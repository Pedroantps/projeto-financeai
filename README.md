# FinanceAI - Gestão Financeira Inteligente com Open Finance e IA

## 1. Visão Geral do Projeto
O **FinanceAI** é uma aplicação web full-stack desenvolvida para automatizar e otimizar a gestão de finanças pessoais. O sistema substitui a tediosa inserção manual de gastos por uma sincronização direta com as contas bancárias do usuário via **Open Finance**. 

O grande diferencial do projeto é a utilização de **Inteligência Artificial (LLMs)** no back-end para processar as descrições confusas dos extratos bancários (ex: "COMPRA CARTAO PAG*IFOOD"), higienizando os dados e categorizando as despesas automaticamente (ex: "Alimentação - iFood"). O resultado é entregue ao usuário em um dashboard interativo e em tempo real.

## 2. Arquitetura e Stack Tecnológica
O projeto adota uma arquitetura cliente-servidor, separando claramente as responsabilidades de interface, regras de negócio e integrações externas.

* **Front-end:** Next.js, React, Tailwind CSS (para estilização responsiva) e Chart.js (para visualização de dados).
* **Back-end:** Node.js com Express.js (construção da API RESTful).
* **Integrações (APIs Externas):**
  * **Pluggy API:** Atua como o agregador de Open Finance, fornecendo o ambiente de Sandbox para simulação de conexão bancária e extração de transações.
  * **Groq API:** Motor de Inteligência Artificial utilizado para o Processamento de Linguagem Natural (NLP), responsável por limpar e categorizar as transações brutas.
* **Banco de Dados:** PostgreSQL (sugestão) para armazenamento persistente e seguro das transações já processadas.

## 3. Descrição dos Diagramas de Arquitetura (UML)

Para fins de documentação visual e entendimento do fluxo de dados, o sistema baseia-se nas seguintes modelagens:

### 3.1. Diagrama de Casos de Uso
Descreve as interações diretas do usuário com o sistema:
* **Ator Principal:** Usuário final.
* **Ações:** 
  * "Conectar Conta Bancária" (aciona o widget do Open Finance).
  * "Visualizar Dashboard de Gastos" (exibe gráficos gerados pelo front-end).
  * "Sincronizar Novas Transações" (solicita ao back-end a atualização do extrato).

### 3.2. Diagrama de Sequência (Fluxo de Sincronização)
Descreve a comunicação passo a passo entre as camadas do sistema durante a extração e processamento de dados:
1. O **Front-end (Next.js)** envia uma requisição de sincronização para a **API Interna (Node.js)**.
2. A **API Interna** autentica a requisição e chama a **API da Pluggy**, solicitando o extrato bruto dos últimos 30 dias.
3. A **Pluggy** retorna um JSON com as transações bancárias (com descrições sujas e sem categoria).
4. A **API Interna** itera sobre essas transações e envia um prompt estruturado para a **API do Groq (IA)**.
5. A **API do Groq** analisa o contexto de cada descrição e retorna um JSON com o "Nome Limpo" e a "Categoria Mapeada".
6. A **API Interna** salva esse dado consolidado no **Banco de Dados**.
7. A **API Interna** responde ao **Front-end** com o status de sucesso e os dados prontos para a geração dos gráficos.

## 4. Segurança e Boas Práticas
Tratando-se de dados financeiros simulados e integrações sensíveis, o projeto implementa as seguintes diretrizes de segurança:
* **Isolamento de Credenciais:** As chaves de API da Pluggy e do Groq residem exclusivamente no servidor (Node.js). O Front-end não possui acesso a esses *secrets*.
* **Gerenciamento de Variáveis de Ambiente:** Utilização de arquivos `.env` para armazenar credenciais localmente, com a inclusão deste arquivo no `.gitignore` para evitar vazamentos no repositório público.
* **Comunicação Segura:** O widget de conexão bancária (Pluggy Connect) roda em um ambiente isolado em iframe, garantindo que as credenciais do banco do usuário nunca passem pelo back-end da aplicação.

## 5. Guia de Instalação e Execução (Setup)

### Pré-requisitos
* Node.js (v18 ou superior)
* Gerenciador de pacotes (npm ou yarn)
* Contas de desenvolvedor ativas na [Pluggy](https://pluggy.ai/) e no [Groq](https://groq.com/).

### Passo a Passo
1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/finai.git](https://github.com/seu-usuario/finai.git)