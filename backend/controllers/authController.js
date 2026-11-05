const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createToken = (user) => jwt.sign(
  { sub: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const role = req.body.role || 'student';
  if (!['student', 'faculty'].includes(role)) {
    return res.status(400).json({ message: 'Choose student or faculty registration' });
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: createToken(user), user });
};

const login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const requestedRole = req.body.role;
  if (requestedRole && !['student', 'faculty', 'admin'].includes(requestedRole)) {
    return res.status(400).json({ message: 'Choose a valid account type' });
  }

  const user = await User.findOne({ email }).select('+password');
  const validPassword = user && await bcrypt.compare(
    String(req.body.password || ''),
    user.password
  );

  if (!validPassword) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  if (requestedRole && user.role !== requestedRole) {
    return res.status(403).json({ message: `This account is registered as ${user.role}. Choose the matching account type.` });
  }
  res.json({ token: createToken(user), user });
};

const currentUser = (req, res) => res.json({ user: req.user });

module.exports = { register, login, currentUser };