const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleCheckMiddleware');   
const tokenValidation = require('../middlewares/authMiddleware');
const anuncioController = require('../controllers/anuncioController'); 

router.post('/', tokenValidation, authorize([1, 2]), anuncioController.createAnuncio);

module.exports = router;