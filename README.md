# CheckObra — Frontend Web (Backoffice)

Frontend desktop do sistema **CheckObra** — plataforma de vistoria de obras em processo digital.

Desenvolvido em **Vue 3** com **Vite**, integrado ao back-end via **Axios** e autenticação **JWT**.

Multi-tenant SaaS com três perfis: **Inspetor** (mobile, já finalizado), **Gestor de Empresa** (este backoffice web) e **Platform Admin** (área restrita AKI, não iniciada).

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Vue 3 | Framework principal (Composition API) |
| Vite | Bundler e servidor de desenvolvimento |
| Vue Router | Navegação entre telas |
| Pinia | Gerenciamento de estado global |
| Axios | Integração com a API |
| FontAwesome | Ícones |
| Chart.js + vue-chartjs | Gráficos do Dashboard |

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação

```bash
git clone https://github.com/AKI-Softwares/project-construction-front.git
cd project-construction-front
npm install
```

---

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=https://project-construction-back.vercel.app
```

Para desenvolvimento local com o back rodando localmente:
```env
VITE_API_URL=http://localhost:3000
```

---

## Rodando o projeto

```bash
npm run dev
```

Acesse em: `http://localhost:5173`

Build de produção:
```bash
npm run build
```

---

## Deploy

- **Plataforma:** Vercel, conectado ao GitHub
- **Branch de produção:** `main`
- **URL produção:** `https://project-construction-front.vercel.app`
- Todo merge na `main` dispara deploy automático

**Fluxo de contribuição:**
```bash
git checkout main
git pull origin main
git checkout -b feat/nome-da-feature
# ... desenvolve ...
git push origin feat/nome-da-feature
# Abre PR no GitHub → revisão → merge na main
```

---

## Estrutura de pastas

```
src/
├── pages/
│   ├── Login/index.vue
│   ├── ForgotPassword/index.vue       # Esqueceu a senha
│   ├── ForgotPassword/Sent.vue        # E-mail enviado
│   ├── ResetPassword/index.vue        # Nova senha via token do e-mail
│   ├── ResetPassword/Success.vue      # Confirmação
│   ├── ChangePassword/index.vue       # Troca obrigatória (mustChangePassword)
│   ├── Dashboard/index.vue            # Visão geral (mock, pendente conectar /analytics)
│   ├── Buildings/index.vue            # Empreendimentos + checklist por apartamento
│   ├── Register/index.vue             # Cadastro de empreendimentos e apartamentos
│   ├── Visits/index.vue               # Listagem de vistorias (conectado ao back real)
│   ├── Visits/Detail.vue              # Detalhe da vistoria por cômodo/item
│   ├── Team/index.vue                 # Listagem + exclusão de usuários
│   ├── Team/Register.vue              # Cadastro de usuário
│   ├── Settings/index.vue             # Configurações da empresa (visual, sem back ainda)
│   └── EmConstrucao/index.vue         # Placeholder para telas não implementadas
├── components/Layout/
│   ├── Sidebar.vue          # Menu lateral recolhível (60px → 260px no hover)
│   ├── Header.vue           # Título + perfil real via GET /auth/me
│   ├── MainLayout.vue       # Layout base (Sidebar + Header + slot)
│   └── ChecklistModal.vue   # Modal de checklist por apartamento
├── services/                # Toda comunicação com o back
│   ├── api.js                # Axios + interceptors (token, 401, X-Company-Id)
│   ├── auth.js                # login, me, forgotPassword, resetPassword, changePassword
│   ├── buildings.js           # getBuildings, getBuilding, createBuilding
│   ├── apartments.js          # getApartments, getApartment, createApartment, getApartmentTypes
│   ├── visits.js               # getVisits, getVisit
│   ├── users.js                # getUsers, createUser, deleteUser, resetUserPassword
│   └── roles.js                # getRoles
├── store/auth.js             # Pinia store
├── utils/checklist.js        # Lógica de status calculado (getApartmentStatus, getProgress, etc.)
├── mocks/buildings.js        # Dados mock (a remover progressivamente)
├── router/index.js           # Rotas + guard de autenticação
└── main.js                   # Vue + Pinia + Router + FontAwesome
```

