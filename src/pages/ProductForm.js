// pages/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    attributes: {}
  });
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (formData.category_id) {
      fetchCategoryAttributes(formData.category_id);
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        base_price: product.base_price,
        attributes: product.attributes || {}
      });
    } catch (err) {
      setError('Failed to fetch product');
    }
  };

  const fetchCategoryAttributes = async (categoryId) => {
    try {
      const response = await categoriesAPI.getById(categoryId);
      setCategoryAttributes(response.data.attributes || []);
      
      // Initialize attributes if they don't exist
      if (!isEdit) {
        const initialAttributes = {};
        response.data.attributes.forEach(attr => {
          initialAttributes[attr.name] = '';
        });
        setFormData(prev => ({
          ...prev,
          attributes: initialAttributes
        }));
      }
    } catch (err) {
      setError('Failed to fetch category attributes');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (attrName, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrName]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await productsAPI.update(id, formData);
      } else {
        await productsAPI.create(formData);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEdit ? 'Edit' : 'Add New'} Product</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Base Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            name="base_price"
            value={formData.base_price}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {categoryAttributes.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Attributes</label>
            {categoryAttributes.map(attr => (
              <div key={attr.id} className="mb-2">
                <label className="form-label">
                  {attr.name}
                  {attr.is_required && <span className="text-danger">*</span>}
                </label>
                {attr.type === 'STRING' && (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.attributes[attr.name] || ''}
                    onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                    required={attr.is_required}
                  />
                )}
                {attr.type === 'NUMBER' && (
                  <input
                    type="number"
                    className="form-control"
                    value={formData.attributes[attr.name] || ''}
                    onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                    required={attr.is_required}
                  />
                )}
                {attr.type === 'BOOLEAN' && (
                  <select
                    className="form-select"
                    value={formData.attributes[attr.name] || ''}
                    onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                    required={attr.is_required}
                  >
                    <option value="">Select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                )}
                {attr.type === 'DATE' && (
                  <input
                    type="date"
                    className="form-control"
                    value={formData.attributes[attr.name] || ''}
                    onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                    required={attr.is_required}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;