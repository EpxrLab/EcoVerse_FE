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
import { partnershipCampaignService } from '../../../services/partnershipCampaign.service';

export function CampaignForm({
  isOpen,
  onClose,
  formData,
  onFormChange,
  availableSchools,
  onSubmit,
  isEditing,
}) {
  const toggleSchool = (schoolId) => {
    const exists = formData.schoolIds.includes(schoolId);
    if (exists) {
      onFormChange({
        schoolIds: formData.schoolIds.filter(id => id !== schoolId)
      });
    } else {
      onFormChange({
        schoolIds: [...formData.schoolIds, schoolId]
      });
    }
  };

  const selectedSchools = availableSchools.filter(s => formData.schoolIds.includes(s.schoolId || s.id));

  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'schools', label: 'Trường tham gia' },
    { id: 'rounds', label: 'Vòng loại' },
    { id: 'rewards', label: 'Phần thưởng' },
  ];

  const addReward = () => {
    onFormChange({
      rewards: [
        ...formData.rewards,
        {
          rankPosition: formData.rewards.length + 1,
          rewardName: '',
          description: '',
          imageUrl: '',
          sponsorName: ''
        }
      ]
    });
  };

  const removeReward = (index) => {
    if (formData.rewards.length === 1) return;
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    onFormChange({ rewards: newRewards });
  };

  const handleRewardImageUpload = async (index, file) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await partnershipCampaignService.uploadImage(formDataUpload);
      const data = res.data?.data || res.data;
      
      if (data) {
        const imageUrl = typeof data === 'string' ? data : (data.publicId || data.imageUrl || data.url || '');
        const presignedUrl = data.presignedUrl || data.url || imageUrl;
        
        const newRewards = [...formData.rewards];
        newRewards[index] = { 
          ...newRewards[index], 
          imageUrl: imageUrl,
          previewUrl: presignedUrl 
        };
        onFormChange({ rewards: newRewards });
      }
    } catch (error) {
      console.error('Failed to upload reward image', error);
    }
  };

  const updateReward = (index, field, value) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    onFormChange({ rewards: newRewards });
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
          formData.campaignName && 
          formData.startDate && 
          formData.endDate && 
          formData.registrationDate &&
          formData.registrationDeadline &&
          formData.invitationDate &&
          formData.invitationDeadline &&
          formData.endDate >= formData.startDate
        );
      case 1:
        return formData.schoolIds.length > 0;
      case 2:
        return formData.rounds.length > 0 && formData.rounds.every(r => r.roundName && r.startTime && r.endTime);
      case 3:
        return formData.rewards.length > 0 && formData.rewards.every(r => r.rewardName && r.rankPosition);
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch mới'}
          </DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="campaignName">Tên chiến dịch *</Label>
                  <Input
                    id="campaignName"
                    placeholder="VD: Chiến dịch Thu gom rác thải nhựa 2024"
                    value={formData.campaignName}
                    onChange={(e) => onFormChange({ campaignName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về chiến dịch..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => onFormChange({ description: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-eco-blue" />
                    Thời gian sự kiện & Đăng ký
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Ngày bắt đầu chiến dịch *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        const newRounds = formData.rounds.map((r, idx) => ({
                          ...r,
                          startTime: idx === 0 ? newStartDate : r.startTime
                        }));
                        onFormChange({ 
                          startDate: newStartDate,
                          rounds: newRounds
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc chiến dịch *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        const newRounds = formData.rounds.map(r => ({
                          ...r,
                          endTime: r.isFinalRound ? newEndDate : r.endTime
                        }));
                        onFormChange({ 
                          endDate: newEndDate,
                          rounds: newRounds
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationDate">Ngày mở đăng ký *</Label>
                    <Input
                      id="registrationDate"
                      type="datetime-local"
                      value={formData.registrationDate}
                      onChange={(e) => onFormChange({ registrationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Hạn chót đăng ký *</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => onFormChange({ registrationDeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-eco-green" />
                    Mời học sinh & Chỉ tiêu
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invitationDate">Ngày gửi lời mời *</Label>
                    <Input
                      id="invitationDate"
                      type="datetime-local"
                      value={formData.invitationDate}
                      onChange={(e) => onFormChange({ invitationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invitationDeadline">Hạn chót xác nhận lời mời *</Label>
                    <Input
                      id="invitationDeadline"
                      type="datetime-local"
                      value={formData.invitationDeadline}
                      onChange={(e) => onFormChange({ invitationDeadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudentsPerSchool">Số học sinh tối đa mỗi trường *</Label>
                    <Input
                      id="maxStudentsPerSchool"
                      type="number"
                      value={formData.maxStudentsPerSchool}
                      onChange={(e) => onFormChange({ maxStudentsPerSchool: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="totalStudentQuota">Tổng chỉ tiêu học sinh *</Label>
                    <Input
                      id="totalStudentQuota"
                      type="number"
                      value={formData.totalStudentQuota}
                      onChange={(e) => {
                        const quota = parseInt(e.target.value) || 0;
                        const updates = { totalStudentQuota: quota };
                        if (formData.rounds.length > 0) {
                          const newRounds = [...formData.rounds];
                          newRounds[0].maxParticipants = quota;
                          updates.rounds = newRounds;
                        }
                        onFormChange(updates);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topRankingCount">Số lượng giải thưởng (Top vinh danh) *</Label>
                    <Input
                      id="topRankingCount"
                      type="number"
                      value={formData.topRankingCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        const updates = { topRankingCount: count };
                        
                        // Sync rewards array length with ranking count
                        let currentRewards = [...formData.rewards];
                        if (count > currentRewards.length) {
                          for (let i = currentRewards.length; i < count; i++) {
                            currentRewards.push({
                              rankPosition: i + 1,
                              rewardName: '',
                              description: '',
                              imageUrl: '',
                              sponsorName: ''
                            });
                          }
                        } else if (count < currentRewards.length) {
                          currentRewards = currentRewards.slice(0, count);
                        }
                        updates.rewards = currentRewards;
                        onFormChange(updates);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Chọn trường tham gia</Label>
                <Badge variant="outline" className="text-sm">
                  <School className="w-4 h-4 mr-1" />
                  {formData.schoolIds.length} trường
                </Badge>
              </div>

              <div className="border-2 rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {availableSchools.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Không tìm thấy trường nào đủ điều kiện
                  </p>
                ) : (
                    availableSchools.map((school) => {
                      const id = school.schoolId || school.id;
                      const isSelected = formData.schoolIds.includes(id);

                      return (
                        <div
                          key={id}
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
                              onCheckedChange={() => toggleSchool(id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{school.schoolName || school.school_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{school.ward || school.district}, {school.province || school.city}</span>
                                </div>
                                {(school.student_count || school.studentCount) && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {school.studentCount || school.student_count} HS
                                  </Badge>
                                )}
                              </div>
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
                </div>
                <Button 
                   onClick={() => {
                    const nextRoundNumber = formData.rounds.length + 1;
                    const lastRound = formData.rounds[formData.rounds.length - 1];
                    onFormChange({
                      rounds: [
                        ...formData.rounds,
                        {
                          roundNumber: nextRoundNumber,
                          roundName: `Vòng ${nextRoundNumber}`,
                          startTime: lastRound ? lastRound.endTime : '',
                          endTime: '',
                          maxParticipants: lastRound ? lastRound.advanceCount : (formData.totalStudentQuota || 0),
                          advanceCount: 0,
                          isFinalRound: false
                        }
                      ]
                    });
                  }}
                  variant="outline" 
                  className="gap-2 border-eco-green text-eco-green hover:bg-eco-green hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vòng
                </Button>
              </div>

              <div className="space-y-4">
                {formData.rounds.map((round, index) => (
                  <div key={index} className="p-4 border-2 rounded-xl space-y-4 bg-muted/10 relative">
                    {formData.rounds.length > 1 && (
                      <button
                        onClick={() => {
                          const newRounds = formData.rounds.filter((_, i) => i !== index).map((r, i, arr) => {
                            if (i === 0) {
                              return { ...r, maxParticipants: formData.totalStudentQuota || 0 };
                            }
                            return { ...r, maxParticipants: arr[i-1].advanceCount };
                          });
                          onFormChange({ rounds: newRounds });
                        }}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-8">
                      <div className="space-y-2 col-span-2">
                        <Label>Tên vòng *</Label>
                        <Input
                          value={round.roundName}
                          onChange={(e) => {
                            const newRounds = [...formData.rounds];
                            newRounds[index].roundName = e.target.value;
                            onFormChange({ rounds: newRounds });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số người tham gia tối đa</Label>
                        <Input
                          type="number"
                          value={round.maxParticipants}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{round.isFinalRound ? 'Top của giải' : 'Số lượng thăng hạng'}</Label>
                        <Input
                          type="number"
                          value={round.advanceCount}
                          disabled={round.isFinalRound}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newRounds = [...formData.rounds];
                            newRounds[index].advanceCount = val;
                            
                            // Chain to next round maxParticipants
                            if (newRounds[index + 1]) {
                              newRounds[index + 1].maxParticipants = val;
                            }
                            
                            onFormChange({ rounds: newRounds });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thời gian bắt đầu *</Label>
                        <Input
                          type="datetime-local"
                          value={round.startTime}
                          onChange={(e) => {
                            const newRounds = [...formData.rounds];
                            newRounds[index].startTime = e.target.value;
                            onFormChange({ rounds: newRounds });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thời gian kết thúc *</Label>
                        <Input
                          type="datetime-local"
                          value={round.endTime}
                          onChange={(e) => {
                            const newEndTime = e.target.value;
                            const newRounds = [...formData.rounds];
                            newRounds[index].endTime = newEndTime;
                            
                            // Chain to next round start time
                            if (newRounds[index + 1]) {
                              newRounds[index + 1].startTime = newEndTime;
                            }
                            
                            onFormChange({ rounds: newRounds });
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <Checkbox 
                          id={`final-${index}`} 
                          checked={round.isFinalRound}
                          onCheckedChange={(checked) => {
                            const newRounds = [...formData.rounds];
                            newRounds[index].isFinalRound = !!checked;
                            if (checked) {
                              newRounds[index].advanceCount = formData.topRankingCount || 0;
                              if (formData.endDate) {
                                newRounds[index].endTime = formData.endDate;
                              }
                            }
                            onFormChange({ rounds: newRounds });
                          }}
                        />
                        <Label htmlFor={`final-${index}`}>Là vòng chung kết</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-eco-orange" />
                    Danh sách phần thưởng cho Top {formData.topRankingCount}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Số lượng giải thưởng tự động khớp với cấu hình xếp hạng
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {formData.rewards.map((reward, index) => (
                  <div key={index} className="p-4 border-2 rounded-xl space-y-4 bg-muted/10 relative">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pr-8">
                       <div className="space-y-2">
                        <Label>Hạng</Label>
                        <Input
                          type="number"
                          value={reward.rankPosition}
                          disabled
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Tên phần thưởng *</Label>
                        <Input
                          placeholder="VD: Xe đạp mini"
                          value={reward.rewardName}
                          onChange={(e) => updateReward(index, 'rewardName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Nhà tài trợ</Label>
                        <Input
                          placeholder="VD: VinFast"
                          value={reward.sponsorName}
                          onChange={(e) => updateReward(index, 'sponsorName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-5">
                        <Label>Mô tả</Label>
                        <Input
                          placeholder="..."
                          value={reward.description}
                          onChange={(e) => updateReward(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-6">
                        <Label>Ảnh phần thưởng</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50">
                            {reward.previewUrl || reward.imageUrl ? (
                              <img src={reward.previewUrl || reward.imageUrl} alt="Reward" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`reward-image-${index}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleRewardImageUpload(index, file);
                              }}
                            />
                            <Label 
                              htmlFor={`reward-image-${index}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-eco-blue/30 text-eco-blue cursor-pointer hover:bg-eco-blue/5 transition-colors text-sm font-medium"
                            >
                              <Upload className="w-4 h-4" />
                              {reward.imageUrl ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                            </Label>
                            {reward.imageUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  const newRewards = [...formData.rewards];
                                  newRewards[index] = { 
                                    ...newRewards[index], 
                                    imageUrl: '', 
                                    previewUrl: '' 
                                  };
                                  onFormChange({ rewards: newRewards });
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Xóa
                              </Button>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Định dạng: JPG, PNG, WebP. Tối đa 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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