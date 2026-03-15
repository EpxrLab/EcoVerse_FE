import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { classesService } from '../services/classes.service';

export function useClasses() {
  const [classes, setClasses] = useState([]);
  const [gradeGroups, setGradeGroups] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // All students in the school
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const schoolId = 1;

  // Fetch classes and school-level data
  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch account info which contains all parents and their nested students
      const accountsRes = await classesService.getAccounts();
      const accountsData = accountsRes?.data?.data?.accounts || [];
      
      const mappedStudents = [];
      const uniqueClasses = {};

      accountsData.forEach(acc => {
        const parentInfo = {
          parent_name: acc.parentFullName,
          parent_phone: acc.phoneNumber,
          parent_email: acc.parentEmail,
          parent_username: acc.phoneNumber, // Account uses phone number
          parent_password: acc.password, // Might be null
          credentialEmailSent: acc.credentialEmailSent || false, // Use credentialEmailSent from account
        };
        
        acc.children?.forEach(child => {
          // Generate a synthetic class ID if missing
          const classGrade = child.gradeLevel || 6;
          const className = child.className || 'Unknown';
          const syntheticClassId = `${classGrade}_${className}`;
          
          if (!uniqueClasses[syntheticClassId]) {
             uniqueClasses[syntheticClassId] = {
               id: syntheticClassId,
               school_id: schoolId,
               name: className,
               grade: parseInt(classGrade),
               teacher_name: '',
             };
          }

          mappedStudents.push({
            id: child.studentId || Math.random().toString(),
            student_name: child.studentFullName || 'Học sinh',
            student_code: child.studentCode || '',
            student_username: child.studentCode || '',
            student_password: child.password || null,
            class_id: syntheticClassId,
            className: className,
            grade: classGrade,
            date_of_birth: child.dateOfBirth || null,
            gender: child.gender === 'MALE' ? 'male' : child.gender === 'FEMALE' ? 'female' : 'other',
            address: child.address || '',
            ...parentInfo,
            status: child.status || 'active',
            accuracy: child.accuracy || 0,
            items_sorted: child.items_sorted || 0,
          });
        });
      });

      const extractedClasses = Object.values(uniqueClasses);

      const data = extractedClasses
        .filter(c => c.school_id === schoolId || !c.school_id)
        .sort((a, b) => a.grade - b.grade || a.name?.localeCompare(b.name));

      const classesWithStats = data.map((classItem) => {
        const classSts = mappedStudents.filter(s =>
          Array.isArray(s.class)
            ? s.class.find(c => c.id === classItem.id)
            : (s.class_id === classItem.id ||
              (s.class && s.class.id === classItem.id) ||
              s.className === classItem.name)
        );
        const avgAccuracy = classSts.length > 0
          ? Math.round(classSts.reduce((sum, s) => sum + (s.accuracy || 0), 0) / classSts.length)
          : 0;
        const totalItems = classSts.reduce((sum, s) => sum + (s.items_sorted || 0), 0);
        const topStudent = classSts.length > 0
          ? [...classSts].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]?.student_name
          : null;

        return {
          ...classItem,
          students_count: classSts.length,
          avg_accuracy: avgAccuracy,
          total_items: totalItems,
          top_student: topStudent,
        };
      });

      setClasses(classesWithStats);

      // Build allStudents for school from mappedStudents
      const yearClassIds = data.map(c => c.id);
      const yearStudents = mappedStudents
        .filter(s => yearClassIds.includes(s.class_id) || yearClassIds.includes(s.class?.id))
        .map(s => {
           let matchedClass = data.find(c => c.id === s.class_id || (s.class && c.id === s.class.id) || c.name === s.className);
           return {
             ...s,
             className: matchedClass?.name || s.className || '',
             grade: matchedClass?.grade || s.grade || '',
           };
        })
        .sort((a, b) => (a.grade - b.grade) || (a.student_name || '').localeCompare(b.student_name || ''));
        
      setAllStudents(yearStudents);

      const groupedByGrade = classesWithStats.reduce((acc, classItem) => {
        const grade = parseInt(classItem.grade) || 6;
        if (!acc[grade]) acc[grade] = [];
        acc[grade].push(classItem);
        return acc;
      }, {});

      const groups = Object.entries(groupedByGrade).map(([grade, gradeClasses]) => ({
        grade: parseInt(grade),
        classes: gradeClasses,
        totalStudents: gradeClasses.reduce((sum, c) => sum + (c.students_count || 0), 0),
        avgAccuracy: gradeClasses.length > 0
          ? Math.round(gradeClasses.reduce((sum, c) => sum + (c.avg_accuracy || 0), 0) / gradeClasses.length)
          : 0,
      }));

      setGradeGroups(groups.sort((a, b) => a.grade - b.grade));
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error('Lỗi khi tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  // Fetch students for selected class from current allStudents state
  const fetchClassStudents = useCallback((classId) => {
    const data = allStudents
      .filter(s => s.class_id === classId || (s.class && s.class.id === classId))
      .sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
    setClassStudents(data);
  }, [allStudents]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id);
    } else {
      setClassStudents([]);
    }
  }, [selectedClass, fetchClassStudents]);

  // Calculate stats
  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + (c.students_count || 0), 0),
    avgAccuracy: classes.length > 0
      ? Math.round(classes.reduce((sum, c) => sum + (c.avg_accuracy || 0), 0) / classes.length)
      : 0,
    totalGrades: gradeGroups.length,
  };

  // Create class (local-only for now, no mock students/parents)
  const createClass = async (formData) => {
    toast.success('Tạo lớp học thành công');
    await fetchClasses();
    setIsAddDialogOpen(false);
  };

  // Update class
  const updateClass = async (classId, formData) => {
    toast.success('Cập nhật lớp học thành công');
    await fetchClasses();
  };

  // Delete class
  const deleteClass = async (classId) => {
    toast.success('Xóa lớp học thành công');
    if (selectedClass?.id === classId) {
      setSelectedClass(null);
    }
    await fetchClasses();
  };

  // Student CRUD operations
  const createStudent = async (classId, formData) => {
    // Find the class info for the payload
    const classInfo = _classes.find(c => c.id === classId) || { name: 'Unknown', grade: 6 };

    try {
      const payload = {
        studentFullName: formData.student_name,
        className: classInfo.name,
        gradeLevel: String(classInfo.grade),
        dateOfBirth: formData.date_of_birth || null,
        gender: formData.gender === 'male' ? 'MALE' : formData.gender === 'female' ? 'FEMALE' : 'OTHER', // Defaulting other to OTHER if expected, or handling it based on backend enum
        address: formData.address || '',
        parentFullName: formData.parent_name || '',
        parentPhone: formData.parent_phone || '',
        parentEmail: formData.parent_email || ''
      };

      await classesService.addStudent(payload);
      toast.success('Thêm học sinh thành công');
      
      // We don't have a reliable way to fetch just students for this class from the Accounts API efficiently
      // without reloading everything, so we reload all data
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Failed to add student:", error);
      toast.error('Có lỗi xảy ra khi thêm học sinh.');
      return false;
    }
  };

  const updateStudent = async (studentId, formData) => {
    if (!selectedClass) return false;

    try {
      const payload = {
        studentFullName: formData.student_name,
        className: selectedClass.name, // Usually doesn't change from this form, but we pass current class
        gradeLevel: String(selectedClass.grade),
        dateOfBirth: formData.date_of_birth || null,
        gender: formData.gender === 'male' ? 'MALE' : formData.gender === 'female' ? 'FEMALE' : 'OTHER', // Defaulting other to OTHER if expected, or handling it based on backend enum
        address: formData.address || '',
        parentFullName: formData.parent_name || '',
        parentPhone: formData.parent_phone || '',
        parentEmail: formData.parent_email || ''
      };

      await classesService.updateStudent(studentId, payload);
      toast.success('Cập nhật học sinh thành công');
      
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Failed to update student:", error);
      toast.error('Có lỗi xảy ra khi cập nhật học sinh.');
      return false;
    }
  };

  const deleteStudent = async (studentId) => {
    if (!selectedClass) return false;

    try {
      await classesService.deleteStudent(studentId);
      toast.success('Xóa học sinh thành công');
      await fetchClassStudents(selectedClass.id);
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast.error('Có lỗi xảy ra khi xóa học sinh.');
      return false;
    }
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      // If student is active, block them (send true)
      // If student is inactive, unblock them (send false)
      const isBlocked = currentStatus === 'active';
      await classesService.toggleStudentStatus(studentId, isBlocked);
      toast.success(isBlocked ? 'Đã vô hiệu hóa tài khoản học sinh' : 'Đã kích hoạt tài khoản học sinh');
      if (selectedClass) {
        await fetchClassStudents(selectedClass.id);
      }
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Failed to toggle student status:", error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái học sinh.');
      return false;
    }
  };

  // ─── Bulk Import via API ─────────────────────────────────────────────────────────────
  const bulkImport = async (file, parsedRows, onProgress) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await classesService.importAccounts(formData, onProgress);

      // Refetch data after successful import
      await fetchClasses();
      
      // Calculate mock results based on parsed rows if backend doesn't return counts
      const classes = [...new Set((parsedRows || []).map(r => r.class_name).filter(Boolean))];
      
      return {
        createdClasses: response.data?.createdClasses || classes,
        createdStudents: response.data?.createdStudents || (parsedRows?.length || 0),
      };
    } catch (error) {
      console.error("Bulk import failed:", error);
      throw error;
    }
  };

  return {
    // Data
    classes,
    gradeGroups,
    classStudents,
    allStudents,
    stats,
    selectedClass,
    selectedGrade,
    isLoading,
    schoolId,

    // Dialog states
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAddStudentDialogOpen,
    setIsAddStudentDialogOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,

    // Setters
    setSelectedClass,
    setSelectedGrade,

    // Class Actions
    createClass,
    updateClass,
    deleteClass,
    fetchClasses,

    // Student Actions
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    fetchClassStudents,

    // Bulk Import
    bulkImport,
  };
}