import { useState } from 'react';

export function useClassForm() {
  // Class form state
  const [classForm, setClassForm] = useState({
    name: '',
    grade: 1,
    teacher_name: '',
    description: '',
  });

  // Academic year form state
  const [yearForm, setYearForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  // UI state for grade expansion
  const [expandedGrades, setExpandedGrades] = useState(new Set([1, 2, 3, 4, 5]));

  // Handlers
  const updateClassForm = (data) => {
    setClassForm(prev => ({ ...prev, ...data }));
  };

  const updateYearForm = (data) => {
    setYearForm(prev => ({ ...prev, ...data }));
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      grade: 1,
      teacher_name: '',
      description: '',
    });
  };

  const resetYearForm = () => {
    setYearForm({
      name: '',
      start_date: '',
      end_date: '',
      is_current: false,
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

  const generateYearName = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  return {
    // Class form
    classForm,
    updateClassForm,
    resetClassForm,
    loadClassForm,
    
    // Year form
    yearForm,
    updateYearForm,
    resetYearForm,
    generateYearName,
    
    // UI state
    expandedGrades,
    toggleGrade,
    openAddClassForGrade,
  };
}