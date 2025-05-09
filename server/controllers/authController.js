const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendResetLink = async (req, res) => {
  const { email } = req.body;
  

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You have requested a password reset. Here is your reset code: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset code sent to your email' });
  } catch (error) {
    console.error('Error sending reset code email:', error);
    res.status(500).json({ message: 'Error sending reset code email' });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, resetCode } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.status(200).json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ message: 'Error verifying reset code' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ message: 'Error resetting password' });
  }
};



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const verificationCode = crypto.randomBytes(3).toString('hex');

    await VerificationCode.findOneAndUpdate(
      { email },
      { code: verificationCode, expires: Date.now() + 600000 }, 
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Verification code sent to email.' });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
};


exports.register = async (req, res) => {
  const { username, email, password, code } = req.body;

  if (!email || !code || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const verificationEntry = await VerificationCode.findOne({
      email,
      code,
      expires: { $gt: Date.now() },
    });

    if (!verificationEntry) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    await VerificationCode.deleteOne({ email });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};



// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const EXPIRES_IN_SECONDS = 6 * 60 * 60;

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: EXPIRES_IN_SECONDS,
//     });

//     res.json({
//       token,
//       expiresIn: EXPIRES_IN_SECONDS,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });

//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ message: 'Error logging in' });
//   }
// };


exports.login = async (req, res) => {
  console.log("🔐 Login isteği alındı.");
  console.log("📦 Gelen body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("⚠️ Eksik email ya da şifre.");
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`🔍 Kullanıcı aranıyor: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.warn("❌ Kullanıcı bulunamadı.");
      return res.status(400).json({ message: 'User not found' });
    }

    console.log("✅ Kullanıcı bulundu, şifre doğrulanıyor...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn("🔑 Şifre eşleşmedi.");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const EXPIRES_IN_SECONDS = 6 * 60 * 60;
    console.log("🛡️ Token oluşturuluyor...");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: EXPIRES_IN_SECONDS,
    });

    console.log("✅ Giriş başarılı. Token gönderiliyor.");
    res.json({
      token,
      expiresIn: EXPIRES_IN_SECONDS,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('❗ Hata oluştu:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};
