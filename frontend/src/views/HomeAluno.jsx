import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CalendarDays, Clock, CheckCircle2, RefreshCw,
    Check, X, ChevronRight, BookOpen, Megaphone, Plus
} from 'lucide-react'
import { horarioService } from '../services/horarioService'
import { eventService } from '../services/eventService'
import { authService } from '../services/authService'

function StatPill({ count, label, color, bg, border }) {
    return (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-3 border ${bg} ${border}`}>
            <span className={`text-3xl font-bold font-['Sora'] ${color}`}>{count}</span>
            <span className={`text-sm font-medium ${color} leading-tight`}>{label}</span>
        </div>
    )
}

function MinhaAulaCard({ aula }) {
    const cfg = {
        1: 'bg-amber-50 text-amber-700 border-amber-200',
        2: 'bg-[#EFF5F4] text-[#006A68] border-[#80D5D2]',
        3: 'bg-red-50 text-red-600 border-red-200',
        4: 'bg-[#CCE8E6] text-[#006A68] border-[#006A68]',
    }[aula.id_estado] ?? 'bg-gray-50 text-gray-600 border-gray-200'

    return (
        <div className="bg-white border border-[#4a6362]/20 rounded-xl p-4 flex flex-col gap-2.5 min-w-[260px] max-w-[300px] hover:border-[#006A68] hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-[#324B4A] text-sm">{aula.modalidade}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg}`}>{aula.estado_nome}</span>
            </div>
            <div className="text-xs text-[#4A6362] space-y-0.5">
                <div>{aula.data} · {aula.hora}</div>
                <div>{aula.duracao} · {aula.sala}</div>
                <div className="text-[#006A68] font-medium">{aula.docente}</div>
            </div>
        </div>
    )
}

function EventCard({ event }) {
    const dt = event.data_de_realizacao
        ? new Date(event.data_de_realizacao).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Data por definir'
    return (
        <div className="bg-[#F4FBF9] border border-[#006A68]/30 rounded-xl p-4 flex flex-col gap-2 min-w-[260px] max-w-[300px]">
            <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-[#006A68]" />
                <h3 className="font-bold text-[#006A68] text-sm">{event.nome}</h3>
            </div>
            <p className="text-[#324B4A] text-xs font-semibold capitalize">{dt}</p>
            {event.descricao && <p className="text-[10px] text-[#6F7978] line-clamp-2">{event.descricao}</p>}
        </div>
    )
}

export default function HomeAluno() {
    const navigate = useNavigate()
    const user = authService.getUser()
    const [loading, setLoading] = useState(true)
    const [minhasAulas, setMinhasAulas] = useState([])
    const [eventos, setEventos] = useState([])

    const loadAll = useCallback(async () => {
        setLoading(true)
        try {
            const [aulasRes, evRes] = await Promise.allSettled([
                horarioService.getMinhasAulas(),
                eventService.getAll(),
            ])
            setMinhasAulas(aulasRes.status === 'fulfilled' ? aulasRes.value : [])
            setEventos(evRes.status === 'fulfilled' && Array.isArray(evRes.value) ? evRes.value.slice(0, 3) : [])
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { loadAll() }, [loadAll])

    const now = new Date()
    const proximas = minhasAulas.filter(a => new Date(a._data_raw) >= now).slice(0, 6)
    const confirmadas = proximas.filter(a => a.id_estado === 2)
    const pendentes = proximas.filter(a => a.id_estado === 1)

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-[#006A68]">
            <RefreshCw size={32} className="animate-spin" />
        </div>
    )

    return (
        <div className="font-['Sora'] space-y-10">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[#4A6362] text-sm font-medium tracking-wide mb-1">Painel do Aluno</p>
                    <h1 className="text-[#324B4A] font-normal text-4xl leading-tight">
                        Olá, <span className="text-[#006A68] font-semibold">{user?.nome ?? 'Aluno'}</span>
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/horario')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#006A68] text-white text-sm font-bold rounded-xl hover:bg-[#00504E] transition-colors"
                >
                    <Plus size={15} /> Inscrever em aula
                </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
                <StatPill count={minhasAulas.length} label="aulas inscritas" color="text-[#324B4A]" bg="bg-[#CCE8E6]" border="border-[#006A68]" />
                <StatPill count={pendentes.length} label="pendentes" color="text-amber-700" bg="bg-amber-50" border="border-amber-200" />
                <StatPill count={confirmadas.length} label="confirmadas" color="text-[#006A68]" bg="bg-[#EFF5F4]" border="border-[#80D5D2]" />
            </div>

            {/* Próximas aulas */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <CalendarDays size={24} className="text-[#006A68]" />
                    <h2 className="text-xl font-bold text-black flex-1">As minhas próximas aulas</h2>
                    <button onClick={() => navigate('/horario')} className="text-xs font-semibold text-[#006A68] hover:underline flex items-center gap-1">
                        Ver todas <ChevronRight size={13} />
                    </button>
                </div>
                {proximas.length === 0 ? (
                    <div className="text-center py-10 bg-[#EFF5F4]/40 rounded-2xl border-2 border-dashed border-[#4a6362]/15">
                        <BookOpen size={32} className="mx-auto text-[#006A68]/20 mb-2" />
                        <p className="text-sm text-[#4A6362]">Ainda não tens aulas agendadas.</p>
                        <button onClick={() => navigate('/horario')}
                            className="mt-3 text-xs font-bold text-[#006A68] underline">
                            Inscrever em aulas →
                        </button>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                        <div className="flex gap-4 w-max">
                            {proximas.map(a => <MinhaAulaCard key={a.id} aula={a} />)}
                        </div>
                    </div>
                )}
            </section>

            {/* Eventos */}
            {eventos.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Megaphone size={24} className="text-[#006A68]" />
                        <h2 className="text-xl font-bold text-black">Próximos eventos</h2>
                    </div>
                    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                        <div className="flex gap-4 w-max">
                            {eventos.map(e => <EventCard key={e.id_evento} event={e} />)}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}