const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const User = require('./models/User');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/smartdonate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ success: true, message: 'User registered!' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'User already exists' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ success: false, message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

  res.json({ success: true, user: { name: user.name, email: user.email } });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
