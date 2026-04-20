// const express = require('express');
// const dotenv = require('dotenv');
// const userRoutes = require('./routes/userRoutes');
// const db = require('./config/db');

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use((err, req, res, next) => {
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid JSON format'
//     });
//   }
//   next();
// });

// app.get('/', (req, res) => {
//   res.send('Express + MySQL API is working');
// });

// app.use('/users', userRoutes);

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     const connection = await db.getConnection();
//     console.log('Connected to MySQL');
//     connection.release();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Database connection failed:', error.message);
//   }
// };
// const path = require('path');

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// startServer();

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  next();
});

app.use('/api/users', userRoutes);
app.use('/', viewRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connected to MySQL');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}/login`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

startServer();