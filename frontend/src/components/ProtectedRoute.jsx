import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

/**
 * ProtectedRoute
 *
 * Props:
 *   children   — o componente a renderizar
 *   roles      — array opcional de roles permitidos, ex: [1] para só coordenadora
 *                se omitido, qualquer utilizador autenticado passa
 *
 * Exemplos de uso no App.jsx:
 *   <ProtectedRoute><Home /></ProtectedRoute>                    // qualquer role
 *   <ProtectedRoute roles={[1]}><AulasAdmin /></ProtectedRoute>  // só coordenadora
 *   <ProtectedRoute roles={[2]}><DisponibilidadeDocente /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/login" replace />

    if (roles && roles.length > 0) {
        const user = authService.getUser()
        if (!user || !roles.includes(user.role)) {
            // Utilizador autenticado mas sem permissão → redireciona para home
            return <Navigate to="/home" replace />
        }
    }

    return children
}