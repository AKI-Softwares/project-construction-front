# CheckObra — Backoffice Web

Frontend desktop do **CheckObra** — plataforma SaaS multi-tenant para inspeção digital de obras.

Desenvolvido em **Vue 3 + Vite**, integrado ao back-end via **Axios** e autenticação **JWT**.

O sistema opera com três perfis de usuário:
- **Inspetor** — App mobile (repositório separado, responsabilidade do Gustavo)
- **Gestor de Empresa** — Este backoffice web
- **Platform Admin** — Área restrita AKI Softwares

---

## Tecnologias

| Tecnologia | Uso |
| :--- | :--- |
| Vue 3 | Framework principal (Composition API + `<script setup>`) |
| Vite 8 | Bundler e servidor de desenvolvimento |
| Vue Router | Navegação + guard de autenticação JWT |
| Pinia | Estado global (auth store com decodificação do JWT) |
| Axios | Integração com a API REST |
| FontAwesome 6 | Ícones da interface (registrados em `main.js`) |
| Inter (Google Fonts) | Fonte padrão de toda a interface |

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

Para desenvolvimento local com o back-end rodando localmente:

```env
VITE_API_URL=http://localhost:3000
```

---

## Rodando o projeto

```bash
# Servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173

# Build de produção
npm run build
```

---

## Deploy

- **Plataforma:** Vercel, conectado ao GitHub
- **Branch de produção:** `main`
- **URL de produção:** https://project-construction-front.vercel.app
- Todo commit na `main` dispara deploy automático

> ⚠️ O campo `CORS_ORIGINS` no painel da Vercel do back-end deve conter exatamente `https://project-construction-front.vercel.app` (sem barra no final).

---

## Estrutura de Pastas

```
src/
├── pages/
│   ├── Login/index.vue                  # Login
│   ├── Register/index.vue               # Cadastro de empresa (auto-registro público)
│   ├── ForgotPassword/index.vue         # Recuperar senha
│   ├── ForgotPassword/Sent.vue          # E-mail enviado
│   ├── ResetPassword/index.vue          # Nova senha via token
│   ├── ResetPassword/Success.vue        # Confirmação
│   ├── ChangePassword/index.vue         # Troca de senha (obrigatória/voluntária)
│   ├── Dashboard/HomeView.vue           # Home — visão rápida (obras, vistorias recentes)
│   ├── Dashboard/index.vue              # Analytics — gráficos por empreendimento
│   ├── Buildings/index.vue              # Empreendimentos + Apartamentos
│   ├── Buildings/Detail.vue             # Detalhe do empreendimento (cômodos e serviços)
│   ├── ApartmentTypes/index.vue         # Tipos de apartamento (CRUD + cômodos + serviços)
│   ├── Services/index.vue               # Catálogo de serviços (CRUD)
│   ├── Visits/index.vue                 # Vistorias — listagem com filtros
│   ├── Visits/Detail.vue                # Vistoria — detalhe (checklist, fotos, NCs)
│   ├── Visits/Report.vue                # Relatórios (/relatorios)
│   ├── NonConformities/index.vue        # Não conformidades por empreendimento
│   ├── Reinspections/index.vue          # Re-inspeções sem inspetor atribuído
│   ├── Team/index.vue                   # Equipe — usuários e funções
│   ├── Team/Register.vue                # Cadastro de usuário
│   ├── Settings/index.vue               # Configurações da empresa
│   └── Platform/
│       ├── Dashboard/index.vue          # Dashboard da plataforma (Platform Admin)
│       ├── Companies/index.vue          # Gestão de empresas
│       ├── CompanyDetail/index.vue      # Detalhe da empresa
│       ├── Catalog/index.vue            # Catálogo global de serviços
│       └── RoleTemplates/index.vue      # Templates de funções
├── components/Layout/
│   ├── Sidebar.vue                      # Menu lateral recolhível (60px → 260px no hover)
│   ├── Header.vue                       # Cabeçalho com logo e nome do usuário
│   ├── MainLayout.vue                   # Layout base (Sidebar + Header + slot de conteúdo)
│   ├── ChecklistModal.vue               # Modal de checklist por apartamento
│   └── VisitModal.vue                   # Modal de detalhe de vistoria (fotos, NCs)
├── services/
│   ├── api.js                           # Axios: injeta Bearer token e X-Company-Id
│   ├── analytics.js                     # getOverview, getBuildingRanking, getQuality
│   ├── apartmentTypes.js                # CRUD de tipos + cômodos + serviços por cômodo
│   ├── apartments.js                    # getApartments, createApartment, deleteApartment
│   ├── auth.js                          # login, me, forgotPassword, resetPassword, changePassword, registerCompany + useAuthStore
│   ├── buildings.js                     # getBuildings, getBuilding, createBuilding, deleteBuilding
│   ├── checklists.js                    # getChecklistByApartment, updateChecklistItem
│   ├── permissions.js                   # getPermissions
│   ├── platform.js                      # Empresas, role-templates, catálogo global, analytics
│   ├── roles.js                         # getRoles, createRole, deleteRole
│   ├── services.js                      # CRUD de serviços do catálogo
│   ├── users.js                         # getUsers, createUser, updateUser, deleteUser, resetUserPassword
│   └── visits.js                        # getVisits, getVisit, createReinspection, assignInspectorToVisit, getAvailableReinspections
├── store/
│   └── auth.js                          # Re-export de useAuthStore (definida em services/auth.js)
├── utils/
│   └── checklist.js                     # groupChecklistByRoom: agrupa items por cômodo
├── router/index.js                      # Rotas + guard de autenticação
└── main.js                              # Vue + Pinia + Router + FontAwesome
```

