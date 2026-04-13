import prisma from '../prisma.js'

export const listDisponibilidades = async (req, res) => {
    try {
        const { docenteId, data } = req.query
        let whereClause = {}
        if (docenteId) whereClause.id_docente = parseInt(docenteId)
        if (data) whereClause.data_especifica = new Date(data)

        const disponibilidades = await prisma.disponibilidade.findMany({
            where: whereClause,
            include: { docente: { include: { utilizador: { select: { nome: true } } } } },
            orderBy: [{ data_especifica: 'asc' }, { hora_inicio: 'asc' }]
        })
        res.json(disponibilidades)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createDisponibilidade = async (req, res) => {
    try {
        const { data, hora_inicio, hora_fim } = req.body
        const docente = await prisma.docente.findUnique({ where: { id_utilizador: req.user.id } })

        const overlappingSlot = await prisma.disponibilidade.findFirst({
            where: {
                id_docente: docente.id_utilizador,
                data_especifica: new Date(data),
                OR: [
                    { hora_inicio: { lte: new Date(hora_fim) }, hora_fim: { gte: new Date(hora_inicio) } }
                ]
            }
        })
        if (overlappingSlot) return res.status(409).json({ error: 'Time slot overlaps' })

        const nova = await prisma.disponibilidade.create({
            data: {
                id_docente: docente.id_utilizador,
                data_especifica: new Date(data),
                hora_inicio: new Date(hora_inicio),
                hora_fim: new Date(hora_fim)
            }
        })
        res.status(201).json(nova)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create slot' })
    }
}

export const updateDisponibilidade = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { hora_inicio, hora_fim } = req.body
        const docente = await prisma.docente.findUnique({ where: { id_utilizador: req.user.id } })
        const existingSlot = await prisma.disponibilidade.findUnique({ where: { id_disponibilidade: id } })

        if (!existingSlot) return res.status(404).json({ error: 'Slot not found' })
        if (existingSlot.id_docente !== docente.id_utilizador) return res.status(403).json({ error: 'Forbidden' })

        const updatedSlot = await prisma.disponibilidade.update({
            where: { id_disponibilidade: id },
            data: {
                ...(hora_inicio && { hora_inicio: new Date(hora_inicio) }),
                ...(hora_fim && { hora_fim: new Date(hora_fim) })
            }
        })
        res.json(updatedSlot)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update' })
    }
}

export const deleteDisponibilidade = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const docente = await prisma.docente.findUnique({ where: { id_utilizador: req.user.id } })
        const existingSlot = await prisma.disponibilidade.findUnique({ where: { id_disponibilidade: id } })

        if (!existingSlot) return res.status(404).json({ error: 'Slot not found' })
        if (existingSlot.id_docente !== docente.id_utilizador) return res.status(403).json({ error: 'Forbidden' })

        await prisma.disponibilidade.delete({ where: { id_disponibilidade: id } })
        res.json({ message: 'Deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' })
    }
}