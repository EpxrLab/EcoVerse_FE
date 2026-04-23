import { Card, CardContent } from '@/shared/components/ui/card';
import { Flag, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function CampaignStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      <Card className="group border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flag className="w-6 h-6 text-eco-blue" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground font-medium">Tổng chiến dịch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.scheduledCampaigns || 0}</p>
              <p className="text-sm text-muted-foreground font-medium">Đã lên lịch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-eco-green/20 hover:border-eco-green/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-eco-green" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.activeCampaigns}</p>
              <p className="text-sm text-muted-foreground font-medium">Đang chạy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-eco-blue" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.completedCampaigns}</p>
              <p className="text-sm text-muted-foreground font-medium">Hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.cancelledCampaigns}</p>
              <p className="text-sm text-muted-foreground font-medium">Đã hủy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}