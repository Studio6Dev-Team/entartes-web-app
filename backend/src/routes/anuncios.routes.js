import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as anuncioController from '../controllers/anuncio.controller.js'

const router = Router()
router.use(authenticate, isAdmin)
router.post('/', anuncioController.createAnuncio)

export default router