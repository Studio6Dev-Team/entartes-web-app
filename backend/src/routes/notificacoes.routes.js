import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import prisma from '../prisma.js'

const router = Router()
router.use(authenticate)

/**
 * GET /api/notificacoes
 * Retrieves all notifications for the logged-in user.
 */
router.get('/', async (req, res) => {
    try {
        const list = await prisma.notificacao.findMany({ // Singular
            where: { id_user: req.user.id },
            orderBy: { data_envio: 'desc' }
        })
        res.json(list)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/notificacoes/:id/lida
 * Marks a specific notification as read.
 */
router.patch('/:id/lida', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const note = await prisma.notificacao.findUnique({ where: { id_notificacao: id } })

        if (!note || note.id_user !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' })
        }

        const updated = await prisma.notificacao.update({
            where: { id_notificacao: id },
            data: { lida: true }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router