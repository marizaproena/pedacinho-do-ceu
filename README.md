# Pedacinho do Céu — pedidos e gestão

Aplicação web com cardápio, adicionais, carrinho, cadastro por telefone, entrega, Pix/cartão, acompanhamento e painel administrativo. O HTML é gerado pela aplicação; os cadastros e pedidos dependem do servidor e do banco D1, não de um arquivo HTML isolado.

## Operação
- `/`: cardápio. Até seis adicionais incluídos; cada adicional excedente custa R$ 2,00 por unidade de açaí.
- `/admin`: login com ChatGPT; somente o e-mail definido em `ADMIN_EMAIL` acessa dados e alterações. A variável deve ser configurada como segredo no servidor.
- A entrega inicia com taxa a confirmar. Configure em Configurações ou informe o valor em cada pedido.
- Pagamentos são conferidos manualmente. Marque como pago somente após conferir Pix ou cartão.
- O painel busca por telefone, nome e código; os valores do pedido são preservados mesmo se o cardápio mudar depois.
- O financeiro considera pedidos pagos, não cancelados, pela data de criação em Brasília; gastos são lançados manualmente. O saldo não é lucro contábil.
- O botão WhatsApp prepara a mensagem para `5541996375199`; o cliente precisa enviá-la. Não há leitura de mensagens nem robô de resposta no WhatsApp.
- O link com chave permite acompanhar somente andamento e pagamento. O telefone sozinho não libera histórico, nome ou endereço.
- A existência de cadastro por telefone é consultada, mas o telefone não é verificado por SMS. Não use como autenticação para expor dados pessoais.

## Desenvolvimento
Node >=22.13.0. Preserve os scripts do starter e siga a configuração de perfil portátil.
`npm run dev` inicia a prévia. `npm run build` gera o artefato para Cloudflare Workers.
`npm run db:generate` gera novas migrações após alterar `db/schema.ts`.
As migrações estão em `drizzle/`. O banco local e o publicado são separados.
`node tests/integration.mjs` testa somente a prévia local na porta 5173 e cria dados fictícios locais.
`.dev.vars`, banco local, cache e dependências não são incluídos na publicação.

## Publicação
O projeto usa Sites com D1. A publicação inicial é privada para revisão. Clientes precisam de acesso público antes da divulgação. A configuração da conta de administrador é independente da privacidade geral do site.
Sem IA ou API de WhatsApp paga neste fluxo. Custos e limites da hospedagem dependem do plano da plataforma; não há promessa de gratuidade ilimitada.

## Entrega local
Nesta pasta, abra iniciar.cmd para iniciar a prévia instalada neste computador. Use http://127.0.0.1:5173 no navegador. O login local é uma simulação seedy@sites.test e não substitui a autenticação publicada. O banco local contém somente pedidos fictícios de teste. A publicação Sites não foi concluída devido à conexão do repositório Git; o projeto e a configuração de administrador foram preservados para retomar.

