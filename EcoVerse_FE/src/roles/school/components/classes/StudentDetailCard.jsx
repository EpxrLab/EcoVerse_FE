import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Flame,
  Coins,
  Star,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function StudentDetailCard({ student, index, onEdit, onDelete }) {
  const getRankIcon = (idx) => {
    if (idx === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (idx === 1) return <Star className="w-4 h-4 text-slate-400" />;
    if (idx === 2) return <Star className="w-4 h-4 text-amber-700" />;
    return null;
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <Card className={cn(
      "group border-2 transition-all duration-300 hover:shadow-lg overflow-hidden",
      index === 0 ? "border-amber-400/40 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20" :
      index === 1 ? "border-slate-300/40 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-950/20" :
      index === 2 ? "border-amber-600/30 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10" :
      "border-border hover:border-eco-blue/40"
    )}>
      <CardContent className="p-4">
        {/* Header with rank and name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg relative",
              index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/30" :
              index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-400/30" :
              index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-600/30" :
              "bg-eco-green/10 text-eco-green"
            )}>
              {index + 1}
              {getRankIcon(index) && (
                <div className="absolute -top-1 -right-1">
                  {getRankIcon(index)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight">{student.student_name}</h3>
              {student.student_code && (
                <p className="text-xs text-muted-foreground font-mono">{student.student_code}</p>
              )}
            </div>
          </div>
          <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={cn(
            "text-xs",
            student.status === 'active' ? "bg-eco-green/10 text-eco-green border border-eco-green/20" : ""
          )}>
            {student.status === 'active' ? 'Đang học' : student.status === 'transferred' ? 'Đã chuyển' : 'Tạm nghỉ'}
          </Badge>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-muted/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-eco-green" />
            </div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-bold text-foreground">{student.level}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground">Xu</p>
            <p className="font-bold text-foreground">{student.coins}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="font-bold text-foreground">{student.streak}</p>
          </div>
          <div className="text-center">
            <p className={cn(
              "text-lg font-bold",
              student.accuracy >= 85 ? "text-eco-green" : 
              student.accuracy >= 70 ? "text-eco-orange" : "text-destructive"
            )}>
              {student.accuracy}%
            </p>
            <p className="text-xs text-muted-foreground">{student.items_sorted} rác</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-2 text-sm">
          {(student.date_of_birth || student.gender) && (
            <div className="flex items-center gap-4 text-muted-foreground">
              {student.date_of_birth && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(student.date_of_birth)}</span>
                </div>
              )}
              {student.gender && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{getGenderText(student.gender)}</span>
                </div>
              )}
            </div>
          )}

          {/* Parent Info */}
          {(student.parent_name || student.parent_phone || student.parent_email) && (
            <div className="pt-2 mt-2 border-t border-border/50 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phụ huynh</p>
              {student.parent_name && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>{student.parent_name}</span>
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{student.parent_phone}</span>
                </div>
              )}
              {student.parent_email && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{student.parent_email}</span>
                </div>
              )}
            </div>
          )}

          {student.address && (
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{student.address}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-eco-blue hover:bg-eco-blue/10"
            onClick={() => onEdit(student)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Sửa
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa học sinh?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tất cả dữ liệu của "{student.student_name}" sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(student.id)}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}