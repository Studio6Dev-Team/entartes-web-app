import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'
import { stringify } from 'csv-stringify/sync'

const router = Router()

router.use(authenticate, isAdmin)

/**
 * GET /api/relatorios/sessoes
 * Retrieves concluded sessions (id_estado: 4) within a date range.
 */
router.get('/sessoes', async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from || !to) return res.status(400).json({ error: 'Parameters "from" and "to" are required' })

        const sessoes = await prisma.marcacao.findMany({
            where: {
                id_estado: 4,
                data_a_realizar: { gte: new Date(from), lte: new Date(to) }
            },
            include: {
                docente: true,
                modalidade: true,
                sala: true,
                aluno_marcacao: { include: { aluno: true } }
            }
        })
        res.json(sessoes)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/relatorios/horas-docente
 * Aggregates coaching hours per teacher.
 */
router.get('/horas-docente', async (req, res) => {
    try {
        const data = await prisma.marcacao.groupBy({
            by: ['id_docente'],
            where: { id_estado: 4 },
            _sum: { duracao_minutos: true },
            _count: true
        })
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/relatorios/alunos
 * Consolidates total coaching minutes per student.
 */
router.get('/alunos', async (req, res) => {
    try {
        const marcacoesAlunos = await prisma.aluno_marcacao.findMany({
            where: { marcacao: { id_estado: 4 } },
            include: {
                aluno: true,
                marcacao: true
            }
        })

        const totaisPorAluno = marcacoesAlunos.reduce((acc, registo) => {
            const id = registo.id_aluno
            if (!acc[id]) {
                acc[id] = {
                    aluno: registo.aluno,
                    totalMinutos: 0,
                    totalSessoes: 0
                }
            }
            acc[id].totalMinutos += registo.marcacao.duracao_minutos || 0
            acc[id].totalSessoes += 1
            return acc
        }, {})

        res.json(Object.values(totaisPorAluno))
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/relatorios/exportar
 * Generates CSV for concluded sessions.
 */
router.get('/exportar', async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from || !to) return res.status(400).json({ error: 'Parameters "from" and "to" are required' })

        const sessoes = await prisma.marcacao.findMany({
            where: {
                id_estado: 4,
                data_a_realizar: { gte: new Date(from), lte: new Date(to) }
            },
            include: { docente: true, modalidade: true, sala: true }
        })

        const rows = sessoes.map(s => ({
            id: s.id_marcacoes,
            data: s.data_a_realizar?.toISOString().split('T')[0] || 'N/A',
            hora: s.hora_inicio,
            duracao_min: s.duracao_minutos,
            docente: s.docente?.id_utilizador || 'N/A',
            modalidade: s.modalidade?.nome || 'N/A',
            sala: s.sala?.nome || 'N/A'
        }))

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="sessoes.csv"')
        res.send(stringify(rows, { header: true }))
    } catch (error) {
        res.status(500).json({ error: 'CSV export failed' })
    }
})

export default router