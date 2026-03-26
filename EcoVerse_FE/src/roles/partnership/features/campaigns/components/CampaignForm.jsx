import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { School, Users, MapPin, Package, Zap, Image as ImageIcon, Upload, X, Calendar, Sparkles, Settings2, Bot, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const CATEGORY_LABELS = { plastic: "Nhựa", paper: "Giấy", organic: "Hữu cơ", others: "Khác" };

const DEMO_PRESETS = [
  { id: 1, name: "Preset Cơ bản", gameType: "sorting", difficulty: "Dễ", levels: [{ levelNumber: 1, itemCount: 15, timeLimitSeconds: 60, lives: null }] },
  { id: 2, name: "Preset Thử thách", gameType: "sorting", difficulty: "Trung bình", levels: [{ levelNumber: 1, itemCount: 20, timeLimitSeconds: 45, lives: 3 }] },
  { id: 3, name: "Preset Khởi động", gameType: "run-sorting", difficulty: "Dễ", levels: [{ levelNumber: 1, itemCount: 10, timeLimitSeconds: 0, lives: null }] },
  { id: 4, name: "Preset Tăng tốc", gameType: "run-sorting", difficulty: "Trung bình", levels: [{ levelNumber: 1, itemCount: 20, timeLimitSeconds: 45, lives: 3 }, { levelNumber: 2, itemCount: 25, timeLimitSeconds: 40, lives: 3 }] },
];

export function CampaignForm({
  isOpen,
  onClose,
  formData,
  onFormChange,
  availableSchools,
  onSubmit,
}) {
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

  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'schools', label: 'Trường tham gia' },
    { id: 'rounds', label: 'Vòng loại' },
    { id: 'rewards', label: 'Phần thưởng' },
  ];

  const addQualifyingRound = () => {
    const nextRoundNumber = formData.qualifying_rounds.length + 1;
    onFormChange({
      qualifying_rounds: [
        ...formData.qualifying_rounds,
        {
          round_number: nextRoundNumber,
          round_name: `Vòng ${nextRoundNumber}`,
          start_date: formData.start_date || '',
          end_date: formData.end_date || '',
          quiz_ids: [],
          selected_game_type: '',
          preset_id: null,
          advancement_limit: 10,
        }
      ]
    });
  };

  const removeQualifyingRound = (index) => {
    if (formData.qualifying_rounds.length === 1) return;
    const newRounds = formData.qualifying_rounds.filter((_, i) => i !== index);
    onFormChange({ qualifying_rounds: newRounds });
  };

  const updateQualifyingRound = (index, field, value) => {
    const newRounds = [...formData.qualifying_rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    onFormChange({ qualifying_rounds: newRounds });
  };

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
        return formData.qualifying_rounds.length > 0 && formData.qualifying_rounds.every(r => r.round_name && r.advancement_limit && r.start_date && r.end_date);
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
                  <Label className="text-base font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-eco-green" />
                    Cấu trúc các vòng loại
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Khai báo trước số lượng vòng chơi. Nội dung game/quiz sẽ cấu hình chi tiết sau.
                  </p>
                </div>
                <Button 
                  onClick={addQualifyingRound} 
                  variant="outline" 
                  className="gap-2 border-eco-green text-eco-green hover:bg-eco-green hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vòng loại
                </Button>
              </div>

              <div className="space-y-4">
                {formData.qualifying_rounds.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">
                    Chưa có vòng loại nào được thiết lập.
                  </div>
                )}
                
                {formData.qualifying_rounds.map((round, index) => (
                  <div key={index} className="p-4 border-2 rounded-xl space-y-4 bg-muted/10 relative group">
                    {formData.qualifying_rounds.length > 1 && (
                      <button
                        onClick={() => removeQualifyingRound(index)}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Xóa vòng"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-8">
                      <div className="space-y-2 md:col-span-1">
                        <Label>Tên vòng *</Label>
                        <Input
                          placeholder="VD: Vòng sơ loại"
                          value={round.round_name || ''}
                          onChange={(e) => updateQualifyingRound(index, 'round_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label>Giới hạn học sinh *</Label>
                        <Input
                          type="number"
                          placeholder="VD: 50"
                          value={round.advancement_limit || ''}
                          onChange={(e) => updateQualifyingRound(index, 'advancement_limit', parseInt(e.target.value) || 0)}
                          min={1}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label>Ngày bắt đầu *</Label>
                        <Input
                          type="date"
                          value={round.start_date || ''}
                          onChange={(e) => updateQualifyingRound(index, 'start_date', e.target.value)}
                          min={formData.start_date}
                          max={formData.end_date}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label>Ngày kết thúc *</Label>
                        <Input
                          type="date"
                          value={round.end_date || ''}
                          onChange={(e) => updateQualifyingRound(index, 'end_date', e.target.value)}
                          min={round.start_date || formData.start_date}
                          max={formData.end_date}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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