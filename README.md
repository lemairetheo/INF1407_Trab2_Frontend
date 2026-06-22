# Biblioteca Comunitária — INF1407 (Frontend)

Frontend do **2º Trabalho de Programação para Web**, desenvolvido apenas com
**HTML, CSS e TypeScript** (sem frameworks). Consome a API REST do backend.

> Backend (Django + DRF) em outro repositório:
> [INF1407_Trab2_Backend](https://github.com/lemairetheo/INF1407_Trab2_Backend)

## Integrantes

* Théo Lemaire
* Lucie Brunelle

## Escopo

Interface de uma **biblioteca comunitária** com dois perfis de usuário:

* **Administrador:** adiciona livros que entram publicados, aprova as sugestões
  pendentes e remove qualquer avaliação.
* **Usuário comum:** sugere livros (ficam pendentes até a aprovação), vê o
  catálogo aprovado + suas próprias sugestões e avalia os livros.

Cada usuário tem uma **visão diferente** do site conforme seu perfil.

### Funcionalidades

* **Login / cadastro** e logout.
* **Gerência de senha:** trocar senha e "esqueci minha senha" (fluxo por email).
* **CRUD de livros** consumindo a API.
* **Moderação** (admin): aprovar livros pendentes.
* **Avaliações:** criar e remover avisos.

## Tecnologias

* HTML5 + CSS3
* **TypeScript** (todo o JavaScript é escrito em TypeScript)
* [Vite](https://vitejs.dev/) como bundler / servidor de desenvolvimento

## Estrutura

```
.
├── index.html              # catálogo + formulário + moderação
├── login.html              # entrar
├── register.html           # cadastro
├── change-password.html    # trocar senha
├── forgot-password.html    # esqueci minha senha
├── reset-password.html     # redefinir senha (via link do email)
└── src/
    ├── api.ts              # camada de acesso à API + JWT
    ├── ui.ts              # utilitários de interface
    ├── style.css          # estilos
    ├── main.ts            # lógica do catálogo
    ├── login.ts / register.ts / change-password.ts
    └── forgot-password.ts / reset-password.ts
```

## Instalação local

Pré-requisito: ter o **backend rodando** (por padrão em `http://127.0.0.1:8000`).

```bash
# 1. Clonar
git clone https://github.com/lemairetheo/INF1407_Trab2_Frontend.git
cd INF1407_Trab2_Frontend

# 2. Dependências
npm install

# 3. (opcional) configurar a URL da API
cp .env.example .env        # ajuste VITE_API_URL se necessário

# 4. Servidor de desenvolvimento
npm run dev                 # http://localhost:5173

# Para gerar a versão de produção:
npm run build               # saída em dist/
npm run preview             # pré-visualiza o build
```

## Manual do usuário

1. **Cadastre-se** em `register.html` ou entre em `login.html`.
2. No **catálogo**, veja os livros aprovados e avalie-os (nota + comentário).
3. **Sugira um livro** pelo formulário — usuários comuns geram uma sugestão
   pendente; administradores publicam diretamente.
4. **Administradores** veem a seção "Aguardando aprovação" e podem aprovar,
   editar ou excluir livros, além de remover avaliações.
5. **Trocar senha** pelo menu superior; **esqueci minha senha** na tela de login.

## Relato (o que funciona / o que não funciona)

> _A preencher antes da entrega._

* ✅ Funciona: _..._
* ❌ Não funciona: _..._
