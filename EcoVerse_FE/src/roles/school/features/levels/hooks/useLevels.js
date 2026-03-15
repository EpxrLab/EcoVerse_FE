import { useState } from 'react';
import { gameLevelsData } from '../../../data/level.data';

export function useLevels() {
  const [levels, setLevels] = useState(gameLevelsData);
  const [isAddLevelOpen, setIsAddLevelOpen] = useState(false);
  const [isEditLevelOpen, setIsEditLevelOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [selectedBinTypes, setSelectedBinTypes] = useState(['plastic', 'paper', 'organic']);
  const [editBinTypes, setEditBinTypes] = useState([]);

  const toggleBinType = (binType, isEdit) => {
    if (isEdit) {
      setEditBinTypes(prev => 
        prev.includes(binType) 
          ? prev.filter(b => b !== binType) 
          : [...prev, binType]
      );
    } else {
      setSelectedBinTypes(prev => 
        prev.includes(binType) 
          ? prev.filter(b => b !== binType) 
          : [...prev, binType]
      );
    }
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setEditBinTypes(level.binTypes);
    setIsEditLevelOpen(true);
  };

  const handleDeleteLevel = (levelId) => {
    setLevels(prev => prev.filter(l => l.id !== levelId));
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      'Dễ': 'bg-eco-green/10 text-eco-green border-eco-green/20',
      'Trung bình': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'Khó': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[difficulty] || '';
  };

  const getBinTypeLabel = (binType) => {
    const labels = {
      plastic: 'Nhựa',
      paper: 'Giấy',
      organic: 'Hữu cơ',
      others: 'Khác',
    };
    return labels[binType];
  };

  const getBinTypeColor = (binType) => {
    const colors = {
      plastic: 'bg-blue-500',
      paper: 'bg-eco-green',
      organic: 'bg-amber-500',
      others: 'bg-gray-500',
    };
    return colors[binType];
  };

  const stats = {
    totalLevels: levels.length,
    easyLevels: levels.filter(l => l.difficulty === 'Dễ').length,
    mediumLevels: levels.filter(l => l.difficulty === 'Trung bình').length,
    hardLevels: levels.filter(l => l.difficulty === 'Khó').length,
  };

  return {
    levels,
    isAddLevelOpen,
    setIsAddLevelOpen,
    isEditLevelOpen,
    setIsEditLevelOpen,
    editingLevel,
    setEditingLevel,
    selectedBinTypes,
    setSelectedBinTypes,
    editBinTypes,
    setEditBinTypes,
    toggleBinType,
    handleEditLevel,
    handleDeleteLevel,
    getDifficultyBadgeColor,
    getBinTypeLabel,
    getBinTypeColor,
    stats,
  };
}