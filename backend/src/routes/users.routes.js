import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as userController from '../controllers/user.controller.js'
const router = Router()
router.use(authenticate, isAdmin)
router.get('/', userController.listUsers)
router.post('/', userController.createUser)
router.patch('/:id/status', userController.updateStatus)
router.get('/:id/export', userController.exportUserData)
router.delete('/:id', userController.deleteUser)
export default router