import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import * as anuncioController from '../controllers/anuncio.controller.js'

const router = Router()
router.use(authenticate, isAdmin)
router.post('/', anuncioController.createAnuncio)

export default router