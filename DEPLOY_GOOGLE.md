# Publicar no Google com tudo funcionando

Este guia cobre frontend + backend + Supabase.

## 1) Preparar chaves do Supabase
No Supabase, abra `Project Settings > API` e copie:
- `Project URL`
- `anon/public key`
- `service_role key`

## 2) Configurar backend localmente (teste antes de publicar)
Crie `.env` na raiz com:

```env
SUPABASE_URL=https://myyrzxvycljhcubyjaal.supabase.co
SUPABASE_ANON_KEY=COLE_AQUI_SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_SUA_SERVICE_ROLE_KEY
PORT=3000
```

Execute:

```bash
npm install
npm start
```

Teste no navegador:
- `http://localhost:3000/health`
- `http://localhost:3000/api/cadastros/diagnostico/supabase`

## 3) Publicar backend (Render, Railway, Cloud Run)
Publique a pasta do projeto com comando de start:

```bash
npm start
```

Defina no painel do provedor as variáveis:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (se o provedor exigir)

Depois copie a URL pública da API, exemplo:
- `https://tayara-api.onrender.com`

## 4) Conectar frontend à API pública
Edite `js/runtime-config.js`:

```javascript
window.APP_CONFIG.API_BASE_URL = 'https://SUA-API-PUBLICA.com';
```

## 5) Publicar frontend
Opções recomendadas:
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages (somente frontend)

## 6) SEO / Google
Já está pronto no projeto:
- `robots.txt`
- `sitemap.xml` (somente páginas públicas)

Passos finais:
1. Abra Google Search Console.
2. Verifique a propriedade do domínio.
3. Envie `https://tayaraandreza.com/sitemap.xml`.
4. Aguarde indexação.

## 7) Checklist final de funcionamento
- Login funciona.
- Cadastro funciona.
- Oficialização de fã-clube salva no banco.
- Busca em `fa-clube.html` traz pessoas/fã-clubes.
- Menu `Perfil` e `Sair` abre por cima de tudo.

## 8) Se aparecer erro 403/RLS no fã-clube
No Supabase SQL Editor, execute:
- `server/sql/fan_clubes_policies.sql`

Isso libera as políticas necessárias para as operações esperadas.
