import {env} from 'cloudflare:workers';
import {initialProducts,initialSettings,toppingGroups,normalizePhone,statuses,money} from '../../catalog';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const db=()=>{if(!env.DB)throw Error('Banco de dados indisponível.');return env.DB;};
async function config(){const row:any=await db().prepare('SELECT data FROM settings WHERE id=?').bind('shop').first();return {...initialSettings,...(row?JSON.parse(row.data):{})};}
async function products(){const rows=await db().prepare('SELECT data FROM products').all();return rows.results.length?rows.results.map((r:any)=>JSON.parse(r.data)):initialProducts;}
function isAdmin(r:Request){const email=r.headers.get('oai-authenticated-user-email');const allowed=(env as any).ADMIN_EMAIL;return !!allowed && !!email && email.toLowerCase()===allowed.toLowerCase() && !!r.headers.get('oai-authenticated-user-id');}
function requireAdmin(r:Request){if(!isAdmin(r))throw Error('Acesso restrito ao administrador autorizado.');}
function messageFor(o:any){const d=typeof o.data==='string'?JSON.parse(o.data):o.data;return `Olá! Fiz meu pedido ${o.id} na Pedacinho do Céu.\nMeu telefone: ${o.phone}\n\n${d.items.map((i:any)=>`${i.qty}x ${i.name} · ${money(i.unit*i.qty)}\nAdicionais: ${i.toppings.join(', ')||'Sem adicionais'}${i.note?'\nObs.: '+i.note:''}`).join('\n\n')}\n\nEndereço: ${d.address}\nPagamento: ${d.payment}\n${o.fee===null?'Subtotal: '+money(o.subtotal)+' + taxa de entrega a confirmar':'Total: '+money(o.subtotal+o.fee)}${d.note?'\nObservações: '+d.note:''}\nGostaria de acompanhar o pedido. Aguardo a confirmação da loja.`;}
const trim=(x:any,max=200)=>String(x??'').trim().slice(0,max);
function cents(n:any){if(!Number.isInteger(n)||n<0||n>10000000)throw Error('Valor inválido.');return n;}
export async function GET(r:Request){try{const u=new URL(r.url),action=u.searchParams.get('action');
 if(action==='session')return json({admin:isAdmin(r),configured:!!(env as any).ADMIN_EMAIL});
 if(action==='customer'){const phone=normalizePhone(u.searchParams.get('phone')||'');const row=await db().prepare('SELECT phone FROM customers WHERE phone=?').bind(phone).first();return json({exists:!!row});}
 if(action==='track'){const row:any=await db().prepare('SELECT id,status,paid,subtotal,fee FROM orders WHERE id=? AND token=?').bind(trim(u.searchParams.get('id')),trim(u.searchParams.get('token'))).first();return row?json(row):json({error:'Pedido não encontrado.'},404);}
 if(action==='admin'){requireAdmin(r);const [p,s,o,c,e]=await Promise.all([products(),config(),db().prepare('SELECT * FROM orders ORDER BY created DESC').all(),db().prepare('SELECT * FROM customers ORDER BY created DESC').all(),db().prepare('SELECT * FROM expenses ORDER BY date DESC').all()]);return json({products:p,settings:s,orders:o.results.map(({token,request_key,...x}:any)=>({...x,data:JSON.parse(x.data)})),customers:c.results,expenses:e.results});}
 return json({products:(await products()).filter((p:any)=>p.active),settings:await config(),toppingGroups});
 }catch(e:any){return json({error:e.message},e.message.startsWith('Acesso')?403:400);}}