---

## Rotas

| Rota | Tela | Auth | Status |
|---|---|---|---|
| `/login` | Login | Pública | ✅ |
| `/forgot-password` | Esqueceu a senha | Pública | ✅ |
| `/forgot-password/sent` | E-mail enviado | Pública | ✅ |
| `/reset-password` | Nova senha | Pública | ✅ |
| `/reset-password/success` | Senha alterada | Pública | ✅ |
| `/change-password` | Troca obrigatória | Privada | ✅ |
| `/dashboard` | Dashboard | Privada | ⚠️ mock |
| `/buildings/:id` | Empreendimentos | Privada | ⚠️ checklist mock |
| `/cadastro` | Cadastro | Privada | ⚠️ parcial |
| `/visits` | Vistorias | Privada | ✅ conectado |
| `/visits/:id` | Detalhe da vistoria | Privada | ✅ conectado |
| `/team` | Equipe | Privada | ⚠️ falta edição |
| `/team/register` | Cadastro usuário | Privada | ✅ |
| `/configuracoes` | Configurações | Privada | ⚠️ visual sem back |
| `/calendario` | — | Privada | ❌ em construção |
| `/relatorios` | — | Privada | ❌ em construção |

---

## Autenticação

JWT Bearer token. Fluxo:

1. `POST /auth/login` → recebe `{ token }`
2. Token salvo no `localStorage`
3. Interceptor injeta `Authorization: Bearer <token>` em toda requisição
4. `401` → limpa token e redireciona para `/login`
5. Se `isPlatformAdmin: true`, interceptor envia header `X-Company-Id`
6. Se `mustChangePassword: true` no JWT, login redireciona para `/change-password`

**JWT payload:**
```json
{
  "sub": "string",
  "companyId": "number | null",
  "isPlatformAdmin": "boolean",
  "isCompanyAdmin": "boolean",
  "roleId": "number | null",
  "permissions": "string[]",
  "mustChangePassword": "boolean"
}
```

---

## Back-end

Repositório: [project-construction-back](https://github.com/AKI-Softwares/project-construction-back)

URL produção: `https://project-construction-back.vercel.app`

Stack: Fastify v5 + Prisma v6 + PostgreSQL (Neon), arquitetura hexagonal.

CORS configurado via variável `CORS_ORIGINS` no Vercel do back, liberado para o domínio do frontend.

---

## Status do projeto

**~35-40% do escopo completo do backoffice implementado.**

### Concluído
- [x] Login + fluxo completo de recuperação/troca de senha
- [x] Sidebar recolhível + Header com perfil real
- [x] Listagem e detalhe de Vistorias conectados ao back real
- [x] Listagem e exclusão de usuários
- [x] Cadastro de usuário com roles do back
- [x] Cadastro de empreendimentos
- [x] Cadastro de apartamentos (individual e em lote)
- [x] Tela de Configurações da empresa (visual)
- [x] Guard de rota por autenticação

### Pendente
- [ ] Conectar Dashboard a `GET /analytics/overview`
- [ ] Conectar checklist de Empreendimentos ao back real
- [ ] Edição de usuário (`PATCH /users/:id`)
- [ ] Tipos de Apartamento (CRUD com cômodos e serviços)
- [ ] Catálogo de Serviços (CRUD)
- [ ] Roles e Permissões (CRUD)
- [ ] Não-Conformidades — visão consolidada (aguarda endpoint `GET /non-conformities`)
- [ ] Re-inspeções
- [ ] Integração de pagamento (AbacatePay) na tela de Configurações
- [ ] Área Platform Admin (gestão de empresas, catálogo global)

---

## Padrões do projeto

- Variáveis e funções em **inglês** no código
- Textos da interface em **português**
- Sem dados hardcodados — services com flag `USE_MOCK` enquanto endpoints não existem
- Permissões verificadas via `permissions[]` do JWT
- Cores do sistema: teal `#00e5cc`, dark `#0d0d2b`, laranja `#f99f56`, amarelo `#f5a623`
