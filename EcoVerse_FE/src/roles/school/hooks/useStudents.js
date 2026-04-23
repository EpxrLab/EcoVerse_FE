import { useState, useMemo, useEffect, useCallback } from 'react';
import { studentStats, classOptions } from '../data/student.data';
import { studentService } from '../services';

export function useStudents() {
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedClass: 'All',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await studentService.getStudents({ size: 100 }); // Fetch a large enough batch for selection
      const data = res.data?.data?.content || res.data?.data || [];
      
      if (Array.isArray(data)) {
        const mappedData = data.map(student => ({
          id: student.studentId,
          name: student.studentFullName,
          class: `${student.gradeLevel || ''}${student.className || ''}`,
          grade: student.gradeLevel,
          avatar: student.avatarUrl,
          code: student.studentCode,
        }));
        setStudentsData(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(studentsData)) return [];
    return studentsData.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           student.id.includes(filters.searchTerm);
      const matchesClass = filters.selectedClass === "All" || student.class === filters.selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [studentsData, filters]);

  const availableClasses = useMemo(() => {
    if (!Array.isArray(studentsData)) return [];
    const classMap = {};
    studentsData.forEach(student => {
      const className = student.class;
      if (!className) return;
      
      if (!classMap[className]) {
        classMap[className] = {
          id: className, // Use class name as ID for selection
          name: className,
          grade: student.grade || '?',
          students_count: 0
        };
      }
      classMap[className].students_count++;
    });
    return Object.values(classMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [studentsData]);

  const setSearchTerm = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const setSelectedClass = (selectedClass) => {
    setFilters(prev => ({ ...prev, selectedClass }));
  };

  return {
    students: filteredStudents,
    allStudents: studentsData,
    availableClasses,
    isLoading,
    refreshStudents: fetchStudents,
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