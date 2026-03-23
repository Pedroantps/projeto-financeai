require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PluggyClient } = require('pluggy-sdk');
const Groq = require('groq-sdk');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Inicializa as configurações principais e as conexões com o banco de dados via Prisma e Neon
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Instancia os clientes das APIs externas necessárias: Pluggy (Open Finance) e Groq (Inteligência Artificial)
const pluggyClient = new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET,
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Rota simples utilizada para a verificação do status de funcionamento do servidor
app.get('/api/status', (req, res) => {
    res.json({ mensagem: "Servidor FinanceAI rodando!", status: "Online" });
});

// Agrupa as rotas responsáveis pelos fluxos de registro e autenticação segura de usuários
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) return res.status(400).json({ erro: "Este e-mail já está em uso." });

        // Observação: Para cenários de produção, é obrigatória a utilização de bibliotecas como bcrypt para o hash das senhas
        const novoUsuario = await prisma.usuario.create({
            data: { nome, email, senha } 
        });

        console.log("👤 Novo usuário criado:", novoUsuario.nome);
        res.status(201).json({ mensagem: "Conta criada com sucesso!", id: novoUsuario.id });
    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        res.status(500).json({ erro: "Falha interna ao criar a conta." });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario || usuario.senha !== senha) { 
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        console.log("🔓 Login efetuado:", usuario.nome);
        res.json({ mensagem: "Login aprovado!", id: usuario.id, nome: usuario.nome });
    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: "Falha interna ao fazer login." });
    }
});

// Define os endpoints responsáveis pela integração bancária inicial e o gerenciamento das conexões de conta

// Rota para a geração do token do Connect Widget da Pluggy, consumido posteriormente pelo front-end
app.get('/api/pluggy/token', async (req, res) => {
    try {
        const tokenData = await pluggyClient.createConnectToken();
        res.json({ accessToken: tokenData.accessToken });
    } catch (erro) {
        console.error("Erro na Pluggy (Token):", erro);
        res.status(500).json({ erro: "Falha ao gerar o token de conexão." });
    }
});

// Registra no banco de dados a referência e os metadados de uma conta bancária recém conectada
app.post('/api/bancos', async (req, res) => {
    try {
        const { usuarioId, pluggyItemId, banco } = req.body;
        if (!usuarioId || !pluggyItemId) return res.status(400).json({ erro: "Dados incompletos." });

        const novaConexao = await prisma.conexaoBancaria.create({
            data: { usuarioId, pluggyItemId, banco: banco || "Banco Desconhecido" }
        });

        console.log(`🏦 Nova conta conectada: ${novaConexao.banco}`);
        res.status(201).json({ mensagem: "Banco salvo com sucesso!", conexao: novaConexao });
    } catch (erro) {
        console.error("Erro ao salvar banco:", erro);
        res.status(500).json({ erro: "Falha ao salvar a conexão bancária." });
    }
});

// Retorna a listagem de todas as conexões bancárias ativas e válidas vinculadas a um determinado usuário
app.get('/api/bancos/usuario/:id', async (req, res) => {
    try {
        const bancos = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: req.params.id },
            orderBy: { criadoEm: 'desc' }
        });
        res.json(bancos);
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao buscar as conexões." });
    }
});

// Remove uma conexão bancária do sistema e exclui automaticamente todas as transações nela atreladas (deleção em cascata)
app.delete('/api/bancos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apagadas = await prisma.transacao.deleteMany({ where: { conexaoId: id } });
        await prisma.conexaoBancaria.delete({ where: { id } });
        
        console.log(`🗑️ Banco e ${apagadas.count} transações removidas.`);
        res.json({ mensagem: "Banco removido com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao remover a conexão." });
    }
});

// Endpoints principais que orquestram a importação do extrato, o processamento de linguagem natural e a categorização via IA

