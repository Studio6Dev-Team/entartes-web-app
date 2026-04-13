import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import * as userController from '../controllers/user.controller.js'
const router = Router()
router.use(authenticate, isAdmin)
router.get('/', userController.listUsers)
router.post('/', userController.createUser)
router.patch('/:id/status', userController.updateStatus)
router.get('/:id/export', userController.exportUserData)
router.delete('/:id', userController.deleteUser)
export default router