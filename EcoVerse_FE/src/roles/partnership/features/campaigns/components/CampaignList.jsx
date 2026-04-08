import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Eye, Calendar, School, Users, Send, MoreVertical, Edit, Trash2, RotateCcw, Gamepad2, FileQuestion, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';

export function CampaignList({ campaigns, onViewDetail, onEdit, onDelete, onActivate, onRevertToDraft, onAddGame, onAddQuiz, onCancel }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'scheduled': return 'bg-purple-500/15 text-purple-500 border-purple-500/25';
      case 'inviting': return 'bg-eco-orange/15 text-eco-orange border-eco-orange/25';
      case 'on_going': return 'bg-eco-blue/15 text-eco-blue border-eco-blue/25';
      case 'completed': return 'bg-eco-green/15 text-eco-green border-eco-green/25';
      case 'cancelled': return 'bg-destructive/15 text-destructive border-destructive/25';
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

  const getCampaignTypeLabel = (type) => {
    switch (type) {
      case 'PARTNERSHIP_EVENT': return 'Sự kiện đối tác';
      case 'SCHOOL_INTERNAL': return 'Nội bộ trường';
      default: return type;
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Chưa có chiến dịch nào</p>
      </div>
    );
  }

  return (
    <div className="border-2 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold">Tên chiến dịch</TableHead>
            <TableHead className="font-bold">Trạng thái</TableHead>
            <TableHead className="font-bold">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Thời gian
              </div>
            </TableHead>
            <TableHead className="font-bold">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Gửi lời mời
              </div>
            </TableHead>
            <TableHead className="text-center font-bold">
              <div className="flex items-center justify-center gap-2">
                <School className="w-4 h-4" />
                Trường
              </div>
            </TableHead>
            <TableHead className="text-center font-bold">
              Cấu hình
            </TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="hover:bg-muted/30">
              <TableCell>
                <p className="font-semibold text-foreground">{campaign.campaignName}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(getStatusColor(campaign.status))}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleString('vi-VN') : "-"}
                  </p>
                  <p className="text-muted-foreground">
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleString('vi-VN') : "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {campaign.invitationDate ? (
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.invitationDate).toLocaleString('vi-VN')}
                  </p>
                ) : (
                  <span className="text-muted-foreground text-sm">Chưa đặt</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className="font-bold text-eco-blue">{campaign.schoolsCount || 0}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <Gamepad2 className={cn("w-5 h-5", campaign.hasGame ? "text-eco-green" : "text-muted-foreground/30")} />
                    <span className={cn("text-[10px] uppercase font-bold", campaign.hasGame ? "text-eco-green" : "text-muted-foreground/30")}>Game</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <FileQuestion className={cn("w-5 h-5", campaign.hasQuiz ? "text-eco-green" : "text-muted-foreground/30")} />
                    <span className={cn("text-[10px] uppercase font-bold", campaign.hasQuiz ? "text-eco-green" : "text-muted-foreground/30")}>Quiz</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(campaign)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    
                    {campaign.status === 'draft' && onActivate && (
                      <DropdownMenuItem onClick={() => onActivate(campaign)} className="text-eco-blue focus:text-eco-blue">
                        <Send className="w-4 h-4 mr-2" />
                        Kích hoạt
                      </DropdownMenuItem>
                    )}

                    {campaign.status === 'draft' && onAddGame && (
                      <DropdownMenuItem onClick={() => onAddGame(campaign)}>
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Thêm Game
                      </DropdownMenuItem>
                    )}
                    
                    {campaign.status === 'draft' && onAddQuiz && (
                      <DropdownMenuItem onClick={() => onAddQuiz(campaign)}>
                        <FileQuestion className="w-4 h-4 mr-2" />
                        Thêm Quiz
                      </DropdownMenuItem>
                    )}

                    {campaign.status === 'scheduled' && onRevertToDraft && (
                      <DropdownMenuItem onClick={() => onRevertToDraft(campaign)} className="text-eco-orange focus:text-eco-orange">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Chuyển về nháp
                      </DropdownMenuItem>
                    )}

                    {(campaign.status === 'draft' || campaign.status === 'cancelled') && (
                      <DropdownMenuItem onClick={() => onEdit(campaign)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </DropdownMenuItem>
                    )}

                    {campaign.status === 'inviting' && onCancel && (
                      <DropdownMenuItem 
                        onClick={() => onCancel(campaign)}
                        className="text-destructive focus:text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy chiến dịch
                      </DropdownMenuItem>
                    )}

                    {(campaign.status === 'draft' || campaign.status === 'cancelled') && onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(campaign)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}