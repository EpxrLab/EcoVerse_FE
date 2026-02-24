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
} from "@/shared/components/ui/dropdown-menu";
import { Edit, Trash2, Star, Trophy, Layers, MoreHorizontal } from 'lucide-react';

export function LevelList({
  levels,
  onEdit,
  onDelete,
  getDifficultyBadgeColor,
  getBinTypeLabel,
  getBinTypeColor,
}) {
  if (levels.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Layers className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Chưa có cấp độ nào</h3>
          <p className="text-muted-foreground">
            Tạo cấp độ đầu tiên cho loại game này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-bold">Tên cấp độ</TableHead>
            <TableHead className="font-bold">Độ khó</TableHead>
            <TableHead className="font-bold">Loại thùng</TableHead>
            <TableHead className="text-center font-bold">Xu thưởng</TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-eco-blue/10 flex items-center justify-center">
                    {level.difficulty === 'Dễ' && <Star className="w-4 h-4 text-eco-green" />}
                    {level.difficulty === 'Trung bình' && <Layers className="w-4 h-4 text-eco-orange" />}
                    {level.difficulty === 'Khó' && <Trophy className="w-4 h-4 text-destructive" />}
                  </div>
                  <span className="font-medium">{level.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getDifficultyBadgeColor(level.difficulty)} variant="secondary">
                  {level.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {level.binTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={getBinTypeColor(type)}
                    >
                      {getBinTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-semibold text-eco-orange">
                  {level.coinsReward} xu
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(level)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(level.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}