---

## Rotas do Sistema

### Públicas

| Rota | Tela |
| --- | --- |
| `/login` | Login |
| `/register` | Cadastro de empresa |
| `/forgot-password` | Recuperar senha |
| `/forgot-password/sent` | E-mail enviado |
| `/reset-password` | Nova senha via token |
| `/reset-password/success` | Confirmação |

### Privadas — Gestor de Empresa

| Rota | Tela |
| --- | --- |
| `/dashboard` | Home — visão rápida |
| `/analytics` | Analytics — gráficos |
| `/buildings` | Empreendimentos + Apartamentos |
| `/buildings/:id` | Detalhe do empreendimento |
| `/apartment-types` | Tipos de apartamento |
| `/services` | Catálogo de serviços |
| `/visits` | Vistorias |
| `/visits/:id` | Detalhe da vistoria |
| `/relatorios` | Relatórios |
| `/non-conformities` | Não conformidades |
| `/reinspections` | Re-inspeções |
| `/team` | Equipe |
| `/configuracoes` | Configurações da empresa |

### Privadas — Platform Admin

| Rota | Tela |
| --- | --- |
| `/platform/dashboard` | Dashboard da plataforma |
| `/platform/companies` | Gestão de empresas |
| `/platform/companies/:id` | Detalhe da empresa |
| `/platform/catalog` | Catálogo global |
| `/platform/role-templates` | Templates de funções |

---

## Autenticação

Fluxo do JWT Bearer token:

1. `POST /auth/login` → recebe `{ token }`
2. `authStore.setToken(token)` — **sempre** use a action da store, nunca `localStorage.setItem` direto
3. O interceptor do Axios injeta `Authorization: Bearer <token>` em todas as requisições automaticamente
4. Resposta `401` → limpa o token e redireciona para `/login`
5. Se `mustChangePassword: true` no JWT → redireciona obrigatoriamente para `/change-password`

### Payload do JWT

```json
{
  "sub": "string",
  "name": "string",
  "email": "string",
  "companyId": "number | null",
  "isPlatformAdmin": "boolean",
  "isCompanyAdmin": "boolean",
  "roleId": "number | null",
  "permissions": "string[]",
  "mustChangePassword": "boolean"
}
```

### Verificando permissões

```js
const authStore = useAuthStore()

authStore.hasPermission('buildings:create') // true para isCompanyAdmin e isPlatformAdmin
authStore.isPlatformAdmin                   // área exclusiva AKI Softwares
authStore.isCompanyAdmin                    // gestão da empresa
authStore.user.name                         // nome do usuário logado (populado do JWT)
authStore.companyId                         // ID da empresa do usuário
```

---

## Back-end

- **Repositório:** `project-construction-back`
- **URL de produção:** https://project-construction-back.vercel.app
- **Stack:** Node.js + Fastify v5 + Prisma v6 + PostgreSQL (Neon)
- **Arquitetura:** Hexagonal — deploy Vercel Serverless
- **Responsável:** Gustavo

---

## Padrões do Projeto

- **Idioma:** Código em inglês (variáveis, funções, arquivos); interface em português (labels, mensagens)
- **Serviços:** Toda comunicação com a API passa por `src/services/`. Nunca use `fetch` ou `axios` direto nos componentes
- **Estado:** Use sempre as actions do Pinia (`authStore.setToken`). Nunca manipule `localStorage` do token diretamente
- **Permissões:** Use `authStore.hasPermission('recurso:acao')`. Não descriptografe o JWT nos componentes
- **Ícones:** Todos os ícones usam o padrão `['fas', 'nome']` do FontAwesome e devem ser registrados em `main.js`
- **Erros:** Nunca silencie erros com `catch { return [] }`. Sempre propague ou exiba feedback ao usuário

### Paleta de Cores

| Cor | Hex | Uso |
| --- | --- | --- |
| Teal | `#00e5cc` | Cor primária — botões de ação, destaques |
| Accent | `#46C7D5` | Cor de destaque secundária |
| Dark Navy | `#0b1120` | Sidebar, header |
| Danger | `#c0392b` | Exclusão, erros |
| Warning | `#f99f56` | Alertas, avisos |

---

## Status do Projeto

### ✅ Concluído

- Fluxo completo de autenticação (login, recuperação, troca obrigatória/voluntária, registro)
- Dashboard (Home + Analytics com gráficos reais)
- Empreendimentos — listagem, cadastro, exclusão, detalhe com cômodos e serviços
- Apartamentos — cadastro individual, cadastro em lote, exclusão
- Tipos de apartamento — CRUD + cômodos + vinculação de serviços + criação de serviço inline
- Catálogo de serviços — CRUD com 17 categorias padrão da construção civil
- Vistorias — listagem com filtros, detalhe com checklist, fotos e NCs, abertura em modal
- Não conformidades — listagem por empreendimento com badge dinâmico (pendente/resolvida)
- Re-inspeções — listagem com filtro por empreendimento, atribuição de inspetor
- Equipe — usuários (cadastro, listagem, exclusão, reset de senha) + funções (CRUD)
- Configurações da empresa
- Relatórios (`/relatorios`)
- Platform Admin completo: Dashboard, Empresas, Catálogo Global, Templates de Funções
- Sidebar adaptativa com grupos lógicos e seção PLATAFORMA restrita via `isPlatformAdmin`
- Toast global via `CustomEvent('app:toast')`

### ⏳ Pendente

- Geração de laudo PDF automático
- Notificações proativas (NC registrada, re-inspeção sem inspetor)
- Calendário de vistorias
