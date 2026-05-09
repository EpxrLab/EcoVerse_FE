import React from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { School, Users, MapPin, Package, Zap, Image as ImageIcon, Upload, X, Calendar, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ConfigProvider, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { partnershipCampaignService } from '../../../services/partnershipCampaign.service';

export function CampaignForm({
  isOpen,
  onClose,
  formData,
  onFormChange,
  availableSchools,
  onSubmit,
  isEditing,
  currentSubscription,
}) {
  const toggleSchool = (schoolId) => {
    const exists = (formData.invitedSchools || []).some(s => s.schoolId === schoolId);
    let newInvitedSchools = [];
    
    if (exists) {
      newInvitedSchools = formData.invitedSchools.filter(s => s.schoolId !== schoolId);
    } else {
      // Check subscription limit for inviting schools
      if (currentSubscription && currentSubscription.maxSchoolsPerCampaign !== null) {
        if ((formData.invitedSchools || []).length >= currentSubscription.maxSchoolsPerCampaign) {
          toast.error(`Gói đăng ký của bạn chỉ cho phép mời tối đa ${currentSubscription.maxSchoolsPerCampaign} trường tham gia mỗi chiến dịch.`);
          return;
        }
      }

      // Check if school meets minimum student requirement
      const school = availableSchools.find(s => (s.schoolId || s.id) === schoolId);
      const studentCount = school?.managedStudentCount || school?.studentCount || school?.student_count || 0;
      if (formData.minStudentsPerSchool > 0 && studentCount < formData.minStudentsPerSchool) {
        toast.error(`Trường này không đủ số lượng học sinh tối thiểu (${formData.minStudentsPerSchool} HS).`);
        return;
      }

      newInvitedSchools = [
        ...(formData.invitedSchools || []),
        { schoolId, maxStudentsInvited: 0 }
      ];
    }

    // Precise distribution: base + remainder for first N schools
    const total = formData.totalStudentQuota || 0;
    const len = newInvitedSchools.length;
    if (len > 0) {
      const base = Math.floor(total / len);
      const remainder = total % len;
      newInvitedSchools = newInvitedSchools.map((s, i) => ({
        ...s,
        maxStudentsInvited: base + (i < remainder ? 1 : 0)
      }));
    }

    onFormChange({
      invitedSchools: newInvitedSchools
    });
  };

  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'schools', label: 'Trường tham gia' },
    { id: 'rounds', label: 'Vòng loại' },
    { id: 'rewards', label: 'Phần thưởng' },
  ];
