import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, School, Send, FileQuestion, Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function CampaignDetail({ isOpen, onClose, campaign, availableQuizzes = [], availableGameLevels = [] }) {
  if (!campaign) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground border-transparent';
      case 'scheduled': return 'bg-purple-500/15 text-purple-500 border-purple-500/25';
      case 'inviting': return 'bg-eco-orange/10 text-eco-orange border-eco-orange/20';
      case 'on_going': return 'bg-eco-blue/10 text-eco-blue border-eco-blue/20';
      case 'completed': return 'bg-eco-green/10 text-eco-green border-eco-green/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'scheduled': return 'Đã lên lịch';
      case 'inviting': return 'Đang mời';
      case 'on_going': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const schoolStats = {
    total: campaign.invitedSchools?.length || 0,
    accepted: campaign.invitedSchools?.filter(s => s.status === 'APPROVED').length || 0,
    declined: campaign.invitedSchools?.filter(s => s.status === 'REJECTED').length || 0,
    invited: campaign.invitedSchools?.filter(s => s.status === 'PENDING_SCHOOL_APPROVAL' || s.status === 'PREPARED' || !s.status).length || 0,
  };

  const approvedSchoolsCount = campaign.invitedSchools?.filter(s => s.status === 'APPROVED').length || 0;
  const approvedStudentsCount = campaign.participants?.filter(p => p.parentApprovalStatus === 'APPROVED' || p.status === 'APPROVED').length || 0;

  const participationRate = campaign.totalStudentQuota > 0 
    ? ((approvedStudentsCount / campaign.totalStudentQuota) * 100).toFixed(1) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-2xl bg-eco-blue/15 flex items-center justify-center shrink-0">
               {campaign.status === 'inviting' ? (
                 <Send className="w-6 h-6 text-eco-blue" />
               ) : (
                 <Calendar className="w-6 h-6 text-eco-blue" />
               )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                {campaign.campaignName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={cn('px-2.5 py-0.5 font-medium', getStatusColor(campaign.status))}>
                   {getStatusLabel(campaign.status)}
                </Badge>
                {campaign.createdAt && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    Tạo ngày {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Trường tham gia</span>
              <span className="text-3xl font-bold text-eco-blue">{approvedSchoolsCount}</span>
            </div>
            
            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Tổng học sinh</span>
              <span className="text-3xl font-bold text-eco-green">{approvedStudentsCount}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Tỷ lệ tham gia</span>
               <span className="text-3xl font-bold text-eco-orange">
                {participationRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Description & School List */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-primary" />
                  Mô tả
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                   {campaign.description || "Chưa có mô tả cho chiến dịch này."}
                </p>
              </div>

              {/* Participating Schools Section */}
              {campaign.invitedSchools && campaign.invitedSchools.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <School className="w-4 h-4 text-primary" />
                    Danh sách trường ({schoolStats.total})
                  </h3>

                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên trường</th>
                          <th className="px-4 py-3 text-right font-medium text-muted-foreground">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-card">
                        {campaign.invitedSchools.map((school) => (
                          <tr key={school.schoolId} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 align-middle font-medium text-foreground">
                              {school.schoolName || school.schoolId}
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                              {school.status === 'APPROVED' ? (
                                <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/20">
                                  Đã tham gia
                                </Badge>
                              ) : school.status === 'REJECTED' ? (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                  Từ chối
                                </Badge>
                              ) : school.status === 'PREPARED' ? (
                                <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/20">
                                  Chuẩn bị
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/20">
                                  Đã mời
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rounds Section */}
              {campaign.rounds && campaign.rounds.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-eco-blue" />
                    Cấu trúc vòng chơi ({campaign.rounds.length})
                  </h3>
                  <div className="space-y-3">
                    {campaign.rounds.map((round, index) => (
                      <div key={index} className="border-2 rounded-xl p-4 bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                              Vòng {round.roundNumber}
                            </Badge>
                            <span className="font-semibold">{round.roundName}</span>
                          </div>
                          {round.isFinalRound && (
                            <Badge className="bg-eco-green text-white">Chung kết</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Bắt đầu: {new Date(round.startTime).toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Kết thúc: {new Date(round.endTime).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                          <span>Tham gia tối đa: {round.maxParticipants || 'Không giới hạn'}</span>
                          <span>Số lượng thăng hạng: {round.advanceCount || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards Section */}
              {campaign.rewards && campaign.rewards.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-eco-orange" />
                    Giải thưởng ({campaign.rewards.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {campaign.rewards.map((reward, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-xl bg-card">
                        {(reward.imagePresignedUrl || reward.imageUrl) && (
                          <img 
                            src={reward.imagePresignedUrl || reward.imageUrl} 
                            alt={reward.rewardName} 
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-foreground">Hạng {reward.rankPosition}: {reward.rewardName}</h4>
                            {reward.sponsorName && (
                              <Badge variant="outline" className="text-eco-blue border-eco-blue/20">
                                {reward.sponsorName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Timeline & Meta */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2 border-b pb-2">
                  <Calendar className="w-4 h-4" />
                  Thời gian quan trọng
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Thời gian chiến dịch:</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold">{new Date(campaign.startDate).toLocaleDateString('vi-VN')}</span>
                      <span className="text-muted-foreground">đến</span>
                      <span className="font-semibold">{new Date(campaign.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bắt đầu đăng ký:</span>
                      <span className="font-semibold">{new Date(campaign.registrationDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Hạn chót đăng ký:</span>
                      <span className="font-semibold text-destructive">{new Date(campaign.registrationDeadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Gửi lời mời:</span>
                      <span className="font-semibold">{new Date(campaign.invitationDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Hạn chót lời mời:</span>
                      <span className="font-semibold text-destructive">{new Date(campaign.invitationDeadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">HS tối đa/trường:</span>
                      <span className="font-bold text-eco-blue">{campaign.maxStudentsPerSchool || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tổng chỉ tiêu HS:</span>
                      <span className="font-bold text-eco-green">{campaign.totalStudentQuota || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
