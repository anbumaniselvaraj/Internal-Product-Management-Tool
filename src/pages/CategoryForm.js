// pages/CategoryForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attributes: [{ name: '', type: 'STRING', is_required: false }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoriesAPI.getById(id);
      const category = response.data;
      setFormData({
        name: category.name,
        description: category.description,
        attributes: category.attributes || []
      });
    } catch (err) {
      setError('Failed to fetch category');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      attributes: updatedAttributes
    }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', type: 'STRING', is_required: false }]
    }));
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await categoriesAPI.update(id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEdit ? 'Edit' : 'Add New'} Category</h2>
      
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
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label">Attributes</label>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary"
              onClick={addAttribute}
            >
              Add Attribute
            </button>
          </div>
          
          {formData.attributes.map((attr, index) => (
            <div key={index} className="card mb-2">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Attribute name"
                      value={attr.name}
                      onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={attr.type}
                      onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                    >
                      <option value="STRING">String</option>
                      <option value="NUMBER">Number</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="DATE">Date</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`required-${index}`}
                        checked={attr.is_required}
                        onChange={(e) => handleAttributeChange(index, 'is_required', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`required-${index}`}>
                        Required
                      </label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeAttribute(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Category
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;