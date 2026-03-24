import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { School, Users, MapPin, Package, Zap, Image as ImageIcon, Upload, X, Calendar, Sparkles, Settings2, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const CATEGORY_LABELS = { plastic: "Nhựa", paper: "Giấy", organic: "Hữu cơ", others: "Khác" };

export function CampaignForm({
  isOpen,
  onClose,
  formData,
  onFormChange,
  availableSchools,
  availableQuizzes,
  setAvailableQuizzes,
  availableGameLevels,
  availableWasteItems = [],
  onSubmit,
}) {
  const [showAIQuiz, setShowAIQuiz] = React.useState(null);
  const [aiTopic, setAiTopic] = React.useState('');
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);
  const [expandedConfig, setExpandedConfig] = React.useState(null);

  const toggleSchool = (schoolId) => {
    const exists = formData.school_participations.find(sp => sp.school_id === schoolId);
    if (exists) {
      onFormChange({
        school_participations: formData.school_participations.filter(sp => sp.school_id !== schoolId)
      });
    } else {
      onFormChange({
        school_participations: [...formData.school_participations, { school_id: schoolId }]
      });
    }
  };

  const updateStudentLimit = (schoolId, limit) => {
    onFormChange({
      school_participations: formData.school_participations.map(sp =>
        sp.school_id === schoolId ? { ...sp, student_limit: limit } : sp
      )
    });
  };

  const selectedSchoolIds = formData.school_participations.map(sp => sp.school_id);
  const selectedSchools = availableSchools.filter(s => selectedSchoolIds.includes(s.id));

  const addQualifyingRound = () => {
    const newRoundNumber = formData.qualifying_rounds.length + 1;
    const lastRound = formData.qualifying_rounds[formData.qualifying_rounds.length - 1];
    const startDate = lastRound && lastRound.end_date ? lastRound.end_date : '';
    
    const newRound = {
      round_number: newRoundNumber,
      round_name: `Vòng loại ${newRoundNumber}`,
      start_date: startDate,
      end_date: formData.end_date,
      quiz_ids: [],
      selected_game_type: '',
      game_level_ids: [],
      advancement_limit: 10,
    };
    onFormChange({ qualifying_rounds: [...formData.qualifying_rounds, newRound] });
  };

  const toggleQualifyingRoundQuiz = (roundIndex, quizId) => {
    const round = formData.qualifying_rounds[roundIndex];
    const newQuizIds = round.quiz_ids.includes(quizId)
      ? round.quiz_ids.filter(id => id !== quizId)
      : [...round.quiz_ids, quizId];
    updateQualifyingRound(roundIndex, { quiz_ids: newQuizIds });
  };

  const toggleQualifyingRoundGameLevel = (roundIndex, levelId) => {
    const round = formData.qualifying_rounds[roundIndex];
    if (!round.level_configs) round.level_configs = {};
    const isSelected = round.game_level_ids.includes(levelId);
    
    let newLevelIds;
    let newConfigs = { ...round.level_configs };
    
    if (isSelected) {
      newLevelIds = round.game_level_ids.filter(id => id !== levelId);
      delete newConfigs[levelId];
      if (expandedConfig === `${roundIndex}-${levelId}`) setExpandedConfig(null);
    } else {
      newLevelIds = [...round.game_level_ids, levelId];
      const level = availableGameLevels.find(l => String(l.id) === String(levelId));
      const binConfigs = {};
      if (level && level.binTypes) {
        level.binTypes.forEach(b => {
           binConfigs[b] = []; 
        });
      }
      newConfigs[levelId] = binConfigs;
    }
    updateQualifyingRound(roundIndex, { game_level_ids: newLevelIds, level_configs: newConfigs });
  };

  const toggleWasteItem = (roundIndex, levelId, binType, itemId) => {
    const round = formData.qualifying_rounds[roundIndex];
    if (!round.level_configs) return;
    const newConfigs = { ...round.level_configs };
    if (!newConfigs[levelId]) return;
    const currentItems = newConfigs[levelId][binType] || [];
    if (currentItems.includes(itemId)) {
      newConfigs[levelId][binType] = currentItems.filter(id => id !== itemId);
    } else {
      newConfigs[levelId][binType] = [...currentItems, itemId];
    }
    updateQualifyingRound(roundIndex, { level_configs: newConfigs });
  };

  const handleGenerateAIQuiz = (roundIndex) => {
    if (!aiTopic.trim()) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      const newQuiz = {
        id: `ai_${Date.now()}`,
        title: `Quiz AI: ${aiTopic}`,
        difficulty: 'medium',
        question_count: 10
      };
      if (typeof setAvailableQuizzes === 'function') {
        setAvailableQuizzes(prev => [...prev, newQuiz]);
      }
      const round = formData.qualifying_rounds[roundIndex];
      updateQualifyingRound(roundIndex, { quiz_ids: [...round.quiz_ids, newQuiz.id] });
      setIsGeneratingAI(false);
      setAiTopic('');
      setShowAIQuiz(null);
    }, 1500);
  };

  const removeQualifyingRound = (index) => {
    if (formData.qualifying_rounds.length <= 1) {
      return;
    }
    const updatedRounds = formData.qualifying_rounds.filter((_, i) => i !== index);
    const renumberedRounds = updatedRounds.map((round, i) => {
      const isLast = i === updatedRounds.length - 1;
      return {
        ...round,
        round_number: i + 1,
        round_name: `Vòng loại ${i + 1}`,
        end_date: isLast ? formData.end_date : round.end_date,
      };
    });
    onFormChange({ qualifying_rounds: renumberedRounds });
  };

  const updateQualifyingRound = (index, updates) => {
    const updatedRounds = formData.qualifying_rounds.map((round, i) =>
      i === index ? { ...round, ...updates } : round
    );
    onFormChange({ qualifying_rounds: updatedRounds });
  };

  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'schools', label: 'Trường tham gia' },
    { id: 'qualifying', label: 'Vòng loại' },
    { id: 'rewards', label: 'Phần thưởng' },
  ];

  const [rewardImagePreviews, setRewardImagePreviews] = React.useState([]);

  const handleRewardImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentImages = formData.reward_images || [];
      onFormChange({ reward_images: [...currentImages, ...files] });
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRewardImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeRewardImage = (index) => {
    const currentImages = formData.reward_images || [];
    onFormChange({ reward_images: currentImages.filter((_, i) => i !== index) });
    setRewardImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.name && 
          formData.start_date && 
          formData.end_date && 
          formData.invitation_send_date &&
          formData.end_date >= formData.start_date
        );
      case 1:
        return formData.school_participations.length > 0;
      case 2:
        const hasBasicFields = formData.qualifying_rounds.length > 0 && 
               formData.qualifying_rounds.every(round => 
                 round.round_name && round.start_date && round.end_date && round.advancement_limit > 0
               );
        
        if (!hasBasicFields) return false;
        
        for (let i = 0; i < formData.qualifying_rounds.length; i++) {
          const round = formData.qualifying_rounds[i];
          
          if (round.end_date <= round.start_date) return false;
          
          if (i === 0 && formData.start_date) {
            if (round.start_date < formData.start_date) return false;
          }

          if (formData.start_date && formData.end_date) {
            if (round.start_date < formData.start_date || round.end_date > formData.end_date) {
              return false;
            }
          }
          
          if (i < formData.qualifying_rounds.length - 1) {
            const nextRound = formData.qualifying_rounds[i + 1];
            if (nextRound.start_date && nextRound.start_date <= round.end_date) return false;
          }
        }
        
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo chiến dịch mới</DialogTitle>
        </DialogHeader>

        <div className="relative flex justify-between px-12 pb-6">
           <div className="absolute top-4 left-12 right-12 h-0.5 bg-muted -z-10" />
           <div 
              className="absolute top-4 left-12 h-0.5 bg-eco-blue -z-10 transition-all duration-300" 
              style={{ width: `${(currentStep / (steps.length - 1)) * (100 - (100/steps.length)*0.5)}%` }}
           /> 
           
           {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center bg-background px-2">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-200",
                  currentStep >= index 
                    ? "bg-eco-blue text-white" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <span 
                className={cn(
                  "text-xs mt-2 font-medium transition-colors duration-200",
                  currentStep >= index ? "text-eco-blue" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 py-4">
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="name">Tên chiến dịch *</Label>
                <Input
                  id="name"
                  placeholder="VD: Chiến dịch Thu gom rác thải nhựa 2024"
                  value={formData.name}
                  onChange={(e) => onFormChange({ name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về chiến dịch..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => onFormChange({ description: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-eco-blue" />
                    Thời gian tổng thể sự kiện
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Khoảng thời gian toàn bộ chiến dịch (bao gồm các vòng loại và vòng chính thức)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Ngày bắt đầu *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      const updatedRounds = [...formData.qualifying_rounds];
                      if (updatedRounds.length > 0) {
                        updatedRounds[0] = { ...updatedRounds[0], start_date: newStartDate };
                      }
                      onFormChange({ 
                        start_date: newStartDate,
                        qualifying_rounds: updatedRounds
                      });
                    }}
                    min={formData.invitation_send_date}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Ngày kết thúc *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => {
                      const newEndDate = e.target.value;
                      const updatedRounds = [...formData.qualifying_rounds];
                      if (updatedRounds.length > 0) {
                        const lastIdx = updatedRounds.length - 1;
                        updatedRounds[lastIdx] = { ...updatedRounds[lastIdx], end_date: newEndDate };
                      }
                      onFormChange({ 
                        end_date: newEndDate,
                        qualifying_rounds: updatedRounds
                      });
                    }}
                    min={formData.start_date}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="invitation_send_date">Thời gian gửi lời mời *</Label>
                <Input
                  id="invitation_send_date"
                  type="date"
                  value={formData.invitation_send_date}
                  onChange={(e) => onFormChange({ invitation_send_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Lời mời sẽ được gửi tự động đến các trường vào ngày này
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Chọn trường và giới hạn học sinh</Label>
                <Badge variant="outline" className="text-sm">
                  <School className="w-4 h-4 mr-1" />
                  {formData.school_participations.length} trường
                </Badge>
              </div>

              <div className="border-2 rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {availableSchools.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Không tìm thấy trường nào trong khu vực của bạn
                  </p>
                ) : (
                  availableSchools.map((school) => {
                    const participation = formData.school_participations.find(sp => sp.school_id === school.id);
                    const isSelected = !!participation;

                    return (
                      <div
                        key={school.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-colors",
                          isSelected
                            ? "bg-eco-blue/5 border-eco-blue/30"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSchool(school.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="font-semibold text-foreground">{school.school_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{school.district}, {school.city}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  {school.student_count} HS
                                </Badge>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2 pt-2">
                                <Label htmlFor={`limit-${school.id}`} className="text-sm whitespace-nowrap">
                                  Giới hạn HS:
                                </Label>
                                <Input
                                  id={`limit-${school.id}`}
                                  type="number"
                                  placeholder={`Tối đa ${school.student_count}`}
                                  className="w-32"
                                  value={participation.student_limit || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                                    updateStudentLimit(school.id, value);
                                  }}
                                  min={1}
                                  max={school.student_count}
                                />
                                <span className="text-xs text-muted-foreground">
                                  (Để trống = tất cả)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Cấu hình vòng loại</h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo các vòng loại để lọc học sinh xuất sắc. Học sinh sẽ tham gia tuần tự từ vòng 1 đến vòng chính thức.
                  </p>
                  {formData.start_date && formData.end_date && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Vòng loại phải nằm trong khoảng: {new Date(formData.start_date).toLocaleDateString('vi-VN')} - {new Date(formData.end_date).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQualifyingRound}
                  className="gap-2"
                >
                  <Package className="w-4 h-4" />
                  Thêm vòng
                </Button>
              </div>

              <div className="space-y-4">
                {formData.qualifying_rounds.map((round, index) => (
                  <div
                    key={index}
                    className="border-2 rounded-xl p-4 space-y-4 bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          Vòng {round.round_number}
                        </Badge>
                        <Input
                          value={round.round_name}
                          onChange={(e) => updateQualifyingRound(index, { round_name: e.target.value })}
                          className="w-48 h-8"
                          placeholder="Tên vòng loại"
                        />
                      </div>
                      {formData.qualifying_rounds.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQualifyingRound(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`round-${index}-start`}>Ngày bắt đầu *</Label>
                        <Input
                          id={`round-${index}-start`}
                          type="date"
                          value={round.start_date}
                          onChange={(e) => updateQualifyingRound(index, { start_date: e.target.value })}
                          disabled={index === 0}
                          min={
                            index === 0 
                              ? formData.start_date
                              : formData.qualifying_rounds[index - 1]?.end_date
                          }
                          max={formData.end_date}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`round-${index}-end`}>Ngày kết thúc *</Label>
                        <Input
                          id={`round-${index}-end`}
                          type="date"
                          value={round.end_date}
                          onChange={(e) => updateQualifyingRound(index, { end_date: e.target.value })}
                          disabled={index === formData.qualifying_rounds.length - 1}
                          min={round.start_date}
                          max={formData.end_date}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`round-${index}-limit`}>Số học sinh được chọn vào vòng tiếp theo *</Label>
                      <Input
                        id={`round-${index}-limit`}
                        type="number"
                        min="1"
                        value={round.advancement_limit}
                        onChange={(e) => updateQualifyingRound(index, { advancement_limit: parseInt(e.target.value) || 10 })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Top {round.advancement_limit} học sinh có điểm cao nhất sẽ được chọn vào {index === formData.qualifying_rounds.length - 1 ? 'vòng chính thức' : `vòng ${round.round_number + 1}`}
                      </p>
                    </div>

                    <div className="border-t pt-4 space-y-6">
                      <h4 className="font-semibold text-sm">Nội dung vòng loại</h4>
                      
                      {/* 1. Game Selection */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">1. Chọn Loại Game & Cấp độ</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div
                              className={cn(
                                "p-2 rounded border cursor-pointer transition-all text-xs",
                                round.selected_game_type === 'collection-sorting'
                                  ? "bg-eco-blue/5 border-eco-blue/30"
                                  : "border-border hover:bg-muted/50"
                              )}
                              onClick={() => updateQualifyingRound(index, { selected_game_type: 'collection-sorting', game_level_ids: [] })}
                            >
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                <span className="font-medium">Thu thập & Phân loại</span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "p-2 rounded border cursor-pointer transition-all text-xs",
                                round.selected_game_type === 'run-sorting'
                                  ? "bg-eco-green/5 border-eco-green/30"
                                  : "border-border hover:bg-muted/50"
                              )}
                              onClick={() => updateQualifyingRound(index, { selected_game_type: 'run-sorting', game_level_ids: [] })}
                            >
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span className="font-medium">Chạy & Phân loại</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {round.selected_game_type && (
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Danh sách Cấp độ</Label>
                              <Badge variant="outline" className="text-xs">
                                {round.game_level_ids.length} cấp độ
                              </Badge>
                            </div>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                              {availableGameLevels
                                .filter(level => level.gameType === round.selected_game_type)
                                .map((level) => {
                                  const isSelected = round.game_level_ids.includes(level.id);
                                  const configKey = `${index}-${level.id}`;
                                  const isExpanded = expandedConfig === configKey;
                                  return (
                                    <div key={level.id} className={cn("rounded-lg border-2 transition-all overflow-hidden", isSelected ? "border-green-500 shadow-sm" : "border-muted bg-background hover:border-green-200")}>
                                      <div
                                        className={cn("flex items-center justify-between p-3 cursor-pointer", isSelected ? "bg-green-50" : "bg-transparent hover:bg-green-50/30")}
                                        onClick={() => toggleQualifyingRoundGameLevel(index, level.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <p className={cn("font-medium text-sm", isSelected ? "text-green-900" : "text-foreground")}>{level.name}</p>
                                          <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 shrink-0 transition-colors", isSelected ? "bg-green-500 text-white border-green-500" : "text-muted-foreground")}>
                                            {level.difficulty}
                                          </Badge>
                                        </div>
                                        {isSelected && (
                                           <Button 
                                             size="sm" 
                                             variant="ghost" 
                                             className="h-6 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 z-10 gap-1"
                                             onClick={(e) => { e.stopPropagation(); setExpandedConfig(isExpanded ? null : configKey); }}
                                           >
                                             <Settings2 className="w-3 h-3" /> Cấu hình rác
                                             {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3"/>}
                                           </Button>
                                        )}
                                      </div>
                                      
                                      {/* Expanded Config Content */}
                                      {isSelected && isExpanded && round.level_configs && round.level_configs[level.id] && (
                                        <div className="p-3 bg-white border-t border-green-100 space-y-3">
                                          <p className="text-xs text-muted-foreground mb-2">Chọn rác phù hợp cho từng loại thùng trong cấp độ này:</p>
                                          {level.binTypes && level.binTypes.map(binType => {
                                            const availableForBin = availableWasteItems.filter(item => item.category === binType);
                                            const selectedItems = round.level_configs[level.id][binType] || [];
                                            return (
                                              <div key={binType} className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-700">Thùng: {CATEGORY_LABELS[binType] || binType}</Label>
                                                {availableForBin.length > 0 ? (
                                                  <div className="flex flex-wrap gap-1.5">
                                                    {availableForBin.map(wItem => (
                                                      <Badge 
                                                        key={wItem.id}
                                                        variant="outline" 
                                                        className={cn("cursor-pointer px-2 py-0.5 text-xs select-none", selectedItems.includes(wItem.id) ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100")}
                                                        onClick={() => toggleWasteItem(index, level.id, binType, wItem.id)}
                                                      >
                                                        {wItem.image} {wItem.name}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                ) : <div className="text-xs text-gray-400 italic">Không có rác phù hợp</div>}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Quiz Selection Component */}
                      <div className="space-y-3 pt-2 border-t mt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">2. Chọn Quiz</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs mr-2">
                              {round.quiz_ids.length} quiz
                            </Badge>
                            <Button 
                              size="sm" 
                              className="h-7 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800 border-0"
                              onClick={() => setShowAIQuiz(showAIQuiz === index ? null : index)}
                            >
                              <Sparkles className="w-3 h-3 mr-1" /> Tạo Quiz bằng AI
                            </Button>
                          </div>
                        </div>

                        {showAIQuiz === index && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex flex-col gap-2 mb-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-800">Tạo Quiz với AI</span>
                            </div>
                            <Textarea 
                              value={aiTopic}
                              onChange={e => setAiTopic(e.target.value)}
                              placeholder="Nhập chủ đề muốn tạo (VD: Tái chế nhựa dùng một lần...)"
                              className="text-sm min-h-[60px] resize-none"
                            />
                            <div className="flex justify-end mt-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleGenerateAIQuiz(index)}
                                disabled={isGeneratingAI || !aiTopic.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white h-7.5"
                              >
                                {isGeneratingAI ? "Đang tạo..." : "Sinh bộ câu hỏi"}
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-[150px] overflow-y-auto bg-background">
                          {availableQuizzes.map((quiz) => {
                            const isSelected = round.quiz_ids.includes(quiz.id);
                            return (
                              <div
                                key={quiz.id}
                                className={cn(
                                  "flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                  isSelected
                                    ? "bg-orange-50 border-orange-500 shadow-md"
                                    : "border-muted bg-background hover:border-orange-200 hover:bg-orange-50/30"
                                )}
                                onClick={() => toggleQualifyingRoundQuiz(index, quiz.id)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn("font-medium text-sm line-clamp-1", isSelected ? "text-orange-900" : "text-foreground")}>{quiz.title}</p>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[10px] h-5 px-1.5 shrink-0 transition-colors", 
                                      isSelected ? "bg-orange-500 text-white border-orange-500" : "text-muted-foreground"
                                    )}
                                  >
                                    {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'TB' : 'Khó'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.qualifying_rounds.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có vòng loại nào. Nhấn "Thêm vòng" để tạo vòng loại đầu tiên.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <Label className="text-base font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-eco-orange" />
                  Hình ảnh phần thưởng
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tải lên hình ảnh phần thưởng sẽ được gửi cho top 5 học sinh xuất sắc nhất
                </p>

                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20">
                  {rewardImagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {rewardImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border-2"
                            />
                            <button
                              onClick={() => removeRewardImage(index)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <label htmlFor="reward-image-upload" className="cursor-pointer">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-eco-orange text-white rounded-lg hover:bg-eco-orange/90 transition-colors">
                            <Upload className="w-4 h-4" />
                            Thêm ảnh
                          </div>
                          <Input
                            id="reward-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleRewardImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-eco-orange/10 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-eco-orange" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Tải lên hình ảnh phần thưởng</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG tối đa 5MB mỗi ảnh. Có thể chọn nhiều ảnh</p>
                      </div>
                      <div className="flex justify-center">
                        <label htmlFor="reward-image-upload" className="cursor-pointer">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-eco-orange text-white rounded-lg hover:bg-eco-orange/90 transition-colors">
                            <Upload className="w-4 h-4" />
                            Chọn ảnh
                          </div>
                          <Input
                            id="reward-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleRewardImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? "invisible" : ""}
          >
            Quay lại
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext} 
                disabled={!isStepValid()}
                className="bg-eco-blue hover:bg-eco-blue/90"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                className="bg-eco-green hover:bg-eco-green/90 text-white font-semibold min-w-[150px]"
                onClick={() => onSubmit(true)}
                disabled={currentStep !== steps.length - 1}
              >
                Tạo chiến dịch
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}