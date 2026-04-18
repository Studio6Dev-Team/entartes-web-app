import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CalendarDays, Clock, CheckCircle2, RefreshCw,
    Check, X, User, ChevronRight, AlertCircle, BookOpen
} from 'lucide-react'
import { aulasService } from '../services/aulasService'
import { eventService } from '../services/eventService'
import { authService } from '../services/authService'

function formatDateLong(raw) {
    if (!raw) return '—'
    return new Date(raw).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
}

function StatPill({ count, label, color, bg, border }) {
    return (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-3 border ${bg} ${border}`}>
            <span className={`text-3xl font-bold font-['Sora'] ${color}`}>{count}</span>
            <span className={`text-sm font-medium ${color} leading-tight`}>{label}</span>
        </div>
    )
}

function AulaCard({ aula, onConfirm, onCancel, loadingId }) {
    const isPendente = aula.id_estado === 1
    return (
        <div className="bg-[#F4FBF9] border border-[#006A68] rounded-xl p-5 flex flex-col gap-3 min-w-[280px] max-w-[340px]">
            <div className="text-sm space-y-0.5">
                <div><span className="text-[#006A68]">Modalidade: </span><span className="font-semibold text-[#000]">{aula.modalidade}</span></div>
                <div><span className="text-[#006A68]">Data: </span><span className="text-[#000]">{aula.data}</span></div>
                <div><span className="text-[#006A68]">Hora: </span><span className="text-[#000]">{aula.hora}</span></div>
                <div><span className="text-[#006A68]">Duração: </span><span className="text-[#000]">{aula.duracao}</span></div>
                <div><span className="text-[#006A68]">Sala: </span><span className="text-[#000]">{aula.sala}</span></div>
            </div>
            <div className="flex items-center gap-2">
                {isPendente ? (
                    <>
                        <button onClick={() => onConfirm(aula.id)} disabled={loadingId === aula.id}
                            className="flex-1 py-2 bg-[#049A59] border border-[#006A68] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5">
                            {loadingId === aula.id ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                            Confirmar
                        </button>
                        <button onClick={() => onCancel(aula.id)} disabled={loadingId === aula.id}
                            className="flex-1 py-2 bg-[#BA1A1A] border border-[#93000A] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5">
                            <X size={13} /> Cancelar
                        </button>
                    </>
                ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        aula.id_estado === 2 ? 'bg-[#EFF5F4] text-[#006A68] border-[#80D5D2]' :
                        aula.id_estado === 3 ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-[#CCE8E6] text-[#006A68] border-[#006A68]'
                    }`}>{aula.estado_nome}</span>
                )}
            </div>
        </div>
    )
}

function EventCard({ event }) {
    const dt = event.data_de_realizacao ? formatDateLong(event.data_de_realizacao) : 'Data por definir'
    return (
        <div className="bg-[#F4FBF9] border border-[#006A68] rounded-xl p-5 flex flex-col gap-2 min-w-[280px] max-w-[340px]">
            <h3 className="font-bold text-[#006A68] text-base">{event.nome}</h3>
            <p className="text-[#324B4A] font-semibold text-xs capitalize">{dt}</p>
            {event.descricao && <p className="text-xs text-[#6F7978] line-clamp-2">{event.descricao}</p>}
            <button className="self-end bg-[#80D5D2] border border-[#006A68] text-white text-xs font-semibold px-3 py-1 rounded-full hover:brightness-95">
                Ver mais
            </button>
        </div>
    )
}

