import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'

const router = Router()
router.use(authenticate)

/**
 * GET /api/salas
 * Lists all available rooms (Studios).
 */
router.get('/', async (req, res) => {
    try {
        const rooms = await prisma.sala.findMany({ orderBy: { nome: 'asc' } })
        res.json(rooms)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/salas/:id
 * Removes a room. Restricted to Admins.
 */
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        await prisma.sala.delete({ where: { id_sala: id } })
        res.json({ message: 'Room removed' })
    } catch (error) {
        res.status(500).json({ error: 'Conflict: Room might be linked to existing bookings' })
    }
})

export default router