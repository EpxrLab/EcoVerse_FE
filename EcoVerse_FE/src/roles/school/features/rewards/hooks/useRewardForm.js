import { useState } from 'react';

export function useRewardForm() {
  // Marketplace item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    coins: 0,
    stock: 0,
    image: '🎁',
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
      name: '',
      coins: 0,
      stock: 0,
      image: '🎁',
    });
  };

  const loadItemForm = (data) => {
    setItemForm({
      name: data.name || '',
      coins: data.coins || 0,
      stock: data.stock || 0,
      image: data.image || '🎁',
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