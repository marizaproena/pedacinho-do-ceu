export const initialProducts = [250,330,440,550].map((size,i)=>({id:'acai-'+size,name:'Açaí '+size+' ml',description:'Seu açaí, do seu jeitinho. Até 6 adicionais incluídos.',price:[1690,1990,2490,2690][i],active:true}));
export const toppingGroups = {
 'Crocantes':['Amendoim granulado','Castanha do Pará','Chocoball','Confete','Cookie','Granola','Ovomaltine'],
 'Cremosos':['Creme de amendoim','Creme de avelã','Creme de limão','Creme de maracujá','Creme de morango','Creme Alpino','Creme Kinder Bueno','Creme Ninho','Doce de leite'],
 'Frutas':['Banana','Kiwi','Manga','Morango','Uva'],
 'Outros':['Brigadeiro','Leite condensado','Leite em pó','Paçoca']
};
export const initialSettings={extraPrice:200,included:6,deliveryFee:null as number|null,whatsapp:'5541996375199',pixKey:'',deliveryNote:'Taxa de entrega a confirmar pela loja.',storeOpen:true};
export const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);
export function normalizePhone(v:string){let p=v.replace(/\D/g,'');if(p.length===12||p.length===13){if(p.startsWith('55'))p=p.slice(2);}if(!/^[1-9]\d{9,10}$/.test(p))throw Error('Informe um telefone válido com DDD.');return p;}
export const statuses=['Recebido','Em preparo','Saiu para entrega','Entregue','Cancelado'];
