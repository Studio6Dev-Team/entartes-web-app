import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import {
    Home, CalendarDays, User, Bell,
    Calendar, LogOut, LayoutGrid, GraduationCap
} from 'lucide-react'

// ─── Nav items por role ────────────────────────────────────────────────────────
// role 1 = Coordenadora | role 2 = Docente | role 3 = Aluno
const NAV_BY_ROLE = {
    1: [
        { label: 'Home',             path: '/home',    icon: Home },
        { label: 'Horário',          path: '/horario', icon: Calendar },
        { label: 'Aulas',            path: '/aulas',   icon: CalendarDays },
        { label: 'Painel de Gestão', path: '/gestao',  icon: LayoutGrid },
        { label: 'Perfil',           path: '/profile', icon: User },
    ],
    2: [
        { label: 'Home',    path: '/home',    icon: Home },
        { label: 'Horário', path: '/horario', icon: Calendar },
        { label: 'Aulas',   path: '/aulas',   icon: CalendarDays },
        { label: 'Escola',  path: '/escola',  icon: GraduationCap },
        { label: 'Perfil',  path: '/profile', icon: User },
    ],
    3: [
        { label: 'Início',  path: '/home',    icon: Home },
        { label: 'Horário', path: '/horario', icon: Calendar },
        { label: 'Aulas',   path: '/aulas',   icon: CalendarDays },
        { label: 'Escola',  path: '/escola',  icon: GraduationCap },
        { label: 'Perfil',  path: '/profile', icon: User },
    ],
}

export default function DashboardHeader({ unreadCount = 0, onBellClick }) {
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || {}
    const role = user.role ?? 3
    const [firstName, ...rest] = (user.nome ?? 'Utilizador').split(' ')
    const lastName = rest.at(-1) ?? ''

    const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE[3]

    function handleLogout() {
        authService.logout()
        navigate('/login')
    }

    return (
        <nav className="bg-[#EFF5F4] border-b-[3px] border-brand-dark px-6 py-4 flex items-center justify-between sticky top-0 z-30">

            {/* Left: Greeting */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center shrink-0">
                    <span className="text-[#9CF1EE] text-lg font-medium">{firstName?.[0] ?? 'U'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#4A6362] text-sm tracking-wide">Bem-vinda</span>
                    <span className="text-black font-semibold text-xl leading-tight">
                        {firstName} {lastName}
                    </span>
                </div>
            </div>

            {/* Centre: Nav (role-aware) */}
            <div className="hidden md:flex items-center justify-center gap-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const Icon = item.icon
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="relative flex flex-col items-center justify-center w-[90px] h-16 group outline-none"
                        >
                            <div className={`flex items-center justify-center w-16 h-8 rounded-full mb-1 transition-colors
                                ${isActive ? 'bg-brand-light' : 'bg-transparent group-hover:bg-brand-light/50'}`}>
                                <Icon size={20} className={isActive ? 'text-[#324B4A]' : 'text-brand-darkest group-hover:text-[#324B4A]'} />
                            </div>
                            <span className={`text-xs font-medium tracking-wide text-center leading-tight ${isActive ? 'text-[#324B4A]' : 'text-brand-darkest'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Right: Bell + Logout */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBellClick}
                    className="relative flex items-center justify-center w-10 h-10 bg-[#4A6362] rounded-full hover:bg-[#3A504F] transition-colors"
                    title="Notificações"
                    aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} por ler` : ''}`}
                >
                    <Bell size={20} className="text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#B3261E] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#EFF5F4]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 bg-brand-bg border border-brand-dark rounded-full hover:bg-red-50 hover:border-red-300 transition-colors group"
                    title="Terminar Sessão"
                >
                    <LogOut size={18} className="text-brand-dark group-hover:text-red-600 transition-colors" />
                </button>
            </div>
        </nav>
    )
}