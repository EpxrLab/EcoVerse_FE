import { useState } from 'react';

export function useLevelForm() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'Dễ',
    gameType: 'sorting',
    binTypes: [],
    items: 0,
    passRate: '',
    coinsReward: 0,
    description: '',
  });

  // UI state
  const [selectedGameType, setSelectedGameType] = useState('sorting');
  const [selectedBinTypes, setSelectedBinTypes] = useState([]);

  // Handlers
  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const toggleBinType = (binType) => {
    setSelectedBinTypes(prev =>
      prev.includes(binType)
        ? prev.filter(t => t !== binType)
        : [...prev, binType]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      difficulty: 'Dễ',
      gameType: 'sorting',
      binTypes: [],
      items: 0,
      passRate: '',
      coinsReward: 0,
      description: '',
    });
    setSelectedBinTypes([]);
  };

  const loadFormData = (data) => {
    setFormData({
      name: data.name || '',
      difficulty: data.difficulty || 'Dễ',
      gameType: data.gameType || 'sorting',
      binTypes: data.binTypes || [],
      items: data.items || 0,
      passRate: data.passRate || '',
      coinsReward: data.coinsReward || 0,
      description: data.description || '',
    });
    setSelectedBinTypes(data.binTypes || []);
  };

  return {
    formData,
    selectedGameType,
    setSelectedGameType,
    selectedBinTypes,
    updateFormData,
    toggleBinType,
    resetForm,
    loadFormData,
  };
}