const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.get('/users', userController.getUsersView);
router.get('/profile', protect, userController.getProfileView);

module.exports = router;