require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PluggyClient } = require('pluggy-sdk');
const Groq = require('groq-sdk');
// Importa o Prisma
// 1. Importa as ferramentas novas
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// 2. Cria o motor de conexão usando a sua chave da Neon (que está no .env)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 3. Inicia o Prisma entregando o adaptador para ele (resolvendo o erro de inicialização vazia!)
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 2. Configurando o "Crachá" de acesso da Pluggy
const pluggyClient = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.get('/api/status', (req, res) => {
    res.json({ mensagem: "Servidor FinanceAI rodando!", status: "Online" });
});

app.get('/api/bancos', async (req, res) => {
    try {
        const bancos = await pluggyClient.fetchConnectors();
        
        res.json(bancos);
    } catch (erro) {
        console.error("Erro ao conectar com a Pluggy:", erro);
        res.status(500).json({ erro: "Falha ao buscar bancos na Pluggy." });
    }
});

app.get('/api/teste-ia', async (req, res) => {
    try {
        // Simulando um extrato sujo que recebemos do banco
        const transacaoSuja = "COMPRA CARTAO PAG*IFOOD SAO PAULO DATA 15/03";

        // Pedindo para a IA processar e limpar essa descrição
        const respostaDaIA = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente financeiro especializado em categorizar extratos bancários. Sua missão é ler a descrição suja e retornar APENAS um JSON válido contendo duas chaves: 'nome_limpo' e 'categoria' (Ex: Alimentação, Transporte, Saúde, Moradia). Não responda com nenhum texto além do JSON."
                },
                {
                    role: "user",
                    content: `Limpe esta transação: ${transacaoSuja}`
                }
            ],
            model: "llama-3.3-70b-versatile", // Modelo super rápido e gratuito do Groq
            temperature: 0.1, // Temperatura baixa para ela ser objetiva e não inventar coisas
            response_format: { type: "json_object" } // Garante que a IA nos devolva código e não um texto falado
        });

        // Extrai o texto da resposta da IA e transforma de volta em JSON real
        const dadosLimpos = JSON.parse(respostaDaIA.choices[0].message.content);

        // Envia o resultado bonitinho para a nossa tela
        res.json({
            original: transacaoSuja,
            processado: dadosLimpos
        });

    } catch (erro) {
        console.error("Erro na IA do Groq:", erro);
        res.status(500).json({ erro: "Falha ao processar a inteligência artificial." });
    }
});

app.get('/api/token', async (req, res) => {
    try {
        // Pede para a Pluggy um passe livre temporário
        const tokenData = await pluggyClient.createConnectToken();
        res.json({ accessToken: tokenData.accessToken });
    } catch (erro) {
        console.error("Erro ao gerar token da Pluggy:", erro);
        res.status(500).json({ erro: "Falha ao gerar o token de conexão." });
    }
});



app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // 1. Verifica se o usuário já existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: email }
        });

        if (usuarioExistente) {
            return res.status(400).json({ erro: "Este e-mail já está em uso." });
        }

        // 2. Salva no banco de dados na nuvem
        // (Nota: Em produção, nós vamos criptografar essa senha antes de salvar!)
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: nome,
                email: email,
                senha: senha 
            }
        });

        console.log("Novo usuário criado com sucesso:", novoUsuario.nome);
        res.status(201).json({ mensagem: "Conta criada com sucesso!", id: novoUsuario.id });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        res.status(500).json({ erro: "Falha interna ao criar a conta." });
    }
});

// NOVIDADE 7: Rota para Fazer Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Procura o usuário no banco de dados
        const usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });

        // 2. Verifica se o usuário existe e se a senha está correta
        // (Nota: Em produção, usaríamos o bcrypt para comparar senhas criptografadas!)
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        // 3. Devolve os dados essenciais para o front-end saber quem logou
        console.log("Login efetuado com sucesso:", usuario.nome);
        res.json({ 
            mensagem: "Login aprovado!", 
            id: usuario.id,
            nome: usuario.nome 
        });

    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: "Falha interna ao fazer login." });
    }
});

app.post('/api/bancos/conectar', async (req, res) => {
    try {
        const { usuarioId, pluggyItemId, banco } = req.body;

        // Verifica se o usuário enviou os dados certos
        if (!usuarioId || !pluggyItemId) {
            return res.status(400).json({ erro: "Dados incompletos." });
        }

        // Salva a conexão na nuvem usando o Prisma
        const novaConexao = await prisma.conexaoBancaria.create({
            data: {
                usuarioId: usuarioId,
                pluggyItemId: pluggyItemId,
                banco: banco || "Banco Desconhecido"
            }
        });

        console.log(`Nova conta do ${novaConexao.banco} conectada com sucesso!`);
        res.status(201).json({ mensagem: "Banco salvo com sucesso!", conexao: novaConexao });

    } catch (erro) {
        console.error("Erro ao salvar conexão:", erro);
        res.status(500).json({ erro: "Falha interna ao salvar o banco." });
    }
});

