import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as salaController from '../controllers/sala.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', salaController.listSalas)
router.delete('/:id', isAdmin, salaController.deleteSala)

export default router