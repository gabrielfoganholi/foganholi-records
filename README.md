# Foganholi Records 🎵

Sistema web para você e seu pai catalogarem a coleção de vinis e CDs da família — com busca automática de dados, wishlist e sincronização entre celular e computador.

## Tecnologias escolhidas (e por quê)

| Peça | Tecnologia | Motivo |
|---|---|---|
| Framework | **Next.js 14** (App Router) + TypeScript | Um único projeto cobre front-end e as rotas de API que protegem a chave do Discogs. Fácil de rodar local e de publicar de graça (Vercel). |
| Estilo | **Tailwind CSS** | Produtividade e um visual consistente sem escrever CSS à parte. |
| Banco + Auth + Storage | **Supabase** (Postgres na nuvem) | Um único serviço gratuito resolve login, banco relacional e armazenamento das fotos de capa. Sincroniza automaticamente entre os dispositivos de vocês dois, já que os dados moram na nuvem. |
| Metadados de discos | **API pública do Discogs** | Maior base de dados de lançamentos musicais do mundo, gratuita, com artista, ano, gravadora, faixas e capa. |
| Leitura de código de barras | **html5-qrcode** (câmera do navegador) | Forma prática e realista de "cadastrar por foto": aponta a câmera pro código de barras do disco e ele busca os dados sozinho. |
| PWA | Manifest + Service Worker nativos | Permite instalar no celular e abrir como app, com cache básico dos arquivos estáticos. |

### Sobre o "cadastro por foto"

Reconhecimento automático de capa a partir de uma foto qualquer (sem código de barras) exigiria um serviço pago de busca de imagem, e mesmo assim erra bastante — não veio incluído por não ser confiável o suficiente. Em vez disso, o sistema oferece duas coisas que resolvem o problema na prática:

1. **Escanear o código de barras** do disco (a maioria dos CDs e relançamentos de vinil tem um) → busca automática no Discogs → preenche título, artista, ano, gravadora e faixas.
2. **Buscar por texto** (nome do artista + álbum) no Discogs → mesma coisa.
3. Independentemente da busca, você pode **tirar uma foto da capa física** com a câmera do celular e ela é enviada para o Supabase Storage — assim a capa exibida é a do disco de vocês, não uma genérica da internet (mas dá pra usar a imagem do Discogs também, se preferir).

## Novidades para quem já tinha o projeto rodando

Se você já tinha o Foganholi Records instalado, é só:
1. Substituir os arquivos deste zip pelos antigos (ou copiar o projeto novo por cima).
2. Voltar no **Supabase → SQL Editor** e rodar o `supabase/schema.sql` **de novo**, inteiro. Ele usa `add column if not exists`, então só adiciona os campos novos sem apagar nada da sua coleção.
3. `npm install` de novo (o `html5-qrcode` já estava lá, nenhuma dependência nova foi adicionada).

### O que mudou, pensando em quem realmente coleciona

- **Condição do disco e da capa** — escala igual à usada no Discogs/Goldmine (Lacrado, Mint, Near Mint, VG+, VG, G+, G, Regular), separada por mídia e capa.
- **Avaliação por estrelas** (1 a 5) — pra saber rapidinho quais são os favoritos de verdade.
- **Favoritos** — estrela clicável direto no card, sem precisar abrir o disco; filtro "Favoritos" na barra de busca.
- **Edição especial** — campo livre pra registrar vinil colorido, numerado, box set, autografado etc.
- **Local de guarda** — pra achar o disco físico na estante/caixa quando a coleção crescer.
- **Preço pago, onde comprou, data da compra e valor estimado hoje** — ficam num painel "Detalhes de colecionador" recolhível, pra não poluir o cadastro rápido.
- **Painel de estatísticas** no topo da coleção: total de vinis vs. CDs, gênero mais comum, avaliação média e valor estimado somado.
- **Aviso de duplicata**: ao cadastrar um disco com artista+título que já existe na coleção, o sistema avisa antes de salvar (útil quando vocês dois cadastram sem saber que o outro já tem).
- **"🎲 O que ouvir hoje?"** — sorteia um disco da coleção (respeitando os filtros ativos) pra ajudar a decidir o que tocar.
- **Ordenação** — por adicionados recentemente, título, artista, ano ou avaliação.
- **Wishlist com prioridade** (Alta/Média/Baixa) e "quanto topo pagar", ordenada por prioridade por padrão.
- **Visual**: o disco de vinil "espia" por trás da capa e desliza ao passar o mouse no card, textura sutil de fundo e estados de carregamento com esqueleto animado em vez de texto simples.

## Estrutura do projeto

