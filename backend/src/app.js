import express from 'express'
import morgan from 'morgan'
import salasRoutes from './routes/salas.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import anunciosRoutes from './routes/anuncios.routes.js'
import notificacoesRoutes from './routes/notificacoes.routes.js'
import gruposRoutes from './routes/grupos.routes.js'
import setupSwagger from './swagger.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

/**
 * Route Registration
 */
app.use('/api/salas', salasRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/anuncios', anunciosRoutes)
app.use('/api/notificacoes', notificacoesRoutes)
app.use('/api/grupos', gruposRoutes)

/**
 * Swagger Documentation
 */
setupSwagger(app)

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong on the server' })
})

export default app