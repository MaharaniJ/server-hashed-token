const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSignup = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;
  if (!username) throw new Error('Please enter a username');
  if (!email) throw new Error('Please enter an email address');
  if (!password) throw new Error('Please enter a password');
  if (!confirmpassword) throw new Error('Please enter a confirmpassword');

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    } else {
      const user = new User({
        username: username,
        email: email,
        password: password,
        confirmpassword: confirmpassword,
      });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user.password = hash;
      await user.save();
      res.status(200).json({ message: 'User saved successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) throw new Error('Please enter an email address');
    if (!password) throw new Error('Please enter a password');

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    bcrypt.compare(password, user.password, (err, data) => {
      if (err) throw err;
      if (data) res.status(200).json({ message: 'Login successful' });
      else res.status(403).json({ message: 'Invalid Credentials' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { UserLogin, UserSignup };
