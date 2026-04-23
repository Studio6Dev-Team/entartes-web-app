import { api } from './api'; 

const coachingService = {

    function formatDate(raw) {
        if (!raw) return '—'
        const d = new Date(raw)
        return d.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    function formatTime(raw) {
        if (!raw) return '—'
        // Se vier como string HH:mm:ss simples (sem data), extrai directamente
        if (typeof raw === 'string' && !raw.includes('T') && raw.includes(':')) {
            const parts = raw.split(':')
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
        }
        // O campo hora_inicio é guardado como DateTime base 1970-01-01THH:mm:ssZ (UTC).
        // Usamos timeZone:'UTC' para não adicionar o offset de Portugal (+1h no Verão).
        const d = new Date(raw)
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    }

    function formatDuration(minutos) {
        if (!minutos) return '—'
        if (minutos < 60) return `${minutos} min`
        const h = Math.floor(minutos / 60)
        const m = minutos % 60
        return m > 0 ? `${h}h ${m}min` : `${h}h`
    }

    /**
     * Normaliza os variados formatos vindos dos diferentes Endpoints de Coaching
     * para o formato unificado aceite pelas Views e ClassCards/ConfirmedCards.
     */
    function mapCoachingParaCartoes(m) {
        // Alunos vêm como [{ nome: '...' }] dependendo se pedimos do docente ou coordenadora
        const nomesAlunos = Array.isArray(m.alunos)
            ? m.alunos.map(a => a.nome ?? 'Aluno Desconhecido')
            : []

    // Combina data + hora_inicio num datetime local completo para cálculos de tempo
    // hora_inicio pode vir como "HH:mm:ss" ou como "1970-01-01THH:mm:ssZ" (UTC simulado)
    const buildDatetime = (dateStr, horaRaw) => {
        if (!dateStr) return dateStr
        // Garante que só usamos a parte da data (YYYY-MM-DD),
        // mesmo que a API devolva um ISO completo como "2026-04-24T00:00:00.000Z"
        const datePart = String(dateStr).slice(0, 10)
        let hh = '00', mm = '00'
        if (horaRaw) {
            if (typeof horaRaw === 'string' && !horaRaw.includes('T') && horaRaw.includes(':')) {
                const parts = horaRaw.split(':')
                hh = parts[0].padStart(2, '0')
                mm = (parts[1] ?? '00').padStart(2, '0')
            } else {
                const t = new Date(horaRaw)
                hh = t.getUTCHours().toString().padStart(2, '0')
                mm = t.getUTCMinutes().toString().padStart(2, '0')
            }
        }
        return `${datePart}T${hh}:${mm}:00`
    }

    return {
        id: m.id_marcacao,
        data: formatDate(m.data),
        hora: formatTime(m.hora_inicio),
        duracao: formatDuration(m.duracao_minutos),
        duracao_min: m.duracao_minutos ?? 0,
        docente: m.docente ?? 'Docente logado',
        modalidade: m.modalidade ?? '—',
        // Na coordenação chama-se sala_atual
        sala: m.sala_atual ?? m.sala ?? '—',
        id_estado: m.id_estado ?? null,
        estado_nome: m.estado ?? 'Desconhecido',
        alunos: nomesAlunos,
        _data_raw: buildDatetime(m.data, m.hora_inicio),
    }
}

// ── API calls para as Roles ───────────────────────────────────────────────────────

export const coachingService = {
    // 1 = AGENDADA (PENDENTE)
    // 2 = EM_VALIDACAO
    // 3 = CONFIRMADA
    // 4 = CONCLUIDA
    // 5 = CANCELADA
    ESTADOS: {
        PENDENTE: 1,
        EM_VALIDACAO: 2,
        CONFIRMADA: 3,
        CONCLUIDA: 4,
        CANCELADA: 5,
    },

  // ==========================================
  // ROTAS DO ALUNO
  // ==========================================
  
  consultarDisponibilidades: async (filtros = {}) => {
    // filtros pode conter { id_modalidade, data }
    const response = await api.get('/coaching/disponibilidades/consultar', { params: filtros });
    return response;
  },

  solicitarMarcacao: async (dados) => {
    // dados: { id_docente, id_modalidade, data_a_realizar, hora_inicio, duracao_minutos, ... }
    const response = await api.post('/coaching/marcacao/solicitar', dados);
    return response;
  },

  listarMeusPedidos: async (id_estado = null) => {
    const response = await api.get('/coaching/meus-pedidos', { params: { id_estado } });
    return response;
  },

  cancelarPedidoPendente: async (id_marcacao) => {
    const response = await api.delete(`/coaching/pedido/${id_marcacao}/cancelar`);
    return response;
  },

  validarConclusaoSessaoAluno: async (id_marcacao) => {
    const response = await api.post(`/coaching/aluno/conclusao-sessao/${id_marcacao}`);
    return response;
  },

  // ==========================================
  // ROTAS DA COORDENADORA
  // ==========================================

  listarPedidosPendentes: async (filtros = {}) => {
    const response = await api.get('/coaching/pedidos-pendentes', { params: filtros });
    return response;
  },

  confirmarMarcacao: async (id_marcacao, id_sala) => {
    const response = await api.post('/coaching/confirmar-marcacao', { id_marcacao, id_sala });
    return response;
  },

  rejeitarMarcacao: async (id_marcacao, motivo) => {
    const response = await api.post('/coaching/rejeitar-marcacao', { id_marcacao, motivo });
    return response;
  },

  cancelarMarcacaoConfirmada: async (id_marcacao, motivo) => {
    const response = await api.post('/coaching/cancelar-marcacao', { id_marcacao, motivo });
    return response;
  },

  // ==========================================
  // ROTAS DO DOCENTE
  // ==========================================

  listarMinhasAulas: async (id_estado = null) => {
    const response = await api.get('/coaching/minhas-aulas', { params: { id_estado } });
    return response;
  },

  validarConclusaoSessaoDocente: async (id_marcacao) => {
    const response = await api.post(`/coaching/docente/conclusao-sessao/${id_marcacao}`);
    return response;
  },

  cancelarMarcacaoDocente: async (id_marcacao, motivo) => {
    const response = await api.post(`/coaching/cancelar-marcacao/${id_marcacao}`, { motivo });
    return response;
  }

}


export default coachingService;
