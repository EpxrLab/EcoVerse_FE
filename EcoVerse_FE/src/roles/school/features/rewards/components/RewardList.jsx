import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, MoreHorizontal, PackageCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export function RewardList({ rewards, status, onMarkDelivered, onConfirm }) {
  if (status === 'pending') {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-eco-orange/5 hover:bg-eco-orange/5">
            <TableHead className="font-bold">Mã yêu cầu</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Phần thưởng</TableHead>
            <TableHead className="text-center font-bold">Xu</TableHead>
            <TableHead className="font-bold">Hết hạn</TableHead>
            <TableHead className="text-right font-bold w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id} className="hover:bg-eco-orange/3">
              <TableCell className="font-mono text-sm">{reward.id}</TableCell>
              <TableCell>
                <p className="font-semibold">{reward.student}</p>
                {reward.class && <p className="text-xs text-muted-foreground">Lớp {reward.class}</p>}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-eco-blue/8 text-eco-blue border-eco-blue/25">
                  {reward.reward}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-bold text-eco-orange">{reward.coins}</TableCell>
              <TableCell className="text-eco-orange font-medium">{reward.expiresAt}</TableCell>
              <TableCell className="text-right">
                {onMarkDelivered && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onMarkDelivered(reward.id)} className="text-eco-green font-medium">
                        <Check className="mr-2 h-4 w-4" />
                        Đánh dấu đã giao
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (status === 'completed') {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-eco-green/5 hover:bg-eco-green/5">
            <TableHead className="font-bold">Mã yêu cầu</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Phần thưởng</TableHead>
            <TableHead className="text-center font-bold">Xu</TableHead>
            <TableHead className="font-bold">Ngày giao</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id} className="hover:bg-eco-green/3">
              <TableCell className="font-mono text-sm">{reward.id}</TableCell>
              <TableCell><p className="font-semibold">{reward.student}</p></TableCell>
              <TableCell><Badge variant="outline">{reward.reward}</Badge></TableCell>
              <TableCell className="text-center font-bold text-eco-orange">{reward.coins}</TableCell>
              <TableCell>{reward.deliveredAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // cancelled
  if (status === 'cancelled') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Mã yêu cầu</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Phần thưởng</TableHead>
            <TableHead className="text-center font-bold">Xu (Hoàn)</TableHead>
            <TableHead className="font-bold">Lý do</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell className="font-mono text-sm">{reward.id}</TableCell>
              <TableCell><p className="font-semibold">{reward.student}</p></TableCell>
              <TableCell><Badge variant="outline">{reward.reward}</Badge></TableCell>
              <TableCell className="text-center font-bold text-eco-green">+{reward.coins}</TableCell>
              <TableCell><Badge variant="destructive">{reward.reason}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // partnership
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-eco-blue/5 hover:bg-eco-blue/5">
          <TableHead className="font-bold">Mã quà tặng</TableHead>
          <TableHead className="font-bold">Học sinh</TableHead>
          <TableHead className="font-bold">Chiến dịch</TableHead>
          <TableHead className="font-bold">Phần thưởng</TableHead>
          <TableHead className="font-bold text-center">Ngày nhận </TableHead>
          <TableHead className="font-bold text-center">Ngày trao </TableHead>
          <TableHead className="text-center font-bold">Trạng thái</TableHead>
          <TableHead className="text-right font-bold w-[100px]">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.map((reward) => (
          <TableRow key={reward.id} className="hover:bg-eco-blue/3">
            <TableCell className="font-mono text-sm">{reward.id}</TableCell>
            <TableCell>
              <p className="font-semibold">{reward.student}</p>
              <p className="text-xs text-muted-foreground">Lớp {reward.class}</p>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/25">
                {reward.campaignName}
              </Badge>
            </TableCell>
            <TableCell><span className="font-medium">{reward.rewardName}</span></TableCell>

            <TableCell className="text-center text-muted-foreground"> {reward.receivedAt || "-"} </TableCell>
            <TableCell className="text-center font-medium"> {reward.collectedAt || reward.givenAt || "-"} </TableCell>
            
            <TableCell className="text-center">
               {reward.status === 'collected' ? (
                  <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/25">
                    Đã hoàn thành
                  </Badge>
                ) : reward.status === 'given' ? (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/25">
                    Đã trao
                  </Badge>
                ) : reward.status === 'at_school' ? (
                  <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/25">
                    Đã về trường
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/25">
                    Đang vận chuyển
                  </Badge>
                )}
            </TableCell>

            <TableCell className="text-right">
              {reward.status !== 'collected' && reward.status !== 'given' && onConfirm && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    
                    {reward.status === 'shipping' && (
                      <DropdownMenuItem onClick={() => onConfirm(reward.id)} className="text-eco-blue font-medium cursor-pointer">
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Đã nhận về trường
                      </DropdownMenuItem>
                    )}

                    {reward.status === 'at_school' && (
                      <DropdownMenuItem onClick={() => onConfirm(reward.id)} className="text-eco-green font-medium cursor-pointer">
                        <Check className="mr-2 h-4 w-4" />
                        Xác nhận đã trao
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {(reward.status === 'collected' || reward.status === 'given') && (
                 <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-muted-foreground opacity-50">
                    <Check className="h-4 w-4" />
                 </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}