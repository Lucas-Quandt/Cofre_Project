const ContaRepository = require('../repositories/contaRepository');
const bcrypt = require('bcrypt'); // 👈 Importação da biblioteca

// O COFRE: Rota de Cadastro
const registrar = async (req, res) => {
    const { nome, email, senha } = req.body;

    // 1. Verifica se o usuário já existe
    const contaExistente = await ContaRepository.buscarContaPorEmail(email);
    if (contaExistente) return res.status(400).json({ mensagem: 'Email já cadastrado.' });

    // 2. Criptografando a senha com custo 10
    const senha_hash = await bcrypt.hash(senha, 10); // 👈 Gera o Salt aleatório e o Hash

    // 3. Salva no banco (enviando o HASH, nunca a senha em texto limpo)
    const novaConta = await ContaRepository.criarConta(nome, email, senha_hash);
    
    res.status(201).json(novaConta);
};

// A PORTARIA: Rota de Login
const login = async (req, res) => {
    const { email, senha } = req.body;

    // 1. Busca se o email existe no banco
    const conta = await ContaRepository.buscarContaPorEmail(email);
    if (!conta) {
        // Por segurança, não confirmamos qual campo errou.
        return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    // 2. Comparando a senha (bcrypt cuida de extrair o Salt sozinho)
    const senhaValida = await bcrypt.compare(senha, conta.senha_hash); // 👈 Comparação segura

    if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    // 3. Sucesso!
    res.json({ mensagem: 'Login realizado com sucesso! Bem-vindo(a).' });
};

module.exports = { registrar, login };