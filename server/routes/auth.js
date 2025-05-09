const express = require('express');
const { register, login, sendResetLink, resetPassword, verifyCode, sendVerificationCode } = require('../controllers/authController');
const authenticateToken = require('../middleware/AuthenticateToken'); 
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/sendresetlink', sendResetLink);

router.post('/verifycode', verifyCode); 

router.post('/resetpassword', resetPassword);

router.post('/send-code', sendVerificationCode);


router.get('/home', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;
