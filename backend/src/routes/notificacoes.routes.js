import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as notificacaoController from '../controllers/notificacao.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', notificacaoController.listNotificacoes)
router.patch('/:id/lida', notificacaoController.markAsRead)

export default router