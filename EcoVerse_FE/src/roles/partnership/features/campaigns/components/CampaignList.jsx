import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Eye, Calendar, Send, MoreVertical, Edit, Trash2, RotateCcw, Gamepad2, FileQuestion, XCircle, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

export function CampaignList({ campaigns, onViewDetail, onEdit, onDelete, onActivate, onRevertToDraft, onAddGame, onAddQuiz, onCancel }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'scheduled': return 'bg-purple-500/15 text-purple-500 border-purple-500/25';
      case 'joining':
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
      case 'joining':
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
      <div className="overflow-x-auto">
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
                Cấu hình
              </TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TooltipProvider>
            <TableBody>
              {campaigns.map((campaign) => {
                const rounds = campaign.rounds || campaign.qualifying_rounds || [];
                const totalRounds = campaign.totalRounds || rounds.length;
                
                // Game warning logic
                const roundsWithGame = rounds.filter(r => r.game_type_id || r.gameTypeId || r.gameId).length;
                const needsGameWarning = totalRounds > 1 && roundsWithGame > 0 && roundsWithGame < totalRounds;
  
                // Quiz warning logic
                const roundsWithQuiz = rounds.filter(r => (r.quiz_ids && r.quiz_ids.length > 0) || (r.quizzes && r.quizzes.length > 0) || r.hasQuiz).length;
                const needsQuizWarning = totalRounds > 1 && roundsWithQuiz > 0 && roundsWithQuiz < totalRounds;
  
                return (
                  <TableRow key={campaign.id} className="hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold text-foreground whitespace-nowrap">{campaign.campaignName}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(getStatusColor(campaign.status), "whitespace-nowrap")}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm whitespace-nowrap">
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
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(campaign.invitationDate).toLocaleString('vi-VN')}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm whitespace-nowrap">Chưa đặt</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-1 relative p-1">
                          <Gamepad2 className={cn("w-5 h-5", campaign.hasGame ? "text-eco-blue" : "text-muted-foreground/30")} />
                          <span className={cn("text-[10px] uppercase font-bold", campaign.hasGame ? "text-eco-blue" : "text-muted-foreground/30")}>Game</span>
                          {needsGameWarning && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="w-3.5 h-3.5 text-eco-orange absolute top-0 -right-1 bg-background rounded-full shadow-sm cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium text-xs">Chiến dịch nhiều vòng nhưng chưa cấu hình Game cho tất cả các vòng ({roundsWithGame}/{totalRounds})</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1 relative p-1">
                          <FileQuestion className={cn("w-5 h-5", campaign.hasQuiz ? "text-eco-blue" : "text-muted-foreground/30")} />
                          <span className={cn("text-[10px] uppercase font-bold", campaign.hasQuiz ? "text-eco-blue" : "text-muted-foreground/30")}>Quiz</span>
                          {needsQuizWarning && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="w-3.5 h-3.5 text-eco-orange absolute top-0 -right-1 bg-background rounded-full shadow-sm cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium text-xs">Chiến dịch nhiều vòng nhưng chưa cấu hình Quiz cho tất cả các vòng ({roundsWithQuiz}/{totalRounds})</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
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
                          <DropdownMenuItem
                            onClick={() => {
                              if (!campaign.hasGame || !campaign.hasQuiz) {
                                toast.error("Cần cấu hình ít nhất 1 Game và 1 Quiz để kích hoạt chiến dịch");
                                return;
                              }
                              onActivate(campaign);
                            }}
                            className="text-eco-blue focus:text-eco-blue"
                          >
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
  
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onEdit(campaign)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                        )}
  
                        {campaign.status === 'joining' && onCancel && (
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
              );
            })}
            </TableBody>
          </TooltipProvider>
        </Table>
      </div>
    </div>
  );
}