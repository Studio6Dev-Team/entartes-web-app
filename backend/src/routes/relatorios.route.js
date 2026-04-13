import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import prisma from '../prisma.js'
import { stringify } from 'csv-stringify/sync'

const router = Router()

// Secures all reporting routes to Administration/Coordination only (RF-SEC-01)
router.use(authenticate, isAdmin)

/**
 * GET /api/relatorios/sessoes
 * Retrieves a detailed list of concluded sessions (State 4) within a specific date range.
 * Supports operational reporting and audit trails.
 * @query {string} from - Start date (YYYY-MM-DD)
 * @query {string} to - End date (YYYY-MM-DD)
 */
router.get('/sessoes', async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from || !to) return res.status(400).json({ error: 'Parameters "from" and "to" are required' })

        const sessoes = await prisma.marcacao.findMany({
            where: {
                ID_Estado: 4, // 4 = Concluída
                Data_a_realizar: { gte: new Date(from), lte: new Date(to) }
            },
            include: {
                Docente: true,
                Modalidade: true,
                Sala: true,
                ALUNO_MARCACAO: { include: { Aluno: true } }
            }
        })
        res.json(sessoes)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/relatorios/horas-docente
 * Aggregates coaching hours per teacher for payroll and management evaluation.
 * Aligns with RF-COA-09 (Automated Accounting).
 */
router.get('/horas-docente', async (req, res) => {
    try {
        const data = await prisma.marcacao.groupBy({
            by: ['ID_Docente'],
            where: { ID_Estado: 4 }, // Only counts fully validated/concluded sessions
            _sum: { Duracao_Minutos: true },
            _count: true
        })
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/relatorios/alunos
 * Consolidates total coaching minutes and session counts per student.
 * Critical for monthly billing generation (RF-COA-09).
 */
router.get('/alunos', async (req, res) => {
    try {
        // Fetches all concluded participations
        const marcacoesAlunos = await prisma.aLUNO_MARCACAO.findMany({
            where: { Marcacao: { ID_Estado: 4 } },
            include: {
                Aluno: true,
                Marcacao: true
            }
        })

        // Aggregates data by student ID to provide clean totals to the frontend
        const totaisPorAluno = marcacoesAlunos.reduce((acc, registo) => {
            const id = registo.ID_Aluno
            if (!acc[id]) {
                acc[id] = {
                    aluno: registo.Aluno,
                    totalMinutos: 0,
                    totalSessoes: 0
                }
            }
            acc[id].totalMinutos += registo.Marcacao.Duracao_Minutos
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
 * Generates a dynamic CSV file containing concluded sessions within a timeframe.
 * Aligns with RF-COA-08 (Invoicing Integration).
 * @query {string} from - Start date (YYYY-MM-DD)
 * @query {string} to - End date (YYYY-MM-DD)
 */
router.get('/exportar', async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from || !to) return res.status(400).json({ error: 'Parameters "from" and "to" are required' })

        const sessoes = await prisma.marcacao.findMany({
            where: {
                ID_Estado: 4, // 4 = Concluída
                Data_a_realizar: { gte: new Date(from), lte: new Date(to) }
            },
            include: { Docente: true, Modalidade: true, Sala: true }
        })

        // Maps complex relations into a flat structure suitable for CSV
        const rows = sessoes.map(s => ({
            id: s.ID_Marcacao,
            data: s.Data_a_realizar.toISOString().split('T')[0], // Extracts YYYY-MM-DD
            hora: s.Hora_Inicio,
            duracao_min: s.Duracao_Minutos,
            docente: s.Docente?.Nome || 'N/A',
            modalidade: s.Modalidade?.Nome || 'N/A',
            sala: s.Sala?.Nome || 'N/A'
        }))

        // Sets headers to trigger a file download in the browser
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="sessoes.csv"')
        res.send(stringify(rows, { header: true }))
    } catch (error) {
        res.status(500).json({ error: 'CSV export failed' })
    }
})

export default router