export default function HomeDocente() {
    const navigate = useNavigate()
    const user = authService.getUser()
    const [loading, setLoading] = useState(true)
    const [loadingId, setLoadingId] = useState(null)
    const [aulas, setAulas] = useState([])
    const [eventos, setEventos] = useState([])
    const [toast, setToast] = useState(null)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadAll = useCallback(async () => {
        setLoading(true)
        try {
            const [aulasRes, evRes] = await Promise.allSettled([
                aulasService.getTodas(),
                eventService.getAll(),
            ])
            setAulas(aulasRes.status === 'fulfilled' ? aulasRes.value : [])
            setEventos(evRes.status === 'fulfilled' && Array.isArray(evRes.value) ? evRes.value.slice(0, 3) : [])
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { loadAll() }, [loadAll])

    async function handleConfirm(id) {
        setLoadingId(id)
        try {
            await aulasService.updateEstado(id, aulasService.ESTADOS.CONFIRMADA)
            setAulas(prev => prev.map(a => a.id === id ? { ...a, id_estado: 2, estado_nome: 'Confirmada' } : a))
            showToast('Aula confirmada!')
        } catch { showToast('Erro ao confirmar.', 'error') }
        finally { setLoadingId(null) }
    }

    async function handleCancel(id) {
        setLoadingId(id)
        try {
            await aulasService.updateEstado(id, aulasService.ESTADOS.CANCELADA)
            setAulas(prev => prev.map(a => a.id === id ? { ...a, id_estado: 3, estado_nome: 'Cancelada' } : a))
            showToast('Aula cancelada.')
        } catch { showToast('Erro ao cancelar.', 'error') }
        finally { setLoadingId(null) }
    }

    const now = new Date()
    const proximas = aulas.filter(a => new Date(a._data_raw) >= now).slice(0, 5)
    const pendentes = proximas.filter(a => a.id_estado === 1)
    const confirmadas = proximas.filter(a => a.id_estado === 2)
    const hoje = aulas.filter(a => new Date(a._data_raw).toDateString() === now.toDateString()).length

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-[#006A68]">
            <RefreshCw size={32} className="animate-spin" />
        </div>
    )

    return (
        <>
            <div className="font-['Sora'] space-y-10">
                {/* Header */}
                <div>
                    <p className="text-[#4A6362] text-sm font-medium tracking-wide mb-1">Painel do Docente</p>
                    <h1 className="text-[#324B4A] font-normal text-4xl leading-tight">
                        Olá, <span className="text-[#006A68] font-semibold">{user?.nome ?? 'Docente'}</span>
                    </h1>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-3">
                    <StatPill count={hoje} label="aulas hoje" color="text-[#324B4A]" bg="bg-[#CCE8E6]" border="border-[#006A68]" />
                    <StatPill count={pendentes.length} label="para confirmar" color="text-amber-700" bg="bg-amber-50" border="border-amber-200" />
                    <StatPill count={confirmadas.length} label="confirmadas" color="text-[#006A68]" bg="bg-[#EFF5F4]" border="border-[#80D5D2]" />
                </div>

                {/* Aulas a confirmar */}
                {pendentes.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={24} className="text-amber-600" />
                            <h2 className="text-xl font-bold text-black">Aulas a confirmar</h2>
                        </div>
                        <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                            <div className="flex gap-4 w-max">
                                {pendentes.map(a => (
                                    <AulaCard key={a.id} aula={a} onConfirm={handleConfirm} onCancel={handleCancel} loadingId={loadingId} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Próximas aulas */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <CalendarDays size={24} className="text-[#006A68]" />
                        <h2 className="text-xl font-bold text-black flex-1">Próximas aulas</h2>
                        <button onClick={() => navigate('/aulas')} className="text-xs font-semibold text-[#006A68] hover:underline flex items-center gap-1">
                            Ver todas <ChevronRight size={13} />
                        </button>
                    </div>
                    {confirmadas.length === 0 ? (
                        <p className="text-sm text-[#4A6362] italic">Sem aulas confirmadas agendadas.</p>
                    ) : (
                        <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                            <div className="flex gap-4 w-max">
                                {confirmadas.map(a => <AulaCard key={a.id} aula={a} onConfirm={handleConfirm} onCancel={handleCancel} loadingId={loadingId} />)}
                            </div>
                        </div>
                    )}
                </section>

                {/* Eventos */}
                {eventos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CalendarDays size={24} className="text-[#006A68]" />
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

            {toast && (
                <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <Check size={15} /> {toast.msg}
                    <button onClick={() => setToast(null)}><X size={13} className="opacity-70" /></button>
                </div>
            )}
        </>
    )
}