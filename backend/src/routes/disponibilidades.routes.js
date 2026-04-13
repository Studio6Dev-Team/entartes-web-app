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

        // Build dynamic where clause based on provided query parameters
        let whereClause = {}
        if (docenteId) whereClause.ID_Docente = parseInt(docenteId)
        if (data) whereClause.Data_Semana = new Date(data) // Adjust to your Prisma schema date field

        const disponibilidades = await prisma.disponibilidade.findMany({
            where: whereClause,
            include: {
                Docente: { select: { Nome: true } },
                // Assuming there is a relation to Modalidade as per mockup Fig 15
            },
            orderBy: [{ Data_Semana: 'asc' }, { Hora_Inicio: 'asc' }]
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
        const { data, hora_inicio, hora_fim, modalidades } = req.body

        if (!data || !hora_inicio || !hora_fim) {
            return res.status(400).json({ error: 'Date, start time, and end time are required' })
        }

        // Identify the specific Docente record linked to the authenticated User
        const docente = await prisma.docente.findFirst({
            where: { ID_User: req.user.id }
        })

        if (!docente) {
            return res.status(403).json({ error: 'Authenticated user is not registered as a Teacher' })
        }

        const targetDate = new Date(data)

        // Overlap validation logic: Check if any existing slot overlaps with the new timeframe
        const overlappingSlot = await prisma.disponibilidade.findFirst({
            where: {
                ID_Docente: docente.ID_Docente,
                Data_Semana: targetDate,
                OR: [
                    {
                        Hora_Inicio: { lte: hora_fim },
                        Hora_Fim: { gte: hora_inicio }
                    }
                ]
            }
        })

        if (overlappingSlot) {
            return res.status(409).json({ error: 'Time slot overlaps with an existing availability' })
        }

        const novaDisponibilidade = await prisma.disponibilidade.create({
            data: {
                ID_Docente: docente.ID_Docente,
                Data_Semana: targetDate,
                Hora_Inicio: hora_inicio,
                Hora_Fim: hora_fim,
                // Depending on your schema, linking 'modalidades' might require a separate associative table insert here
            }
        })

        res.status(201).json(novaDisponibilidade)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create availability slot' })
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