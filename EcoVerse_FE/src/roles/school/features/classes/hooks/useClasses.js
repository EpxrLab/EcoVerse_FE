import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Mock data
const mockAcademicYears = [
  { id: 1, name: 'Năm học 2024-2025', start_date: '2024-09-01', end_date: '2025-05-31', is_current: true, school_id: 1 },
  { id: 2, name: 'Năm học 2023-2024', start_date: '2023-09-01', end_date: '2024-05-31', is_current: false, school_id: 1 },
];

const mockClasses = [
  { id: 1, name: '6A', grade: 6, teacher_name: 'Nguyễn Văn A', description: '', academic_year_id: 1, school_id: 1 },
  { id: 2, name: '6B', grade: 6, teacher_name: 'Trần Thị B', description: '', academic_year_id: 1, school_id: 1 },
  { id: 3, name: '7A', grade: 7, teacher_name: 'Lê Văn C', description: '', academic_year_id: 1, school_id: 1 },
  { id: 4, name: '8A', grade: 8, teacher_name: 'Phạm Thị D', description: '', academic_year_id: 2, school_id: 1 },
];

const mockStudents = [
  { id: 1, class_id: 1, student_name: 'Nguyễn An', student_code: 'HS001', student_username: 'hs_HS001', student_password: 'An@2024', date_of_birth: '2012-03-15', gender: 'male', parent_name: 'Nguyễn Văn X', parent_phone: '0901234567', parent_email: 'nguyenx@gmail.com', parent_username: 'ph_0901234567', parent_password: 'Ph@2024X', address: '', notes: '', status: 'active', accuracy: 85, items_sorted: 120, coins: 450, streak: 7, level: 3 },
  { id: 2, class_id: 1, student_name: 'Trần Bình', student_code: 'HS002', student_username: 'hs_HS002', student_password: 'Binh@2024', date_of_birth: '2012-07-20', gender: 'male', parent_name: 'Trần Thị Y', parent_phone: '0912345678', parent_email: 'tranthy@gmail.com', parent_username: 'ph_0912345678', parent_password: 'Ph@2024Y', address: '', notes: '', status: 'active', accuracy: 72, items_sorted: 95, coins: 210, streak: 3, level: 2 },
  { id: 3, class_id: 2, student_name: 'Lê Cẩm', student_code: 'HS003', student_username: 'hs_HS003', student_password: 'Cam@2024', date_of_birth: '2012-01-10', gender: 'female', parent_name: 'Lê Văn Z', parent_phone: '0923456789', parent_email: 'levanz@gmail.com', parent_username: 'ph_0923456789', parent_password: 'Ph@2024Z', address: '', notes: '', status: 'active', accuracy: 91, items_sorted: 150, coins: 780, streak: 14, level: 5 },
];

let _academicYears = [...mockAcademicYears];
let _classes = [...mockClasses];
let _students = [...mockStudents];
let _nextYearId = 3;
let _nextClassId = 5;
let _nextStudentId = 4;

