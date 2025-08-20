// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products with their attributes
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.*, 
      c.name as category_name,
      GROUP_CONCAT(
        CONCAT_WS(':', a.name, pa.value) 
        SEPARATOR ','
      ) as attributes
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_attributes pa ON p.id = pa.product_id
    LEFT JOIN attributes a ON pa.attribute_id = a.id
    WHERE p.is_active = TRUE
    GROUP BY p.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Parse attributes string into object
    const products = results.map(product => {
      const attributes = {};
      if (product.attributes) {
        product.attributes.split(',').forEach(attr => {
          const [key, value] = attr.split(':');
          attributes[key] = value;
        });
      }
      return {
        ...product,
        attributes
      };
    });
    
    res.json(products);
  });
});

// Get a single product with its attributes
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  
  const productQuery = `
    SELECT 
      p.*, 
      c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;
  
  const attributesQuery = `
    SELECT 
      a.name, 
      a.type, 
      pa.value 
    FROM product_attributes pa
    JOIN attributes a ON pa.attribute_id = a.id
    WHERE pa.product_id = ?
  `;
  
  db.query(productQuery, [productId], (err, productResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    db.query(attributesQuery, [productId], (err, attributeResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const product = productResults[0];
      const attributes = {};
      
      attributeResults.forEach(attr => {
        attributes[attr.name] = {
          value: attr.value,
          type: attr.type
        };
      });
      
      product.attributes = attributes;
      res.json(product);
    });
  });
});

// Create a new product
router.post('/', (req, res) => {
  const { name, description, category_id, base_price, attributes } = req.body;
  
  const productQuery = 'INSERT INTO products (name, description, category_id, base_price) VALUES (?, ?, ?, ?)';
  
  db.query(productQuery, [name, description, category_id, base_price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const productId = result.insertId;
    
    // Insert attributes if provided
    if (attributes && Object.keys(attributes).length > 0) {
      // First get all attributes for this category
      const attributeQuery = 'SELECT id, name FROM attributes WHERE category_id = ?';
      
      db.query(attributeQuery, [category_id], (err, attributeResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const attributeMap = {};
        attributeResults.forEach(attr => {
          attributeMap[attr.name] = attr.id;
        });
        
        const attributeValues = [];
        for (const [name, value] of Object.entries(attributes)) {
          if (attributeMap[name]) {
            attributeValues.push([productId, attributeMap[name], value]);
          }
        }
        
        if (attributeValues.length > 0) {
          const productAttrQuery = 'INSERT INTO product_attributes (product_id, attribute_id, value) VALUES ?';
          
          db.query(productAttrQuery, [attributeValues], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({ 
              message: 'Product created successfully', 
              productId 
            });
          });
        } else {
          res.status(201).json({ 
            message: 'Product created successfully', 
            productId 
          });
        }
      });
    } else {
      res.status(201).json({ 
        message: 'Product created successfully', 
        productId 
      });
    }
  });
});

// Update a product
router.put('/:id', (req, res) => {
  const productId = req.params.id;
  const { name, description, category_id, base_price, is_active, attributes } = req.body;
  
  const productQuery = 'UPDATE products SET name = ?, description = ?, category_id = ?, base_price = ?, is_active = ? WHERE id = ?';
  
  db.query(productQuery, [name, description, category_id, base_price, is_active, productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update attributes if provided
    if (attributes && Object.keys(attributes).length > 0) {
      // First get all attributes for this category
      const attributeQuery = 'SELECT id, name FROM attributes WHERE category_id = ?';
      
      db.query(attributeQuery, [category_id], (err, attributeResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const attributeMap = {};
        attributeResults.forEach(attr => {
          attributeMap[attr.name] = attr.id;
        });
        
        // Delete existing attributes
        const deleteQuery = 'DELETE FROM product_attributes WHERE product_id = ?';
        db.query(deleteQuery, [productId], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Insert new attributes
          const attributeValues = [];
          for (const [name, value] of Object.entries(attributes)) {
            if (attributeMap[name]) {
              attributeValues.push([productId, attributeMap[name], value]);
            }
          }
          
          if (attributeValues.length > 0) {
            const productAttrQuery = 'INSERT INTO product_attributes (product_id, attribute_id, value) VALUES ?';
            
            db.query(productAttrQuery, [attributeValues], (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              res.json({ message: 'Product updated successfully' });
            });
          } else {
            res.json({ message: 'Product updated successfully' });
          }
        });
      });
    } else {
      res.json({ message: 'Product updated successfully' });
    }
  });
});

// Delete a product
router.delete('/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;