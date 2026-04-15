import express from 'express'
import morgan from 'morgan'
import setupSwagger from './swagger.js'


import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import salasRoutes from './routes/salas.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import anunciosRoutes from './routes/anuncios.routes.js'
import marcacoesRoutes from './routes/marcacoes.routes.js'
import notificacoesRoutes from './routes/notificacoes.routes.js'
import gruposRoutes from './routes/grupos.routes.js'
import disponibilidadesRoutes from './routes/disponibilidades.routes.js'
import relatoriosRoutes from './routes/relatorios.routes.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/salas', salasRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/anuncios', anunciosRoutes)
app.use('/api/marcacoes', marcacoesRoutes)
app.use('/api/notificacoes', notificacoesRoutes)
app.use('/api/grupos', gruposRoutes)
app.use('/api/disponibilidades', disponibilidadesRoutes)
app.use('/api/relatorios', relatoriosRoutes)

setupSwagger(app)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong on the server' })
})

export default app