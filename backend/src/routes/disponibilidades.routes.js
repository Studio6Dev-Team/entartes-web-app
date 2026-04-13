import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isDocente } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'

const router = Router()

// All routes require at least authentication
router.use(authenticate)

/**
 * GET /api/disponibilidades
 * Lists availabilities. Students use this to find slots; Teachers/Admins can see schedules.
 * @query {number} docenteId - Filter by specific teacher
 * @query {string} data - Filter by date (YYYY-MM-DD)
 */
router.get('/', async (req, res) => {
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
})

/**
 * POST /api/disponibilidades
 * Creates a new availability slot for the authenticated teacher.
 * Critical Rule: Prevents overlapping time slots for the same teacher (RF-COA-01 CA2).
 */
router.post('/', isDocente, async (req, res) => {
    try {
        const { data, hora_inicio, hora_fim } = req.body
        const docente = await prisma.docente.findUnique({ where: { id_utilizador: req.user.id } })

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
})

/**
 * PUT /api/disponibilidades/:id
 * Updates an existing slot. Validates ownership before updating.
 */
router.put('/:id', isDocente, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const { hora_inicio, hora_fim } = req.body

        // Ensure the teacher updating the slot actually owns it
        const docente = await prisma.docente.findFirst({ where: { ID_User: req.user.id } })
        const existingSlot = await prisma.disponibilidade.findUnique({ where: { ID_Disponibilidade: id } })

        if (!existingSlot) return res.status(404).json({ error: 'Slot not found' })
        if (existingSlot.ID_Docente !== docente.ID_Docente) {
            return res.status(403).json({ error: 'You do not have permission to edit this slot' })
        }

        const updatedSlot = await prisma.disponibilidade.update({
            where: { ID_Disponibilidade: id },
            data: {
                ...(hora_inicio && { Hora_Inicio: hora_inicio }),
                ...(hora_fim && { Hora_Fim: hora_fim })
            }
        })

        res.json(updatedSlot)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update availability' })
    }
})

/**
 * DELETE /api/disponibilidades/:id
 * Removes an availability slot. Validates ownership.
 */
router.delete('/:id', isDocente, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const docente = await prisma.docente.findFirst({ where: { ID_User: req.user.id } })
        const existingSlot = await prisma.disponibilidade.findUnique({ where: { ID_Disponibilidade: id } })

        if (!existingSlot) return res.status(404).json({ error: 'Slot not found' })
        if (existingSlot.ID_Docente !== docente.ID_Docente) {
            return res.status(403).json({ error: 'You do not have permission to delete this slot' })
        }

        await prisma.disponibilidade.delete({
            where: { ID_Disponibilidade: id }
        })

        res.json({ message: 'Availability slot deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete slot. Ensure it is not linked to active bookings.' })
    }
})

export default router