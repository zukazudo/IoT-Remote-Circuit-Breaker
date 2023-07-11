const express = require('express');
const router = express.Router();

const currentController = require('../controllers/currentController');

router.get('/state', currentController.get_state);
router.get('/signup', currentController.signup_get);
router.get('/login', currentController.login_get);
router.get('/data/:current', currentController.data_get);
router.get('/create-machine', currentController.create_machine);

module.exports = router;
