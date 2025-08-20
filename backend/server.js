// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Ecommerce Product Management Tool API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});