app.post('/api/transacoes/sincronizar', async (req, res) => {
    try {
        const { conexaoId } = req.body;
        const conexao = await prisma.conexaoBancaria.findUnique({ where: { id: conexaoId } });
        if (!conexao) return res.status(404).json({ erro: "Conexão não encontrada." });

        console.log(`🔗 Buscando contas na Pluggy para: ${conexao.banco}...`);
        
        // Utiliza o SDK da Pluggy para facilitar o acesso e a busca paginada pelas contas dessa conexão específica
        const accounts = await pluggyClient.fetchAccounts(conexao.pluggyItemId);
        if (!accounts.results || accounts.results.length === 0) {
            return res.status(400).json({ erro: "Nenhuma conta encontrada neste banco." });
        }
        const primeiraContaId = accounts.results[0].id;

        console.log(`💸 Baixando extrato real...`);
        const transactions = await pluggyClient.fetchTransactions(primeiraContaId);
        if (!transactions.results || transactions.results.length === 0) {
            return res.json({ mensagem: "Nenhuma transação encontrada no momento." });
        }
        
        const todasTransacoes = transactions.results.slice(0, 120);
        console.log(`📦 Encontradas ${todasTransacoes.length} transações. Chamando a IA...`);

        const transacoesSalvas = [];
        const tamanhoDoLote = 30;

        for (let i = 0; i < todasTransacoes.length; i += tamanhoDoLote) {
            const loteCru = todasTransacoes.slice(i, i + tamanhoDoLote);
            console.log(`🧠 IA analisando lote (${i + 1} a ${i + loteCru.length}) de ${todasTransacoes.length}...`);

            const listaParaIA = loteCru.map(t => {
                const temFatura = t.creditCardMetadata ? "Sim" : "Null";
                return `[Valor: ${t.amount} | Cat. Banco: ${t.category || "Vazia"} | Fatura: ${temFatura}] ${t.description}`;
            }).join(" || ");
            
            const prompt = `
            Você é um analista financeiro sênior. Analise as transações separadas por " || ".
            Para CADA UMA, devolva um JSON estrito contendo um array de objetos chamado "transacoes" com as seguintes chaves exatas:
            - "descricaoOriginal": (mantenha a descrição exata enviada)
            - "nomeLimpo": (Remova códigos, datas e símbolos. Deixe APENAS o nome limpo da empresa. Ex: "Uber", "McDonalds", "Mercado Livre")
            - "categoria": (REGRA 1: Olhe a 'Cat. Banco' que eu enviei. Se for útil, use-a como base e traduza. Se for vazia ou genérica, deduza pelo nome. 
               REGRA 2: Encaixe OBRIGATORIAMENTE em UMA destas opções: 
               1. "Supermercado" (atacados, mercados, hortifruti)
               2. "Alimentação" (restaurantes, iFood, lanches)
               3. "Compras e Lojas" (roupas, eletrônicos, Shoppings, Mercado Livre, Amazon)
               4. "Transporte" (Uber, 99, postos de gasolina, passagens)
               5. "Saúde e Farmácia" (farmácias, médicos)
               6. "Assinaturas" (Netflix, Spotify)
               7. Use também: Moradia, Educação, Lazer, Serviços, Transferências, Salário, Investimentos. 
               Se não encaixar em nada, use "Outros".)
            - "tipoPagamento": (REGRA: Se a 'Fatura' for 'Sim', é "Cartão de Crédito". Se tiver "PIX", é "PIX". Se a 'Fatura' for 'Null' e for negativo, é "Cartão de Débito". Se for positivo, é "Recebimento".)
            
            Transações a processar: ${listaParaIA}
            `;

            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile", 
                    temperature: 0.1, 
                    response_format: { type: "json_object" } 
                });

                const iaResponse = JSON.parse(chatCompletion.choices[0].message.content);
                const transacoesLimpas = iaResponse.transacoes || iaResponse[Object.keys(iaResponse)[0]] || [];

                for (let j = 0; j < loteCru.length; j++) {
                    const tCrua = loteCru[j];
                    const tLimpa = transacoesLimpas[j];
                    const dataFaturaReal = tCrua.creditCardMetadata?.billDate ? new Date(tCrua.creditCardMetadata.billDate) : null;

                    const transacaoSalva = await prisma.transacao.upsert({
                        where: { pluggyTransactionId: tCrua.id },
                        update: {
                            nomeLimpo: tLimpa?.nomeLimpo || tCrua.description,
                            categoria: tLimpa?.categoria || "Outros",
                            tipoPagamento: tLimpa?.tipoPagamento || (tCrua.amount > 0 ? "Recebimento" : "Cartão de Débito"),
                            dataFatura: dataFaturaReal
                        }, 
                        create: {
                            pluggyTransactionId: tCrua.id,
                            descricaoOriginal: tCrua.description,
                            nomeLimpo: tLimpa?.nomeLimpo || tCrua.description,
                            categoria: tLimpa?.categoria || "Outros",
                            valor: tCrua.amount, 
                            dataOcorrencia: new Date(tCrua.date), 
                            tipoPagamento: tLimpa?.tipoPagamento || (tCrua.amount > 0 ? "Recebimento" : "Cartão de Débito"),
                            dataFatura: dataFaturaReal,
                            conexaoId: conexao.id
                        }
                    });
                    transacoesSalvas.push(transacaoSalva);
                }
            } catch (erroLote) {
                console.error(`⚠️ Erro da IA no lote ${i}:`, erroLote.message);
            }
        }

        console.log(`✅ Sincronização 100% concluída. ${transacoesSalvas.length} novas transações guardadas.`);
        res.json({ mensagem: "Sincronização concluída com sucesso!", transacoes: transacoesSalvas });
    } catch (erro) {
        console.error("Erro geral na sincronização:", erro);
        res.status(500).json({ erro: "Falha na sincronização inteligente." });
    }
});

