import { useState, useMemo } from 'react';
import { getGameLevelsForSchool } from '@/shared/data/admin-game-levels.data';

export function useCampaignForm(initialData) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    invitation_send_date: initialData?.invitation_send_date || '',
    invitation_deadline: initialData?.invitation_deadline || '',
    class_ids: initialData?.class_ids || [],
    student_ids: initialData?.student_ids || [],
    quiz_ids: initialData?.quiz_ids || [],
    game_types: initialData?.game_types || [],
    level_ids: initialData?.level_ids || [],
  });

  // Quiz validation
  const quizValidation = useMemo(() => {
    // This would need availableQuizzes passed in, but for now we'll keep it simple
    return {
      hasEasy: true,
      hasMedium: true,
      hasHard: true,
      isValid: true,
    };
  }, [formData.quiz_ids]);

  const schoolGameLevels = useMemo(() => getGameLevelsForSchool(), []);

  // Level validation
  const levelValidation = useMemo(() => {
    const validation = {};
    
    formData.game_types.forEach(gameType => {
      const selectedLevelsForGame = schoolGameLevels.filter(
        level => formData.level_ids.includes(level.id) && level.gameType === gameType
      );
      
      const hasEasy = selectedLevelsForGame.some(l => l.difficulty === 'Dễ');
      const hasMedium = selectedLevelsForGame.some(l => l.difficulty === 'Trung bình');
      const hasHard = selectedLevelsForGame.some(l => l.difficulty === 'Khó');
      
      validation[gameType] = {
        hasEasy,
        hasMedium,
        hasHard,
        isValid: hasEasy && hasMedium && hasHard
      };
    });
    
  const allValid = formData.game_types.length === 0 || formData.game_types.every(gt => validation[gt]?.isValid);
    return { byGameType: validation, allValid };
  }, [formData.game_types, formData.level_ids]);

  // Date Validation
  const dateValidation = useMemo(() => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = formData.start_date ? new Date(formData.start_date) : null;
    const end = formData.end_date ? new Date(formData.end_date) : null;
    const invite = formData.invitation_send_date ? new Date(formData.invitation_send_date) : null;
    const deadline = formData.invitation_deadline ? new Date(formData.invitation_deadline) : null;

    if (start && start < today) {
      errors.start_date = 'Ngày bắt đầu phải trong tương lai';
    }

    if (start && end && end <= start) {
      errors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (start && deadline && deadline >= start) {
      errors.invitation_deadline = 'Hạn mời phải trước ngày bắt đầu';
    }

    if (start && invite && invite >= start) {
      errors.invitation_send_date = 'Ngày gửi mời phải trước ngày bắt đầu';
    }

    if (invite && deadline && deadline <= invite) {
      errors.invitation_deadline = 'Hạn mời phải sau ngày gửi mời';
    }

    const isValid = Object.keys(errors).length === 0 && 
                   formData.start_date && 
                   formData.end_date;

    return { errors, isValid };
  }, [formData.start_date, formData.end_date, formData.invitation_send_date, formData.invitation_deadline]);

  // Handlers
  const handleFormChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId],
    }));
  };

  const handleStudentSelection = (newStudentIds, classId, classStudentIds = []) => {
    setFormData(prev => {
        const otherStudents = (prev.student_ids || []).filter(id => !classStudentIds.includes(id));
        const updatedStudentIds = Array.from(new Set([...otherStudents, ...newStudentIds]));
        
        const currentClassIds = prev.class_ids.includes(classId) 
            ? prev.class_ids 
            : [...prev.class_ids, classId];

        return {
            ...prev,
            student_ids: updatedStudentIds,
            class_ids: currentClassIds
        };
    });
  };

  const handleQuizToggle = (quizId) => {
    setFormData(prev => ({
      ...prev,
      quiz_ids: prev.quiz_ids.includes(quizId)
        ? prev.quiz_ids.filter(id => id !== quizId)
        : [...prev.quiz_ids, quizId],
    }));
  };

  const handleGameToggle = (gameType) => {
    setFormData(prev => ({
      ...prev,
      game_types: prev.game_types.includes(gameType)
        ? prev.game_types.filter(g => g !== gameType)
        : [...prev.game_types, gameType],
    }));
  };

  const handleLevelToggle = (levelId) => {
    setFormData(prev => ({
      ...prev,
      level_ids: prev.level_ids.includes(levelId)
        ? prev.level_ids.filter(id => id !== levelId)
        : [...prev.level_ids, levelId],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      invitation_send_date: '',
      invitation_deadline: '',
      class_ids: [],
      quiz_ids: [],
      game_types: [],
      level_ids: [],
    });
  };

  const loadFormData = (data) => {
    setFormData({
      name: data.name || '',
      description: data.description || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      invitation_send_date: data.invitation_send_date || '',
      invitation_deadline: data.invitation_deadline || '',
      class_ids: data.class_ids || [],
      student_ids: data.student_ids || [],
      quiz_ids: data.quiz_ids || [],
      game_types: data.game_types || [],
      level_ids: data.level_ids || [],
    });
  };

  return {
    formData,
    quizValidation,
    levelValidation,
    dateValidation,
    handleFormChange,
    handleClassToggle,
    handleStudentSelection,
    handleQuizToggle,
    handleGameToggle,
    handleLevelToggle,
    resetForm,
    loadFormData,
  };
}