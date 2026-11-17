# Pré-Conselho Escolar Digital — Colégio Estadual Unidade Polo

Sistema digital de preenchimento, organização e arquivamento de fichas de pré-conselho de classe do **Colégio Estadual Unidade Polo** (Ensino Fundamental, Médio e Profissional — 6º Ano ao 3º Ano EM), com sincronização em tempo real via Firebase Firestore.

## Executar localmente

**Pré-requisitos:** Node.js 20+ e npm

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Para gerar a versão de produção:
   ```bash
   npm run build
   ```

## Publicar na Vercel

O projeto já inclui `vercel.json` configurado para Vite (`npm run build` com saída em `dist/` e rewrite SPA):

1. Envie este repositório para o GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Mantenha as configurações detectadas automaticamente (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
4. Clique em **Deploy** (nenhuma variável de ambiente obrigatória precisa ser adicionada, pois a conexão com o banco Firestore independente já está configurada em `firebase-applet-config.json`).
