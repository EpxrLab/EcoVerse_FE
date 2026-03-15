import { useState } from 'react';

export function useClassForm() {
  // Class form state
  const [classForm, setClassForm] = useState({
    name: '',
    grade: 1,
    teacher_name: '',
    description: '',
  });
  // UI state for grade expansion
  const [expandedGrades, setExpandedGrades] = useState(new Set([1, 2, 3, 4, 5]));

  // Handlers
  const updateClassForm = (data) => {
    setClassForm(prev => ({ ...prev, ...data }));
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      grade: 1,
      teacher_name: '',
      description: '',
    });
  };

  const loadClassForm = (data) => {
    setClassForm({
      name: data.name || '',
      grade: data.grade || 1,
      teacher_name: data.teacher_name || '',
      description: data.description || '',
    });
  };

  const toggleGrade = (grade) => {
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grade)) {
        newSet.delete(grade);
      } else {
        newSet.add(grade);
      }
      return newSet;
    });
  };

  const openAddClassForGrade = (grade) => {
    setClassForm(prev => ({ ...prev, grade }));
  };

  return {
    // Class form
    classForm,
    updateClassForm,
    resetClassForm,
    loadClassForm,
    
    // UI state
    expandedGrades,
    toggleGrade,
    openAddClassForGrade,
  };
}