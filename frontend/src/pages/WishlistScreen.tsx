import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { WishlistItem } from '../components/finance/WishlistItem';
import { api } from '../lib/api';

export function WishlistScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setItems(data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      // Use empty array if endpoint doesn't exist yet
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      // If a file is selected, upload it first
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await api.uploadImage(selectedFile);
          finalImageUrl = `http://localhost:8000${uploadResult.url}`;
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Item will be added without image.');
        } finally {
          setUploading(false);
        }
      }
      
      const itemData = {
        name,
        price: parseFloat(price),
        category,
        url: url || null,
        image_url: finalImageUrl || null
      };
      
      await api.createWishlistItem(itemData);
      
      setName('');
      setPrice('');
      setCategory('Electronics');
      setUrl('');
      setImageUrl('');
      setSelectedFile(null);
      setImagePreview('');
      setShowAddForm(false);
      await loadWishlist();
    } catch (error) {
      console.error('Failed to add item:', error);
      alert(`Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.updateWishlistItem(id, { status: 'removed' });
      await loadWishlist();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleBuy = async (id: string) => {
    try {
      await api.updateWishlistItem(id, { status: 'purchased' });
      await loadWishlist();
    } catch (error) {
      console.error('Failed to mark as purchased:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear URL input if file is selected
      setImageUrl('');
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="pb-24 pt-8 px-4 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Wishlist</h1>
          <p className="text-neutral-500 text-sm">Park your impulses here.</p>
        </div>
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={24} className={showAddForm ? 'rotate-45 transition-transform' : ''} />
        </Button>
      </header>

      {/* Add Item Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Noise Cancelling Headphones"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Image
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!selectedFile}
                        className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-50 disabled:text-neutral-400"
                      />
                      <span className="text-neutral-400 text-sm py-2">or</span>
                      <label className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                        <Upload size={16} />
                        <span className="text-sm">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {(imagePreview || imageUrl) && (
                      <div className="relative mt-2">
                        <img 
                          src={imagePreview || imageUrl} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting || uploading} className="flex-1">
                    {uploading ? 'Uploading...' : submitting ? 'Adding...' : 'Add to Wishlist'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Wishlist Items */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Active Wishlist</h2>
        {items.filter(i => i.status === 'waiting').map(item => {
          const daysSinceAdded = Math.floor((Date.now() - new Date(item.added_date).getTime()) / (1000 * 60 * 60 * 24));
          return <WishlistItem 
            key={item.id} 
            id={item.id}
            name={item.name}
            price={parseFloat(item.price)}
            imageUrl={item.image_url}
            daysWaiting={daysSinceAdded}
            cooldownDays={item.cooldown_days}
            status="waiting"
            onRemove={handleRemove} 
            onBuy={handleBuy} 
          />;
        })}
        {items.filter(i => i.status === 'waiting').length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>Your wishlist is empty.</p>
            <p className="text-sm">Great job controlling your impulses!</p>
          </div>
        )}
      </div>

      {/* Purchased Items */}
      {items.filter(i => i.status === 'purchased').length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-bold text-neutral-900">Purchased Items</h2>
          <p className="text-sm text-neutral-500">Items you decided to buy after the cooldown period</p>
          {items.filter(i => i.status === 'purchased').map(item => {
            const daysSinceAdded = Math.floor((Date.now() - new Date(item.added_date).getTime()) / (1000 * 60 * 60 * 24));
            return <WishlistItem 
              key={item.id} 
              id={item.id}
              name={item.name}
              price={parseFloat(item.price)}
              imageUrl={item.image_url}
              daysWaiting={daysSinceAdded}
              cooldownDays={item.cooldown_days}
              status="purchased"
              purchasedDate={item.purchased_date}
              onRemove={handleRemove} 
              onBuy={handleBuy} 
            />;
          })}
        </div>
      )}

      {/* Removed Items */}
      {items.filter(i => i.status === 'removed').length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-bold text-neutral-900">Removed Items</h2>
          <p className="text-sm text-neutral-500">Impulses you successfully avoided - great job!</p>
          <div className="space-y-3">
            {items.filter(i => i.status === 'removed').map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <p className="font-semibold text-neutral-500 line-through">{item.name}</p>
                      <p className="text-sm text-neutral-400">${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-neutral-200 text-neutral-600 text-xs font-medium rounded-full">
                    Avoided
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>;
}