app.get('/api/bancos/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;

        const bancos = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: usuarioId },
            orderBy: { criadoEm: 'desc' } // Mostra os mais recentes primeiro
        });

        res.json(bancos);
    } catch (erro) {
        console.error("Erro ao buscar bancos:", erro);
        res.status(500).json({ erro: "Falha ao buscar as conexões." });
    }
});

// NOVIDADE 11: Rota para apagar (desconectar) um banco
app.delete('/api/bancos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Pede ao Prisma para eliminar o registo com este ID
        await prisma.conexaoBancaria.delete({
            where: { id: id }
        });

        res.json({ mensagem: "Banco desconectado e removido com sucesso!" });
    } catch (erro) {
        console.error("Erro ao eliminar banco:", erro);
        res.status(500).json({ erro: "Falha ao remover a conexão." });
    }
});

// NOVIDADE 12 (DEFINITIVA): Rota Mestra REAL - Pluggy + Groq AI (Lotes) + Prisma
app.post('/api/transacoes/sincronizar', async (req, res) => {
    try {
        const { conexaoId } = req.body;

        const conexao = await prisma.conexaoBancaria.findUnique({ where: { id: conexaoId } });
        if (!conexao) return res.status(404).json({ erro: "Conexão não encontrada." });

        console.log("🔗 Autenticando com a Pluggy...");
        const authResponse = await fetch('https://api.pluggy.ai/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: process.env.PLUGGY_CLIENT_ID,
                clientSecret: process.env.PLUGGY_CLIENT_SECRET
            })
        });
        const authData = await authResponse.json();
        if (!authData.apiKey) return res.status(401).json({ erro: "Credenciais da Pluggy inválidas" });

        // 3.1: Pegando a conta
        console.log(`🏦 Buscando contas do Item ID: ${conexao.pluggyItemId}...`);
        const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${conexao.pluggyItemId}`, {
            headers: { 'X-API-KEY': authData.apiKey }
        });
        const accountsData = await accountsResponse.json();
        if (!accountsData.results || accountsData.results.length === 0) {
            return res.status(400).json({ erro: "Nenhuma conta encontrada." });
        }

        const primeiraContaId = accountsData.results[0].id;

        // 3.2: Pegando TODAS as transações
        console.log(`💸 Buscando extrato real da Conta ID: ${primeiraContaId}...`);
        const pluggyResponse = await fetch(`https://api.pluggy.ai/transactions?accountId=${primeiraContaId}`, {
            headers: { 'X-API-KEY': authData.apiKey }
        });
        const pluggyData = await pluggyResponse.json();

        if (!pluggyData.results || pluggyData.results.length === 0) {
            return res.json({ mensagem: "Nenhuma transação encontrada no momento." });
        }
        const limiteTransacoes = 120; // Para evitar sobrecarregar a IA, vamos limitar a 120 transações por sincronização
        const todasTransacoes = pluggyData.results.slice(0, limiteTransacoes);
        console.log(`📦 Foram encontradas ${todasTransacoes.length} transações na Pluggy. Iniciando fatiamento...`);

        // --- A MÁGICA DO CHUNKING (LOTES) ---
        const tamanhoDoLote = 30; // Manda 30 transações por vez para a IA
        const transacoesSalvas = [];

        for (let i = 0; i < todasTransacoes.length; i += tamanhoDoLote) {
            const loteCru = todasTransacoes.slice(i, i + tamanhoDoLote);
            console.log(`🧠 Processando lote de transações (${i + 1} até ${i + loteCru.length})...`);

            const listaParaIA = loteCru.map(t => t.description).join(" | ");
            
            const prompt = `
            Analise as seguintes descrições de extrato bancário separadas por " | ". 
            Para cada uma, devolva um JSON estrito contendo um array de objetos com:
            - "descricaoOriginal"
            - "nomeLimpo" (nome legível da empresa ou pessoa)
            - "categoria" (Identifique a categoria de acordo com a descrição, coloque o que for apropriado, sempre tentando ser específico (Ex: Alimentação, Transporte, Saúde, etc).
            - "tipoPagamento" (Identifique o método lendo a descrição. Ex: se tiver "PIX", devolva "PIX". Se tiver "PAY" ou "COMPRA", perceba se foi Crédito ou Débito. Se for transferência, "TED/DOC". Caso não dê para saber, devolva "Outros").
            Extrato: ${listaParaIA}
            `;

            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.1-8b-instant", 
                    temperature: 0.1, 
                    response_format: { type: "json_object" } 
                });

                const iaResponse = JSON.parse(chatCompletion.choices[0].message.content);
                const transacoesLimpas = iaResponse.transacoes || iaResponse[Object.keys(iaResponse)[0]] || [];

                // Salva o lote no Prisma
                for (let j = 0; j < loteCru.length; j++) {
                    const tCrua = loteCru[j];
                    const tLimpa = transacoesLimpas[j];

                    const transacaoSalva = await prisma.transacao.upsert({
                        where: { pluggyTransactionId: tCrua.id },
                        update: {
                            // Se a transação já existe, vamos sobrepor com a nova análise da IA!
                            nomeLimpo: tLimpa?.nomeLimpo || tCrua.description,
                            categoria: tLimpa?.categoria || "Outros",
                            tipoPagamento: tLimpa?.tipoPagamento || (tCrua.amount > 0 ? "Recebimento" : "Pagamento")
                        }, 
                        create: {
                            pluggyTransactionId: tCrua.id,
                            descricaoOriginal: tCrua.description,
                            nomeLimpo: tLimpa?.nomeLimpo || tCrua.description,
                            categoria: tLimpa?.categoria || "Outros",
                            valor: tCrua.amount, 
                            dataOcorrencia: new Date(tCrua.date), 
                            // Pega o tipo da IA, ou usa uma lógica simples de fallback
                            tipoPagamento: tLimpa?.tipoPagamento || (tCrua.amount > 0 ? "Recebimento" : "Pagamento"),
                            conexaoId: conexao.id
                        }
                    });;
                    transacoesSalvas.push(transacaoSalva);
                }
            } catch (erroLote) {
                console.error(`⚠️ Erro ao processar o lote ${i}:`, erroLote.message);
                // Se um lote falhar (ex: a IA engasgou), ele avisa no log mas continua o próximo lote!
            }
        }

        console.log(`✅ Sincronização 100% concluída. ${transacoesSalvas.length} transações processadas.`);
        res.json({ mensagem: "Sincronização concluída com sucesso!", transacoes: transacoesSalvas });

    } catch (erro) {
        console.error("Erro na sincronização:", erro);
        res.status(500).json({ erro: "Falha na sincronização inteligente." });
    }
});

