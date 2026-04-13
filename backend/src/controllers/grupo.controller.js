import prisma from '../prisma.js'

export const addParticipanteGrupo = async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id)
        const { id_aluno } = req.body

        const grupo = await prisma.grupo.findUnique({ where: { id_grupo } })
        if (!grupo) return res.status(404).json({ error: 'Grupo não encontrado' })

        const inscrito = await prisma.evento_aluno.findFirst({
            where: { id_evento: grupo.id_evento, id_utilizador: id_aluno }
        })
        if (!inscrito) return res.status(403).json({ error: 'Aluno não inscrito no evento' })

        const vinculo = await prisma.aluno_grupo.create({
            data: { id_grupo, id_aluno }
        })
        res.status(201).json(vinculo)
    } catch (error) {
        res.status(500).json({ error: 'Erro interno' })
    }
}