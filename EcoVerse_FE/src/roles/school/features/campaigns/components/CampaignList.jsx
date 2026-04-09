import React from 'react';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/shared/components/ui/pagination';
import {
  Flag,
  MoreHorizontal,
  Calendar,
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
  Gamepad2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/shared/lib/utils';

const statusConfig = {
  prepared: { label: 'Chuẩn bị', color: 'bg-blue-500/15 text-blue-500', icon: Clock },
  draft: { label: 'Nháp', color: 'bg-muted text-muted-foreground', icon: Edit },
  scheduled: { label: 'Đã lên lịch', color: 'bg-purple-500/15 text-purple-500', icon: Clock },
  on_going: { label: 'Đang hoạt động', color: 'bg-eco-green/15 text-eco-green', icon: Play },
  inviting: { label: 'Đang mời', color: 'bg-indigo-50 text-indigo-600', icon: Send },
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
  onCancel,
  onExtend,
  onAddGame,
  onAddQuiz,
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [campaigns.length]);

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

  const totalResults = campaigns.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="border-2">
      <Table>
        <TableHeader>
          <TableRow className={`${tableHeaderBg} hover:${tableHeaderBg}`}>
            <TableHead className="font-bold">Tên chiến dịch</TableHead>
            <TableHead className="font-bold">Thời gian</TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCampaigns.map((campaign) => {
            const StatusIcon = statusConfig[campaign.status]?.icon || AlertCircle;
            return (
              <TableRow key={campaign.id} className={rowHoverBg}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{campaign.name}</p>
                      <Badge className={statusConfig[campaign.status]?.color || 'bg-muted'} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[campaign.status]?.label || campaign.status}
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
                      {/* Game & Quiz Status Indicators */}
                      {campaign.has_game ? (
                        <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/10 text-[10px] gap-1 py-0.5 font-medium">
                          <Gamepad2 className="w-3 h-3 text-indigo-500" />
                          Có Game
                        </Badge>
                      ) : (
                        campaign.status === 'draft' && campaign.origin !== 'partnership' && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] gap-1 py-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Chưa có Game
                          </Badge>
                        )
                      )}
                      
                      {campaign.has_quiz ? (
                        <Badge variant="outline" className="bg-eco-orange/5 text-eco-orange border-eco-orange/10 text-[10px] gap-1 py-0.5 font-medium">
                          <Brain className="w-3 h-3 text-eco-orange" />
                          Có Quiz
                        </Badge>
                      ) : (
                        campaign.status === 'draft' && campaign.origin !== 'partnership' && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-[10px] gap-1 py-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Chưa có Quiz
                          </Badge>
                        )
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
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(() => {
                          const start = new Date(campaign.start_date);
                          const end = new Date(campaign.end_date);
                          const isValidStart = campaign.start_date && !isNaN(start.getTime());
                          const isValidEnd = campaign.end_date && !isNaN(end.getTime());
                          
                          return (
                            <>
                              {isValidStart ? format(start, 'HH:mm dd/MM', { locale: vi }) : '??'}
                              {' - '}
                              {isValidEnd ? format(end, 'HH:mm dd/MM/yyyy', { locale: vi }) : '??'}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                    {/* Invitation Timing */}
                    {(campaign.invitation_send_date || campaign.invitation_deadline) && (
                      <div className="flex items-center gap-2 text-[10px] whitespace-nowrap">
                        {campaign.invitation_send_date && (
                          <span className="flex items-center gap-1 text-eco-blue bg-eco-blue/5 px-1.5 py-0.5 rounded border border-eco-blue/10">
                            <Send className="w-2.5 h-2.5" />
                             {(() => {
                               const d = new Date(campaign.invitation_send_date);
                               return !isNaN(d.getTime()) ? format(d, 'HH:mm dd/MM', { locale: vi }) : '---';
                             })()}
                          </span>
                        )}
                        {campaign.invitation_deadline && (
                          <span className="flex items-center gap-1 text-eco-orange bg-eco-orange/5 px-1.5 py-0.5 rounded border border-eco-orange/10">
                            <Clock className="w-2.5 h-2.5" />
                             Hạn: {(() => {
                               const d = new Date(campaign.invitation_deadline);
                               return !isNaN(d.getTime()) ? format(d, 'HH:mm dd/MM', { locale: vi }) : '---';
                             })()}
                          </span>
                        )}
                      </div>
                    )}
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
                        
                        <DropdownMenuSeparator />

                        {campaign.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(campaign)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {campaign.origin !== 'partnership' && onAddGame && (
                              <DropdownMenuItem onClick={() => onAddGame(campaign)}>
                                <Gamepad2 className="w-4 h-4 mr-2" />
                                Thêm Game
                              </DropdownMenuItem>
                            )}
                            {campaign.origin !== 'partnership' && onAddQuiz && (
                              <DropdownMenuItem onClick={() => onAddQuiz(campaign)}>
                                <Brain className="w-4 h-4 mr-2" />
                                Thêm Quiz
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onActivate ? onActivate(campaign.id) : onChangeStatus(campaign.id, 'on_going')}>
                              <Play className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </DropdownMenuItem>
                          </>
                        )}
                        {campaign.status === 'on_going' && (
                          <>
                            {/* Actions removed as requested */}
                          </>
                        )}
                        
                        {campaign.origin !== 'partnership' && campaign.status !== 'scheduled' && campaign.status !== 'on_going' && (
                          <>
                            <DropdownMenuSeparator />
                            
                            {(campaign.status === 'inviting' || campaign.status === 'EXTENDED') ? (
                              <>
                                {campaign.status === 'EXTENDED' && (
                                  <DropdownMenuItem
                                    onClick={() => onCancel ? onCancel(campaign.id) : onDelete(campaign.id)}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Hủy chiến dịch
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => onExtend && onExtend(campaign.id)}
                                  className="text-eco-orange focus:text-eco-orange focus:bg-eco-orange/10"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Gia hạn thêm
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onDelete(campaign.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            )}
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Hiển thị <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalResults)}</span>
            {' - '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalResults)}</span>
            {' trên '}
            <span className="font-medium">{totalResults}</span> kết quả
          </p>
          
          <Pagination className="justify-end order-1 sm:order-2 mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={cn(
                    "cursor-pointer",
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis if there's a gap
                if (
                  (page === 2 && currentPage > 3) || 
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={cn(
                    "cursor-pointer",
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
}