import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login          from './views/Login'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute  from './components/ProtectedRoute'

// Pages — shared across roles (component renders different content per role internally)
import Home    from './views/Home'      // routes to HomeAdmin / HomeDocente / HomeAluno
import Horario from './views/Horario'
import Aulas   from './views/Aulas'     // for aluno/docente
import Escola  from './views/Escola'
import Profile from './views/Profile'
import Events  from './views/Events'

// Pages — coordenadora only
import AulasAdmin from './views/AulasAdmin'  // Lista de Coachings (admin)
import Grupos     from './views/Grupos'      // Painel de Gestão → Grupos

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Protected: any authenticated user */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Home — renders HomeAdmin, HomeDocente or HomeAluno depending on role */}
                    <Route path="/home" element={<Home />} />

                    {/* Shared pages — all roles, but each page guards internally if needed */}
                    <Route path="/horario"  element={<Horario />} />
                    <Route path="/escola"   element={<Escola />} />
                    <Route path="/profile"  element={<Profile />} />
                    <Route path="/events"   element={<Events />} />

                    {/* /aulas:
                        - role 1 (coordenadora) → AulasAdmin (Lista de Coachings)
                        - role 2/3              → Aulas (confirmação / horário pessoal)
                        handled inside a wrapper below */}
                    <Route path="/aulas" element={<AulasRouter />} />

                    {/* Coordenadora only */}
                    <Route path="/gestao" element={
                        <ProtectedRoute roles={[1]}>
                            <Grupos />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

/**
 * AulasRouter — decides which Aulas view to show based on role.
 * Coordenadora (1) sees the full admin coaching list.
 * Docente (2) and Aluno (3) see their personal schedule/class confirmation.
 */
import { authService } from './services/authService'

function AulasRouter() {
    const user = authService.getUser()
    if (user?.role === 1) return <AulasAdmin />
    return <Aulas />
}