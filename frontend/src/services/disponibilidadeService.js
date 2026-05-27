import { api } from './api'

export const disponibilidadeService = {
    async criar(dados) {
        return api.post('/disponibilidades', dados)
    },

    async listar() {
        return api.get('/disponibilidades')
    },

    async eliminar(id) {
        return api.delete(`/disponibilidades/${id}`)
    },

    async editar(id, dados) {
        return api.put(`/disponibilidades/${id}`, dados)
    }
}
