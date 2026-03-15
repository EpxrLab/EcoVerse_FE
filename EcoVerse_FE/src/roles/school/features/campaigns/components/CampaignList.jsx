import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Flag,
  MoreHorizontal,
  Calendar,
  Users,
  Building2,
  Brain,
  Send,
  Eye,
  Edit,
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusConfig = {
  draft: { label: 'Nháp', color: 'bg-muted text-muted-foreground', icon: Edit },
  scheduled: { label: 'Đã lên lịch', color: 'bg-purple-500/15 text-purple-500', icon: Clock },
  active: { label: 'Đang hoạt động', color: 'bg-eco-green/15 text-eco-green', icon: Play },
  inviting_students: { label: 'Đang mời', color: 'bg-indigo-50 text-indigo-600', icon: Send },
  completed: { label: 'Hoàn thành', color: 'bg-eco-blue/15 text-eco-blue', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-destructive/15 text-destructive', icon: XCircle },
};

export function CampaignList({
  campaigns,
  tableHeaderBg = 'bg-muted/30',
  rowHoverBg = 'hover:bg-muted/20',
  participantLabel = 'Lớp tham gia',
  onView,
  onEdit,
  onInvite,
  onChangeStatus,
  onDelete,
  onRevertToDraft,
  onActivate,
}) {
  if (campaigns.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Chưa có chiến dịch nào</h3>
          <p className="text-sm text-muted-foreground">
            Không có chiến dịch nào trong danh mục này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <Table>
        <TableHeader>
          <TableRow className={`${tableHeaderBg} hover:${tableHeaderBg}`}>
            <TableHead className="font-bold">Tên chiến dịch</TableHead>
            <TableHead className="font-bold">Thời gian</TableHead>
            <TableHead className="text-center font-bold">{participantLabel}</TableHead>
            <TableHead className="text-center font-bold">Quiz</TableHead>
            <TableHead className="text-center font-bold">Game</TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const StatusIcon = statusConfig[campaign.status].icon;
            return (
              <TableRow key={campaign.id} className={rowHoverBg}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{campaign.name}</p>
                      <Badge className={statusConfig[campaign.status].color} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[campaign.status].label}
                      </Badge>
                      {campaign.origin === 'partnership' ? (
                        <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/20">
                          Đối tác
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/20">
                          Trường
                        </Badge>
                      )}
                    </div>
                    {campaign.origin === 'partnership' && campaign.partnership_name ? (
                      <div className="flex items-center gap-1.5 text-xs text-eco-blue mt-1">
                        <Building2 className="w-3 h-3" />
                        <span>{campaign.partnership_name}</span>
                      </div>
                    ) : (
                      campaign.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {campaign.description}
                        </p>
                      )
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(campaign.start_date), 'dd/MM', { locale: vi })} -{' '}
                      {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {campaign.origin === 'partnership' 
                        ? (campaign.participating_students?.length || 0)
                        : (campaign.participating_classes?.length || 0)
                      }
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {campaign.origin === 'partnership' ? 'HS' : 'Lớp'}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Brain className="w-4 h-4 text-eco-blue" />
                    <span className="font-medium">{campaign.selected_quizzes?.length || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {campaign.selected_games?.map(game => (
                      <Badge key={game} variant="outline" className="text-xs">
                        {game === 'sorting' ? '🗑️' : '🏃'}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(campaign)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </DropdownMenuItem>

                        {campaign.status === 'scheduled' && onRevertToDraft && (
                           <DropdownMenuItem onClick={() => onRevertToDraft(campaign.id)} className="text-eco-orange focus:text-eco-orange">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Chuyển về nháp
                          </DropdownMenuItem>
                        )}
                        
                        {campaign.status !== 'scheduled' && (
                          <DropdownMenuItem onClick={() => onInvite(campaign)}>
                            <Send className="w-4 h-4 mr-2" />
                            Mời
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {campaign.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(campaign)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onActivate ? onActivate(campaign.id) : onChangeStatus(campaign.id, 'active')}>
                              <Play className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </DropdownMenuItem>
                          </>
                        )}
                        {campaign.status === 'active' && (
                          <>
                            {campaign.origin !== 'partnership' && (
                              <>
                                <DropdownMenuItem onClick={() => onChangeStatus(campaign.id, 'completed')}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Hoàn thành
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onChangeStatus(campaign.id, 'cancelled')}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Hủy chiến dịch
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        )}
                        
                        {campaign.origin !== 'partnership' && campaign.status !== 'scheduled' && (
                          <>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => onDelete(campaign.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}