import prisma from '../prisma.js'
import bcrypt from 'bcrypt'

export const listUsers = async (req, res) => {
    try {
        const users = await prisma.utilizador.findMany({
            select: { id_utilizador: true, codigo_username: true, id_tipo: true, estado: true, tipo_utilizador: true }
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const createUser = async (req, res) => {
    try {
        const { username, password, id_tipo, nome, apelido } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.utilizador.create({
            data: {
                codigo_username: username,
                password: hashedPassword,
                id_tipo,
                nome,
                apelido,
                estado: 'ATIVO'
            }
        })
        res.status(201).json(newUser)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { estado } = req.body
        const updated = await prisma.utilizador.update({
            where: { id_utilizador: id },
            data: { estado }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' })
    }
}

export const exportUserData = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const data = await prisma.utilizador.findUnique({
            where: { id_utilizador: id },
            include: {
                aluno: { include: { aluno_marcacao: true, evento_aluno: true } },
                docente: { include: { marcacao: true, disponibilidade: true } }
            }
        })
        if (!data) return res.status(404).json({ error: 'Not found' })
        delete data.password
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Export failed' })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        await prisma.utilizador.delete({ where: { id_utilizador: id } })
        res.json({ message: 'User deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' })
    }
}