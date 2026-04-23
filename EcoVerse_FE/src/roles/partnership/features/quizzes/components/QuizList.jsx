import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Eye, Edit, Trash2, Lock, Star, MoreHorizontal, Globe, User } from 'lucide-react';
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
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from '@/shared/lib/utils';

export function QuizList({
  quizzes,
  onViewDetail,
  onEdit,
  onDelete,
  onPublish,
  getDifficultyStars,
  getDifficultyColor,
}) {
  const renderDifficultyStars = (difficulty) => {
    const count = getDifficultyStars(difficulty);
    return Array(count).fill(0).map((_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-eco-orange text-eco-orange" />
    ));
  };

  return (
    <Card className="border-2 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[300px] font-bold">Tên Quiz</TableHead>
            <TableHead className="font-bold">Độ khó</TableHead>
            <TableHead className="font-bold">Trạng thái</TableHead>
            <TableHead className="font-bold">Tạo bởi</TableHead>
            <TableHead className="text-center font-bold">Thống kê</TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                Chưa có bài quiz nào trong danh sách này
              </TableCell>
            </TableRow>
          ) : (
            quizzes.map((quiz) => (
              <TableRow key={quiz.id} className="hover:bg-muted/20">
                <TableCell>
                  <div>
                    <div className="font-bold text-base mb-1">{quiz.title}</div>
                    {'classes' in quiz && quiz.classes && (
                      <div className="flex flex-wrap gap-1">
                        {quiz.classes.map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-eco-blue/8 text-eco-blue border-eco-blue/25">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderDifficultyStars(quiz.difficulty)}
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getDifficultyColor(quiz.difficulty))}>
                      {quiz.difficulty?.toLowerCase() === 'easy' ? 'Dễ' : quiz.difficulty?.toLowerCase() === 'medium' ? 'TB' : 'Khó'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {quiz.type === 'default' ? (
                    <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-0 text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Mặc định
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-medium text-xs",
                        quiz.status === "published" 
                          ? "bg-eco-green/10 text-eco-green border-eco-green/25" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {quiz.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]" title={quiz.createdBy || 'Hệ thống'}>
                      {(() => {
                        const creator = quiz.createdBy?.toUpperCase();
                        if (creator === 'USER' || creator === 'IMPORT') return 'Người dùng';
                        if (creator === 'AI') return 'AI';
                        return quiz.createdBy || 'Hệ thống';
                      })()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex flex-col items-center" title="Số câu hỏi">
                          <span className="font-bold text-foreground">{quiz.questions}</span>
                          <span className="text-[10px]">Câu hỏi</span>
                      </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetail(quiz)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem chi tiết</span>
                          </DropdownMenuItem>
                          
                          {quiz.type !== 'default' && (
                              <>
                                  {onEdit && (
                                      <DropdownMenuItem onClick={() => onEdit(quiz)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Sửa</span>
                                      </DropdownMenuItem>
                                  )}
                                  {quiz.status === 'draft' && onPublish && (
                                      <DropdownMenuItem onClick={() => onPublish(quiz.id, true)}>
                                      <Globe className="mr-2 h-4 w-4 text-eco-blue" />
                                      <span className="text-eco-blue font-medium">Xuất bản</span>
                                      </DropdownMenuItem>
                                  )}
                                  {quiz.status === 'published' && onPublish && (
                                      <DropdownMenuItem onClick={() => onPublish(quiz.id, false)}>
                                      <Lock className="mr-2 h-4 w-4 text-eco-orange" />
                                      <span className="text-eco-orange font-medium">Chuyển về nháp</span>
                                      </DropdownMenuItem>
                                  )}
                                  {onDelete && (
                                      <DropdownMenuItem 
                                      onClick={() => onDelete(quiz.id)}
                                      className="text-destructive focus:text-destructive"
                                      >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Xóa</span>
                                      </DropdownMenuItem>
                                  )}
                              </>
                          )}
                      </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
