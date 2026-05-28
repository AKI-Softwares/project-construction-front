# cofront-web

Frontend desktop do sistema **CheckObra** — plataforma de vistoria de obras em processo digital.

Desenvolvido em **Vue 3** com **Vite**, integrado ao back-end via **Axios** e autenticação **JWT**.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Vue 3 | Framework principal |
| Vite | Bundler e servidor de desenvolvimento |
| Vue Router | Navegação entre telas |
| Pinia | Gerenciamento de estado global |
| Axios | Integração com a API |

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/AKI-Softwares/project-construction-front.git
cd project-construction-front/cofront-web

# Instale as dependências
npm install
```

---

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3333
```

> A porta `3333` é a padrão do back-end. Ajuste se necessário.

---

## Rodando o projeto

```bash
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Estrutura de pastas

```
cofront-web/
├── .env                  # Variáveis de ambiente (não versionar)
├── index.html            # HTML base
├── vite.config.js        # Configuração do Vite
├── package.json
└── src/
    ├── assets/           # Imagens, fontes, ícones
    ├── components/       # Componentes reutilizáveis
    │   └── Layout/
    │       ├── Sidebar.vue   # Menu lateral
    │       └── Header.vue    # Cabeçalho (em desenvolvimento)
    ├── composables/      # Lógica reutilizável (hooks do Vue)
    ├── pages/            # Uma pasta por tela
    │   ├── Login/
    │   │   └── index.vue
    │   └── Dashboard/
    │       └── index.vue
    ├── router/
    │   └── index.js      # Definição de rotas
    ├── services/
    │   └── api.js        # Instância do Axios
    ├── store/
    │   └── auth.js       # Estado de autenticação (Pinia)
    ├── utils/            # Funções auxiliares
    ├── App.vue           # Componente raiz
    └── main.js           # Entry point
```

---

## Rotas disponíveis

| Rota | Tela | Autenticação |
|---|---|---|
| `/` | Redireciona para `/login` | — |
| `/login` | Tela de login | Pública |
| `/dashboard` | Dashboard principal | Privada |

---

## Integração com o back-end

O back-end utiliza **Fastify + JWT**. Toda requisição autenticada envia o token no header:

```
Authorization: Bearer <token>
```

O token é armazenado no `localStorage` após o login e removido ao sair.

O Axios está configurado em `src/services/api.js` com dois interceptors:

- **Request** — injeta o token automaticamente em toda requisição
- **Response** — redireciona para `/login` em caso de erro `401`

---

## Back-end

Repositório: [project-construction-back](https://github.com/AKI-Softwares/project-construction-back)

Porta padrão: `3333`

---

## Status do projeto

- [x] Estrutura de pastas
- [x] Configuração do Axios com interceptors
- [x] Vue Router configurado
- [x] Pinia store de autenticação
- [x] Tela de Login
- [x] Sidebar com menu de navegação
- [ ] Header com busca e perfil do usuário
- [ ] Layout principal (Sidebar + Header + conteúdo)
- [ ] Dashboard com dados reais
- [ ] Demais telas (Cadastro, Empreendimentos, Calendário, Equipe, Relatórios)
- [ ] Integração real com o back-end