import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Flag,
  Users,
  Brain,
  Gamepad2,
  Layers,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  Building2,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusConfig = {
  prepared: { label: 'Chuẩn bị', color: 'bg-blue-500/15 text-blue-500' },
  draft: { label: 'Nháp', color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Đã lên lịch', color: 'bg-purple-500/15 text-purple-500' },
  on_going: { label: 'Đang hoạt động', color: 'bg-eco-green/15 text-eco-green' },
  inviting: { label: 'Đang mời', color: 'bg-indigo-50 text-indigo-600' },
  completed: { label: 'Hoàn thành', color: 'bg-eco-blue/15 text-eco-blue' },
  cancelled: { label: 'Đã hủy', color: 'bg-destructive/15 text-destructive' },
};

const invitationStatusConfig = {
  prepared: { label: 'Chưa gửi mời', color: 'bg-muted text-muted-foreground', icon: Clock },
  invited: { label: 'Đã mời', color: 'bg-eco-orange/15 text-eco-orange', icon: Clock },
  approved: { label: 'Đã chấp nhận', color: 'bg-eco-green/15 text-eco-green', icon: CheckCircle2 },
  rejected: { label: 'Đã từ chối', color: 'bg-destructive/15 text-destructive', icon: XCircle },
};

export function CampaignDetail({ campaign, isLoading }) {
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  if (isLoading && !campaign?.rounds) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Clock className="w-12 h-12 text-eco-green animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tải chi tiết chiến dịch...</p>
      </div>
    );
  }

  const safeDateFormat = (dateStr, formatStr = 'HH:mm dd/MM/yyyy') => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '---';
    return format(date, formatStr, { locale: vi });
  };

  const isPendingInvitation = campaign.invitation_status === 'INVITED';
  const isInvitingStudents = campaign.status === 'inviting';
  
  const deadline = campaign.registration_deadline || 
    (campaign.start_date ? new Date(new Date(campaign.start_date).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : null);

  // Student invitations/participants mapping
  const participants = campaign.participants || [];
  
  // Filter participants by class
  const filteredParticipants = selectedClassFilter === 'all'
    ? participants
    : participants.filter(p => `${p.grade}${p.class_name}` === selectedClassFilter);

  // Calculate stats from participants
  const participantStats = {
    total: participants.length,
    invited: participants.filter(p => p.approval_status === 'INVITED' || p.approval_status === 'PENDING_PARENT_APPROVAL' || p.approval_status === 'PREPARED').length,
    approved: participants.filter(p => p.approval_status === 'APPROVED').length,
    declined: participants.filter(p => p.approval_status === 'DECLINED' || p.approval_status === 'REJECTED').length,
  };

  // Get unique classes
  const uniqueClasses = Array.from(new Set(participants.map(p => `${p.grade}${p.class_name}`))).filter(Boolean);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-eco-green/15 flex items-center justify-center">
          <Flag className="w-6 h-6 text-eco-green" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{campaign.name}</h2>
          {campaign.origin === 'partnership' && campaign.partnership_name && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-eco-blue mb-1">
              <Building2 className="w-4 h-4" />
              <span>Đối tác: {campaign.partnership_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            {isPendingInvitation && deadline && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                <Clock className="w-3 h-3" />
                Hạn đăng ký của trường: {safeDateFormat(deadline)}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-1">
              Thời gian: {safeDateFormat(campaign.start_date)} -{' '}
              {safeDateFormat(campaign.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {/* Description - Hide for inviting phase */}
      {campaign.description && !isInvitingStudents && (
        <p className="text-muted-foreground">{campaign.description}</p>
      )}


      {/* Rewards Section - Hide for inviting phase */}
      {campaign.rewards && campaign.rewards.length > 0 && !isInvitingStudents && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-500" />
            Phần thưởng
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.rewards.map((reward, index) => (
              <Card key={reward.id || `reward-${index}`} className="p-3 border-pink-100 bg-pink-50/30">
                <div className="flex gap-3">
                  {reward.image && (
                    <img 
                      src={reward.image} 
                      alt={reward.name} 
                      className="w-12 h-12 object-contain rounded-md bg-white p-1"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm text-pink-900">{reward.name}</h5>
                      {reward.rank_position && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] h-4 px-1">
                          Hạng {reward.rank_position}
                        </Badge>
                      )}
                    </div>
                    {reward.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{reward.description}</p>
                    )}
                    {reward.quantity && (
                      <Badge variant="outline" className="mt-1 bg-white text-xs border-pink-200 text-pink-700">
                        x{reward.quantity} suất
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Registration & Invitation Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Registration Timing */}
        {campaign.origin === 'partnership' && (campaign.registration_date || campaign.registration_deadline) && (
          <div className="p-4 rounded-lg bg-eco-green/5 border border-eco-green/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-eco-green" />
              Thời hạn đăng ký của Trường
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Bắt đầu:</span>{' '}
                <span className="font-medium">{safeDateFormat(campaign.registration_date)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Hạn chót:</span>{' '}
                <span className="font-medium">{safeDateFormat(campaign.registration_deadline)}</span>
              </p>
              <p className="text-xs text-muted-foreground italic">
                Thời hạn để trường xác nhận tham gia chiến dịch
              </p>
            </div>
          </div>
        )}

        {/* Student Invitation Timing */}
        {(campaign.invitation_send_date || campaign.invitation_deadline) && (
          <div className="p-4 rounded-lg bg-eco-blue/5 border border-eco-blue/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-eco-blue" />
              Thời gian mời học học sinh
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Bắt đầu mời:</span>{' '}
                <span className="font-medium">{safeDateFormat(campaign.invitation_send_date)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Hạn phản hồi:</span>{' '}
                <span className="font-medium">{safeDateFormat(campaign.invitation_deadline)}</span>
              </p>
              <p className="text-xs text-muted-foreground italic">
                Thời gian phụ huynh/học sinh nhận và phản hồi lời mời
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quotas and Rankings - NEW Section */}
      {(campaign.max_students_per_school || campaign.total_student_quota || campaign.top_ranking_count) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {campaign.max_students_per_school > 0 && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Giới hạn của trường</p>
                <p className="text-sm font-bold text-purple-900">{campaign.max_students_per_school} học sinh</p>
              </div>
            </div>
          )}
          {campaign.total_student_quota > 0 && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Tổng chỉ tiêu toàn đoàn</p>
                <p className="text-sm font-bold text-indigo-900">{campaign.total_student_quota} học sinh</p>
              </div>
            </div>
          )}
          {campaign.top_ranking_count > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-amber-500 uppercase font-bold tracking-wider">Số lượng giải thưởng</p>
                <p className="text-sm font-bold text-amber-900">Top {campaign.top_ranking_count} học sinh</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Rounds - NEW Structure */}
      {campaign.rounds && campaign.rounds.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-bold text-lg flex items-center gap-2 border-l-4 border-eco-green pl-3">
            <Layers className="w-5 h-5 text-eco-green" />
            Cấu trúc vòng chơi ({campaign.rounds.length})
          </h4>
          <div className="space-y-4">
            {campaign.rounds.map((round, index) => (
              <Card key={round.id || `round-${index}`} className="overflow-hidden border-2 border-muted/20">
                <div className="bg-muted/10 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-eco-green text-white flex items-center justify-center text-xs font-bold">
                      {round.number}
                    </div>
                    <span className="font-bold">{round.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{safeDateFormat(round.start_time, 'HH:mm dd/MM')} - {safeDateFormat(round.end_time, 'HH:mm dd/MM')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Gamepad2 className="w-4 h-4 text-eco-orange" />
                      <span>{round.game_type_name || 'Chưa cấu hình Game'}</span>
                      {round.difficulty && (
                        <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                          {round.difficulty}
                        </Badge>
                      )}
                    </div>
                    {round.max_participants > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Tối đa: {round.max_participants} HS</span>
                      </div>
                    )}
                    {round.advance_count > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>Lấy top: {round.advance_count} HS</span>
                      </div>
                    )}
                  </div>

                  {round.quizzes && round.quizzes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        Danh sách Quiz ({round.quizzes.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {round.quizzes.map((quiz, qIndex) => (
                          <div key={quiz.id || `quiz-${qIndex}`} className="flex items-center justify-between p-2 rounded-lg bg-eco-blue/5 border border-eco-blue/10">
                            <span className="text-xs font-medium truncate max-w-[150px]">{quiz.title}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize">
                                {quiz.difficulty.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Student Participation Status - Show if there are participants */}
      {participants.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-eco-purple" />
            Trạng thái tham gia của học sinh
          </h4>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{participantStats.total}</p>
              <p className="text-xs text-muted-foreground">Tổng số</p>
            </div>
            <div className="p-3 rounded-lg bg-eco-orange/10 text-center">
              <p className="text-2xl font-bold text-eco-orange">{participantStats.invited}</p>
              <p className="text-xs text-muted-foreground">Đã mời</p>
            </div>
            <div className="p-3 rounded-lg bg-eco-green/10 text-center">
              <p className="text-2xl font-bold text-eco-green">{participantStats.approved}</p>
              <p className="text-xs text-muted-foreground">Đã chấp nhận</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <p className="text-2xl font-bold text-destructive">{participantStats.declined}</p>
              <p className="text-xs text-muted-foreground">Đã từ chối</p>
            </div>
          </div>

          {/* Class Filter */}
          <div className="mb-3">
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Lọc theo lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Table */}
          <Card className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead className="text-center">Trạng thái tham gia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants?.map((participant, index) => {
                  const status = participant.approval_status || 'INVITED';
                  const config = invitationStatusConfig[status.toLowerCase()] || invitationStatusConfig.pending;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={participant.id || `participant-${index}`}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.grade}{participant.class_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={config.color}
                          variant="secondary"
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}