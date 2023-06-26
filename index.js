const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = 5000;
require('dotenv').config();

const UserModel = require('./model/userSchema');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Hello world' });
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: 'Token is missing' });
  } else {
    jwt.verify(token, 'jwtsecretkey', (err, decoded) => {
      if (err) {
        return res.json({ message: 'Error with Token' });
      } else {
        if (decoded.role === 'admin') {
          next();
        } else {
          return res.json({ message: 'Not an admin' });
        }
      }
    });
  }
};

app.get('/dashboard', verifyUser, (req, res) => {
  res.json({ message: 'Success' });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
      UserModel.findOne({ email: email })
        .then((user) => {
          if (user) {
            res.json({ message: 'User already exists' });
          } else {
            UserModel.create({ name: name, email: email, password: hash })
              .then(() => {
                res.json({ message: 'User registered successfully' });
              })
              .catch((err) => {
                res.json(err);
              });
          }
        })
        .catch((err) => res.json(err));
    }).catch((err) => res.json(err));
  });
  
  

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            { email: user.email, role: user.role },
            'jwtsecretkey',
            { expiresIn: '1d' }
          );
          res.cookie('token', token, { httpOnly: true });
          return res.json({ status: 'success', role: user.role }); // Return status and role
        } else {
          return res.json({ status: 'failure', message: 'Invalid credentials' }); // Return status and error message
        }
      });
    } else {
      return res.json({ status: 'failure', message: 'User not found' }); // Return status and error message
    }
  });
});

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
