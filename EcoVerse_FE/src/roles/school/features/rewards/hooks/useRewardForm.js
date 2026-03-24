import { useState } from 'react';

export function useRewardForm() {
  // Marketplace item form state
  const [itemForm, setItemForm] = useState({
    id: null,
    rewardName: '',
    rewardType: 'PHYSICAL',
    description: '',
    coinCost: 0,
    imageUrl: '',
    stockQuantity: 0,
    isUnlimited: false,
    termsConditions: ''
  });

  // Dialog states
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers
  const updateItemForm = (data) => {
    setItemForm(prev => ({ ...prev, ...data }));
  };

  const resetItemForm = () => {
    setItemForm({
      id: null,
      rewardName: '',
      rewardType: 'PHYSICAL',
      description: '',
      coinCost: 0,
      imageUrl: '',
      stockQuantity: 0,
      isUnlimited: false,
      termsConditions: ''
    });
  };

  const loadItemForm = (data) => {
    setItemForm({
      id: data.id,
      rewardName: data.rewardName || data.name || '',
      rewardType: data.rewardType || 'PHYSICAL',
      description: data.description || '',
      coinCost: data.coinCost !== undefined ? data.coinCost : (data.coins || 0),
      imageUrl: data.imageUrl || data.image || '',
      stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : (data.stock || 0),
      isUnlimited: data.isUnlimited || false,
      termsConditions: data.termsConditions || ''
    });
  };

  return {
    // Item form
    itemForm,
    updateItemForm,
    resetItemForm,
    loadItemForm,

    // Dialog states
    isAddItemOpen,
    setIsAddItemOpen,
    isEditItemOpen,
    setIsEditItemOpen,

    // Search
    searchTerm,
    setSearchTerm,
  };
}