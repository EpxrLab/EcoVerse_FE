import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { classesService } from '../services/classes.service';
import { subscriptionService } from '@/roles/school/services/subscription.service';

export function useClasses() {
  const [gradeGroups, setGradeGroups] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // All students in the school
  const [selectedClass, setSelectedClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const schoolId = 1;

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await subscriptionService.getMySubscription();
      setCurrentSubscription(res.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  }, []);

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
            date_of_birth: child.dob || null,
            gender: child.gender === 'MALE' ? 'male' : child.gender === 'FEMALE' ? 'female' : 'other',
            address: child.address || '',
            ...parentInfo,
            parent_id: acc.parentId,
            status: child.active ? 'active' : 'suspended',
            accuracy: child.accuracy || 0,
            items_sorted: child.items_sorted || 0,
            coins: child.coins || 0,
            level: child.level || 1,
            streak: child.streak || 0,
          });
        });
      });

      const extractedClasses = Object.values(uniqueClasses);

      const data = extractedClasses
        .filter(c => c.school_id === schoolId || !c.school_id)
        .sort((a, b) => a.grade - b.grade || a.name?.localeCompare(b.name));

      const classesWithStats = data.map((classItem) => {
        const classSts = mappedStudents.filter(s =>
          s.class_id === classItem.id ||
          (s.className === classItem.name && parseInt(s.grade) === classItem.grade)
        );
        const totalItems = classSts.reduce((sum, s) => sum + (s.items_sorted || 0), 0);
        const totalCoins = classSts.reduce((sum, s) => sum + (s.coins || 0), 0);
        const topStudent = classSts.length > 0
          ? [...classSts].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]?.student_name
          : null;

        return {
          ...classItem,
          students_count: classSts.length,
          total_items: totalItems,
          total_coins: totalCoins,
          top_student: topStudent,
        };
      });


      // Build allStudents for school from mappedStudents
      const yearClassIds = data.map(c => c.id);
      const yearStudents = mappedStudents
        .filter(s => yearClassIds.includes(s.class_id) || yearClassIds.includes(s.class?.id))
        .map(s => {
          let matchedClass = data.find(c =>
            c.id === s.class_id ||
            (c.name === s.className && c.grade === parseInt(s.grade))
          );
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
    fetchSubscription();
  }, [fetchClasses, fetchSubscription]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id);
    } else {
      setClassStudents([]);
    }
  }, [selectedClass, fetchClassStudents]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalClasses: gradeGroups.reduce((sum, g) => sum + (g.classes?.length || 0), 0),
    totalStudents: allStudents.length,
    totalGrades: gradeGroups.length,
  }), [gradeGroups, allStudents.length]);


  // Student CRUD operations
  const createStudent = async (formData) => {
    // Check subscription limit
    if (currentSubscription && currentSubscription.maxStudents !== null) {
      if (allStudents.length >= currentSubscription.maxStudents) {
        toast.error(`Giới hạn gói đăng ký: Trường của bạn đã đạt tối đa ${currentSubscription.maxStudents} học sinh. Vui lòng nâng cấp gói để thêm mới.`);
        return false;
      }
    }

    // We use the className and gradeLevel from formData
    const className = formData.className;
    const gradeLevel = formData.gradeLevel;


    try {
      const payload = {
        studentFullName: formData.student_name,
        className: className,
        gradeLevel: String(gradeLevel),
        dateOfBirth: formData.date_of_birth || null,
        gender: formData.gender === 'male' ? 'MALE' : formData.gender === 'female' ? 'FEMALE' : 'OTHER',
        address: formData.address || '',
        parentFullName: formData.parent_name || '',
        parentPhone: formData.parent_phone || '',
        parentEmail: formData.parent_email || ''
      };

      await classesService.addStudent(payload);
      toast.success('Thêm học sinh thành công');

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
        className: formData.className,
        gradeLevel: String(formData.gradeLevel),
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
      // isActive = true if we want to activate (current is not 'active')
      // isActive = false if we want to deactivate (current is 'active')
      const isActive = currentStatus !== 'active';
      await classesService.toggleStudentStatus(studentId, isActive);
      toast.success(isActive ? 'Đã kích hoạt tài khoản học sinh' : 'Đã vô hiệu hóa tài khoản học sinh');
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

    // Check subscription limit
    if (currentSubscription && currentSubscription.maxStudents !== null) {
      const availableSlots = currentSubscription.maxStudents - allStudents.length;
      if (availableSlots <= 0) {
        toast.error(`Giới hạn gói đăng ký: Trường của bạn đã đạt tối đa ${currentSubscription.maxStudents} học sinh. Vui lòng nâng cấp gói để import.`);
        return null;
      }
      if (parsedRows && parsedRows.length > availableSlots) {
        toast.error(`Bạn chỉ còn ${availableSlots} chỗ trống, nhưng file import có ${parsedRows.length} học sinh. Vui lòng giảm số lượng hoặc nâng cấp gói.`);
        return null;
      }
    }

    try {
      const response = await classesService.importAccounts(formData, onProgress);

      // Refetch data after successful import
      await fetchClasses();

      // Calculate fallback results based on parsed rows if backend doesn't return counts
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
    gradeGroups,
    classStudents,
    allStudents,
    stats,
    selectedClass,
    isLoading,

    // Setters
    setSelectedClass,

    // class Actions
    fetchClasses,

    // Student Actions
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,

    // Bulk Import
    bulkImport,
  };
}