;
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
    if (currentStep === 0) {
      // Filter out schools that no longer meet the minimum student requirement when moving to Step 1
      const val = formData.minStudentsPerSchool;
      if ((formData.invitedSchools || []).length > 0) {
        const filteredSchools = formData.invitedSchools.filter(invited => {
          const school = availableSchools.find(s => (s.schoolId || s.id) === invited.schoolId);
          const studentCount = school?.managedStudentCount || school?.studentCount || school?.student_count || 0;
          return studentCount >= val;
        });

        if (filteredSchools.length !== formData.invitedSchools.length) {
          const len = filteredSchools.length;
          let newInvitedSchools = filteredSchools;
          if (len > 0) {
            const total = formData.totalStudentQuota || 0;
            const base = Math.floor(total / len);
            const remainder = total % len;
            newInvitedSchools = filteredSchools.map((s, i) => ({
              ...s,
              maxStudentsInvited: base + (i < remainder ? 1 : 0)
            }));
          } else {
            newInvitedSchools = [];
          }
          onFormChange({ invitedSchools: newInvitedSchools });
          toast('Một số trường đã bị loại bỏ do không đủ số học sinh tối thiểu.', { icon: 'ℹ️' });
        }
      }
    }

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
        const now = dayjs();
        const invStart = dayjs(formData.invitationDate);
        const invEnd = dayjs(formData.invitationDeadline);
        const regStart = dayjs(formData.registrationDate);
        const regEnd = dayjs(formData.registrationDeadline);
        const camStart = dayjs(formData.startDate);
        const camEnd = dayjs(formData.endDate);

        return (
          camStart.isAfter(now.subtract(1, 'minute')) &&
          camEnd.isAfter(camStart) &&
          regStart.isBefore(camStart) &&
          regEnd.isAfter(regStart) &&
          invStart.isAfter(regEnd) &&
          invStart.isBefore(invEnd) &&
          invStart.isBefore(camStart) &&
          invEnd.isBefore(camStart)
        );
      case 1:
        const totalAllocated = (formData.invitedSchools || []).reduce((sum, s) => sum + (parseInt(s.maxStudentsInvited) || 0), 0);
        return (formData.invitedSchools || []).length > 0 && totalAllocated === formData.totalStudentQuota;
      case 2:
        if (formData.rounds.length === 0) return false;
        
        const camStartStep2 = dayjs(formData.startDate);
        const camEndStep2 = dayjs(formData.endDate);

        return formData.rounds.every((r, idx) => {
          if (!r.roundName || !r.startTime || !r.endTime) return false;
          
          const rStart = dayjs(r.startTime);
          const rEnd = dayjs(r.endTime);
          
          // Basic round range check
          if (!rEnd.isAfter(rStart)) return false;
          if (rStart.isBefore(camStartStep2.subtract(1, 'minute')) || rEnd.isAfter(camEndStep2.add(1, 'minute'))) return false;
          
          // Sequential check
          if (idx > 0) {
            const prevEnd = dayjs(formData.rounds[idx-1].endTime);
            if (rStart.isBefore(prevEnd.subtract(1, 'minute'))) return false;
          }
          
          return true;
        });
      case 3:
        return formData.rewards.length > 0 && formData.rewards.every(r => r.rewardName && r.rankPosition);
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl h-[92vh] flex flex-col p-6 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#2d6a4f',
              borderRadius: 12,
              colorBorder: '#d8e2dc',
              colorBgContainer: 'transparent',
              colorBgElevated: '#ffffff',
              zIndexPopupBase: 10000,
            },
            components: {
              DatePicker: {
                activeBorderColor: '#2d6a4f',
                hoverBorderColor: '#40916c',
                cellActiveWithRangeBg: '#d8f3dc',
                zIndexPopup: 10000,
              }
            }
          }}
        >
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

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 px-2 scrollbar-thin">
          <div className="py-4">
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="campaignName">Tên chiến dịch *</Label>
                    <Input
                      id="campaignName"
                      placeholder="VD: Chiến dịch Thu gom rác thải nhựa 2026"
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
                      <DatePicker
                        id="startDate"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn ngày bắt đầu"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={(formData.startDate && dayjs(formData.startDate).isBefore(dayjs().subtract(1, 'minute'))) || (formData.startDate && formData.endDate && !dayjs(formData.startDate).isBefore(dayjs(formData.endDate))) ? 'error' : ''}
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        onChange={(date) => {
                          const newStartDate = date ? date.format('YYYY-MM-DDTHH:mm') : '';
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
                      {formData.startDate && dayjs(formData.startDate).isBefore(dayjs().subtract(1, 'minute')) && (
                        <p className="text-[10px] text-destructive mt-1">Ngày bắt đầu phải từ hiện tại trở đi</p>
                      )}
                      {formData.startDate && formData.endDate && !dayjs(formData.startDate).isBefore(dayjs(formData.endDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải trước ngày kết thúc</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Ngày kết thúc chiến dịch *</Label>
                      <DatePicker
                        id="endDate"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn ngày kết thúc"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={formData.endDate && formData.startDate && !dayjs(formData.endDate).isAfter(dayjs(formData.startDate)) ? 'error' : ''}
                        value={formData.endDate ? dayjs(formData.endDate) : null}
                        onChange={(date) => {
                          const newEndDate = date ? date.format('YYYY-MM-DDTHH:mm') : '';
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
                      {formData.endDate && formData.startDate && !dayjs(formData.endDate).isAfter(dayjs(formData.startDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Ngày kết thúc phải sau ngày bắt đầu</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Ngày mở đăng ký *</Label>
                      <DatePicker
                        id="registrationDate"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn ngày mở đăng ký"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={(formData.registrationDate && formData.startDate && !dayjs(formData.registrationDate).isBefore(dayjs(formData.startDate))) || (formData.registrationDate && formData.registrationDeadline && !dayjs(formData.registrationDate).isBefore(dayjs(formData.registrationDeadline))) ? 'error' : ''}
                        value={formData.registrationDate ? dayjs(formData.registrationDate) : null}
                        onChange={(date) => onFormChange({ registrationDate: date ? date.format('YYYY-MM-DDTHH:mm') : '' })}
                      />
                      {formData.registrationDate && formData.startDate && !dayjs(formData.registrationDate).isBefore(dayjs(formData.startDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải trước ngày bắt đầu chiến dịch</p>
                      )}
                      {formData.registrationDate && formData.registrationDeadline && !dayjs(formData.registrationDate).isBefore(dayjs(formData.registrationDeadline)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải trước hạn chót đăng ký</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline">Hạn chót đăng ký *</Label>
                      <DatePicker
                        id="registrationDeadline"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn hạn chót đăng ký"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={formData.registrationDeadline && formData.registrationDate && !dayjs(formData.registrationDeadline).isAfter(dayjs(formData.registrationDate)) ? 'error' : ''}
                        value={formData.registrationDeadline ? dayjs(formData.registrationDeadline) : null}
                        onChange={(date) => onFormChange({ registrationDeadline: date ? date.format('YYYY-MM-DDTHH:mm') : '' })}
                      />
                      {formData.registrationDeadline && formData.registrationDate && !dayjs(formData.registrationDeadline).isAfter(dayjs(formData.registrationDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải sau ngày mở đăng ký</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-eco-blue" />
                      Mời học sinh & Chỉ tiêu
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invitationDate">Ngày gửi lời mời *</Label>
                      <DatePicker
                        id="invitationDate"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn ngày gửi lời mời"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={(formData.invitationDate && formData.registrationDeadline && !dayjs(formData.invitationDate).isAfter(dayjs(formData.registrationDeadline))) || (formData.invitationDate && formData.invitationDeadline && !dayjs(formData.invitationDate).isBefore(dayjs(formData.invitationDeadline))) || (formData.invitationDate && formData.startDate && !dayjs(formData.invitationDate).isBefore(dayjs(formData.startDate))) ? 'error' : ''}
                        value={formData.invitationDate ? dayjs(formData.invitationDate) : null}
                        onChange={(date) => onFormChange({ invitationDate: date ? date.format('YYYY-MM-DDTHH:mm') : '' })}
                      />
                      {formData.invitationDate && formData.registrationDeadline && !dayjs(formData.invitationDate).isAfter(dayjs(formData.registrationDeadline)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải sau hạn chót đăng ký</p>
                      )}
                      {formData.invitationDate && ( (formData.invitationDeadline && !dayjs(formData.invitationDate).isBefore(dayjs(formData.invitationDeadline))) || (formData.startDate && !dayjs(formData.invitationDate).isBefore(dayjs(formData.startDate))) ) && (
                        <p className="text-[10px] text-destructive mt-1">Phải trước hạn chót xác nhận và ngày bắt đầu</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invitationDeadline">Hạn chót xác nhận lời mời *</Label>
                      <DatePicker
                        id="invitationDeadline"
                        showTime={{ format: 'HH:mm', showNow: false }}
                        format="DD/MM/YYYY HH:mm"
                        needConfirm={false}
                        className="w-full h-10"
                        placeholder="Chọn hạn chót xác nhận"
                        getPopupContainer={(trigger) => trigger.parentElement}
                        status={(formData.invitationDeadline && formData.invitationDate && !dayjs(formData.invitationDeadline).isAfter(dayjs(formData.invitationDate))) || (formData.invitationDeadline && formData.startDate && !dayjs(formData.invitationDeadline).isBefore(dayjs(formData.startDate))) ? 'error' : ''}
                        value={formData.invitationDeadline ? dayjs(formData.invitationDeadline) : null}
                        onChange={(date) => onFormChange({ invitationDeadline: date ? date.format('YYYY-MM-DDTHH:mm') : '' })}
                      />
                      {formData.invitationDeadline && formData.invitationDate && !dayjs(formData.invitationDeadline).isAfter(dayjs(formData.invitationDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải sau ngày gửi lời mời</p>
                      )}
                      {formData.invitationDeadline && formData.startDate && !dayjs(formData.invitationDeadline).isBefore(dayjs(formData.startDate)) && (
                        <p className="text-[10px] text-destructive mt-1">Phải trước ngày bắt đầu chiến dịch</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStudentsPerSchool">Số học sinh tối thiểu mỗi trường</Label>
                      <Input
                        id="minStudentsPerSchool"
                        type="number"
                        min={0}
                        placeholder="VD: 50"
                        value={formData.minStudentsPerSchool}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          onFormChange({ minStudentsPerSchool: val });
                        }}
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="totalStudentQuota">Tổng chỉ tiêu học sinh *</Label>
                      <Input
                        id="totalStudentQuota"
                        type="number"
                        min={0}
                        value={formData.totalStudentQuota}
                        onChange={(e) => {
                          const quota = Math.max(0, parseInt(e.target.value) || 0);
                          const updates = { totalStudentQuota: quota };
                          
                          // Precise distribution: base + remainder for first N schools
                          if ((formData.invitedSchools || []).length > 0) {
                            const len = formData.invitedSchools.length;
                            const base = Math.floor(quota / len);
                            const remainder = quota % len;
                            updates.invitedSchools = formData.invitedSchools.map((s, i) => ({
                              ...s,
                              maxStudentsInvited: base + (i < remainder ? 1 : 0)
                            }));
                          }

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
                        min={0}
                        value={formData.topRankingCount}
                        onChange={(e) => {
                          const count = Math.max(0, parseInt(e.target.value) || 0);
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Label className="text-base font-bold">Chọn trường tham gia</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const totalAllocated = (formData.invitedSchools || []).reduce((sum, s) => sum + (parseInt(s.maxStudentsInvited) || 0), 0);
                        const isMatched = totalAllocated === formData.totalStudentQuota;
                        return (
                          <p className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full border",
                            isMatched 
                              ? "bg-eco-green/10 text-eco-green border-eco-green/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}>
                            Đã phân bổ: {totalAllocated}/{formData.totalStudentQuota} HS
                            {!isMatched && ` (Còn ${formData.totalStudentQuota - totalAllocated > 0 ? 'thiếu' : 'dư'} ${Math.abs(formData.totalStudentQuota - totalAllocated)})`}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="text-sm bg-eco-blue/5 text-eco-blue border-eco-blue/20 h-9">
                      <Users className="w-4 h-4 mr-1" />
                      Tổng chỉ tiêu: {formData.totalStudentQuota}
                    </Badge>
                    
                    <Badge variant="outline" className="text-sm h-9">
                      <School className="w-4 h-4 mr-1" />
                      {(formData.invitedSchools || []).length} trường
                    </Badge>
                  </div>
                </div>

                <div className="border-2 rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {availableSchools.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Không tìm thấy trường nào đủ điều kiện
                    </p>
                  ) : (
                      availableSchools.map((school) => {
                        const id = school.schoolId || school.id;
                        const invitedSchool = (formData.invitedSchools || []).find(s => s.schoolId === id);
                        const isSelected = !!invitedSchool;
                        const studentCount = school.managedStudentCount || school.studentCount || school.student_count || 0;
                        const isEligible = formData.minStudentsPerSchool === 0 || studentCount >= formData.minStudentsPerSchool;

                        return (
                          <div
                            key={id}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-colors relative",
                              isSelected
                                ? "bg-eco-blue/5 border-eco-blue/30"
                                : !isEligible 
                                  ? "bg-muted/20 border-muted opacity-60 grayscale-[0.5]"
                                  : "border-border hover:bg-muted/50"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSchool(id)}
                                  disabled={!isEligible && !isSelected}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-foreground">{school.schoolName || school.school_name}</p>
                                    {!isEligible && (
                                      <Badge variant="destructive" className="text-[10px] py-0 h-4">
                                        Không đủ HS tối thiểu
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{school.ward || school.district}, {school.province || school.city}</span>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                      "text-xs",
                                      !isEligible ? "text-destructive border-destructive/20 bg-destructive/5" : "text-eco-blue border-eco-blue/20 bg-eco-blue/5"
                                    )}>
                                      <Users className="w-3 h-3 mr-1" />
                                      {studentCount} học sinh
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-2 pl-7 sm:pl-0">
                                  <Label className="text-xs font-semibold whitespace-nowrap text-eco-orange">Chỉ tiêu mời:</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={formData.totalStudentQuota}
                                    className="w-20 h-8 text-xs font-bold bg-background border-eco-orange/30 focus-visible:ring-eco-orange"
                                    value={invitedSchool.maxStudentsInvited}
                                    onChange={(e) => {
                                      let val = Math.max(0, parseInt(e.target.value) || 0);
                                      if (val > formData.totalStudentQuota) {
                                        val = formData.totalStudentQuota;
                                        toast.error(`Chỉ tiêu của trường không được vượt quá tổng chỉ tiêu chiến dịch (${formData.totalStudentQuota} HS)`);
                                      }
                                      const updated = formData.invitedSchools.map(s => 
                                        s.schoolId === id ? { ...s, maxStudentsInvited: val } : s
                                      );
                                      onFormChange({ invitedSchools: updated });
                                    }}
                                  />
                                </div>
                              )}
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
                      <Zap className="w-5 h-5 text-eco-blue" />
                      Cấu trúc các vòng loại
                    </Label>
                  </div>
                    <Button 
                      onClick={() => {
                        if (currentSubscription && currentSubscription.maxRoundsPerCampaign !== null && formData.rounds.length >= currentSubscription.maxRoundsPerCampaign) {
                          toast.error(`Gói đăng ký của bạn chỉ cho phép tối đa ${currentSubscription.maxRoundsPerCampaign} vòng trên mỗi chiến dịch.`);
                          return;
                        }
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
                      className="gap-2 border-eco-blue text-eco-blue hover:bg-eco-blue hover:text-white"
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
                            min={0}
                            value={round.advanceCount}
                            disabled={round.isFinalRound}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
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
                          <DatePicker
                            showTime={{ format: 'HH:mm', showNow: false }}
                            format="DD/MM/YYYY HH:mm"
                            needConfirm={false}
                            className="w-full h-10"
                            placeholder="Chọn ngày bắt đầu"
                            getPopupContainer={(trigger) => trigger.parentElement}
                            value={round.startTime ? dayjs(round.startTime) : null}
                            onChange={(date) => {
                              const newRounds = [...formData.rounds];
                              newRounds[index].startTime = date ? date.format('YYYY-MM-DDTHH:mm') : '';
                              onFormChange({ rounds: newRounds });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Thời gian kết thúc *</Label>
                          <DatePicker
                            showTime={{ format: 'HH:mm', showNow: false }}
                            format="DD/MM/YYYY HH:mm"
                            needConfirm={false}
                            className="w-full h-10"
                            placeholder="Chọn ngày kết thúc"
                            getPopupContainer={(trigger) => trigger.parentElement}
                            value={round.endTime ? dayjs(round.endTime) : null}
                            onChange={(date) => {
                              const newEndTime = date ? date.format('YYYY-MM-DDTHH:mm') : '';
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
                              const newRounds = formData.rounds.map((r, i) => {
                                if (checked && i === index) {
                                  return {
                                    ...r,
                                    isFinalRound: true,
                                    advanceCount: formData.topRankingCount || 0,
                                    endTime: formData.endDate || r.endTime
                                  };
                                }
                                if (checked && i !== index) {
                                  return { ...r, isFinalRound: false };
                                }
                                if (!checked && i === index) {
                                  return { ...r, isFinalRound: false };
                                }
                                return r;
                              });
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
                      <Package className="w-5 h-5 text-eco-blue" />
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
                className="bg-eco-blue hover:bg-eco-blue/90 text-white font-semibold min-w-[150px]"
                onClick={() => onSubmit(true)}
                disabled={currentStep !== steps.length - 1}
              >
                {isEditing ? 'Cập nhật' : 'Tạo chiến dịch'}
              </Button>
            )}
          </div>
        </div>
        </ConfigProvider>
      </DialogContent>
    </Dialog>
  );
}