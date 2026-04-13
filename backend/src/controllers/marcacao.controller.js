import prisma from '../prisma.js'

export const listMarcacoes = async (req, res) => {
    try {
        let where = {}
        if (req.user.role === 'aluno') {
            where = { aluno_marcacao: { some: { id_aluno: req.user.id } } }
        } else if (req.user.role === 'docente') {
            where = { id_docente: req.user.id }
        }
        const list = await prisma.marcacao.findMany({
            where,
            include: { estado_marcacao: true, docente: true, sala: true, modalidade: true }
        })
        res.json(list)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createMarcacao = async (req, res) => {
    try {
        const { id_docente, id_modalidade, data_a_realizar, hora_inicio, duracao_minutos, numero_alunos_pretendidos } = req.body
        const nova = await prisma.marcacao.create({
            data: {
                id_docente, id_modalidade, id_estado: 1,
                data_a_realizar: new Date(data_a_realizar),
                hora_inicio: new Date(hora_inicio),
                duracao_minutos, numero_alunos_pretendidos,
                id_user_criador: req.user.id
            }
        })
        await prisma.marcacao_estado_historico.create({ data: { id_marcacoes: nova.id_marcacoes, id_estado: 1 } })
        await prisma.aluno_marcacao.create({ data: { id_aluno: req.user.id, id_marcacoes: nova.id_marcacoes } })
        res.status(201).json(nova)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const getMarcacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const m = await prisma.marcacao.findUnique({
            where: { id_marcacoes: id },
            include: { estado_marcacao: true, sala: true, docente: true, modalidade: true, aluno_marcacao: { include: { aluno: true } }, marcacao_estado_historico: true }
        })
        if (!m) return res.status(404).json({ error: 'Not found' })
        res.json(m)
    } catch (error) {
        res.status(500).json({ error: 'Internal error' })
    }
}

export const validarMarcacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { id_sala } = req.body
        const updated = await prisma.marcacao.update({
            where: { id_marcacoes: id },
            data: { id_sala, id_estado: 2 }
        })
        await prisma.marcacao_estado_historico.create({ data: { id_marcacoes: id, id_estado: 2 } })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Validation failed' })
    }
}

export const cancelarMarcacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const updated = await prisma.marcacao.update({ where: { id_marcacoes: id }, data: { id_estado: 5 } })
        await prisma.marcacao_estado_historico.create({ data: { id_marcacoes: id, id_estado: 5 } })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Cancellation failed' })
    }
}

export const concluirMarcacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { confirmou } = req.body
        const isDocente = req.user.role === 'docente'
        const isAluno = req.user.role === 'aluno'
        const existing = await prisma.participacao_conclusao.findFirst({
            where: { id_marcacoes: id, OR: [{ id_docente: req.user.id }, { id_aluno: req.user.id }] }
        })
        if (!existing) {
            await prisma.participacao_conclusao.create({
                data: { id_marcacoes: id, id_docente: isDocente ? req.user.id : null, id_aluno: isAluno ? req.user.id : null, confirmou_conclusao: confirmou }
            })
        }
        const confirmations = await prisma.participacao_conclusao.findMany({ where: { id_marcacoes: id } })
        const docOK = confirmations.some(c => c.id_docente && c.confirmou_conclusao)
        const aluOK = confirmations.some(c => c.id_aluno && c.confirmou_conclusao)
        if (docOK && aluOK) {
            await prisma.marcacao.update({ where: { id_marcacoes: id }, data: { id_estado: 4 } })
            await prisma.marcacao_estado_historico.create({ data: { id_marcacoes: id, id_estado: 4 } })
        }
        res.json({ message: 'Recorded', concluded: docOK && aluOK })
    } catch (error) {
        res.status(500).json({ error: 'Error' })
    }
}

export const confirmarPresenca = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const record = await prisma.aluno_marcacao.findFirst({ where: { id_marcacoes: id, id_aluno: req.user.id } })
        if (!record) return res.status(404).json({ error: 'Record not found' })
        const updated = await prisma.aluno_marcacao.update({
            where: { id_aluno_marcacoes: record.id_aluno_marcacoes },
            data: { data_resposta: new Date() }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Internal error' })
    }
}