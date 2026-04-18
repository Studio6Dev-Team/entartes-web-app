import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

// Role-specific home pages (same file, different sections)
import HomeAdmin   from './HomeAdmin'
import HomeDocente from './HomeDocente'
import HomeAluno   from './HomeAluno'

/**
 * Home.jsx — Router de conteúdo por role.
 *
 * Não tem layout próprio nem header — o DashboardLayout já cuida disso.
 * Simplesmente escolhe qual sub-view renderizar conforme o role do utilizador.
 *
 * role 1 → Coordenadora  → HomeAdmin
 * role 2 → Docente       → HomeDocente
 * role 3 → Aluno         → HomeAluno
 */
export default function Home() {
    const navigate = useNavigate()
    const user = authService.getUser()

    useEffect(() => {
        if (!user) navigate('/login', { replace: true })
    }, [user, navigate])

    if (!user) return null

    switch (user.role) {
        case 1:  return <HomeAdmin />
        case 2:  return <HomeDocente />
        case 3:  return <HomeAluno />
        default: return <HomeAluno />
    }
}
