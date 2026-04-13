import prisma from '../prisma.js'

export const listEventos = async (req, res) => {
    try {
        const eventos = await prisma.evento.findMany({ orderBy: { data_de_realizacao: 'asc' } })
        res.json(eventos)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const getEvento = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const evento = await prisma.evento.findUnique({
            where: { id_evento: id },
            include: { grupo: true, anuncio: true, evento_aluno: { include: { aluno: true } } }
        })
        if (!evento) return res.status(404).json({ error: 'Event not found' })
        res.json(evento)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createEvento = async (req, res) => {
    try {
        const { nome, descricao, data_realizacao } = req.body
        const novo = await prisma.evento.create({
            data: { nome, descricao: descricao || '', data_de_realizacao: new Date(data_realizacao) }
        })
        res.status(201).json(novo)
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}

export const updateEvento = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { nome, descricao, data_realizacao } = req.body
        const updated = await prisma.evento.update({
            where: { id_evento: id },
            data: { ...(nome && { nome }), ...(descricao && { descricao }), ...(data_realizacao && { data_de_realizacao: new Date(data_realizacao) }) }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}

export const deleteEvento = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        await prisma.evento.delete({ where: { id_evento: id } })
        res.json({ message: 'Deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}

export const addParticipante = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { id_aluno } = req.body
        const p = await prisma.evento_aluno.create({ data: { id_evento: id, id_utilizador: id_aluno } })
        res.status(201).json(p)
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}

export const removeParticipante = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const aid = parseInt(req.params.alunoId)
        await prisma.evento_aluno.deleteMany({ where: { id_evento: id, id_utilizador: aid } })
        res.json({ message: 'Removed' })
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}