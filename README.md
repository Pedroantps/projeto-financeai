# 🚀 FinanceAI - Consultor Financeiro Inteligente

> O **FinanceAI** é uma plataforma moderna de gestão financeira que elimina a necessidade de planilhas manuais. Através da tecnologia de **Open Finance**, conecta-se de forma segura aos seus bancos e utiliza **Inteligência Artificial (Llama 3.3)** para categorizar gastos e gerar insights personalizados.

---

## ✨ Principais Funcionalidades

- **🏦 Sincronização Bancária Automática:** Integração com a API Pluggy para puxar extratos bancários automaticamente.
- **🧠 Consultor de Bolso IA:** A IA (Groq/Llama 3.3) analisa o seu volume de ganhos e gastos mensais, oferecendo dicas práticas, alertas de gastos excessivos e destaques positivos.
- **🛡️ Caching Inteligente (Token Saver):** Arquitetura otimizada que compara o volume financeiro antes e depois da sincronização. A IA só é consultada novamente se houver novas transações no mês.
- **📊 Dashboard Interativo:** Gráficos dinâmicos com filtros de alcance de datas e filtros independentes para o consultor IA (Estilo Power BI).
- **🌗 Modo Escuro / Claro:** Suporte nativo e fluido com persistência de memória (`localStorage`) e *Fade-in Hydration* para evitar ecrãs brancos.
- **📱 Design Totalmente Responsivo:** UI/UX premium baseada em *Glassmorphism*, com barra lateral retrátil (Desktop) e menu *Drawer* com clique de fecho no fundo (Mobile).

---

## 🛠️ Stack Tecnológica

### Frontend (`financeai-frontend`)
- **Framework:** Next.js (React)
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Gráficos:** Recharts

### Backend (`financeai-backend`)
- **Ambiente:** Node.js
- **Framework:** Express.js
- **ORM & Base de Dados:** Prisma + PostgreSQL
- **Integrações:** Groq API (IA) e Pluggy API (Open Finance)

---

## 🚀 Como Executar o Projeto Localmente

Para rodar o projeto, você precisará abrir **dois terminais separados**: um para o Backend e outro para o Frontend.

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado.
- Conta e Chaves API da [Groq](https://console.groq.com/).
- Conta e Chaves API da [Pluggy](https://pluggy.ai/).

---

### Passo 1: Iniciar o Backend e a Base de Dados

1. Abra o seu primeiro terminal e entre na pasta do backend:
   ```bash
   cd financeai-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo chamado **`.env`** dentro da pasta `financeai-backend` e cole as suas credenciais:
   ```env
   DATABASE_URL="file:./dev.db"
   PLUGGY_CLIENT_ID="sua_chave_pluggy_aqui"
   PLUGGY_CLIENT_SECRET="seu_secret_pluggy_aqui"
   GROQ_API_KEY="sua_chave_groq_aqui"
   ```

4. Prepare a Base de Dados (Prisma):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Inicie o servidor Backend:
   ```bash
   node server.js
   ```
   *(O servidor deve avisar que está rodando na porta 3333).*

---

### Passo 2: Iniciar o Frontend

1. Abra um **novo terminal** e entre na pasta do frontend:
   ```bash
   cd financeai-frontend
   ```

2. Instale as dependências do React/Next.js:
   ```bash
   npm install
   ```

3. Inicie a aplicação:
   ```bash
   npm run dev
   ```

4. Acesse no seu navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 🤝 Contribuições

Este projeto foi construído combinando as melhores práticas de Engenharia de Software com integrações de IA e Open Finance. Sinta-se à vontade para fazer um *fork* e melhorá-lo!

Desenvolvido com dedicação por **[Pedro Antonio]**
