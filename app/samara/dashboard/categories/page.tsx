'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './categories.module.css';
import Image from 'next/image';

interface Category {
    id: number;
    name: string;
    desc: string;
    image: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', desc: '', image: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            let query = supabase.from('categories').select('*');
            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }
            // If you have a status field, you can filter here. For now, this is a placeholder.
            // if (statusFilter) {
            //     query = query.eq('status', statusFilter);
            // }
            const { data, error } = await query;
            if (error) throw error;
            setCategories(data || []);
        } catch {
            setError('Failed to load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = () => {
        setShowAddForm(true);
        setAddError(null);
        setNewCategory({ name: '', desc: '', image: '' });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        if (!newCategory.name.trim()) {
            setAddError('Category name is required.');
            setAddLoading(false);
            return;
        }
        if (!imageFile) {
            setAddError('Image is required.');
            setAddLoading(false);
            return;
        }
        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const { error: uploadError } = await supabase
                .storage
                .from('samara.storage')
                .upload(`categories/${fileName}`, imageFile);
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase
                .storage
                .from('samara.storage')
                .getPublicUrl(`categories/${fileName}`);
            const imageUrl = publicUrlData?.publicUrl || '';
            const { error: insertError } = await supabase
                .from('categories')
                .insert([{ name: newCategory.name.trim(), desc: newCategory.desc.trim(), image: imageUrl }]);
            if (insertError) throw insertError;
            setShowAddForm(false);
            fetchCategories();
        } catch {
            setAddError('Failed to add category. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Categories Management"
            actionButton={{ label: 'Add New Category', onClick: handleAddCategory }}
        >
            <div className={styles.content}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {/* <option value="active">Active</option>
                        <option value="inactive">Inactive</option> */}
                    </select>
                </div>
                {showAddForm && (
                    <form className={styles.addForm} onSubmit={handleAddCategorySubmit}>
                        <input
                            type="text"
                            placeholder="Category name"
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newCategory.desc}
                            onChange={e => setNewCategory({ ...newCategory, desc: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <label className={styles.imageUploadLabel} htmlFor="category-image">
                            {imageFile ? 'Change Image' : 'Upload Image'}
                        </label>
                        <input
                            id="category-image"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        {imageFile && (
                            <span className={styles.imageFileName}>{imageFile.name}</span>
                        )}
                        <button type="submit" className={styles.statusButton} disabled={addLoading}>
                            {addLoading ? 'Adding...' : 'Add Category'}
                        </button>
                        <button type="button" className={styles.statusButton} onClick={() => setShowAddForm(false)} disabled={addLoading}>
                            Cancel
                        </button>
                        {addError && <div className={styles.error}>{addError}</div>}
                    </form>
                )}
                <div className={styles.categoriesList}>
                    {error && <div className={styles.error}>{error}</div>}
                    {isLoading ? (
                        <div className={styles.loading}>Loading categories...</div>
                    ) : categories.length > 0 ? (
                        <table className={styles.categoriesTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Image</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td>{cat.name}</td>
                                        <td>{cat.desc}</td>
                                        <td>
                                            {cat.image ? (
                                                <Image src={cat.image} alt={cat.name} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                            ) : (
                                                'No image'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No categories found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 