```
foganholi-records/
├── src/
│   ├── app/
│   │   ├── page.tsx              → Coleção (grid/lista + filtros)
│   │   ├── wishlist/page.tsx     → Lista de desejos
│   │   ├── new/page.tsx          → Formulário de cadastro
│   │   ├── discs/[id]/page.tsx   → Editar/excluir disco
│   │   ├── wishlist/[id]/page.tsx
│   │   ├── login/page.tsx        → Login/cadastro (Supabase Auth)
│   │   └── api/discogs/…         → Rotas que conversam com a API do Discogs
│   ├── components/               → Navbar, DiscForm, BarcodeScanner, etc.
│   ├── contexts/AuthContext.tsx
│   └── lib/                      → supabaseClient, discogs, types, hooks
├── supabase/schema.sql           → Tabelas, RLS e bucket de imagens
├── public/                       → manifest.json, ícone, service worker (PWA)
└── .env.example
```

## Passo a passo para rodar localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org) 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma conta gratuita no [Discogs](https://www.discogs.com)

### 2. Criar o projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) → **New project** (escolha uma senha de banco e a região mais próxima, ex.: São Paulo).
2. Espere o projeto terminar de provisionar (~2 min).
3. No menu lateral, vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo `supabase/schema.sql` deste projeto e clique em **Run**. Isso cria as tabelas `discs` e `wishlist`, as políticas de segurança e o bucket `covers` para as fotos.
4. Vá em **Authentication → Providers** e confirme que **Email** está habilitado (vem habilitado por padrão).
5. (Opcional, recomendado para uso familiar) Em **Authentication → Settings**, desative "Confirm email" para não depender de e-mail transacional — são só vocês dois usando.
6. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

### 3. Criar um token no Discogs
1. Acesse [discogs.com/settings/developers](https://www.discogs.com/settings/developers).
2. Clique em **Generate new token** e copie o token pessoal gerado.

### 4. Configurar o projeto
```bash
# entre na pasta do projeto
cd foganholi-records

# copie o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` com os valores que você copiou:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
DISCOGS_TOKEN=seu-token-pessoal-do-discogs
```

> `DISCOGS_TOKEN` **não** tem o prefixo `NEXT_PUBLIC_` de propósito: ele só é usado nas rotas de API do servidor (`src/app/api/discogs/*`), nunca chega ao navegador.

### 5. Instalar e rodar
```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), crie uma conta (seu e-mail) e crie outra para o seu pai — ambos veem e editam a mesma coleção compartilhada.

### 6. Instalar como app no celular (PWA)
Com o site publicado (veja abaixo) ou rodando na rede local:
- **Android/Chrome**: menu ⋮ → "Adicionar à tela inicial".
- **iPhone/Safari**: botão de compartilhar → "Adicionar à Tela de Início".

## Publicar online (para acessar de qualquer lugar)

O jeito mais simples é a [Vercel](https://vercel.com) (gratuita, feita pela mesma empresa do Next.js):
1. Suba este projeto para um repositório no GitHub.
2. Em vercel.com, **New Project** → importe o repositório.
3. Nas configurações do projeto, adicione as mesmas três variáveis de ambiente do `.env.local`.
4. Deploy. Pronto — a URL pública funciona no celular de vocês dois, sincronizando via Supabase.

## Como funciona o compartilhamento entre você e seu pai

Não existe conceito de "coleção de cada um": qualquer usuário autenticado enxerga e edita todos os registros das tabelas `discs` e `wishlist` (veja as políticas de RLS em `schema.sql`). Basta cada um criar sua própria conta (e-mail/senha) para ter seu próprio login, mas os dados são sempre os mesmos — como um caderno físico compartilhado, só que na nuvem.

## Principais fluxos

- **Adicionar disco**: `/new` → escolha "Coleção" ou "Wishlist" → busque no Discogs, escaneie o código de barras, ou preencha manualmente → tire uma foto da capa se quiser → salvar.
- **Ver coleção**: página inicial, alterna entre grade e lista, filtra por artista/gênero e busca por texto.
- **Wishlist → Coleção**: na página de wishlist, cada item tem um botão "Mover para a coleção", que copia o registro e remove da lista de desejos.
- **Editar/excluir**: clique em qualquer disco para abrir o formulário de edição, com botão de exclusão.

## Limitações conhecidas

- A busca automática depende da disponibilidade e dos dados cadastrados no Discogs — nem todo lançamento nacional/independente está lá.
- O reconhecimento por "foto" é via código de barras, não visão computacional pura (veja explicação acima).
- Sem paginação: para coleções muito grandes (milhares de itens) valeria adicionar paginação nas consultas do Supabase — não deve ser um problema para uma coleção pessoal.
