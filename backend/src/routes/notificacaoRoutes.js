const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleCheckMiddleware');        
const tokenValidation = require('../middlewares/authMiddleware');
const notificacaoController = require('../controllers/notificacaoController'); 

router.get('/', tokenValidation, authorize([1, 2, 3]), notificacaoController.listNotificacoes);
router.patch('/:id/lida', tokenValidation, authorize([1, 2, 3]), notificacaoController.markAsRead);

module.exports = router;