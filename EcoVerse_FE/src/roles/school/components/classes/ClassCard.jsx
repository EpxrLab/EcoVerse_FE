import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
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
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ClassCard({ classItem, compact = false, onSelect, onEdit, onDelete }) {
  const accuracy = classItem.avg_accuracy || 0;

  if (compact) {
    // Compact version for when there are many classes
    return (
      <div 
        className="group flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-eco-blue/40 bg-card cursor-pointer transition-all hover:shadow-md"
        onClick={() => onSelect(classItem)}
      >
        <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-eco-blue/20 to-eco-green/20 flex items-center justify-center border border-eco-blue/20">
          <span className="font-bold text-eco-blue text-sm">{classItem.name}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">Lớp {classItem.name}</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-eco-blue/10 text-eco-blue shrink-0">
              {classItem.students_count || 0} HS
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground truncate">
              {classItem.teacher_name || 'Chưa phân công'}
            </span>
            <span className={cn(
              "text-xs font-semibold shrink-0",
              accuracy >= 85 ? "text-eco-green" : 
              accuracy >= 70 ? "text-eco-orange" : "text-muted-foreground"
            )}>
              {accuracy}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 text-eco-blue hover:bg-eco-blue/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(classItem);
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa lớp học?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tất cả dữ liệu học sinh trong lớp "{classItem.name}" sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(classItem.id)}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-eco-green group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    );
  }

  // Full card version
  return (
    <div 
      className="group border-2 border-border hover:border-eco-blue/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 overflow-hidden rounded-xl bg-card"
      onClick={() => onSelect(classItem)}
    >
      {/* Header gradient */}
      <div className="h-1.5 bg-gradient-to-r from-eco-blue via-eco-green to-eco-leaf" />
      
      <div className="p-3">
        {/* Class info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-eco-blue/20 to-eco-green/20 flex items-center justify-center border border-eco-blue/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-eco-blue">{classItem.name}</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Lớp {classItem.name}</h3>
              <p className="text-xs text-muted-foreground">
                {classItem.teacher_name || 'Chưa phân công'}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-eco-blue/10 text-eco-blue border border-eco-blue/20 text-xs px-2"
          >
            <Users className="w-3 h-3 mr-1" />
            {classItem.students_count || 0}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Độ chính xác</span>
            <span className={cn(
              "font-bold",
              accuracy >= 85 ? "text-eco-green" : 
              accuracy >= 70 ? "text-eco-orange" : "text-destructive"
            )}>
              {accuracy}%
            </span>
          </div>
          <Progress value={accuracy} className="h-1.5" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-eco-blue hover:bg-eco-blue/10"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(classItem);
              }}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa lớp học?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tất cả dữ liệu học sinh trong lớp "{classItem.name}" sẽ bị xóa vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(classItem.id)}
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs text-eco-green hover:bg-eco-green/10 group-hover:translate-x-0.5 transition-transform"
          >
            Xem
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}