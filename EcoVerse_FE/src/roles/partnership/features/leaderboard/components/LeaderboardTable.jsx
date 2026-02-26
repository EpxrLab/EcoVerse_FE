import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { School, ChevronLeft, ChevronRight, Coins, Gamepad2, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const getInitials = (name) => {
  const parts = name.split(' ');
  return parts[parts.length - 1]?.charAt(0).toUpperCase() || '?';
};

export function LeaderboardTable({ data, currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/50">
              <TableHead className="font-bold w-16 text-center py-3.5">Hạng</TableHead>
              <TableHead className="font-bold py-3.5">Học sinh</TableHead>
              <TableHead className="font-bold py-3.5 hidden md:table-cell">Trường</TableHead>
              <TableHead className="text-center font-bold py-3.5">
                <div className="flex items-center justify-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-eco-blue" />
                  Quiz
                </div>
              </TableHead>
              <TableHead className="text-center font-bold py-3.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-eco-green" />
                  Game
                </div>
              </TableHead>
              <TableHead className="text-center font-bold py-3.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-eco-orange" />
                  Tổng
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((student) => {
              const isTop3 = student.rank <= 3;
              return (
                <TableRow
                  key={student.id}
                  className={cn(
                    'group transition-colors border-b border-border/30 last:border-0',
                    isTop3 ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-muted/40'
                  )}
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center justify-center">
                      {isTop3 ? (
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs',
                          student.rank === 1 ? 'bg-accent/15 text-accent' :
                          student.rank === 2 ? 'bg-muted text-muted-foreground' :
                          'bg-secondary/15 text-secondary'
                        )}>
                          {student.rank}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground font-medium">{student.rank}</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className={cn(
                        'h-8 w-8 border transition-transform group-hover:scale-105',
                        isTop3 ? 'border-primary/20' : 'border-border'
                      )}>
                        <AvatarFallback className={cn(
                          'text-[10px] font-bold',
                          isTop3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          {getInitials(student.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{student.studentName}</p>
                        <p className="text-[10px] text-muted-foreground md:hidden truncate">{student.schoolName}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2.5 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <School className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm truncate max-w-[180px]">{student.schoolName}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2.5">
                    <span className="text-sm font-medium text-eco-blue">{student.quizScore}</span>
                  </TableCell>

                  <TableCell className="text-center py-2.5">
                    <span className="text-sm font-medium text-eco-green">{student.gameScore}</span>
                  </TableCell>

                  <TableCell className="text-center py-2.5">
                    <span className="text-sm font-bold text-eco-orange tabular-nums">{student.totalPoints.toLocaleString()}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground order-2 sm:order-1">
          Hiển thị <span className="font-bold text-foreground">{data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> / <span className="font-bold text-foreground">{totalItems}</span>
        </p>

        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border order-1 sm:order-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-0.5 px-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let startPage = Math.max(1, currentPage - 2);
              if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
              const pageNum = startPage + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-7 h-7 p-0 rounded-md text-xs font-medium',
                    currentPage === pageNum && 'shadow-sm'
                  )}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}