import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import appRoutes from './app.js' // O ficheiro que já tens com os app.use()

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Use the routes defined in app.js
app.use(appRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`)
})