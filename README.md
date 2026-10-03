# Manu Suplementos

Loja de suplementos com visão do cliente e painel do vendedor.

- `apps/web`: Next.js (loja + painel em `/admin`)
- `apps/api`: NestJS + Prisma + PostgreSQL

## Rodar no computador

1. Instale as dependências: `npm run install:all`
2. Configure a API: copie `apps/api/.env.example` para `apps/api/.env` e preencha
   `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (banco Neon, ou o `docker compose up -d` local),
   `JWT_SECRET` e `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Crie as tabelas e o login do vendedor:
   ```
   cd apps/api
   npx prisma migrate dev
   npm run db:seed
   ```
4. Na raiz: `npm run dev`
   - Loja: http://localhost:3000
   - Painel: http://localhost:3000/admin
   - API: http://localhost:3001

Testes da API: `npm test`

## Primeiros passos no painel

1. **Configurações**: informe a chave Pix, o nome do recebedor, a cidade e a taxa de entrega.
2. **Produtos**: cadastre produtos com preço de venda, preço de custo (para o lucro), estoque e foto.

## Como funciona

- **Pix**: o pedido mostra o QR Code / copia e cola com o valor; o cliente envia o comprovante;
  o vendedor confere e confirma.
- **Cartão**: o pedido vai direto para "aguardando confirmação"; o pagamento é feito na maquininha
  na entrega ou retirada, e o vendedor confirma.
- O **estoque** só é baixado quando o vendedor confirma a compra.
- O **lucro** é (preço − custo) × quantidade dos pedidos finalizados, sem a taxa de entrega.
- O cliente acompanha o pedido pelo link `/pedido/<código>?t=<token>` (sem login).

## Publicar na Vercel (quando decidir)

São dois projetos na Vercel, do mesmo repositório:

**API** (Root Directory: `apps/api`)
1. Em Storage, crie um banco **Neon** e conecte ao projeto (injeta `DATABASE_URL` e `DATABASE_URL_UNPOOLED`).
2. Em Storage, crie um **Blob** e conecte (injeta `BLOB_READ_WRITE_TOKEN`), para fotos e comprovantes.
3. Variáveis: `JWT_SECRET`, `WEB_URL` (URL do site), `ADMIN_*`.
4. Build Command: `npx prisma migrate deploy && npm run build`.
5. Depois do primeiro deploy, rode o seed uma vez apontando para o banco de produção.

**Site** (Root Directory: `apps/web`)
1. Variável `NEXT_PUBLIC_API_URL` = URL do projeto da API.
