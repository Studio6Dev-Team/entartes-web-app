import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import prisma from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

/**
 * POST /api/auth/login
 * Authenticates user, validates account state (ATIVO/INATIVO),
 * and issues JWT with role-based expiration.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await prisma.utilizador.findUnique({
            where: { codigo_username: username },
            include: { tipo_utilizador: true }
        })

        if (!user || !(await bcrypt.compare(password, user.pass))) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        if (user.estado === 'INATIVO') {
            return res.status(403).json({ error: 'Account suspended. Contact administration.' })
        }

        let roleName = user.tipo_utilizador?.nome?.toLowerCase() || ''
        if (['coordenação', 'coordenadora', 'administração'].includes(roleName)) {
            roleName = 'admin'
        }

        const expiresIn = roleName === 'admin' ? '20m' : '8h'

        const token = jwt.sign(
            { id: user.id_utilizador, role: roleName },
            process.env.JWT_SECRET,
            { expiresIn }
        )

        res.json({ token, role: roleName })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/auth/logout
 * Standard logout endpoint. Client handles token destruction.
 */
router.post('/logout', authenticate, (req, res) => {
    res.json({ message: 'Logged out' })
})

/**
 * GET /api/auth/me
 * Retrieves current authenticated user details.
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.utilizador.findUnique({
            where: { id_utilizador: req.user.id },
            select: {
                id_utilizador: true,
                codigo_username: true,
                estado: true,
                tipo_utilizador: { select: { nome: true } }
            }
        })

        if (!user) return res.status(404).json({ error: 'User not found' })

        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router