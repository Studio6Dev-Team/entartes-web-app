import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'

const router = Router()
router.use(authenticate)

/**
 * POST /api/anuncios
 * Creates a new announcement linked to an event or group.
 */
router.post('/', isAdmin, async (req, res) => {
    try {
        const { id_evento, id_grupo, titulo, mensagem } = req.body

        const novoAnuncio = await prisma.anuncio.create({
            data: {
                id_evento: id_evento ? parseInt(id_evento) : null,
                id_grupo: id_grupo ? parseInt(id_grupo) : null,
                id_coordenadora: req.user.id,
                titulo,
                mensagem,
                data_envio: new Date()
            }
        })
        res.status(201).json(novoAnuncio)
    } catch (error) {
        res.status(500).json({ error: 'Failed to post announcement' })
    }
})

export default router