// Utility: generate a random password
function generatePassword(name, suffix = '') {
  const base = name?.split(' ').pop()?.replace(/\s+/g, '') || 'user';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}@${rand}${suffix}`;
}

// Utility: generate username from code/phone
function generateStudentUsername(code) {
  return `hs_${code}`;
}

function generateParentUsername(phone) {
  return `ph_${phone?.replace(/\D/g, '').slice(-9) || Math.random().toString(36).slice(2, 10)}`;
}

export function useClasses() {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [classes, setClasses] = useState([]);
  const [gradeGroups, setGradeGroups] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // All students in the selected year
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddYearDialogOpen, setIsAddYearDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const schoolId = 1;

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    const data = _academicYears.filter(y => y.school_id === schoolId)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    setAcademicYears(data);

    const currentYear = data.find(y => y.is_current) || data[0];
    if (currentYear && !selectedYear) {
      setSelectedYear(currentYear);
    }
  }, [selectedYear]);

  // Fetch classes for selected year
  const fetchClasses = useCallback(async () => {
    if (!selectedYear) {
      setClasses([]);
      setGradeGroups([]);
      return;
    }

    setIsLoading(true);

    const data = _classes
      .filter(c => c.academic_year_id === selectedYear.id)
      .sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));

    const classesWithStats = data.map((classItem) => {
      const students = _students.filter(s => s.class_id === classItem.id);
      const avgAccuracy = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.accuracy || 0), 0) / students.length)
        : 0;
      const totalItems = students.reduce((sum, s) => sum + (s.items_sorted || 0), 0);
      const topStudent = students.length > 0
        ? [...students].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]?.student_name
        : null;

      return {
        ...classItem,
        students_count: students.length,
        avg_accuracy: avgAccuracy,
        total_items: totalItems,
        top_student: topStudent,
      };
    });

    setClasses(classesWithStats);

    // Build allStudents for this year (with className injected)
    const yearClassIds = data.map(c => c.id);
    const yearStudents = _students
      .filter(s => yearClassIds.includes(s.class_id))
      .map(s => ({
        ...s,
        className: data.find(c => c.id === s.class_id)?.name || '',
        grade: data.find(c => c.id === s.class_id)?.grade || '',
      }))
      .sort((a, b) => (a.grade - b.grade) || a.student_name.localeCompare(b.student_name));
    setAllStudents(yearStudents);

    const groupedByGrade = classesWithStats.reduce((acc, classItem) => {
      const grade = classItem.grade;
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
    setIsLoading(false);
  }, [selectedYear]);

  // Fetch students for selected class
  const fetchClassStudents = useCallback(async (classId) => {
    const data = _students
      .filter(s => s.class_id === classId)
      .sort((a, b) => a.student_name.localeCompare(b.student_name));
    setClassStudents(data);
  }, []);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

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
    const newYear = {
      id: _nextYearId++,
      school_id: schoolId,
      name: formData.name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_current: formData.is_current || false,
    };
    _academicYears = [..._academicYears, newYear];
    toast.success('Tạo niên khóa thành công');
    await fetchAcademicYears();
    setSelectedYear(newYear);
    return newYear;
  };

  // Copy classes from previous year
  const copyClassesFromYear = async (sourceYearId, targetYearId) => {
    const sourceClasses = _classes.filter(c => c.academic_year_id === sourceYearId);
    if (!sourceClasses.length) {
      toast.error('Không thể sao chép lớp học');
      return;
    }

    const newClasses = sourceClasses.map(c => ({
      id: _nextClassId++,
      school_id: schoolId,
      academic_year_id: targetYearId,
      name: c.name,
      grade: c.grade,
      teacher_name: c.teacher_name,
      description: c.description,
    }));

    _classes = [..._classes, ...newClasses];
    toast.success(`Đã sao chép ${newClasses.length} lớp từ niên khóa trước`);
    await fetchClasses();
  };

  // Create class
  const createClass = async (formData) => {
    if (!selectedYear) return;

    const newClass = {
      id: _nextClassId++,
      school_id: schoolId,
      academic_year_id: selectedYear.id,
      name: formData.name,
      grade: formData.grade,
      teacher_name: formData.teacher_name,
      description: formData.description,
    };
    _classes = [..._classes, newClass];
    toast.success('Tạo lớp học thành công');
    await fetchClasses();
    setIsAddDialogOpen(false);
  };

  // Update class
  const updateClass = async (classId, formData) => {
    _classes = _classes.map(c =>
      c.id === classId
        ? { ...c, name: formData.name, grade: formData.grade, teacher_name: formData.teacher_name, description: formData.description }
        : c
    );
    toast.success('Cập nhật lớp học thành công');
    await fetchClasses();
  };

  // Delete class
  const deleteClass = async (classId) => {
    _classes = _classes.filter(c => c.id !== classId);
    toast.success('Xóa lớp học thành công');
    if (selectedClass?.id === classId) {
      setSelectedClass(null);
    }
    await fetchClasses();
  };

  // Delete academic year
  const deleteAcademicYear = async (yearId) => {
    _academicYears = _academicYears.filter(y => y.id !== yearId);
    toast.success('Xóa niên khóa thành công');
    setSelectedYear(null);
    await fetchAcademicYears();
  };

  // Set current academic year
  const setCurrentAcademicYear = async (yearId) => {
    _academicYears = _academicYears.map(y => ({ ...y, is_current: y.id === yearId }));
    toast.success('Đã đặt làm niên khóa hiện tại');
    await fetchAcademicYears();
  };

  // Student CRUD operations
  const createStudent = async (classId, formData) => {
    const code = formData.student_code || `HS${String(_nextStudentId).padStart(3, '0')}`;
    const newStudent = {
      id: _nextStudentId++,
      class_id: classId,
      student_name: formData.student_name,
      student_code: code,
      student_username: formData.student_username || generateStudentUsername(code),
      student_password: formData.student_password || generatePassword(formData.student_name),
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || 'other',
      parent_name: formData.parent_name || null,
      parent_phone: formData.parent_phone || null,
      parent_email: formData.parent_email || null,
      parent_username: formData.parent_username || (formData.parent_phone ? generateParentUsername(formData.parent_phone) : null),
      parent_password: formData.parent_password || (formData.parent_name ? generatePassword(formData.parent_name, 'PH') : null),
      address: formData.address || null,
      notes: formData.notes || null,
      status: formData.status || 'active',
      accuracy: 0,
      items_sorted: 0,
      coins: 0,
      streak: 0,
      level: 1,
    };
    _students = [..._students, newStudent];
    toast.success('Thêm học sinh thành công');
    await fetchClassStudents(classId);
    await fetchClasses();
    return true;
  };

  const updateStudent = async (studentId, formData) => {
    if (!selectedClass) return false;

    _students = _students.map(s =>
      s.id === studentId
        ? {
            ...s,
            student_name: formData.student_name,
            student_code: formData.student_code || null,
            student_username: formData.student_username || s.student_username,
            student_password: formData.student_password || s.student_password,
            date_of_birth: formData.date_of_birth || null,
            gender: formData.gender || 'other',
            parent_name: formData.parent_name || null,
            parent_phone: formData.parent_phone || null,
            parent_email: formData.parent_email || null,
            parent_username: formData.parent_username || s.parent_username,
            parent_password: formData.parent_password || s.parent_password,
            address: formData.address || null,
            notes: formData.notes || null,
            status: formData.status,
          }
        : s
    );
    toast.success('Cập nhật học sinh thành công');
    await fetchClassStudents(selectedClass.id);
    return true;
  };

  const deleteStudent = async (studentId) => {
    if (!selectedClass) return false;

    _students = _students.filter(s => s.id !== studentId);
    toast.success('Xóa học sinh thành công');
    await fetchClassStudents(selectedClass.id);
    await fetchClasses();
    return true;
  };

  const importStudents = async (classId, students) => {
    if (students.length === 0) return false;

    const newStudents = students.map(s => {
      const code = s.student_code || `HS${String(_nextStudentId).padStart(3, '0')}`;
      _nextStudentId++;
      return {
        id: _nextStudentId - 1,
        class_id: classId,
        student_name: s.student_name,
        student_code: code,
        student_username: generateStudentUsername(code),
        student_password: generatePassword(s.student_name),
        date_of_birth: s.date_of_birth || null,
        gender: s.gender || 'other',
        parent_name: s.parent_name || null,
        parent_phone: s.parent_phone || null,
        parent_email: s.parent_email || null,
        parent_username: s.parent_phone ? generateParentUsername(s.parent_phone) : null,
        parent_password: s.parent_name ? generatePassword(s.parent_name, 'PH') : null,
        address: s.address || null,
        status: 'active',
        accuracy: 0,
        items_sorted: 0,
        coins: 0,
        streak: 0,
        level: 1,
      };
    });
    _students = [..._students, ...newStudents];
    toast.success(`Đã import ${students.length} học sinh thành công`);
    await fetchClassStudents(classId);
    await fetchClasses();
    return true;
  };

  // ─── Bulk Import ─────────────────────────────────────────────────────────────
  // parsedRows: Array<{ academic_year, grade, class_name, student_name, date_of_birth,
  //                      gender, parent_name, parent_phone, parent_email, address }>
  const bulkImport = async (parsedRows, onProgress) => {
    if (!parsedRows || parsedRows.length === 0) return null;

    const results = {
      createdYears: [],
      createdClasses: [],
      createdStudents: 0,
      targetYear: null,
    };

    // Step 1: Group by academic year
    const yearMap = {};
    parsedRows.forEach(row => {
      const yName = row.academic_year?.trim() || 'Năm học mới';
      if (!yearMap[yName]) yearMap[yName] = [];
      yearMap[yName].push(row);
    });

    onProgress?.({ step: 'years', total: Object.keys(yearMap).length, done: 0 });

    let lastCreatedYear = null;

    for (const [yearName, rows] of Object.entries(yearMap)) {
      // Find existing or create
      let year = _academicYears.find(y => y.name === yearName || y.name === `Năm học ${yearName}`);
      if (!year) {
        const fullName = yearName.includes('Năm học') ? yearName : `Năm học ${yearName}`;
        const yearParts = yearName.replace('Năm học ', '').split('-');
        const startYear = parseInt(yearParts[0]) || new Date().getFullYear();
        year = {
          id: _nextYearId++,
          school_id: schoolId,
          name: fullName,
          start_date: `${startYear}-09-01`,
          end_date: `${startYear + 1}-05-31`,
          is_current: results.createdYears.length === 0,
        };
        _academicYears = [..._academicYears, year];
        results.createdYears.push(year);
      }
      lastCreatedYear = year;

      // Step 2: Group by class within this year
      const classMap = {};
      rows.forEach(row => {
        const grade = parseInt(row.grade) || 6;
        const className = row.class_name?.trim() || `${grade}A`;
        const key = `${grade}_${className}`;
        if (!classMap[key]) classMap[key] = { grade, className, students: [] };
        classMap[key].students.push(row);
      });

      onProgress?.({ step: 'classes', total: Object.keys(classMap).length, done: 0 });

      for (const [, classInfo] of Object.entries(classMap)) {
        // Find existing or create class
        let cls = _classes.find(c =>
          c.academic_year_id === year.id &&
          c.grade === classInfo.grade &&
          c.name === classInfo.className
        );
        if (!cls) {
          cls = {
            id: _nextClassId++,
            school_id: schoolId,
            academic_year_id: year.id,
            name: classInfo.className,
            grade: classInfo.grade,
            teacher_name: '',
            description: '',
          };
          _classes = [..._classes, cls];
          results.createdClasses.push(cls);
        }

        // Step 3: Create students
        const newStudents = classInfo.students.map(row => {
          const code = `HS${String(_nextStudentId).padStart(3, '0')}`;
          _nextStudentId++;
          return {
            id: _nextStudentId - 1,
            class_id: cls.id,
            student_name: row.student_name?.trim() || 'Học sinh',
            student_code: code,
            student_username: generateStudentUsername(code),
            student_password: generatePassword(row.student_name || 'user'),
            date_of_birth: row.date_of_birth || null,
            gender: row.gender === 'Nam' ? 'male' : row.gender === 'Nữ' ? 'female' : (row.gender || 'other'),
            parent_name: row.parent_name?.trim() || null,
            parent_phone: row.parent_phone?.trim() || null,
            parent_email: row.parent_email?.trim() || null,
            parent_username: row.parent_phone ? generateParentUsername(row.parent_phone) : null,
            parent_password: row.parent_name ? generatePassword(row.parent_name, 'PH') : null,
            address: row.address?.trim() || null,
            notes: null,
            status: 'active',
            accuracy: 0,
            items_sorted: 0,
            coins: 0,
            streak: 0,
            level: 1,
          };
        });

        _students = [..._students, ...newStudents];
        results.createdStudents += newStudents.length;

        onProgress?.({ step: 'students', done: results.createdStudents });
      }
    }

    results.targetYear = lastCreatedYear;

    // Refresh data and navigate to the newly created year
    await fetchAcademicYears();
    if (lastCreatedYear) {
      setSelectedYear(lastCreatedYear);
    }

    // Trigger fetchClasses to update allStudents
    await fetchClasses();

    return results;
  };

  return {
    // Data
    academicYears,
    selectedYear,
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
    isAddYearDialogOpen,
    setIsAddYearDialogOpen,
    isAddStudentDialogOpen,
    setIsAddStudentDialogOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,

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

    // Bulk Import
    bulkImport,
  };
}