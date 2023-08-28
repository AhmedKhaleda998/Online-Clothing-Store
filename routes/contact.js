const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact');
const contactValidation = require('../validation/contact');

router.post('/', contactValidation.info(), contactController.send);

module.exports = router;