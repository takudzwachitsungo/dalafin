import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import { ConfirmModal } from '../components/modals/ConfirmModal';

interface AvoidedImpulse {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  avoided_at: string;
}

export function ImpulsesScreen() {
  const navigate = useNavigate();
  const [impulses, setImpulses] = useState<AvoidedImpulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImpulse, setSelectedImpulse] = useState<AvoidedImpulse | null>(null);

  useEffect(() => {
    loadImpulses();
  }, []);

  const loadImpulses = async () => {
    try {
      const response = await api.get('/api/v1/avoided-impulses/');
      setImpulses(response);
    } catch (error) {
      console.error('Failed to load impulses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (impulse: AvoidedImpulse) => {
    setSelectedImpulse(impulse);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedImpulse) return;
    
    try {
      await api.delete(`/api/v1/avoided-impulses/${selectedImpulse.id}`);
      setImpulses(impulses.filter(i => i.id !== selectedImpulse.id));
    } catch (error) {
      console.error('Failed to delete impulse:', error);
      alert('Failed to delete impulse');
    }
  };

  const handleProceedClick = (impulse: AvoidedImpulse) => {
    setSelectedImpulse(impulse);
    setShowProceedModal(true);
  };

  const handleProceedConfirm = async () => {
    if (!selectedImpulse) return;
    
    setProcessingId(selectedImpulse.id);
    try {
      await api.post(`/api/v1/avoided-impulses/${selectedImpulse.id}/proceed/`);
      setImpulses(impulses.filter(i => i.id !== selectedImpulse.id));
      alert('Transaction logged successfully!');
    } catch (error) {
      console.error('Failed to proceed with impulse:', error);
      alert('Failed to create transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const totalAvoided = impulses.reduce((sum, i) => sum + i.amount, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pb-24 pt-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 pt-8 px-4 space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Avoided Impulses</h1>
            <p className="text-sm text-neutral-500">Your impulse control wins</p>
          </div>
        </div>
      </header>

      {/* Summary Card */}
      {impulses.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium uppercase tracking-wide">Total Saved</div>
              <div className="text-4xl font-bold text-emerald-900 mt-2">
                {formatCurrency(totalAvoided)}
              </div>
              <div className="text-sm text-emerald-600 mt-2">
                {impulses.length} impulse{impulses.length !== 1 ? 's' : ''} avoided
              </div>
            </div>
            <div className="h-20 w-20 rounded-full bg-emerald-200/50 flex items-center justify-center">
              <AlertCircle className="text-emerald-700" size={36} />
            </div>
          </div>
        </Card>
      )}

      {/* Impulses List */}
      <section className="space-y-3">
        {impulses.length === 0 ? (
          <Card className="p-10 text-center bg-neutral-50">
            <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-neutral-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Avoided Impulses Yet</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              When you choose to avoid an impulse purchase, it will appear here for you to review.
            </p>
          </Card>
        ) : (
          impulses.map((impulse) => (
            <Card key={impulse.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xl font-bold text-neutral-900">
                        {formatCurrency(impulse.amount)}
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">{impulse.category}</div>
                    </div>
                    <div className="text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">
                      {formatDate(impulse.avoided_at)}
                    </div>
                  </div>
                  
                  {impulse.description && (
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {impulse.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProceedClick(impulse)}
                      disabled={processingId === impulse.id}
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                    >
                      <ShoppingCart size={16} className="mr-1.5" />
                      {processingId === impulse.id ? 'Processing...' : 'Proceed with Purchase'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClick(impulse)}
                      className="text-neutral-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* Proceed Confirmation Modal */}
      <ConfirmModal
        isOpen={showProceedModal}
        onClose={() => setShowProceedModal(false)}
        onConfirm={handleProceedConfirm}
        title="Proceed with Purchase?"
        message="Are you sure you want to proceed with this purchase? It will be logged as a transaction and removed from your avoided impulses list."
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        variant="info"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Impulse?"
        message="Are you sure you want to remove this avoided impulse from your list? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}
