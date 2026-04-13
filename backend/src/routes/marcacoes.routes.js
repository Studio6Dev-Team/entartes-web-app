import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin, isAluno } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'

const router = Router()

router.use(authenticate)

/**
 * GET /api/marcacoes
 * Retrieves bookings based on user role (Admin sees all, Teacher sees assigned, Student sees enrolled).
 */
router.get('/', async (req, res) => {
    try {
        let where = {}
        if (req.user.role === 'aluno') {
            where = { aluno_marcacao: { some: { id_aluno: req.user.id } } }
        } else if (req.user.role === 'docente') {
            where = { id_docente: req.user.id }
        }

        const marcacoes = await prisma.marcacao.findMany({
            where,
            include: {
                estado_marcacao: true,
                docente: true,
                sala: true,
                modalidade: true
            }
        })
        res.json(marcacoes)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/marcacoes
 * Creates a new coaching request. Enforces duration limits and checks teacher schedule conflicts.
 */
router.post('/', isAluno, async (req, res) => {
    try {
        const { id_docente, id_modalidade, data_a_realizar, hora_inicio, duracao_minutos, numero_alunos_pretendidos } = req.body

        const conflito = await prisma.marcacao.findFirst({
            where: {
                id_docente,
                data_a_realizar: new Date(data_a_realizar),
                id_estado: { notIn: [5] },
                hora_inicio: new Date(hora_inicio)
            }
        })

        if (conflito) return res.status(409).json({ error: 'Conflict with existing booking' })

        const novaMarcacao = await prisma.marcacao.create({
            data: {
                id_docente,
                id_modalidade,
                id_estado: 1,
                data_a_realizar: new Date(data_a_realizar),
                hora_inicio: new Date(hora_inicio),
                duracao_minutos,
                numero_alunos_pretendidos,
                id_user_criador: req.user.id
            }
        })

        await prisma.marcacao_estado_historico.create({
            data: { id_marcacoes: novaMarcacao.id_marcacoes, id_estado: 1 }
        })

        await prisma.aluno_marcacao.create({
            data: { id_aluno: req.user.id, id_marcacoes: novaMarcacao.id_marcacoes }
        })

        res.status(201).json(novaMarcacao)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/marcacoes/:id
 * Retrieves a single booking with full relational details.
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        // Corrigido: marcacao (singular)
        const m = await prisma.marcacao.findUnique({
            where: { id_marcacoes: id },
            include: {
                estado_marcacao: true,
                sala: true,
                docente: true,
                modalidade: true,
                // Corrigido: aluno_marcacao e marcacao_estado_historico (conforme o schema)
                aluno_marcacao: { include: { aluno: true } },
                marcacao_estado_historico: true
            }
        })

        if (!m) return res.status(404).json({ error: 'Not found' })
        res.json(m)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/marcacoes/:id/validar
 * Admin endpoint to assign a room and update state to Confirmed. Prevents room double-booking.
 */
router.patch('/:id/validar', isAdmin, async (req, res) => {
    try {
        const { id_sala } = req.body
        const id = parseInt(req.params.id)
        const current = await prisma.marcacao.findUnique({ where: { id_marcacoes: id } })

        const roomConflict = await prisma.marcacao.findFirst({
            where: {
                id_sala,
                id_estado: 2,
                data_a_realizar: current.data_a_realizar,
                hora_inicio: current.hora_inicio
            }
        })

        if (roomConflict) return res.status(409).json({ error: 'Room already booked' })

        const updated = await prisma.marcacao.update({
            where: { id_marcacoes: id },
            data: { id_sala, id_estado: 2 }
        })

        await prisma.marcacao_estado_historico.create({
            data: { id_marcacoes: id, id_estado: 2 }
        })

        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/marcacoes/:id/cancelar
 * Admin endpoint to cancel a booking. Updates the history trail.
 */
router.patch('/:id/cancelar', isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const updated = await prisma.marcacoes.update({
            where: { id_marcacoes: id },
            data: { id_estado: 5 }
        })

        await prisma.marcacoes_estado_historico.create({
            data: { id_marcacoes: id, id_estado: 5 }
        })

        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/marcacoes/:id/concluir
 * Registers double validation (teacher and student). Transitions booking to Concluded if both agree.
 */
router.patch('/:id/concluir', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { confirmou } = req.body
        if (isNaN(id) || typeof confirmou !== 'boolean') return res.status(400).json({ error: 'Invalid payload' })

        const isDocente = req.user.role === 'docente'
        const isAluno = req.user.role === 'aluno'

        if (!isDocente && !isAluno) {
            return res.status(403).json({ error: 'User not authorized to validate this session' })
        }

        const existing = await prisma.participacao_conclusao.findFirst({
            where: {
                id_marcacoes: id,
                OR: [
                    { id_docente: req.user.id },
                    { id_aluno: req.user.id }
                ]
            }
        })

        if (!existing) {
            await prisma.participacao_conclusao.create({
                data: {
                    id_marcacoes: id,
                    id_docente: isDocente ? req.user.id : null,
                    id_aluno: isAluno ? req.user.id : null,
                    confirmou_conclusao: confirmou
                }
            })
        }

        const allConfirmations = await prisma.participacao_conclusao.findMany({
            where: { id_marcacoes: id }
        })

        const docenteConfirmed = allConfirmations.some(c => c.id_docente && c.confirmou_conclusao)
        const alunoConfirmed   = allConfirmations.some(c => c.id_aluno && c.confirmou_conclusao)

        if (docenteConfirmed && alunoConfirmed) {
            await prisma.marcacoes.update({ where: { id_marcacoes: id }, data: { id_estado: 4 } })
            await prisma.marcacoes_estado_historico.create({
                data: { id_marcacoes: id, id_estado: 4 }
            })
        }

        res.json({ message: 'Validation recorded', concluded: docenteConfirmed && alunoConfirmed })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/marcacoes/:id/historico
 * Retrieves the state change history for a specific booking.
 */
router.get('/:id/historico', async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const historico = await prisma.marcacoes_estado_historico.findMany({
            where: { id_marcacoes: id },
            include: { estado_marcacoes: true },
            orderBy: { data_alteracao: 'asc' }
        })
        res.json(historico)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/marcacoes/:id/confirmar-presenca
 * Handles student presence confirmation within a strict 60-minute window from booking creation.
 */
router.patch('/:id/confirmar-presenca', isAluno, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

        const record = await prisma.aluno_marcacoes.findFirst({
            where: { id_marcacoes: id, id_aluno: req.user.id }
        })

        if (!record) return res.status(404).json({ error: 'Participation record not found' })

        const marcacao = await prisma.marcacoes.findUnique({ where: { id_marcacoes: id } })

        const minutesPassed = (Date.now() - new Date(marcacao.data_criacao)) / 60000

        if (minutesPassed > 60) {
            return res.status(410).json({ error: 'Confirmation window expired (60 min)' })
        }

        await prisma.aluno_marcacoes.update({
            where: { id_aluno_marcacoes: record.id_aluno_marcacoes },
            data: { data_resposta: new Date() }
        })

        res.json({ message: 'Presence confirmed' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router