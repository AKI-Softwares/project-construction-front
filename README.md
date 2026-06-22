CheckObra — Frontend Web (Backoffice)

Frontend desktop do sistema CheckObra — plataforma de vistoria de obras em processo digital.

Desenvolvido em Vue 3 com Vite, integrado ao back-end via Axios e autenticação JWT.

Multi-tenant SaaS com três perfis: Inspetor (mobile, finalizado — repositório separado), Gestor de Empresa (este backoffice web) e Platform Admin (área restrita AKI Softwares).


Tecnologias

TecnologiaUsoVue 3Framework principal (Composition API + <script setup>)ViteBundler e servidor de desenvolvimentoVue RouterNavegação entre telas com guard de autenticaçãoPiniaGerenciamento de estado global (auth store)AxiosIntegração com a API RESTFontAwesomeÍconesChart.js + vue-chartjsGráficos do Dashboard e Platform Dashboard


Pré-requisitos


Node.js 18+
npm 9+



Instalação

bashgit clone https://github.com/AKI-Softwares/project-construction-front.git
cd project-construction-front
npm install


Configuração

Crie um arquivo .env na raiz do projeto:

envVITE_API_URL=https://project-construction-back.vercel.app

Para desenvolvimento local com o back rodando localmente:

envVITE_API_URL=http://localhost:3000


Rodando o projeto

bashnpm run dev

Acesse em: http://localhost:5173

Build de produção:

bashnpm run build


Deploy


Plataforma: Vercel, conectado ao GitHub
Branch de produção: main
URL produção: https://project-construction-front.vercel.app
Todo commit na main dispara deploy automático
O campo CORS_ORIGINS no painel Vercel do back deve conter exatamente https://project-construction-front.vercel.app (sem barra no final)



Estrutura de pastas

src/
├── pages/
│   ├── Login/index.vue                     # W-01 Login
│   ├── ForgotPassword/index.vue            # W-02 Recuperar senha
│   ├── ForgotPassword/Sent.vue             # W-02 E-mail enviado
│   ├── ResetPassword/index.vue             # W-03 Nova senha via token
│   ├── ResetPassword/Success.vue           # W-03 Confirmação
│   ├── ChangePassword/index.vue            # W-04 Troca de senha (obrigatória ou voluntária)
│   ├── Dashboard/index.vue                 # W-05 Dashboard (usa /buildings, /apartments, /users)
│   ├── Buildings/index.vue                 # W-06/W-08 Empreendimentos + Apartamentos + Checklist
│   ├── ApartmentTypes/index.vue            # W-07 Tipos de Apartamento (CRUD + cômodos)
│   ├── Services/index.vue                  # W-09 Catálogo de Serviços (CRUD)
│   ├── Visits/index.vue                    # W-10 Vistorias listagem (implementado pelo colega)
│   ├── Visits/Detail.vue                   # W-10 Vistorias detalhe (implementado pelo colega)
│   ├── Team/index.vue                      # W-11/W-12 Equipe — usuários e funções
│   ├── Team/Register.vue                   # W-11 Cadastro de usuário
│   ├── Settings/index.vue                  # W-13 Configurações da empresa (visual — aguarda endpoint self-service no back)
│   ├── NonConformities/index.vue           # W-14 Não-Conformidades (bloqueada — aguarda GET /non-conformities no back)
│   ├── Reinspections/index.vue             # W-15 Re-inspeções (lista as sem inspetor via GET /visits/available-reinspections)
│   ├── Platform/
│   │   ├── Dashboard/index.vue             # WP-01 Dashboard da Plataforma
│   │   ├── Companies/index.vue             # WP-02 Gestão de Empresas — lista
│   │   ├── CompanyDetail/index.vue         # WP-02 Gestão de Empresas — detalhe
│   │   ├── Catalog/index.vue               # WP-03/WP-04 Catálogo Global (serviços + tipos)
│   │   └── RoleTemplates/index.vue         # WP-05 Templates de Funções
│   ├── Register/index.vue                  # Cadastro de empresa (público — auto-registro)
│   └── EmConstrucao/index.vue              # Placeholder para Calendário e Relatórios
├── components/Layout/
│   ├── Sidebar.vue          # Menu lateral recolhível (60px → 260px no hover). Seção PLATAFORMA só aparece para isPlatformAdmin
│   ├── Header.vue           # Título + nome do usuário via GET /auth/me
│   ├── MainLayout.vue       # Layout base (Sidebar + Header + slot)
│   └── ChecklistModal.vue   # Modal de checklist por apartamento
├── services/
│   ├── api.js               # Axios base: injeta Bearer token, envia X-Company-Id, redireciona em 401
│   ├── analytics.js         # getOverview, getBuildingRanking, getQuality
│   ├── apartmentTypes.js    # CRUD de tipos + cômodos + serviços padrão por cômodo
│   ├── apartments.js        # getApartments, createApartment, getApartmentTypes
│   ├── auth.js              # login, me, forgotPassword, resetPassword, changePassword
│   ├── buildings.js         # getBuildings, getBuilding, createBuilding
│   ├── checklists.js        # getChecklistByApartment, updateChecklistItem
│   ├── permissions.js       # getPermissions
│   ├── platform.js          # Empresas, role-templates, catálogo global e analytics da plataforma
│   ├── roles.js             # getRoles, createRole, deleteRole
│   ├── services.js          # CRUD de serviços do catálogo
│   ├── users.js             # getUsers, createUser, deleteUser, resetUserPassword
│   └── visits.js            # getVisits, getVisit, getAvailableReinspections, createReinspection
├── store/
│   └── auth.js              # Pinia store: state.token reativo, getters hasPermission + isPlatformAdmin, actions setToken + logout
├── utils/
│   └── checklist.js         # groupChecklistByRoom: transforma resposta do back em estrutura por cômodo
├── router/index.js          # Todas as rotas + guard de autenticação
└── main.js                  # Vue + Pinia + Router + FontAwesome


