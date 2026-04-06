import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
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
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusConfig = {
  draft: { label: 'Nháp', color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Đã lên lịch', color: 'bg-purple-500/15 text-purple-500' },
  active: { label: 'Đang hoạt động', color: 'bg-eco-green/15 text-eco-green' },
  inviting_students: { label: 'Đang mời', color: 'bg-indigo-50 text-indigo-600' },
  completed: { label: 'Hoàn thành', color: 'bg-eco-blue/15 text-eco-blue' },
  cancelled: { label: 'Đã hủy', color: 'bg-destructive/15 text-destructive' },
};

const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-eco-green/15 text-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-eco-orange/15 text-eco-orange' },
  hard: { label: 'Khó', color: 'bg-destructive/15 text-destructive' },
};

const invitationStatusConfig = {
  invited: { label: 'Đã mời', color: 'bg-eco-orange/15 text-eco-orange', icon: Clock },
  approved: { label: 'Đã chấp nhận', color: 'bg-eco-green/15 text-eco-green', icon: CheckCircle2 },
  declined: { label: 'Đã từ chối', color: 'bg-destructive/15 text-destructive', icon: XCircle },
  rejected: { label: 'Đã từ chối', color: 'bg-destructive/15 text-destructive', icon: XCircle },
  pending: { label: 'Chờ phản hồi', color: 'bg-eco-orange/15 text-eco-orange', icon: Clock },
  pending_parent_approval: { label: 'Chờ PH duyệt', color: 'bg-eco-orange/15 text-eco-orange', icon: Clock },
};

export function CampaignDetail({ campaign, gameTypes, isLoading, onAddQuiz }) {
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  if (isLoading && !campaign?.rounds) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Clock className="w-12 h-12 text-eco-green animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tải chi tiết chiến dịch...</p>
      </div>
    );
  }

  const isPendingInvitation = campaign.invitation_status === 'pending';
  const isInvitingStudents = campaign.status === 'inviting_students';
  const isCompleted = campaign.status === 'completed';
  
  const deadline = campaign.invitation_deadline || 
    (campaign.start_date ? new Date(new Date(campaign.start_date).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : null);

  // Student invitations/participants mapping
  const participants = campaign.participants || [];
  
  // Filter participants by class
  const filteredParticipants = selectedClassFilter === 'all'
    ? participants
    : participants.filter(p => p.class_name === selectedClassFilter);

  // Calculate stats from participants
  const participantStats = {
    total: participants.length,
    invited: participants.filter(p => p.approval_status === 'INVITED' || p.approval_status === 'PENDING_PARENT_APPROVAL').length,
    approved: participants.filter(p => p.approval_status === 'APPROVED').length,
    declined: participants.filter(p => p.approval_status === 'DECLINED' || p.approval_status === 'REJECTED').length,
  };

  // Get unique classes
  const uniqueClasses = Array.from(new Set(participants.map(p => p.class_name))).filter(Boolean);

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
            {!isPendingInvitation ? (
              <Badge className={statusConfig[campaign.status].color} variant="secondary">
                {statusConfig[campaign.status].label}
              </Badge>
            ) : deadline && (
               <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                 <Clock className="w-3 h-3" />
                 Hạn nhận: {format(new Date(deadline), 'HH:mm dd/MM/yyyy', { locale: vi })}
               </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-1">
              Thời gian: {format(new Date(campaign.start_date), 'HH:mm dd/MM/yyyy', { locale: vi })} -{' '}
              {format(new Date(campaign.end_date), 'HH:mm dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {/* Description - Hide for inviting_students phase */}
      {campaign.description && !isInvitingStudents && (
        <p className="text-muted-foreground">{campaign.description}</p>
      )}

      {/* Stats Grid */}
      {!isPendingInvitation && !isInvitingStudents && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-eco-green">
              {participantStats.total}
            </p>
            <p className="text-xs text-muted-foreground">Học sinh đăng ký</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-eco-blue">
              {campaign.rounds?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Vòng chơi</p>
          </div>
        </div>
      )}

      {/* Rewards Section - Hide for inviting_students phase */}
      {campaign.rewards && campaign.rewards.length > 0 && !isInvitingStudents && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-500" />
            Phần thưởng
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.rewards.map((reward) => (
              <Card key={reward.id} className="p-3 border-pink-100 bg-pink-50/30">
                <div className="flex gap-3">
                  {reward.image && (
                    <img 
                      src={reward.image} 
                      alt={reward.name} 
                      className="w-12 h-12 object-contain rounded-md bg-white p-1"
                    />
                  )}
                  <div>
                    <h5 className="font-medium text-sm text-pink-900">{reward.name}</h5>
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

      {/* Invitation Timing */}
      {/* Invitation Timing */}
      {(campaign.invitation_send_date || campaign.invitation_deadline) && (
        <div className="p-4 rounded-lg bg-eco-blue/5 border border-eco-blue/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-eco-blue" />
            Thời gian gửi mời
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Ngày gửi:</span>{' '}
              <span className="font-medium">{format(new Date(campaign.invitation_send_date), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Hạn phản hồi:</span>{' '}
              <span className="font-medium">{format(new Date(campaign.invitation_deadline), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
            </p>
            <p className="text-xs text-muted-foreground italic">
              Các lời mời chưa phản hồi sẽ tự động bị từ chối sau hạn phản hồi
            </p>
          </div>
        </div>
      )}

      {/* Detailed Rounds - NEW Structure */}
      {campaign.rounds && campaign.rounds.length > 0 && (
        <div className="space-y-6">
          <h4 className="font-bold text-lg flex items-center gap-2 border-l-4 border-eco-green pl-3">
            <Layers className="w-5 h-5 text-eco-green" />
            Cấu trúc vòng chơi
          </h4>
          <div className="space-y-4">
            {campaign.rounds.map((round) => (
              <Card key={round.id} className="overflow-hidden border-2 border-muted/20">
                <div className="bg-muted/10 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-eco-green text-white flex items-center justify-center text-xs font-bold">
                      {round.number}
                    </div>
                    <span className="font-bold">{round.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      round.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                      round.status === 'ONGOING' ? 'bg-green-50 text-green-600' :
                      'bg-slate-50 text-slate-600'
                    }>
                      {round.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-2 text-eco-blue hover:text-eco-blue hover:bg-eco-blue/10 text-xs"
                      onClick={() => onAddQuiz(campaign, round.id)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Gán Quiz
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(round.start_time), 'HH:mm dd/MM')} - {format(new Date(round.end_time), 'HH:mm dd/MM')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Gamepad2 className="w-4 h-4 text-eco-orange" />
                      <span>{round.game_type_name}</span>
                      <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                        {round.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {round.quizzes && round.quizzes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        Danh sách Quiz ({round.quizzes.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {round.quizzes.map((quiz) => (
                          <div key={quiz.id} className="flex items-center justify-between p-2 rounded-lg bg-eco-blue/5 border border-eco-blue/10">
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
                {filteredParticipants?.map((participant) => {
                  const status = participant.approval_status || 'INVITED';
                  const config = invitationStatusConfig[status.toLowerCase()] || invitationStatusConfig.pending;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={participant.id}>
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