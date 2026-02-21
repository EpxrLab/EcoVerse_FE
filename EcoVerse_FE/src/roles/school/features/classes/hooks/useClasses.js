import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useClasses() {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [classes, setClasses] = useState([]);
  const [gradeGroups, setGradeGroups] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);

  // Fetch school ID
  useEffect(() => {
    const fetchSchoolId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: registration } = await supabase
        .from('school_registrations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (registration) {
        setSchoolId(registration.id);
      }
    };

    fetchSchoolId();
  }, []);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    if (!schoolId) return;

    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching academic years:', error);
      toast.error('Không thể tải danh sách niên khóa');
      return;
    }

    setAcademicYears(data || []);

    // Select current year or first year
    const currentYear = data?.find(y => y.is_current) || data?.[0];
    if (currentYear && !selectedYear) {
      setSelectedYear(currentYear);
    }
  }, [schoolId, selectedYear]);

  // Fetch classes for selected year
  const fetchClasses = useCallback(async () => {
    if (!selectedYear) {
      setClasses([]);
      setGradeGroups([]);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('academic_year_id', selectedYear.id)
      .order('grade', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      toast.error('Không thể tải danh sách lớp học');
      setIsLoading(false);
      return;
    }

    // Fetch student counts for each class
    const classesWithStats = await Promise.all(
      (data || []).map(async (classItem) => {
        const { data: students } = await supabase
          .from('class_students')
          .select('*')
          .eq('class_id', classItem.id);

        const studentList = students || [];
        const avgAccuracy = studentList.length > 0 
          ? Math.round(studentList.reduce((sum, s) => sum + s.accuracy, 0) / studentList.length)
          : 0;
        const totalItems = studentList.reduce((sum, s) => sum + s.items_sorted, 0);
        const topStudent = studentList.length > 0 
          ? studentList.sort((a, b) => b.accuracy - a.accuracy)[0]?.student_name
          : null;

        return {
          ...classItem,
          students_count: studentList.length,
          avg_accuracy: avgAccuracy,
          total_items: totalItems,
          top_student: topStudent,
        };
      })
    );

    setClasses(classesWithStats);

    // Group classes by grade
    const groupedByGrade = classesWithStats.reduce((acc, classItem) => {
      const grade = classItem.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
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
    setIsLoading(false);
  }, [selectedYear]);

  // Fetch students for selected class
  const fetchClassStudents = useCallback(async (classId) => {
    const { data, error } = await supabase
      .from('class_students')
      .select('*')
      .eq('class_id', classId)
      .order('student_name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      return;
    }

    setClassStudents(data || []);
  }, []);

  useEffect(() => {
    if (schoolId) {
      fetchAcademicYears();
    }
  }, [schoolId, fetchAcademicYears]);

  useEffect(() => {
    if (selectedYear) {
      fetchClasses();
    }
  }, [selectedYear, fetchClasses]);

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

  // Create academic year
  const createAcademicYear = async (formData) => {
    if (!schoolId) return;

    const { data, error } = await supabase
      .from('academic_years')
      .insert({
        school_id: schoolId,
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating academic year:', error);
      toast.error('Không thể tạo niên khóa mới');
      return;
    }

    toast.success('Tạo niên khóa thành công');
    await fetchAcademicYears();
    if (data) {
      setSelectedYear(data);
    }
  };

  // Copy classes from previous year
  const copyClassesFromYear = async (sourceYearId, targetYearId) => {
    if (!schoolId) return;

    const { data: sourceClasses, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .eq('academic_year_id', sourceYearId);

    if (fetchError || !sourceClasses) {
      toast.error('Không thể sao chép lớp học');
      return;
    }

    const newClasses = sourceClasses.map(c => ({
      school_id: schoolId,
      academic_year_id: targetYearId,
      name: c.name,
      grade: c.grade,
      teacher_name: c.teacher_name,
      description: c.description,
    }));

    const { error: insertError } = await supabase
      .from('classes')
      .insert(newClasses);

    if (insertError) {
      toast.error('Không thể sao chép lớp học');
      return;
    }

    toast.success(`Đã sao chép ${newClasses.length} lớp từ niên khóa trước`);
    await fetchClasses();
  };

  // Create class
  const createClass = async (formData) => {
    if (!schoolId || !selectedYear) return;

    const { error } = await supabase
      .from('classes')
      .insert({
        school_id: schoolId,
        academic_year_id: selectedYear.id,
        name: formData.name,
        grade: formData.grade,
        teacher_name: formData.teacher_name,
        description: formData.description,
      });

    if (error) {
      console.error('Error creating class:', error);
      toast.error('Không thể tạo lớp học');
      return;
    }

    toast.success('Tạo lớp học thành công');
    await fetchClasses();
    setIsAddDialogOpen(false);
  };

  // Update class
  const updateClass = async (classId, formData) => {
    const { error } = await supabase
      .from('classes')
      .update({
        name: formData.name,
        grade: formData.grade,
        teacher_name: formData.teacher_name,
        description: formData.description,
      })
      .eq('id', classId);

    if (error) {
      console.error('Error updating class:', error);
      toast.error('Không thể cập nhật lớp học');
      return;
    }

    toast.success('Cập nhật lớp học thành công');
    await fetchClasses();
  };

  // Delete class
  const deleteClass = async (classId) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) {
      console.error('Error deleting class:', error);
      toast.error('Không thể xóa lớp học');
      return;
    }

    toast.success('Xóa lớp học thành công');
    if (selectedClass?.id === classId) {
      setSelectedClass(null);
    }
    await fetchClasses();
  };

  // Delete academic year
  const deleteAcademicYear = async (yearId) => {
    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', yearId);

    if (error) {
      console.error('Error deleting academic year:', error);
      toast.error('Không thể xóa niên khóa');
      return;
    }

    toast.success('Xóa niên khóa thành công');
    setSelectedYear(null);
    await fetchAcademicYears();
  };

  // Set current academic year
  const setCurrentAcademicYear = async (yearId) => {
    const { error } = await supabase
      .from('academic_years')
      .update({ is_current: true })
      .eq('id', yearId);

    if (error) {
      console.error('Error setting current year:', error);
      toast.error('Không thể đặt niên khóa hiện tại');
      return;
    }

    toast.success('Đã đặt làm niên khóa hiện tại');
    await fetchAcademicYears();
  };

  // Student CRUD operations
  const createStudent = async (classId, formData) => {
    const { error } = await supabase
      .from('class_students')
      .insert({
        class_id: classId,
        student_name: formData.student_name,
        student_code: formData.student_code || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || 'other',
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        parent_email: formData.parent_email || null,
        address: formData.address || null,
        notes: formData.notes || null,
        status: formData.status || 'active',
      });

    if (error) {
      console.error('Error creating student:', error);
      toast.error('Không thể thêm học sinh');
      return false;
    }

    toast.success('Thêm học sinh thành công');
    await fetchClassStudents(classId);
    await fetchClasses();
    return true;
  };

  const updateStudent = async (studentId, formData) => {
    if (!selectedClass) return false;

    const { error } = await supabase
      .from('class_students')
      .update({
        student_name: formData.student_name,
        student_code: formData.student_code || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || 'other',
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        parent_email: formData.parent_email || null,
        address: formData.address || null,
        notes: formData.notes || null,
        status: formData.status,
      })
      .eq('id', studentId);

    if (error) {
      console.error('Error updating student:', error);
      toast.error('Không thể cập nhật học sinh');
      return false;
    }

    toast.success('Cập nhật học sinh thành công');
    await fetchClassStudents(selectedClass.id);
    return true;
  };

  const deleteStudent = async (studentId) => {
    if (!selectedClass) return false;

    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('id', studentId);

    if (error) {
      console.error('Error deleting student:', error);
      toast.error('Không thể xóa học sinh');
      return false;
    }

    toast.success('Xóa học sinh thành công');
    await fetchClassStudents(selectedClass.id);
    await fetchClasses();
    return true;
  };

  const importStudents = async (classId, students) => {
    if (students.length === 0) return false;

    const studentsToInsert = students.map(s => ({
      class_id: classId,
      student_name: s.student_name,
      status: 'active',
    }));

    const { error } = await supabase
      .from('class_students')
      .insert(studentsToInsert);

    if (error) {
      console.error('Error importing students:', error);
      toast.error('Không thể import học sinh');
      return false;
    }

    toast.success(`Đã import ${students.length} học sinh thành công`);
    await fetchClassStudents(classId);
    await fetchClasses();
    return true;
  };

  return {
    // Data
    academicYears,
    selectedYear,
    classes,
    gradeGroups,
    classStudents,
    stats,
    selectedClass,
    selectedGrade,
    isLoading,
    schoolId,
    
    // Dialog states
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAddYearDialogOpen,
    setIsAddYearDialogOpen,
    isAddStudentDialogOpen,
    setIsAddStudentDialogOpen,
    
    // Setters
    setSelectedYear,
    setSelectedClass,
    setSelectedGrade,
    
    // Academic Year Actions
    createAcademicYear,
    copyClassesFromYear,
    deleteAcademicYear,
    setCurrentAcademicYear,
    
    // Class Actions
    createClass,
    updateClass,
    deleteClass,
    fetchClasses,
    
    // Student Actions
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    fetchClassStudents,
  };
}