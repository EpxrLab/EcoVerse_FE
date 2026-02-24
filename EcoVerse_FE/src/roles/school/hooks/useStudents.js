import { useState, useMemo } from 'react';
import { studentsData, studentStats, classOptions } from '../data/student.data';

export function useStudents() {
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedClass: 'All',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           student.id.includes(filters.searchTerm);
      const matchesClass = filters.selectedClass === "All" || student.class === filters.selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [filters]);

  const setSearchTerm = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const setSelectedClass = (selectedClass) => {
    setFilters(prev => ({ ...prev, selectedClass }));
  };

  return {
    students: filteredStudents,
    allStudents: studentsData,
    stats: studentStats,
    classOptions,
    filters,
    setSearchTerm,
    setSelectedClass,
    selectedStudent,
    setSelectedStudent,
    isAddDialogOpen,
    setIsAddDialogOpen,
  };
}