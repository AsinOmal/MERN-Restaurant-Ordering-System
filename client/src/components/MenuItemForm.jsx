import { useState, useEffect } from 'react';
import { uploadAPI } from '../services/api';
import './MenuItemForm.css';

const MenuItemForm = ({ item, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: '',
        available: true,
        dietary: []
    });

    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                category: item.category || 'Main Course',
                image: item.image || '',
                available: item.available !== undefined ? item.available : true,
                dietary: item.dietary || []
            });
            setImagePreview(item.image || '');
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'image') {
            setImagePreview(value);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const response = await uploadAPI.uploadFile(file);
            const imageUrl = `http://localhost:5001${response.data.data.url}`;

            setFormData(prev => ({ ...prev, image: imageUrl }));
            setImagePreview(imageUrl);
        } catch (error) {
            alert('Failed to upload image');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDietaryChange = (tag) => {
        setFormData(prev => ({
            ...prev,
            dietary: prev.dietary.includes(tag)
                ? prev.dietary.filter(t => t !== tag)
                : [...prev.dietary, tag]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            price: parseFloat(formData.price)
        };
        onSubmit(submitData);
    };

    const categories = ['Appetizer', 'Main Course', 'Side', 'Dessert', 'Beverage'];
    const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

    return (
        <form className="menu-item-form" onSubmit={handleSubmit}>
            <h3>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>

            <div className="form-group">
                <label>Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Margherita Pizza"
                />
            </div>

            <div className="form-group">
                <label>Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Brief description of the item"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Price * ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="12.99"
                    />
                </div>

                <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Image</label>
                <div className="image-upload-container">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="file-input"
                    />
                    <div className="or-divider">
                        <span>OR</span>
                    </div>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                        disabled={uploading}
                    />
                </div>
                {uploading && <div className="uploading-indicator">Uploading...</div>}
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" onError={() => setImagePreview('')} />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Dietary Tags</label>
                <div className="dietary-tags">
                    {dietaryOptions.map(tag => (
                        <label key={tag} className="tag-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.dietary.includes(tag)}
                                onChange={() => handleDietaryChange(tag)}
                            />
                            <span>{tag}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                    />
                    <span>Available for ordering</span>
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {item ? 'Update Item' : 'Create Item'}
                </button>
            </div>
        </form >
    );
};

export default MenuItemForm;
