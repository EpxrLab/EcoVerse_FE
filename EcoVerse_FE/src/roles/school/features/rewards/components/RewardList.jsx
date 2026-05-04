import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, MoreHorizontal, PackageCheck, XCircle, Clock, Gift } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";

export function RewardList({ rewards, status, onConfirm, onApprove, onReject, onDeliver, onViewLogs }) {
  if (status === 'pending') {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-eco-orange/5 hover:bg-eco-orange/5">
            <TableHead className="font-bold">Mã yêu cầu</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Phần thưởng</TableHead>
            <TableHead className="text-center font-bold">Xu</TableHead>
            <TableHead className="text-center font-bold">Trạng thái</TableHead>
            <TableHead className="font-bold">Ngày yêu cầu</TableHead>
            <TableHead className="text-right font-bold w-[60px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id} className="hover:bg-eco-orange/3">
              <TableCell className="font-mono text-sm">{reward.requestCode || reward.id}</TableCell>
              <TableCell>
                <p className="font-semibold">{reward.student}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {reward.imagePresignedUrl && (
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                      <img src={reward.imagePresignedUrl} alt={reward.reward} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Badge variant="outline" className="bg-eco-blue/8 text-eco-blue border-eco-blue/25">
                    {reward.reward}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-center font-bold text-eco-orange">{reward.coins}</TableCell>
              <TableCell className="text-center">
                {reward.rawStatus === 'PENDING' ? (
                  <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/25">
                    Chờ duyệt
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/25">
                    Đã duyệt
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{reward.requestDate}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    {reward.rawStatus === 'PENDING' && (
                      <>
                        {onApprove && (
                          <DropdownMenuItem onClick={() => onApprove(reward.id)} className="text-eco-green font-medium cursor-pointer">
                            <Check className="mr-2 h-4 w-4" />
                            Duyệt yêu cầu
                          </DropdownMenuItem>
                        )}
                        {onReject && (
                          <DropdownMenuItem onClick={() => onReject(reward.id)} className="text-destructive font-medium cursor-pointer">
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối yêu cầu
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {reward.rawStatus === 'APPROVED' && onDeliver && (
                      <DropdownMenuItem onClick={() => onDeliver(reward.id)} className="text-eco-blue font-medium cursor-pointer">
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Đánh dấu đã giao
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onViewLogs(reward)} className="font-medium cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      Xem lịch sử
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <TableHead className="font-bold">Ngày xác nhận</TableHead>
            <TableHead className="text-center font-bold">Ảnh xác nhận</TableHead>
            <TableHead className="text-center font-bold">Phụ huynh xác nhận</TableHead>
            <TableHead className="text-right font-bold w-[60px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id} className="hover:bg-eco-green/3">
              <TableCell className="font-mono text-sm">{reward.requestCode || reward.id}</TableCell>
              <TableCell><p className="font-semibold">{reward.student}</p></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {reward.imagePresignedUrl && (
                    <div className="w-7 h-7 rounded overflow-hidden bg-muted flex-shrink-0 border">
                      <img src={reward.imagePresignedUrl} alt={reward.reward} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Badge variant="outline">{reward.reward}</Badge>
                </div>
              </TableCell>
              <TableCell className="text-center font-bold text-eco-orange">{reward.coins}</TableCell>
              <TableCell>{reward.deliveredAt}</TableCell>
              <TableCell>{reward.confirmedAt || "-"}</TableCell>
              <TableCell className="text-center">
                {reward.deliveryImagePresignedUrl ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="w-10 h-10 rounded border overflow-hidden mx-auto cursor-pointer hover:opacity-80 transition-opacity">
                        <img src={reward.deliveryImagePresignedUrl} alt="Delivery" className="w-full h-full object-cover" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Ảnh giao quà</DialogTitle>
                      </DialogHeader>
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        <img src={reward.deliveryImagePresignedUrl} alt="Delivery confirmation" className="w-full h-auto" />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-muted-foreground text-xs italic">Chưa có</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {reward.rawStatus === 'CONFIRMED' ? (
                  <Badge className="bg-eco-green hover:bg-eco-green text-white border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Đã xác nhận
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-muted-foreground/20">
                    Chờ xác nhận
                  </Badge>
                )}
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
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewLogs(reward)} className="font-medium cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      Xem lịch sử
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
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
            <TableHead className="font-bold">Ngày hủy</TableHead>
            <TableHead className="font-bold">Lý do</TableHead>
            <TableHead className="text-right font-bold w-[60px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell className="font-mono text-sm">{reward.requestCode || reward.id}</TableCell>
              <TableCell><p className="font-semibold">{reward.student}</p></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {reward.imagePresignedUrl && (
                    <div className="w-7 h-7 rounded overflow-hidden bg-muted flex-shrink-0 border">
                      <img src={reward.imagePresignedUrl} alt={reward.reward} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Badge variant="outline">{reward.reward}</Badge>
                </div>
              </TableCell>
              <TableCell className="text-center font-bold text-eco-green">+{reward.coins}</TableCell>
              <TableCell className="text-muted-foreground">{reward.cancelledDate || reward.requestDate}</TableCell>
              <TableCell><Badge variant="destructive">{reward.reason}</Badge></TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewLogs(reward)} className="font-medium cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      Xem lịch sử
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
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
          <TableHead className="font-bold">Học sinh</TableHead>
          <TableHead className="font-bold">Chiến dịch</TableHead>
          <TableHead className="font-bold">Phần thưởng</TableHead>
          <TableHead className="font-bold text-center">Ngày nhận </TableHead>
          <TableHead className="font-bold text-center">Ngày trao </TableHead>
          <TableHead className="text-center font-bold">Ảnh xác nhận</TableHead>
          <TableHead className="text-center font-bold">Trạng thái</TableHead>
          <TableHead className="text-right font-bold w-[100px]">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.map((reward) => (
          <TableRow key={reward.id} className="hover:bg-eco-blue/3">
            <TableCell>
              <p className="font-semibold">{reward.student}</p>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/25">
                {reward.campaignName}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                {reward.rewardImagePresignedUrl || reward.rewardImageUrl ? (
                  <div className="w-10 h-10 rounded-md border overflow-hidden flex-shrink-0">
                    <img 
                      src={reward.rewardImagePresignedUrl || reward.rewardImageUrl} 
                      alt={reward.rewardName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md border flex items-center justify-center bg-muted/20 flex-shrink-0">
                    <Gift className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
                <span className="font-medium">{reward.rewardName}</span>
              </div>
            </TableCell>

            <TableCell className="text-center text-muted-foreground"> {reward.receivedAt || "-"} </TableCell>
            <TableCell className="text-center font-medium"> {reward.collectedAt || reward.givenAt || "-"} </TableCell>
            
            <TableCell className="text-center">
              {reward.deliveryImagePresignedUrl || reward.deliveryImageUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="w-10 h-10 rounded border overflow-hidden mx-auto cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center bg-muted/20">
                      <img src={reward.deliveryImagePresignedUrl || reward.deliveryImageUrl} alt="Delivery" className="w-full h-full object-cover" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Ảnh xác nhận trao quà</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 rounded-xl overflow-hidden border-2 shadow-sm bg-muted/10">
                      <img src={reward.deliveryImagePresignedUrl || reward.deliveryImageUrl} alt="Delivery confirmation" className="w-full h-auto" />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <span className="text-muted-foreground text-xs italic">Chưa có</span>
              )}
            </TableCell>

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
                ) : reward.status === 'shipping' ? (
                  <Badge variant="outline" className="bg-blue-400/10 text-blue-500 border-blue-400/25">
                    Đang vận chuyển
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/25">
                    Chờ đối tác gửi
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
                      <DropdownMenuItem onClick={() => onConfirm(reward.id, 'shipping')} className="text-eco-blue font-medium cursor-pointer">
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Đã nhận về trường
                      </DropdownMenuItem>
                    )}

                    {reward.status === 'at_school' && (
                      <DropdownMenuItem onClick={() => onConfirm(reward.id, 'at_school')} className="text-eco-green font-medium cursor-pointer">
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