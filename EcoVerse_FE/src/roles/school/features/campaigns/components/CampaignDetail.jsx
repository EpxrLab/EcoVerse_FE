import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
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
  Recycle,
  Zap,
  Layers,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  Building2
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
  pending: { label: 'Chờ phản hồi', color: 'bg-eco-orange/15 text-eco-orange', icon: Clock },
  accepted: { label: 'Đã chấp nhận', color: 'bg-eco-green/15 text-eco-green', icon: CheckCircle2 },
  rejected: { label: 'Đã từ chối', color: 'bg-destructive/15 text-destructive', icon: XCircle },
};

export function CampaignDetail({ campaign, gameTypes }) {
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const isPendingInvitation = campaign.invitation_status === 'pending';
  const isInvitingStudents = campaign.status === 'inviting_students';
  const isCompleted = campaign.status === 'completed';
  
  const deadline = campaign.invitation_deadline || 
    (campaign.start_date ? new Date(new Date(campaign.start_date).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : null);

  // Filter student invitations by class and status (if completed)
  const filteredInvitations = (selectedClassFilter === 'all'
    ? campaign.student_invitations
    : campaign.student_invitations?.filter(inv => inv.class_id === selectedClassFilter)
  )?.filter(inv => !isCompleted || inv.status !== 'pending');

  // Calculate invitation stats
  const invitationStats = {
    total: campaign.student_invitations?.length || 0,
    pending: campaign.student_invitations?.filter(inv => inv.status === 'pending').length || 0,
    accepted: campaign.student_invitations?.filter(inv => inv.status === 'accepted').length || 0,
    rejected: campaign.student_invitations?.filter(inv => inv.status === 'rejected').length || 0,
  };

  // Get unique classes from invitations
  const classesWithInvitations = Array.from(
    new Set(campaign.student_invitations?.map(inv => inv.class_id) || [])
  ).map(classId => {
    const invitation = campaign.student_invitations?.find(inv => inv.class_id === classId);
    return {
      id: classId,
      name: invitation?.class_name || '',
    };
  });

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
                 Hạn nhận: {format(new Date(deadline), 'dd/MM/yyyy', { locale: vi })}
               </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-1">
              Thời gian: {format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: vi })} -{' '}
              {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: vi })}
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
      {/* Stats Grid - Hide for pending invitations OR inviting_students */}
      {!isPendingInvitation && !isInvitingStudents && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-eco-green">
              {campaign.total_students}
            </p>
            <p className="text-xs text-muted-foreground">Học sinh</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold text-eco-blue">
              {campaign.participating_classes?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Lớp tham gia</p>
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
      {campaign.invitation_send_date && campaign.invitation_deadline && (
        <div className="p-4 rounded-lg bg-eco-blue/5 border border-eco-blue/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-eco-blue" />
            Thời gian gửi mời
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Ngày gửi:</span>{' '}
              <span className="font-medium">{format(new Date(campaign.invitation_send_date), 'dd/MM/yyyy', { locale: vi })}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Hạn phản hồi:</span>{' '}
              <span className="font-medium">{format(new Date(campaign.invitation_deadline), 'dd/MM/yyyy', { locale: vi })}</span>
            </p>
            <p className="text-xs text-muted-foreground italic">
              Các lời mời chưa phản hồi sẽ tự động bị từ chối sau hạn phản hồi
            </p>
          </div>
        </div>
      )}

      {/* Operational Details - Hide for pending invitations AND inviting_students */}
      {!isPendingInvitation && !isInvitingStudents && (
        <>
          {/* Selected Quizzes */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-eco-blue" />
              Quiz đã chọn
            </h4>
            <div className="flex flex-wrap gap-2">
              {campaign.selected_quizzes?.map((quiz) => (
                <Badge
                  key={quiz.quiz_id}
                  className={difficultyConfig[quiz.difficulty].color}
                  variant="secondary"
                >
                  {quiz.quiz_title} ({quiz.questions_count} câu)
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected Games */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-eco-orange" />
              Loại Game
            </h4>
            <div className="flex flex-wrap gap-2">
              {campaign.selected_games?.map((gameId) => {
                const game = gameTypes.find(g => g.id === gameId);
                return (
                  <Badge key={gameId} variant="outline" className="px-3 py-1.5">
                    {gameId === 'sorting' ? '🗑️' : '🏃'} {game?.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Selected Levels */}
          {campaign.selected_levels && campaign.selected_levels.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-eco-purple" />
                Cấp độ Game
              </h4>
              <div className="space-y-3">
                {campaign.selected_games?.map((gameId) => {
                  const gameName = gameTypes.find(g => g.id === gameId)?.name;
                  const levelsForGame = campaign.selected_levels?.filter(l => l.game_type === gameId);
                  
                  if (!levelsForGame || levelsForGame.length === 0) return null;

                  return (
                    <div key={gameId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {gameId === 'sorting' ? <Recycle className="w-4 h-4 text-eco-green" /> : <Zap className="w-4 h-4 text-eco-blue" />}
                        <span className="font-medium text-sm">{gameName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-6">
                        {levelsForGame.map((level) => (
                          <Badge 
                            key={level.level_id} 
                            variant="outline" 
                            className={`px-3 py-1 ${
                              level.difficulty === 'Dễ' ? 'border-eco-green/30 bg-eco-green/5 text-eco-green' :
                              level.difficulty === 'Trung bình' ? 'border-eco-orange/30 bg-eco-orange/5 text-eco-orange' :
                              'border-destructive/30 bg-destructive/5 text-destructive'
                            }`}
                          >
                            {level.level_name} ({level.difficulty})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Participating Classes */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Danh sách lớp tham gia
            </h4>
            <Card className="border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Khối</TableHead>
                    <TableHead className="text-center">Học sinh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.participating_classes?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.class_name}</TableCell>
                      <TableCell>Khối {cls.grade}</TableCell>
                      <TableCell className="text-center">{cls.students_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </>
      )}

      {/* Student Participation Status - Show for inviting_students phase OR completed phase */}
      {(isInvitingStudents || isCompleted) && campaign.student_invitations && campaign.student_invitations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-eco-purple" />
            Trạng thái tham gia của học sinh
          </h4>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{invitationStats.total}</p>
              <p className="text-xs text-muted-foreground">Tổng số</p>
            </div>
            <div className="p-3 rounded-lg bg-eco-orange/10 text-center">
              <p className="text-2xl font-bold text-eco-orange">{invitationStats.pending}</p>
              <p className="text-xs text-muted-foreground">Chờ phản hồi</p>
            </div>
            <div className="p-3 rounded-lg bg-eco-green/10 text-center">
              <p className="text-2xl font-bold text-eco-green">{invitationStats.accepted}</p>
              <p className="text-xs text-muted-foreground">Đã chấp nhận</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <p className="text-2xl font-bold text-destructive">{invitationStats.rejected}</p>
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
                {classesWithInvitations.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
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
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Phụ huynh</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations?.map((invitation) => {
                  const StatusIcon = invitationStatusConfig[invitation.status].icon;
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.student_name}</TableCell>
                      <TableCell>{invitation.class_name}</TableCell>
                      <TableCell>{invitation.parent_name}</TableCell>
                      <TableCell>{invitation.parent_phone}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={invitationStatusConfig[invitation.status].color}
                          variant="secondary"
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {invitationStatusConfig[invitation.status].label}
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