export async function POST(r:Request){try{
 if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Origem inválida.'},403);
 if(Number(r.headers.get('content-length')||0)>50000)return json({error:'Pedido muito grande.'},413);
 const b=await r.json() as any;
 if(b.action==='order'){
 const s=await config();if(!s.storeOpen)throw Error('A loja está fechada para novos pedidos.');
 const phone=normalizePhone(b.phone),address=trim(b.address,500),payment=trim(b.payment),key=trim(b.requestKey,100);
 if(!/^[a-zA-Z0-9-]{20,100}$/.test(key))throw Error('Identificador inválido.');
 const previous:any=await db().prepare('SELECT * FROM orders WHERE request_key=?').bind(key).first();
 if(previous){if(previous.phone!==phone)throw Error('Pedido inválido.');return json({id:previous.id,token:previous.token,whatsapp:s.whatsapp,message:messageFor(previous)});}
 if(address.length<12)throw Error('Preencha rua, número, bairro e cidade.');
 if(!['Pix','Débito na entrega','Crédito na entrega'].includes(payment))throw Error('Selecione a forma de pagamento.');
 const existing:any=await db().prepare('SELECT name FROM customers WHERE phone=?').bind(phone).first();
 const name=existing?.name||trim(b.name,100);if(name.length<2)throw Error('Informe seu nome para o cadastro.');
 if(!Array.isArray(b.items)||b.items.length<1||b.items.length>30)throw Error('Adicione itens ao pedido.');
 const catalog=await products(),allowed=Object.values(toppingGroups).flat();let subtotal=0;
 const items=b.items.map((x:any)=>{const p=catalog.find((p:any)=>p.id===x.productId&&p.active);if(!p)throw Error('Produto indisponível. Atualize o cardápio.');if(!Number.isInteger(x.qty)||x.qty<1||x.qty>20)throw Error('Quantidade inválida.');if(!Array.isArray(x.toppings)||x.toppings.length>allowed.length||x.toppings.some((t:any)=>!allowed.includes(t))||new Set(x.toppings).size!==x.toppings.length)throw Error('Adicionais inválidos.');const unit=p.price+Math.max(0,x.toppings.length-s.included)*s.extraPrice;subtotal+=unit*x.qty;return {productId:p.id,name:p.name,qty:x.qty,toppings:x.toppings,unit,note:trim(x.note,300)};});
 const id='PC-'+crypto.randomUUID().slice(0,8).toUpperCase(),token=crypto.randomUUID()+crypto.randomUUID(),created=new Date().toISOString();
 const data={items,address,payment,note:trim(b.note,500)};
 await db().batch([db().prepare('INSERT INTO customers (phone,name,created) VALUES (?,?,?) ON CONFLICT(phone) DO NOTHING').bind(phone,name,created),db().prepare('INSERT INTO orders (id,request_key,token,phone,name,created,status,paid,subtotal,fee,data) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,key,token,phone,name,created,'Recebido',0,subtotal,s.deliveryFee,JSON.stringify(data))]);
 return json({id,token,whatsapp:s.whatsapp,message:messageFor({id,phone,data,subtotal,fee:s.deliveryFee})});
 }
 requireAdmin(r);
 if(b.action==='product'){const p=b.product;if(!p||!trim(p.name,100))throw Error('Informe o nome do produto.');const data={id:trim(p.id,100)||crypto.randomUUID(),name:trim(p.name,100),description:trim(p.description,300),price:cents(p.price),active:!!p.active};const current=await products();const list=current.some((x:any)=>x.id===data.id)?current.map((x:any)=>x.id===data.id?data:x):[...current,data];await db().batch(list.map((x:any)=>db().prepare('INSERT INTO products(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(x.id,JSON.stringify(x))));return json({ok:true});}
 if(b.action==='settings'){const old=await config();const s={...old,extraPrice:cents(b.settings.extraPrice),included:b.settings.included,deliveryFee:b.settings.deliveryFee===null?null:cents(b.settings.deliveryFee),pixKey:trim(b.settings.pixKey,200),deliveryNote:trim(b.settings.deliveryNote,500),storeOpen:!!b.settings.storeOpen};if(!Number.isInteger(s.included)||s.included<0||s.included>30)throw Error('Quantidade de adicionais inválida.');await db().prepare('INSERT INTO settings(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind('shop',JSON.stringify(s)).run();return json({ok:true});}
 if(b.action==='updateOrder'){if(!statuses.includes(b.status))throw Error('Status inválido.');const row:any=await db().prepare('SELECT * FROM orders WHERE id=?').bind(trim(b.id)).first();if(!row)throw Error('Pedido não encontrado.');const fee=b.fee===null?null:cents(b.fee);if(b.paid&&fee===null)throw Error('Defina a taxa de entrega antes de confirmar o pagamento.');await db().prepare('UPDATE orders SET status=?,paid=?,fee=? WHERE id=?').bind(b.status,b.paid?1:0,fee,row.id).run();return json({ok:true});}
 if(b.action==='expense'){const description=trim(b.description,200);if(!description||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!Number.isFinite(Date.parse(b.date)))throw Error('Preencha a descrição e uma data válida.');await db().prepare('INSERT INTO expenses(id,date,description,amount) VALUES (?,?,?,?)').bind(crypto.randomUUID(),b.date,description,cents(b.amount)).run();return json({ok:true});}
 if(b.action==='deleteExpense'){await db().prepare('DELETE FROM expenses WHERE id=?').bind(trim(b.id)).run();return json({ok:true});}
 return json({error:'Ação inválida.'},400);
 }catch(e:any){return json({error:e.message},e.message.startsWith('Acesso')?403:400);}}

