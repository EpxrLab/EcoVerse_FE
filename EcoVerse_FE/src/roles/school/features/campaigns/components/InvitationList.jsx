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
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Calendar,
  Users,
  Check,
  X,
  Building2,
  Flag,
  MoreVertical,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function InvitationList({
  invitations,
  onAccept,
  onDecline,
  onView,
}) {
  if (invitations.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Không có lời mời nào</h3>
          <p className="text-sm text-muted-foreground">
            Hiện tại trường chưa nhận được lời mời hợp tác nào
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-50/50 hover:bg-purple-50/50">
            <TableHead className="font-bold w-[300px]">Chiến dịch</TableHead>
            <TableHead className="font-bold">Đối tác</TableHead>
            <TableHead className="font-bold">Thời gian</TableHead>
            <TableHead className="text-center font-bold">Hạn nhận</TableHead>
            <TableHead className="text-center font-bold">Giới hạn HS</TableHead>
            <TableHead className="text-right font-bold w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
             // Calculate a mock deadline if not present (e.g., 7 days after creation or 5 days before start)
             const deadline = invitation.invitation_deadline || 
               (invitation.start_date ? new Date(new Date(invitation.start_date).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : null);

             return (
              <TableRow key={invitation.id} className="hover:bg-purple-50/30">
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-purple-900">{invitation.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2" title={invitation.description || ''}>
                      {invitation.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{invitation.partnership_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-green-600" />
                      <span className="text-xs">Bắt đầu: {invitation.start_date ? format(new Date(invitation.start_date), 'HH:mm dd/MM/yyyy', { locale: vi }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="w-3 h-3 text-red-600" />
                      <span className="text-xs">Kết thúc: {invitation.end_date ? format(new Date(invitation.end_date), 'HH:mm dd/MM/yyyy', { locale: vi }) : 'N/A'}</span>
                    </div>
                  </div>
                </TableCell>
                 <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    {deadline ? (
                       <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                         <Clock className="w-3 h-3" />
                         {format(new Date(deadline), 'HH:mm dd/MM', { locale: vi })}
                       </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Users className="w-3 h-3 mr-1" />
                    Max: {invitation.student_limit}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(invitation)}>
                        <div className="flex items-center">
                           {/* Using a standard icon for view detail, maybe Eye or Info. Previous plan mentioned Eye. */}
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                           <span>Chi tiết</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAccept(invitation)} className="text-purple-700 focus:text-purple-800 focus:bg-purple-50">
                        <Check className="mr-2 h-4 w-4" />
                        <span>Chấp nhận</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDecline(invitation)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <X className="mr-2 h-4 w-4" />
                        <span>Từ chối</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}