# CheckObra — Frontend Web (Backoffice)

Frontend desktop do sistema **CheckObra** — plataforma de vistoria de obras em processo digital.

Desenvolvido em **Vue 3** com **Vite**, integrado ao back-end via **Axios** e autenticação **JWT**.

Sistema *Multi-tenant SaaS* com três perfis:
* **Inspetor:** Mobile (finalizado — repositório separado).
* **Gestor de Empresa:** Este backoffice web.
* **Platform Admin:** Área restrita AKI Softwares.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
| :--- | :--- |
| **Vue 3** | Framework principal (Composition API + `<script setup>`) |
| **Vite** | Bundler e servidor de desenvolvimento |
| **Vue Router** | Navegação entre telas com guard de autenticação |
| **Pinia** | Gerenciamento de estado global (`auth store`) |
| **Axios** | Integração com a API REST |
| **FontAwesome** | Ícones da interface |
| **Chart.js + vue-chartjs** | Gráficos do Dashboard e Platform Dashboard |

---

## 🚀 Pré-requisitos

* **Node.js** 18+
* **npm** 9+

---

## 📥 Instalação

```bash
git clone [https://github.com/AKI-Softwares/project-construction-front.git](https://github.com/AKI-Softwares/project-construction-front.git)
cd project-construction-front
npm install

```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=[https://project-construction-back.vercel.app](https://project-construction-back.vercel.app)

```

Para desenvolvimento local com o back-end rodando localmente:

```env
VITE_API_URL=http://localhost:3000

```

---

## 💻 Rodando o projeto

```bash
# Iniciar servidor de desenvolvimento
npm run dev

```

Acesse em: `http://localhost:5173`

```bash
# Build de produção
npm run build

```

---

## 🌐 Deploy

* **Plataforma:** Vercel, conectado ao GitHub.
* **Branch de produção:** `main`
* **URL de produção:** [https://project-construction-front.vercel.app](https://project-construction-front.vercel.app)
* *Todo commit na branch `main` dispara o deploy automático.*

> ⚠️ **Importante:** O campo `CORS_ORIGINS` no painel da Vercel do back-end deve conter exatamente `https://project-construction-front.vercel.app` (sem barra no final).

---

## 📂 Estrutura de Pastas

```text
src/
├── pages/
│   ├── Login/index.vue                  # W-01 Login
│   ├── ForgotPassword/index.vue         # W-02 Recuperar senha
│   ├── ForgotPassword/Sent.vue          # W-02 E-mail enviado
│   ├── ResetPassword/index.vue          # W-03 Nova senha via token
│   ├── ResetPassword/Success.vue        # W-03 Confirmação
│   ├── ChangePassword/index.vue         # W-04 Troca de senha (obrigatória/voluntária)
│   ├── Dashboard/index.vue              # W-05 Dashboard (usa /buildings, /apartments, /users)
│   ├── Buildings/index.vue              # W-06/W-08 Empreendimentos + Apartamentos + Checklist
│   ├── ApartmentTypes/index.vue         # W-07 Tipos de Apartamento (CRUD + cômodos)
│   ├── Services/index.vue               # W-09 Catálogo de Serviços (CRUD)
│   ├── Visits/index.vue                 # W-10 Vistorias listagem (implementado pelo colega)
│   ├── Visits/Detail.vue                # W-10 Vistorias detalhe (implementado pelo colega)
│   ├── Team/index.vue                   # W-11/W-12 Equipe — usuários e funções
│   ├── Team/Register.vue                # W-11 Cadastro de usuário
│   ├── Settings/index.vue               # W-13 Configurações da empresa (visual — aguarda back)
│   ├── NonConformities/index.vue        # W-14 Não-Conformidades (bloqueada — aguarda back)
│   ├── Reinspections/index.vue          # W-15 Re-inspeções (lista as sem inspetor via back)
│   ├── Platform/
│   │   ├── Dashboard/index.vue          # WP-01 Dashboard da Plataforma
│   │   ├── Companies/index.vue          # WP-02 Gestão de Empresas — lista
│   │   ├── CompanyDetail/index.vue      # WP-02 Gestão de Empresas — detalhe
│   │   ├── Catalog/index.vue            # WP-03/WP-04 Catálogo Global (serviços + tipos)
│   │   └── RoleTemplates/index.vue      # WP-05 Templates de Funções
│   ├── Register/index.vue               # Cadastro de empresa (público — auto-registro)
│   └── EmConstrucao/index.vue           # Placeholder para Calendário e Relatórios
├── components/Layout/
│   ├── Sidebar.vue                      # Menu lateral recolhível (60px → 260px no hover)
│   ├── Header.vue                       # Título + nome do usuário via GET /auth/me
│   ├── MainLayout.vue                   # Layout base (Sidebar + Header + slot)
│   └── ChecklistModal.vue               # Modal de checklist por apartamento
├── services/
│   ├── api.js                           # Axios base: injeta Bearer token, envia X-Company-Id
│   ├── analytics.js                     # getOverview, getBuildingRanking, getQuality
│   ├── apartmentTypes.js                # CRUD de tipos + cômodos + serviços padrão
│   ├── apartments.js                    # getApartments, createApartment, getApartmentTypes
│   ├── auth.js                          # login, me, forgotPassword, resetPassword, etc.
│   ├── buildings.js                     # getBuildings, getBuilding, createBuilding
│   ├── checklists.js                    # getChecklistByApartment, updateChecklistItem
│   ├── permissions.js                   # getPermissions
│   ├── platform.js                      # Empresas, role-templates, catálogo global e analytics
│   ├── roles.js                         # getRoles, createRole, deleteRole
│   ├── services.js                      # CRUD de serviços do catálogo
│   ├── users.js                         # getUsers, createUser, deleteUser, resetUserPassword
│   └── visits.js                        # getVisits, getVisit, getAvailableReinspections
├── store/
│   └── auth.js                          # Pinia store: token reativo e getters de permissão
├── utils/
│   └── checklist.js                     # groupChecklistByRoom: transforma estrutura do back
├── router/index.js                      # Todas as rotas + guard de autenticação
└── main.js                              # Inicialização (Vue + Pinia + Router + FontAwesome)

```

---

## 🛣️ Rotas do Sistema

### 🔓 Públicas

| Rota | Tela |
| --- | --- |
| `/login` | W-01 Login |
| `/forgot-password` | W-02 Recuperar senha |
| `/forgot-password/sent` | W-02 E-mail enviado |
| `/reset-password` | W-03 Nova senha via token |
| `/reset-password/success` | W-03 Senha redefinida |

### 🔐 Privadas — Gestor de Empresa

| Rota | Tela | Status |
| --- | --- | --- |
| `/change-password` | W-04 Troca de senha | ✅ Concluído |
| `/dashboard` | W-05 Dashboard | ✅ Dados reais |
| `/buildings` | W-06/W-08 Empreendimentos + Apartamentos | ✅ Concluído |
| `/apartment-types` | W-07 Tipos de Apartamento | ✅ Concluído |
| `/services` | W-09 Catálogo de Serviços | ✅ Concluído |
| `/visits` | W-10 Vistorias | ✅ Concluído (colega) |
| `/visits/:id` | W-10 Detalhe da vistoria | ✅ Concluído (colega) |
| `/team` | W-11/W-12 Equipe | ✅ Concluído |
| `/team/register` | W-11 Cadastro de usuário | ✅ Concluído |
| `/configuracoes` | W-13 Configurações | ⚠️ Visual (Aguardando back-end) |
| `/non-conformities` | W-14 Não-Conformidades | 🚫 Bloqueada (Aguardando back-end) |
| `/reinspections` | W-15 Re-inspeções | ⚠️ Parcial (Apenas sem inspetor) |
| `/calendario` | Calendário | ❌ Em construção |
| `/relatorios` | Relatórios | ❌ Em construção |

### 🛡️ Privadas — Platform Admin (`isPlatformAdmin: true`)

| Rota | Tela | Status |
| --- | --- | --- |
| `/platform/dashboard` | WP-01 Dashboard da Plataforma | ✅ Concluído |
| `/platform/companies` | WP-02 Gestão de Empresas | ✅ Concluído |
| `/platform/companies/:id` | WP-02 Detalhe da empresa | ✅ Concluído |
| `/platform/catalog` | WP-03/WP-04 Catálogo Global | ✅ Concluído |
| `/platform/role-templates` | WP-05 Templates de Funções | ✅ Concluído |

---

## 🔑 Autenticação

Fluxo do **JWT Bearer token**:

1. `POST /auth/login` → recebe `{ token }`
2. `authStore.setToken(token)` — **Sempre** use a action da store, nunca o `localStorage.setItem` direto. Os getters `hasPermission` e `isPlatformAdmin` dependem da reatividade do `state.token`.
3. Interceptor do Axios injeta `Authorization: Bearer <token>` automaticamente em todas as requisições.
4. Resposta `401` → limpa o token e redireciona para `/login`.
5. Se `isPlatformAdmin: true` e `companyId` presente, o interceptor injeta o header `X-Company-Id`.
6. Se `mustChangePassword: true` no JWT → redireciona obrigatoriamente para `/change-password`.

### Payload do JWT:

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

### Verificação de permissões em tela:

```javascript
const authStore = useAuthStore()

// Retorna true para isCompanyAdmin e isPlatformAdmin
authStore.hasPermission('buildings:create') 

// Controle de blocos exclusivos do admin da plataforma
authStore.isPlatformAdmin 

```

---

## 🖥️ Back-end

* **Repositório:** `project-construction-back`
* **URL de Produção:** [https://project-construction-back.vercel.app](https://project-construction-back.vercel.app)
* **Stack:** Fastify v5 + Prisma v6 + PostgreSQL (Neon)
* **Arquitetura:** Hexagonal (Deploy Vercel Serverless)

### 🚨 Gaps de Back-end Conhecidos

| Tela | Endpoint Necessário | Impacto no Front-end |
| --- | --- | --- |
| **W-14** | `GET /non-conformities` com filtros (`buildingId`, `status`, `inspectorId`, `period`) | Tela completamente bloqueada. |
| **W-13** | Endpoint self-service para empresa atualizar dados próprios | Tela estritamente visual; salvar não funciona. |
| **W-15** | `GET /visits?type=REINSPECTION` sem o filtro `/mine` | Só exibe re-inspeções que estão sem inspetor associado. |
| **WP-02** | `GET /roles?companyId=X` ou campo `companyId` no payload | A criação de usuário por empresa está bloqueada. |
| **WP-02** | Seed automático ao criar empresa via `POST /platform/companies` | Empresa é criada vazia (sem funções ou catálogo). |

---

## 📐 Padrões do Projeto

* **Idioma:** Código em inglês (variáveis, funções, arquivos); Interface em português (textos, avisos, labels).
* **Comunicação API:** Centralizada em `src/services/`. Nunca utilize `fetch` ou `axios` isolados diretamente nos componentes.
* **Estado:** Nunca manipule o `localStorage` do token na força bruta. Use sempre as actions do Pinia para garantir a reatividade.
* **Permissões:** Valide os acessos por meio do `authStore.hasPermission('recurso:acao')`. Não descriptografe o JWT nas páginas.
* **Tratamento de Endpoints Ausentes:** Quando uma rota do back-end não existir, exiba um banner claro e honesto na tela (como feito em W-14, W-15 e WP-02). Não simule dados falsos de sucesso.
* **Paleta de Cores:**
* 🟢 Teal (`#00e5cc`): Cor primária
* 🔵 Dark Navy (`#0d0d2b`): Headers e botões principais
* 🟠 Laranja (`#f99f56`): Alertas e avisos urgentes
* 🔴 Vermelho (`#c0392b`): Ações de perigo / exclusão
* 🟡 Amarelo (`#f5a623`): Avisos neutros



---

## 📊 Status do Projeto

Atualmente o Backoffice web encontra-se com **~90% do escopo concluído**.

### ✅ Concluído

* [x] Fluxo completo de autenticação (login, recuperação, troca de senha obrigatória/voluntária).
* [x] Dashboard com dados reais de empreendimentos, apartamentos e usuários.
* [x] Empreendimentos + Apartamentos (individual e em lote) + Checklist modal.
* [x] Tipos de Apartamento (CRUD + cômodos + serviços padrão por cômodo).
* [x] Catálogo de Serviços (CRUD com filtro por categoria).
* [x] Vistorias — listagem e detalhe (parceria com o colega de equipe).
* [x] Equipe — usuários (cadastro, listagem, exclusão, reset de senha).
* [x] Equipe — funções (CRUD com seleção de permissões por recurso).
* [x] Configurações da empresa (estrutura visual pronta).
* [x] Não-Conformidades (tela de bloqueio estruturada com alternativa via PDF).
* [x] Re-inspeções (lista as disponíveis sem inspetor designado).
* [x] Platform Admin completo: Dashboard, Empresas, Catálogo Global, Templates de Funções.
* [x] Sidebar adaptativa com seção PLATAFORMA restrita via `isPlatformAdmin`.

### ⏳ Pendente (Aguardando Back-end)

* [ ] Filtros do `GET /non-conformities` (W-14).
* [ ] Endpoint self-service de dados da empresa (W-13).
* [ ] Ajuste no `GET /visits?type=REINSPECTION` (W-15).
* [ ] Parâmetro de query/payload para `GET /roles?companyId=X` (WP-02).
* [ ] Gatilho de Seed automático em `POST /platform/companies` (WP-02).

### 🛠️ Pendente (Desenvolvimento no Front-end)

* [ ] Calendário — escopo técnico a definir.
* [ ] Relatórios — escopo de regras de negócio a definir.
* [ ] Integração do gateway AbacatePay na tela de Configurações (depende do back-end).

```

```
