const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const authValidation = require('../validation/auth');

router.post('/register', authValidation.isUser(), authController.register);

router.post('/login', authValidation.login(), authController.login);

module.exports = router;
