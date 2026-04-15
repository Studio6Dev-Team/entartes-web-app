import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de utilizadores da plataforma
 */
router.use(authenticate, isAdmin)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os utilizadores (Apenas Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *   post:
 *     summary: Cria um novo utilizador
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               id_tipo:
 *                 type: integer
 *               nome:
 *                 type: string
 *               apelido:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 */
router.get('/', userController.listUsers)
router.post('/', userController.createUser)

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Atualiza o estado de um utilizador (Ativo/Inativo)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 example: INATIVO
 *     responses:
 *       200:
 *         description: Estado atualizado
 */
router.patch('/:id/status', userController.updateStatus)

/**
 * @swagger
 * /api/users/{id}/export:
 *   get:
 *     summary: Exporta dados de um utilizador pelo seu ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados detalhados do utilizador exportados
 */
router.get('/:id/export', userController.exportUserData)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um utilizador
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilizador apagado
 */
router.delete('/:id', userController.deleteUser)
export default router