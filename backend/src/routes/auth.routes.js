import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as authController from '../controllers/auth.controller.js'
const router = Router()
router.post('/login', authController.login)
router.get('/me', authenticate, authController.getMe)
router.post('/logout', authenticate, (req, res) => res.json({ message: 'Logged out' }))
export default router