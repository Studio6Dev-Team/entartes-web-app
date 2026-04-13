import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'

const router = Router()

// All users must be authenticated to view events, but only admins can manage them
router.use(authenticate)

/**
 * GET /api/eventos
 * Lists all active events. Accessible to any authenticated user (Alunos, Docentes, Admins).
 */
router.get('/', async (req, res) => {
    try {
        const eventos = await prisma.evento.findMany({
            select: {
                ID_Evento: true,
                Nome: true,
                Data_de_realizacao: true,
                Descricao: true
                // Assuming there might be a ticketing link field based on RF-EVT-01
            },
            orderBy: { Data_de_realizacao: 'asc' }
        })
        res.json(eventos)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/eventos
 * Creates a new event. Restricted to Administration.
 */
router.post('/', isAdmin, async (req, res) => {
    try {
        const { nome, descricao, data_realizacao, cronograma, link_bilheteira } = req.body

        if (!nome || !data_realizacao) {
            return res.status(400).json({ error: 'Name and date are required' })
        }

        const novoEvento = await prisma.evento.create({
            data: {
                Nome: nome,
                Descricao: descricao || '',
                Data_de_realizacao: new Date(data_realizacao),
                // Additional fields based on the Prisma schema
            }
        })

        res.status(201).json(novoEvento)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' })
    }
})

/**
 * GET /api/eventos/:id
 * Retrieves full details of an event, including associated groups and announcements.
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const evento = await prisma.evento.findUnique({
            where: { ID_Evento: id },
            include: {
                Grupo: true,
                Anuncio: true,
                Evento_Aluno: { include: { Aluno: { include: { User: { select: { Codigo_UserName: true } } } } } }
            }
        })

        if (!evento) return res.status(404).json({ error: 'Event not found' })

        res.json(evento)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PUT /api/eventos/:id
 * Updates event details (e.g., changing the date or description).
 */
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const { nome, descricao, data_realizacao } = req.body

        const eventoAtualizado = await prisma.evento.update({
            where: { ID_Evento: id },
            data: {
                ...(nome && { Nome: nome }),
                ...(descricao && { Descricao: descricao }),
                ...(data_realizacao && { Data_de_realizacao: new Date(data_realizacao) })
            }
        })

        res.json(eventoAtualizado)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' })
    }
})

/**
 * DELETE /api/eventos/:id
 * Cancels/Deletes an event. In a real scenario, this might trigger a status change
 * rather than a hard delete, depending on audit requirements.
 */
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        await prisma.evento.delete({
            where: { ID_Evento: id }
        })

        res.json({ message: 'Event successfully removed' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event. Ensure no foreign key constraints are violated.' })
    }
})

/**
 * POST /api/eventos/:id/participantes
 * Associates a student directly with an event.
 */
router.post('/:id/participantes', isAdmin, async (req, res) => {
    try {
        const idEvento = parseInt(req.params.id)
        const { id_aluno } = req.body

        if (isNaN(idEvento) || !id_aluno) return res.status(400).json({ error: 'Invalid payload' })

        const participacao = await prisma.evento_Aluno.create({
            data: {
                ID_Evento: idEvento,
                ID_Aluno: id_aluno
            }
        })

        res.status(201).json(participacao)
    } catch (error) {
        res.status(500).json({ error: 'Failed to add participant to event' })
    }
})

/**
 * DELETE /api/eventos/:id/participantes/:alunoId
 * Removes a student from an event.
 */
router.delete('/:id/participantes/:alunoId', isAdmin, async (req, res) => {
    try {
        const idEvento = parseInt(req.params.id)
        const idAluno = parseInt(req.params.alunoId)

        if (isNaN(idEvento) || isNaN(idAluno)) return res.status(400).json({ error: 'Invalid IDs' })

        // Note: Adjust the where clause based on your composite key or unique ID for Evento_Aluno
        await prisma.evento_Aluno.deleteMany({
            where: {
                ID_Evento: idEvento,
                ID_Aluno: idAluno
            }
        })

        res.json({ message: 'Participant removed from event' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove participant' })
    }
})

export default router