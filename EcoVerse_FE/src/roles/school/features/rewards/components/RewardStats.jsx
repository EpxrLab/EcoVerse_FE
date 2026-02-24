import { Card, CardContent } from '@/shared/components/ui/card';
import { Clock, CheckCircle, XCircle, Coins } from 'lucide-react';

export function RewardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-2 border-eco-orange/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-eco-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Đang chờ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-eco-green/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Hết hạn</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-eco-brown/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-brown/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-eco-brown" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.coinsRedeemed.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Xu đã đổi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}