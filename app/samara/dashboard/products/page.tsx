'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './products.module.css';

interface Product {
    id: number;
    name: string;
    category: string;
    desc: string;
    image: string;
    is_active: string;
    unit: number;
    benefits: string;
    uses: string;
    recipes: string;
    supplier: string;
    price: number;
    bonus_points: number;
    qty_per_unit: number;
    discount_price: number;
}

interface ProductPlan {
    id: number;
    product: number;
    point: string;
    value: number;
    unit: string;
}

interface ProductImage {
    id: number;
    product: number;
    image: string;
}

interface CategoryRef {
    id: number;
    name: string;
}

interface UnitRef {
    id: number;
    name: string;
}

interface NewImage {
    file: File | null;
    product_id: number;
}

interface NewPlan {
    point: string;
    value: number;
    unit: string;
    product_id: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<{ [productId: number]: ProductPlan[] }>({});
    const [images, setImages] = useState<{ [productId: number]: ProductImage[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryRefs, setCategoryRefs] = useState<CategoryRef[]>([]);
    const [unitRefs, setUnitRefs] = useState<UnitRef[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        desc: '',
        image: '',
        is_active: 'Y',
        unit: '',
        benefits: '',
        uses: '',
        recipes: '',
        supplier: '',
        price: '',
        bonus_points: '',
        qty_per_unit: '',
        discount_price: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const editFileInputRef = React.useRef<HTMLInputElement>(null);
    const [showAddImageForm, setShowAddImageForm] = useState(false);
    const [showAddPlanForm, setShowAddPlanForm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [newImage, setNewImage] = useState<NewImage>({ file: null, product_id: 0 });
    const [newPlan, setNewPlan] = useState<NewPlan>({ point: '', value: 0, unit: '', product_id: 0 });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isAddingPlan, setIsAddingPlan] = useState(false);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let query = supabase.from('products').select('*');
            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }
            const { data: productsData, error: productsError } = await query;
            if (productsError) throw productsError;
            setProducts(productsData || []);

            const { data: plansData } = await supabase
                .from('product_plan')
                .select('*');
            const plansMap: { [productId: number]: ProductPlan[] } = {};
            (plansData || []).forEach((plan: ProductPlan) => {
                if (!plansMap[plan.product]) plansMap[plan.product] = [];
                plansMap[plan.product].push(plan);
            });
            setPlans(plansMap);

            const { data: imagesData } = await supabase
                .from('product_images')
                .select('*');
            const imagesMap: { [productId: number]: ProductImage[] } = {};
            (imagesData || []).forEach((img: ProductImage) => {
                if (!imagesMap[img.product]) imagesMap[img.product] = [];
                imagesMap[img.product].push(img);
            });
            setImages(imagesMap);

            // Fetch categories
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('id, name');
            setCategoryRefs(categoriesData || []);

            // Fetch units
            const { data: unitsData } = await supabase
                .from('units')
                .select('id, name');
            setUnitRefs(unitsData || []);
        } catch {
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleAddProduct = () => {
        setShowAddForm(true);
        setAddError(null);
        setNewProduct({
            name: '',
            category: '',
            desc: '',
            image: '',
            is_active: 'Y',
            unit: '',
            benefits: '',
            uses: '',
            recipes: '',
            supplier: '',
            price: '',
            bonus_points: '',
            qty_per_unit: '',
            discount_price: '',
        });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        if (!newProduct.name.trim()) {
            setAddError('Product name is required.');
            setAddLoading(false);
            return;
        }
        if (!newProduct.category) {
            setAddError('Category is required.');
            setAddLoading(false);
            return;
        }
        if (!newProduct.unit) {
            setAddError('Unit is required.');
            setAddLoading(false);
            return;
        }
        let imageUrl = '';
        if (imageFile) {
            try {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('samara.storage')
                    .upload(`products/${fileName}`, imageFile);
                if (uploadError) throw uploadError;
                const { data: publicUrlData } = supabase
                    .storage
                    .from('samara.storage')
                    .getPublicUrl(`products/${fileName}`);
                imageUrl = publicUrlData?.publicUrl || '';
            } catch {
                setAddError('Failed to upload image.');
                setAddLoading(false);
                return;
            }
        }
        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    name: newProduct.name.trim(),
                    category: newProduct.category,
                    desc: newProduct.desc,
                    image: imageUrl,
                    is_active: newProduct.is_active,
                    unit: Number(newProduct.unit),
                    benefits: newProduct.benefits,
                    uses: newProduct.uses,
                    recipes: newProduct.recipes,
                    supplier: newProduct.supplier,
                    price: Number(newProduct.price) || 0,
                    bonus_points: Number(newProduct.bonus_points) || 0,
                    qty_per_unit: Number(newProduct.qty_per_unit) || 0,
                    discount_price: Number(newProduct.discount_price) || 0,
                }]);
            if (error) throw error;
            setShowAddForm(false);
            setNewProduct({
                name: '',
                category: '',
                desc: '',
                image: '',
                is_active: 'Y',
                unit: '',
                benefits: '',
                uses: '',
                recipes: '',
                supplier: '',
                price: '',
                bonus_points: '',
                qty_per_unit: '',
                discount_price: '',
            });
            setImageFile(null);
            fetchAll();
        } catch {
            setAddError('Failed to add product. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);
            if (error) throw error;
            fetchAll();
        } catch (error: unknown) {
            console.error('Delete error:', error);
            setError('Failed to delete product. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct({
            ...product,
            price: product.price || 0,
            bonus_points: product.bonus_points || 0,
            qty_per_unit: product.qty_per_unit || 0,
            discount_price: product.discount_price || 0,
            name: product.name || '',
            desc: product.desc || '',
            benefits: product.benefits || '',
            uses: product.uses || '',
            recipes: product.recipes || '',
            supplier: product.supplier || '',
            image: product.image || '',
            category: product.category || '',
            is_active: product.is_active || 'Y',
            unit: product.unit || 0
        });
        setIsEditing(true);
        setEditError(null);
        setEditImageFile(null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setEditLoading(true);
        setEditError(null);

        let imageUrl = editingProduct.image;
        if (editImageFile) {
            try {
                const fileExt = editImageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('samara.storage')
                    .upload(`products/${fileName}`, editImageFile);
                if (uploadError) throw uploadError;
                const { data: publicUrlData } = supabase
                    .storage
                    .from('samara.storage')
                    .getPublicUrl(`products/${fileName}`);
                imageUrl = publicUrlData?.publicUrl || '';
            } catch (error: unknown) {
                console.error('Upload error:', error);
                setEditError('Failed to upload image.');
                setEditLoading(false);
                return;
            }
        }

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: editingProduct.name.trim(),
                    category: editingProduct.category,
                    desc: editingProduct.desc,
                    image: imageUrl,
                    is_active: editingProduct.is_active,
                    unit: Number(editingProduct.unit),
                    benefits: editingProduct.benefits,
                    uses: editingProduct.uses,
                    recipes: editingProduct.recipes,
                    supplier: editingProduct.supplier,
                    price: Number(editingProduct.price) || 0,
                    bonus_points: Number(editingProduct.bonus_points) || 0,
                    qty_per_unit: Number(editingProduct.qty_per_unit) || 0,
                    discount_price: Number(editingProduct.discount_price) || 0,
                })
                .eq('id', editingProduct.id);

            if (error) throw error;
            setIsEditing(false);
            setEditingProduct(null);
            fetchAll();
        } catch (error: unknown) {
            console.error('Update error:', error);
            setEditError('Failed to update product. Please try again.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImage.file || !selectedProductId) {
            setError('Please select a file and product');
            return;
        }

        setIsUploadingImage(true);
        try {
            // Validate file
            if (newImage.file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('File size must be less than 10MB');
            }

            if (!newImage.file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            const fileExt = newImage.file.name.split('.').pop();
            if (!fileExt) {
                throw new Error('Invalid file name');
            }

            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            console.log('Attempting to upload file:', {
                fileName,
                filePath,
                fileType: newImage.file.type,
                fileSize: newImage.file.size
            });

            // Upload the file
            const uploadResponse = await supabase
                .storage
                .from('samara.storage')
                .upload(filePath, newImage.file, {
                    cacheControl: '3600',
                    contentType: newImage.file.type
                });

            console.log('Upload response:', uploadResponse);

            if (uploadResponse.error) {
                console.error('Upload error details:', {
                    error: uploadResponse.error,
                    message: uploadResponse.error.message,
                    name: uploadResponse.error.name
                });
                throw new Error(`Upload failed: ${uploadResponse.error.message}`);
            }

            // Get the public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('samara.storage')
                .getPublicUrl(filePath);

            console.log('Public URL response:', { publicUrlData });

            if (!publicUrlData?.publicUrl) {
                throw new Error('No public URL returned');
            }

            // Insert the image record
            const { error: insertError } = await supabase
                .from('product_images')
                .insert([{
                    product: selectedProductId,
                    image: publicUrlData.publicUrl
                }]);

            if (insertError) {
                console.error('Database insert error:', insertError);
                // If insert fails, try to delete the uploaded file
                const { error: deleteError } = await supabase
                    .storage
                    .from('samara.storage')
                    .remove([filePath]);

                if (deleteError) {
                    console.error('Failed to delete uploaded file after insert error:', deleteError);
                }
                throw new Error(`Failed to save image record: ${insertError.message}`);
            }

            setShowAddImageForm(false);
            setNewImage({ file: null, product_id: 0 });
            fetchAll();
        } catch (error: unknown) {
            console.error('Image upload error:', error);
            let errorMessage = 'Failed to upload image. ';

            if (error instanceof Error) {
                errorMessage += error.message;
            } else if (typeof error === 'object' && error !== null) {
                const errorObj = error as Record<string, unknown>;
                if (errorObj.message) {
                    errorMessage += String(errorObj.message);
                } else {
                    errorMessage += JSON.stringify(error);
                }
            }

            setError(errorMessage);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            // First get the image record to get the file path
            const { data: imageData, error: fetchError } = await supabase
                .from('product_images')
                .select('image')
                .eq('id', imageId)
                .single();

            if (fetchError) throw fetchError;

            // Extract the file path from the URL
            const imageUrl = imageData.image;
            const filePath = imageUrl.split('/products/').pop();

            if (filePath) {
                // Delete from storage
                const { error: deleteStorageError } = await supabase
                    .storage
                    .from('samara.storage')
                    .remove([`products/${filePath}`]);

                if (deleteStorageError) {
                    console.error('Storage delete error:', deleteStorageError);
                }
            }

            // Delete the database record
            const { error: deleteError } = await supabase
                .from('product_images')
                .delete()
                .eq('id', imageId);

            if (deleteError) throw deleteError;
            fetchAll();
        } catch (error: unknown) {
            console.error('Delete image error:', error);
            let errorMessage = 'Failed to delete image. ';
            if (error instanceof Error) {
                errorMessage += error.message;
            } else if (typeof error === 'object' && error !== null) {
                errorMessage += JSON.stringify(error);
            }
            setError(errorMessage);
        }
    };

    const handleAddPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId) return;

        setIsAddingPlan(true);
        try {
            const { error } = await supabase
                .from('product_plan')
                .insert([{
                    product: selectedProductId,
                    point: newPlan.point,
                    value: newPlan.value,
                    unit: newPlan.unit
                }]);
            if (error) throw error;
            setShowAddPlanForm(false);
            setNewPlan({ point: '', value: 0, unit: '', product_id: 0 });
            fetchAll();
        } catch (error: unknown) {
            console.error('Add plan error:', error);
            setError('Failed to add plan. Please try again.');
        } finally {
            setIsAddingPlan(false);
        }
    };

    const handleDeletePlan = async (planId: number) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;

        try {
            const { error } = await supabase
                .from('product_plan')
                .delete()
                .eq('id', planId);
            if (error) throw error;
            fetchAll();
        } catch (error: unknown) {
            console.error('Delete plan error:', error);
            setError('Failed to delete plan. Please try again.');
        }
    };

    return (
        <DashboardLayout
            title="Products Management"
            actionButton={{ label: 'Add Product', onClick: handleAddProduct }}
        >
            <div className={styles.content}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                {showAddForm && (
                    <form className={styles.addForm} onSubmit={handleAddProductSubmit}>
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Basic Information</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-name">Product Name</label>
                                    <input
                                        id="product-name"
                                        type="text"
                                        placeholder="Enter product name"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-category">Category</label>
                                    <select
                                        id="product-category"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className={styles.formSelect}
                                        disabled={addLoading}
                                    >
                                        <option value="">Select Category</option>
                                        {categoryRefs.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-unit">Unit</label>
                                    <select
                                        id="product-unit"
                                        value={newProduct.unit}
                                        onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                        className={styles.formSelect}
                                        disabled={addLoading}
                                    >
                                        <option value="">Select Unit</option>
                                        {unitRefs.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-status">Status</label>
                                    <select
                                        id="product-status"
                                        value={newProduct.is_active}
                                        onChange={e => setNewProduct({ ...newProduct, is_active: e.target.value })}
                                        className={styles.formSelect}
                                        disabled={addLoading}
                                    >
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Product Details</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-desc">Description</label>
                                    <textarea
                                        id="product-desc"
                                        placeholder="Enter product description"
                                        value={newProduct.desc}
                                        onChange={e => setNewProduct({ ...newProduct, desc: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={addLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-benefits">Benefits</label>
                                    <textarea
                                        id="product-benefits"
                                        placeholder="Enter product benefits"
                                        value={newProduct.benefits}
                                        onChange={e => setNewProduct({ ...newProduct, benefits: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={addLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-uses">Uses</label>
                                    <textarea
                                        id="product-uses"
                                        placeholder="Enter product uses"
                                        value={newProduct.uses}
                                        onChange={e => setNewProduct({ ...newProduct, uses: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={addLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-recipes">Recipes</label>
                                    <textarea
                                        id="product-recipes"
                                        placeholder="Enter product recipes"
                                        value={newProduct.recipes}
                                        onChange={e => setNewProduct({ ...newProduct, recipes: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={addLoading}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Pricing & Inventory</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-price">Price</label>
                                    <input
                                        id="product-price"
                                        type="number"
                                        placeholder="Enter price"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-discount">Discount Price</label>
                                    <input
                                        id="product-discount"
                                        type="number"
                                        placeholder="Enter discount price"
                                        value={newProduct.discount_price}
                                        onChange={e => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-bonus">Bonus Points</label>
                                    <input
                                        id="product-bonus"
                                        type="number"
                                        placeholder="Enter bonus points"
                                        value={newProduct.bonus_points}
                                        onChange={e => setNewProduct({ ...newProduct, bonus_points: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-qty">Quantity per Unit</label>
                                    <input
                                        id="product-qty"
                                        type="number"
                                        placeholder="Enter quantity per unit"
                                        value={newProduct.qty_per_unit}
                                        onChange={e => setNewProduct({ ...newProduct, qty_per_unit: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Additional Information</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-supplier">Supplier</label>
                                    <input
                                        id="product-supplier"
                                        type="text"
                                        placeholder="Enter supplier name"
                                        value={newProduct.supplier}
                                        onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })}
                                        className={styles.formInput}
                                        disabled={addLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="product-image">Product Image</label>
                                    <div className={styles.imageUploadContainer}>
                                        <label className={styles.imageUploadLabel} htmlFor="product-image">
                                            {imageFile ? 'Change Image' : 'Upload Image'}
                                        </label>
                                        <input
                                            id="product-image"
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                            className={styles.formInput}
                                            disabled={addLoading}
                                            style={{ display: 'none' }}
                                        />
                                        {imageFile && (
                                            <span className={styles.imageFileName}>{imageFile.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formButtons}>
                            <button type="submit" className={styles.submitButton} disabled={addLoading}>
                                {addLoading ? 'Adding Product...' : 'Add Product'}
                            </button>
                            <button type="button" className={styles.cancelButton} onClick={() => setShowAddForm(false)} disabled={addLoading}>
                                Cancel
                            </button>
                        </div>

                        {addError && <div className={styles.formError}>{addError}</div>}
                    </form>
                )}
                {isEditing && editingProduct && (
                    <form className={styles.addForm} onSubmit={handleEditSubmit}>
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Edit Product</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-name">Product Name</label>
                                    <input
                                        id="edit-product-name"
                                        type="text"
                                        placeholder="Enter product name"
                                        value={editingProduct.name}
                                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-category">Category</label>
                                    <select
                                        id="edit-product-category"
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className={styles.formSelect}
                                        disabled={editLoading}
                                    >
                                        <option value="">Select Category</option>
                                        {categoryRefs.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-unit">Unit</label>
                                    <select
                                        id="edit-product-unit"
                                        value={editingProduct.unit}
                                        onChange={e => setEditingProduct({ ...editingProduct, unit: Number(e.target.value) })}
                                        className={styles.formSelect}
                                        disabled={editLoading}
                                    >
                                        <option value="">Select Unit</option>
                                        {unitRefs.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-status">Status</label>
                                    <select
                                        id="edit-product-status"
                                        value={editingProduct.is_active}
                                        onChange={e => setEditingProduct({ ...editingProduct, is_active: e.target.value })}
                                        className={styles.formSelect}
                                        disabled={editLoading}
                                    >
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Product Details</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-desc">Description</label>
                                    <textarea
                                        id="edit-product-desc"
                                        placeholder="Enter product description"
                                        value={editingProduct.desc}
                                        onChange={e => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={editLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-benefits">Benefits</label>
                                    <textarea
                                        id="edit-product-benefits"
                                        placeholder="Enter product benefits"
                                        value={editingProduct.benefits}
                                        onChange={e => setEditingProduct({ ...editingProduct, benefits: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={editLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-uses">Uses</label>
                                    <textarea
                                        id="edit-product-uses"
                                        placeholder="Enter product uses"
                                        value={editingProduct.uses}
                                        onChange={e => setEditingProduct({ ...editingProduct, uses: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={editLoading}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-recipes">Recipes</label>
                                    <textarea
                                        id="edit-product-recipes"
                                        placeholder="Enter product recipes"
                                        value={editingProduct.recipes}
                                        onChange={e => setEditingProduct({ ...editingProduct, recipes: e.target.value })}
                                        className={styles.formTextarea}
                                        disabled={editLoading}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Pricing & Inventory</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-price">Price</label>
                                    <input
                                        id="edit-product-price"
                                        type="number"
                                        placeholder="Enter price"
                                        value={editingProduct.price ?? 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-discount">Discount Price</label>
                                    <input
                                        id="edit-product-discount"
                                        type="number"
                                        placeholder="Enter discount price"
                                        value={editingProduct.discount_price ?? 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, discount_price: Number(e.target.value) || 0 })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-bonus">Bonus Points</label>
                                    <input
                                        id="edit-product-bonus"
                                        type="number"
                                        placeholder="Enter bonus points"
                                        value={editingProduct.bonus_points ?? 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, bonus_points: Number(e.target.value) || 0 })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-qty">Quantity per Unit</label>
                                    <input
                                        id="edit-product-qty"
                                        type="number"
                                        placeholder="Enter quantity per unit"
                                        value={editingProduct.qty_per_unit ?? 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, qty_per_unit: Number(e.target.value) || 0 })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>Additional Information</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-supplier">Supplier</label>
                                    <input
                                        id="edit-product-supplier"
                                        type="text"
                                        placeholder="Enter supplier name"
                                        value={editingProduct.supplier}
                                        onChange={e => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                                        className={styles.formInput}
                                        disabled={editLoading}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel} htmlFor="edit-product-image">Product Image</label>
                                    <div className={styles.imageUploadContainer}>
                                        <label className={styles.imageUploadLabel} htmlFor="edit-product-image">
                                            {editImageFile ? 'Change Image' : 'Upload New Image'}
                                        </label>
                                        <input
                                            id="edit-product-image"
                                            type="file"
                                            accept="image/*"
                                            ref={editFileInputRef}
                                            onChange={e => setEditImageFile(e.target.files ? e.target.files[0] : null)}
                                            className={styles.formInput}
                                            disabled={editLoading}
                                            style={{ display: 'none' }}
                                        />
                                        {editImageFile && (
                                            <span className={styles.imageFileName}>{editImageFile.name}</span>
                                        )}
                                        {!editImageFile && editingProduct.image && (
                                            <Image src={editingProduct.image} alt="Current" className={styles.currentImage} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formButtons}>
                            <button type="submit" className={styles.submitButton} disabled={editLoading}>
                                {editLoading ? 'Updating Product...' : 'Update Product'}
                            </button>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingProduct(null);
                                    setEditImageFile(null);
                                }}
                                disabled={editLoading}
                            >
                                Cancel
                            </button>
                        </div>

                        {editError && <div className={styles.formError}>{editError}</div>}
                    </form>
                )}
                <div className={styles.productsList}>
                    {error && <div className={styles.error}>{error}</div>}
                    {isLoading ? (
                        <div className={styles.loading}>Loading products...</div>
                    ) : products.length > 0 ? (
                        <table className={styles.productsTable}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Image</th>
                                    <th>Status</th>
                                    <th>Unit</th>
                                    <th>Benefits</th>
                                    <th>Uses</th>
                                    <th>Recipes</th>
                                    <th>Supplier</th>
                                    <th>Price</th>
                                    <th>Bonus Points</th>
                                    <th>Qty/Unit</th>
                                    <th>Discount Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <React.Fragment key={product.id}>
                                        <tr>
                                            <td>
                                                <button
                                                    className={styles.expandBtn}
                                                    onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                                                >
                                                    {expanded === product.id ? '-' : '+'}
                                                </button>
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{categoryRefs.find(c => c.id === Number(product.category))?.name || product.category}</td>
                                            <td className={styles.descCell}>{product.desc}</td>
                                            <td>
                                                {product.image && (
                                                    <Image src={product.image} alt={product.name} className={styles.productImage} />
                                                )}
                                            </td>
                                            <td>
                                                <span className={product.is_active === 'Y' ? styles.active : styles.inactive}>
                                                    {product.is_active === 'Y' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{unitRefs.find(u => u.id === product.unit)?.name || product.unit}</td>
                                            <td>{product.benefits}</td>
                                            <td>{product.uses}</td>
                                            <td>{product.recipes}</td>
                                            <td>{product.supplier}</td>
                                            <td>{product.price}</td>
                                            <td>{product.bonus_points}</td>
                                            <td>{product.qty_per_unit}</td>
                                            <td>{product.discount_price}</td>
                                            <td className={styles.actionsCell}>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.editButton}`}
                                                        onClick={() => handleEditProduct(product)}
                                                        title="Edit Product"
                                                        disabled={isDeleting || isEditing}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        title="Delete Product"
                                                        disabled={isDeleting}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18"></path>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded === product.id && (
                                            <tr>
                                                <td colSpan={16}>
                                                    <div className={styles.productDetailsCard}>
                                                        <div className={styles.detailsSection}>
                                                            <div className={styles.sectionHeader}>
                                                                <h4>Images</h4>
                                                                <button
                                                                    className={styles.addButton}
                                                                    onClick={() => {
                                                                        setSelectedProductId(product.id);
                                                                        setShowAddImageForm(true);
                                                                    }}
                                                                >
                                                                    Add Image
                                                                </button>
                                                            </div>
                                                            <div className={styles.productImages}>
                                                                {images[product.id]?.length ? (
                                                                    <div className={styles.imageGrid}>
                                                                        {images[product.id].map(img => (
                                                                            <div key={img.id} className={styles.imageContainer}>
                                                                                <Image src={img.image} alt="Product" className={styles.productImage} />
                                                                                <button
                                                                                    className={styles.deleteButton}
                                                                                    onClick={() => handleDeleteImage(img.id)}
                                                                                    title="Delete Image"
                                                                                >
                                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                        <path d="M3 6h18"></path>
                                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className={styles.detailsEmpty}>No images</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={styles.detailsSection}>
                                                            <div className={styles.sectionHeader}>
                                                                <h4>Plans</h4>
                                                                <button
                                                                    className={styles.addButton}
                                                                    onClick={() => {
                                                                        setSelectedProductId(product.id);
                                                                        setShowAddPlanForm(true);
                                                                    }}
                                                                >
                                                                    Add Plan
                                                                </button>
                                                            </div>
                                                            {plans[product.id]?.length ? (
                                                                <table className={styles.plansTable}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Point</th>
                                                                            <th>Value</th>
                                                                            <th>Unit</th>
                                                                            <th>Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {plans[product.id].map(plan => (
                                                                            <tr key={plan.id}>
                                                                                <td>{plan.point}</td>
                                                                                <td>{plan.value}</td>
                                                                                <td>{plan.unit}</td>
                                                                                <td>
                                                                                    <button
                                                                                        className={styles.deleteButton}
                                                                                        onClick={() => handleDeletePlan(plan.id)}
                                                                                        title="Delete Plan"
                                                                                    >
                                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                            <path d="M3 6h18"></path>
                                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                                        </svg>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p className={styles.detailsEmpty}>No plans</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No products found</p>
                    )}
                </div>
            </div>

            {/* Add Image Form */}
            {showAddImageForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Add New Image</h3>
                        <form onSubmit={handleAddImage}>
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Select Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setNewImage({ file: e.target.files?.[0] || null, product_id: selectedProductId || 0 })}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.modalButtons}>
                                <button type="submit" className={styles.submitButton} disabled={isUploadingImage}>
                                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowAddImageForm(false);
                                        setNewImage({ file: null, product_id: 0 });
                                    }}
                                    disabled={isUploadingImage}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Plan Form */}
            {showAddPlanForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Add New Plan</h3>
                        <form onSubmit={handleAddPlan}>
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Point</label>
                                <input
                                    type="text"
                                    value={newPlan.point}
                                    onChange={e => setNewPlan({ ...newPlan, point: e.target.value })}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Value</label>
                                <input
                                    type="number"
                                    value={newPlan.value}
                                    onChange={e => setNewPlan({ ...newPlan, value: Number(e.target.value) || 0 })}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.formLabel}>Unit</label>
                                <input
                                    type="text"
                                    value={newPlan.unit}
                                    onChange={e => setNewPlan({ ...newPlan, unit: e.target.value })}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.modalButtons}>
                                <button type="submit" className={styles.submitButton} disabled={isAddingPlan}>
                                    {isAddingPlan ? 'Adding...' : 'Add Plan'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowAddPlanForm(false);
                                        setNewPlan({ point: '', value: 0, unit: '', product_id: 0 });
                                    }}
                                    disabled={isAddingPlan}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
} 