Rotas

Públicas

RotaTela/loginW-01 Login/forgot-passwordW-02 Recuperar senha/forgot-password/sentW-02 E-mail enviado/reset-passwordW-03 Nova senha via token/reset-password/successW-03 Senha redefinida

Privadas — Gestor de Empresa

RotaTelaStatus/change-passwordW-04 Troca de senha✅/dashboardW-05 Dashboard✅ dados reais/buildingsW-06/W-08 Empreendimentos + Apartamentos✅/apartment-typesW-07 Tipos de Apartamento✅/servicesW-09 Catálogo de Serviços✅/visitsW-10 Vistorias✅ (colega)/visits/:idW-10 Detalhe da vistoria✅ (colega)/teamW-11/W-12 Equipe✅/team/registerW-11 Cadastro de usuário✅/configuracoesW-13 Configurações⚠️ visual — aguarda endpoint no back/non-conformitiesW-14 Não-Conformidades🚫 bloqueada — aguarda GET /non-conformities/reinspectionsW-15 Re-inspeções⚠️ parcial — só lista sem inspetor/calendarioCalendário❌ em construção/relatoriosRelatórios❌ em construção

Privadas — Platform Admin (isPlatformAdmin: true)

RotaTelaStatus/platform/dashboardWP-01 Dashboard da Plataforma✅/platform/companiesWP-02 Gestão de Empresas✅/platform/companies/:idWP-02 Detalhe da empresa✅/platform/catalogWP-03/WP-04 Catálogo Global✅/platform/role-templatesWP-05 Templates de Funções✅


Autenticação

JWT Bearer token. Fluxo:


POST /auth/login → recebe { token }
authStore.setToken(token) — sempre use a action da store, nunca localStorage.setItem direto; os getters hasPermission e isPlatformAdmin leem de state.token e só recalculam quando esse state muda
Interceptor do Axios injeta Authorization: Bearer <token> em toda requisição
401 → limpa token e redireciona para /login automaticamente
Se isPlatformAdmin: true e companyId presente, interceptor envia X-Company-Id
Se mustChangePassword: true no JWT → redireciona para /change-password antes de entrar