// NOVIDADE 13: Rota para buscar todas as transações de um usuário
app.get('/api/transacoes/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // 1. Primeiro, descobre quais são as conexões bancárias deste usuário
        const conexoes = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: usuarioId },
            select: { id: true } // Traz só o ID para ficar leve
        });

        // Extrai só a lista de IDs em um array: ['id1', 'id2']
        const conexoesIds = conexoes.map(c => c.id);

        // 2. Busca as transações que pertencem a essas conexões, ordenadas da mais nova pra mais velha
        const transacoes = await prisma.transacao.findMany({
            where: { conexaoId: { in: conexoesIds } },
            orderBy: { dataOcorrencia: 'desc' }
        });

        res.json(transacoes);
    } catch (erro) {
        console.error("Erro ao buscar transações:", erro);
        res.status(500).json({ erro: "Falha ao carregar o extrato." });
    }
});

// NOVIDADE 14 (ATUALIZADA COM FILTROS): Rota para calcular os dados do Dashboard
app.get('/api/dashboard/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { dataInicio, dataFim } = req.query; // 👈 Pega as datas da URL

        // 1. Acha os bancos do utilizador
        const conexoes = await prisma.conexaoBancaria.findMany({
            where: { usuarioId: usuarioId },
            select: { id: true }
        });
        const conexoesIds = conexoes.map(c => c.id);

        // 2. Prepara o Filtro de Data (se o utilizador selecionou alguma coisa)
        let filtroDeData = {};
        if (dataInicio && dataFim) {
            filtroDeData = {
                dataOcorrencia: {
                    gte: new Date(dataInicio), // Maior ou igual à data de início
                    lte: new Date(dataFim)     // Menor ou igual à data de fim
                }
            };
        }

        // 3. Pega as transações aplicando o filtro (se houver)
        const transacoes = await prisma.transacao.findMany({
            where: { 
                conexaoId: { in: conexoesIds },
                ...filtroDeData // 👈 Adiciona a regra da data aqui
            }
        });

        // 4. A MATEMÁTICA (Continua exatamente igual)
        let totalEntradas = 0;
        let totalSaidas = 0;
        const gastosPorCategoria = {};

        transacoes.forEach(t => {
            if (t.valor > 0) {
                totalEntradas += t.valor;
            } else {
                const valorGasto = Math.abs(t.valor); 
                totalSaidas += valorGasto;

                if (gastosPorCategoria[t.categoria]) {
                    gastosPorCategoria[t.categoria] += valorGasto;
                } else {
                    gastosPorCategoria[t.categoria] = valorGasto;
                }
            }
        });

        const dadosDoGrafico = Object.keys(gastosPorCategoria)
            .map(categoria => ({
                name: categoria,
                value: gastosPorCategoria[categoria]
            }))
            .sort((a, b) => b.value - a.value);

        res.json({
            entradas: totalEntradas,
            saidas: totalSaidas,
            saldo: totalEntradas - totalSaidas,
            grafico: dadosDoGrafico
        });

    } catch (erro) {
        console.error("Erro ao gerar dashboard:", erro);
        res.status(500).json({ erro: "Falha ao calcular o resumo financeiro." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});