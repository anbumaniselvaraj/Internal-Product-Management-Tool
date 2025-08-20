// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all categories
router.get('/', (req, res) => {
  const query = 'SELECT * FROM categories WHERE is_active = TRUE';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a single category with its attributes
router.get('/:id', (req, res) => {
  const categoryId = req.params.id;
  
  const categoryQuery = 'SELECT * FROM categories WHERE id = ?';
  const attributesQuery = 'SELECT * FROM attributes WHERE category_id = ?';
  
  db.query(categoryQuery, [categoryId], (err, categoryResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (categoryResults.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    db.query(attributesQuery, [categoryId], (err, attributeResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const category = categoryResults[0];
      category.attributes = attributeResults;
      res.json(category);
    });
  });
});

// Create a new category
router.post('/', (req, res) => {
  const { name, description, attributes } = req.body;
  
  const categoryQuery = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  
  db.query(categoryQuery, [name, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const categoryId = result.insertId;
    
    // Insert attributes if provided
    if (attributes && attributes.length > 0) {
      const attributeValues = attributes.map(attr => [
        categoryId, 
        attr.name, 
        attr.type || 'STRING', 
        attr.is_required || false
      ]);
      
      const attributeQuery = 'INSERT INTO attributes (category_id, name, type, is_required) VALUES ?';
      
      db.query(attributeQuery, [attributeValues], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.status(201).json({ 
          message: 'Category created successfully', 
          categoryId 
        });
      });
    } else {
      res.status(201).json({ 
        message: 'Category created successfully', 
        categoryId 
      });
    }
  });
});

// Update a category
router.put('/:id', (req, res) => {
  const categoryId = req.params.id;
  const { name, description, is_active } = req.body;
  
  const query = 'UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?';
  
  db.query(query, [name, description, is_active, categoryId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete a category
router.delete('/:id', (req, res) => {
  const categoryId = req.params.id;
  
  const query = 'DELETE FROM categories WHERE id = ?';
  
  db.query(query, [categoryId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  });
});

module.exports = router;