JWT payload:

json{
  "sub": "string",
  "companyId": "number | null",
  "isPlatformAdmin": "boolean",
  "isCompanyAdmin": "boolean",
  "roleId": "number | null",
  "permissions": "string[]",
  "mustChangePassword": "boolean"
}

Verificação de permissão nas telas:

javascriptconst authStore = useAuthStore()
authStore.hasPermission('buildings:create') // true para isCompanyAdmin e isPlatformAdmin
authStore.isPlatformAdmin                   // true somente para platform admins


Back-end

Repositório: project-construction-back

URL produção: https://project-construction-back.vercel.app

Stack: Fastify v5 + Prisma v6 + PostgreSQL (Neon) — arquitetura hexagonal, deploy Vercel serverless.


Gaps de back-end conhecidos

Limitações documentadas para o responsável pelo back:

TelaEndpoint necessárioImpactoW-14GET /non-conformities com filtros buildingId, status, inspectorId, periodTela completamente bloqueadaW-13Endpoint self-service para empresa atualizar seus dadosTela é visual, salvar não funcionaW-15GET /visits?type=REINSPECTION sem filtro /mineSó mostra re-inspeções sem inspetorWP-02GET /roles?companyId=X ou campo companyId no payloadCriar usuário por empresa está bloqueadoWP-02Seed automático ao criar empresa via POST /platform/companiesEmpresa criada sem funções nem catálogo


Padrões do projeto


Variáveis e funções em inglês no código; textos da interface em português
Toda comunicação com o back passa pelos arquivos em src/services/ — nunca use fetch ou axios direto nas telas
Nunca use localStorage.setItem('token', ...) direto — sempre use authStore.setToken() para manter a reatividade do Pinia
Permissões verificadas via authStore.hasPermission('recurso:ação') — não leia o JWT direto nas telas
Quando um endpoint não existe, use um banner de aviso honesto na tela (padrão W-14, W-15, WP-02) — nunca simule funcionalidade
Cores: teal #00e5cc (primária), dark navy #0d0d2b (headers/botões), laranja #f99f56 (alertas), vermelho #c0392b (perigo), amarelo #f5a623 (avisos)



Status do projeto

Backoffice web: ~90% do escopo construído.

Concluído


 Fluxo completo de autenticação (login, recuperação, troca de senha obrigatória/voluntária)
 Dashboard com dados reais de empreendimentos, apartamentos e usuários
 Empreendimentos + Apartamentos (individual e em lote) + Checklist modal
 Tipos de Apartamento (CRUD + cômodos + serviços padrão por cômodo)
 Catálogo de Serviços (CRUD com filtro por categoria)
 Vistorias — listagem e detalhe (implementado pelo colega)
 Equipe — usuários (cadastro, listagem, exclusão, reset de senha)
 Equipe — funções (CRUD com seleção de permissões por recurso)
 Configurações da empresa (visual — aguarda endpoint no back)
 Não-Conformidades (tela de bloqueio com alternativa via PDF de vistoria)
 Re-inspeções (lista as disponíveis sem inspetor designado)
 Platform Admin completo: Dashboard, Empresas, Catálogo Global, Templates de Funções
 Sidebar adaptativa com seção PLATAFORMA exclusiva para isPlatformAdmin: true


Pendente de back-end


 GET /non-conformities com filtros (W-14)
 Endpoint self-service de empresa (W-13)
 GET /visits?type=REINSPECTION sem filtro /mine (W-15)
 GET /roles?companyId=X para criar usuário por empresa (WP-02)
 Seed automático em POST /platform/companies (WP-02)


Pendente de front-end


 Calendário — escopo a definir
 Relatórios — escopo a definir
 Integração AbacatePay na tela de Configurações (aguarda back)