app.get('/api/transacoes/:usuarioId', async (req, res) => {
    try {
        const conexoes = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: req.params.usuarioId },
            select: { id: true }
        });
        const conexoesIds = conexoes.map(c => c.id);

        const transacoes = await prisma.transacao.findMany({
            where: { conexaoId: { in: conexoesIds } },
            orderBy: { dataOcorrencia: 'desc' }
        });

        res.json(transacoes);
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao carregar o extrato." });
    }
});

app.get('/api/dashboard/:usuarioId', async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        
        const conexoes = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: req.params.usuarioId },
            select: { id: true }
        });

        let filtroDeData = {};
        if (dataInicio && dataFim) {
            filtroDeData = {
                dataOcorrencia: { gte: new Date(dataInicio), lte: new Date(dataFim) }
            };
        }

        const transacoes = await prisma.transacao.findMany({
            where: { 
                conexaoId: { in: conexoes.map(c => c.id) },
                ...filtroDeData 
            }
        });

        let entradas = 0;
        let saidas = 0;
        const gastosPorCategoria = {};

        transacoes.forEach(t => {
            if (t.valor > 0) {
                entradas += t.valor;
            } else {
                const valorGasto = Math.abs(t.valor); 
                saidas += valorGasto;
                gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + valorGasto;
            }
        });

        const dadosDoGrafico = Object.keys(gastosPorCategoria)
            .map(categoria => ({ name: categoria, value: gastosPorCategoria[categoria] }))
            .sort((a, b) => b.value - a.value);

        res.json({
            entradas,
            saidas,
            saldo: entradas - saidas,
            grafico: dadosDoGrafico
        });
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao calcular o resumo financeiro." });
    }
});

app.get('/api/insights/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { dataInicio, dataFim } = req.query; // Extrai os parâmetros de data através da querystring para a aplicação de restrições de período

        const conexoes = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: usuarioId },
            select: { id: true }
        });
        const conexoesIds = conexoes.map(c => c.id);

        if (conexoesIds.length === 0) {
            return res.json({
                resumo: "Conecte um banco para começarmos.",
                dicaPratica: "Vá à aba 'Meus Bancos' e adicione a sua primeira conta para receber insights automáticos.",
                alerta: null,
                destaquePositivo: null
            });
        }

        // Configura a restrição condicional de datas, adotando os últimos 30 dias corridos como o valor padrão de segurança
        let filtroData = {};
        if (dataInicio && dataFim) {
            filtroData = {
                dataOcorrencia: { gte: new Date(dataInicio), lte: new Date(dataFim) }
            };
        } else {
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            filtroData = { dataOcorrencia: { gte: trintaDiasAtras } };
        }

        const transacoes = await prisma.transacao.findMany({
            where: { conexaoId: { in: conexoesIds }, ...filtroData }
        });

        if (transacoes.length === 0) {
            return res.json({
                resumo: "Ainda não tem transações registadas neste mês.",
                dicaPratica: "Clique em 'Sincronizar Bancos' no Dashboard para atualizar o seu extrato.",
                alerta: null,
                destaquePositivo: null
            });
        }

        let totalGanhos = 0;
        let totalGastos = 0;
        const gastosPorCategoria = {};

        transacoes.forEach(t => {
            if (t.valor > 0) {
                totalGanhos += t.valor;
            } else {
                const gasto = Math.abs(t.valor);
                totalGastos += gasto;
                gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + gasto;
            }
        });

        const categoriasTexto = Object.entries(gastosPorCategoria)
            .map(([cat, valor]) => `- ${cat}: R$ ${valor.toFixed(2)}`)
            .join("\n");

        const prompt = `
        Você é um consultor financeiro sênior. Analise este resumo financeiro:
        Ganhos: R$ ${totalGanhos.toFixed(2)} | Gastos: R$ ${totalGastos.toFixed(2)} | Saldo: R$ ${(totalGanhos - totalGastos).toFixed(2)}
        Gastos por Categoria:
        ${categoriasTexto}

        Devolva um JSON:
        {
            "resumo": "Um parágrafo curto (máx 3 linhas) resumindo o mês.",
            "destaquePositivo": "Um elogio sobre algo bom.",
            "alerta": "Aviso sobre a categoria com maior gasto. Se o mês for bom, pode ser null.",
            "dicaPratica": "Dica financeira baseada nos dados."
        }
        `;

        console.log("🧠 Solicitando Insights ao Groq...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" } 
        });

        const insightJSON = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(insightJSON);

    } catch (erro) {
        console.error("Erro ao gerar insights:", erro);
        res.status(500).json({ erro: "Falha ao gerar o insight financeiro." });
    }
});

// Conclui as instâncias e inicia a aplicação, habilitando o servidor para a recepção de requisições na porta especificada
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});