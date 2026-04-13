import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'
import bcrypt from 'bcrypt'

const router = Router()

router.use(authenticate, isAdmin)

/**
 * GET /api/users
 * Lists all registered users and their roles.
 */
router.get('/', async (req, res) => {
    try {
        const users = await prisma.utilizador.findMany({
            select: { id_utilizador: true, codigo_username: true, id_tipo: true, estado: true, tipo_utilizador: true }
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/users
 * Administrator creates a new user account manually.
 */
router.post('/', async (req, res) => {
    try {
        const { username, password, id_tipo, nome, apelido } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.utilizador.create({
            data: {
                codigo_username: username,
                password: hashedPassword, // Campo correto
                id_tipo: id_tipo,
                nome,
                apelido,
                estado: 'ATIVO'
            }
        })
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({ error: 'Check if username or email already exists' })
    }
})

/**
 * PATCH /api/users/:id/status
 * Suspends or reactivates a user account using VARCHAR states (ATIVO/INATIVO).
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { estado } = req.body

        if (isNaN(id) || !['ATIVO', 'INATIVO'].includes(estado)) {
            return res.status(400).json({ error: 'Invalid payload. State must be ATIVO or INATIVO.' })
        }

        const updatedUser = await prisma.utilizador.update({
            where: { id_utilizador: id },
            data: { estado: estado },
            select: { id_utilizador: true, codigo_username: true, estado: true }
        })

        res.json(updatedUser)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status' })
    }
})

/**
 * PATCH /api/users/:id/coaching-access
 * Grants or revokes access to the coaching module for a specific student.
 */
router.patch('/:id/coaching-access', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { hasCoachingAccess } = req.body

        if (isNaN(id) || typeof hasCoachingAccess !== 'boolean') {
            return res.status(400).json({ error: 'Invalid payload' })
        }

        const updated = await prisma.aluno.update({
            where: { id_utilizador: id },
            data: { coaching: hasCoachingAccess }
        })

        res.json({ message: 'Coaching access updated', state: updated.coaching })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/users/:id/export
 * GDPR Compliance (RNF-02): Exports all personal data based on Prisma relations.
 */
router.get('/:id/export', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const userData = await prisma.utilizador.findUnique({
            where: { id_utilizador: id },
            include: {
                aluno: { include: { aluno_marcacao: true, evento_aluno: true } },
                docente: { include: { marcacoes: true, disponibilidade: true } }
            }
        })

        if (!userData) return res.status(404).json({ error: 'User not found' })

        delete userData.pass

        res.json(userData)
    } catch (error) {
        res.status(500).json({ error: 'Data export failed' })
    }
})

/**
 * DELETE /api/users/:id
 * GDPR Compliance (RNF-02): Deletes the user.
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        await prisma.utilizador.delete({
            where: { id_utilizador: id }
        })

        res.json({ message: 'User data permanently deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' })
    }
})

export default router