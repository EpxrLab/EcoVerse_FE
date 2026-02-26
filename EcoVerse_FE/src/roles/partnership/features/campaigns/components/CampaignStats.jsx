import { Card, CardContent } from '@/shared/components/ui/card';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export function CampaignStats({ draft, scheduled, inviting, active, completed, cancelled }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <Card className="border-2 border-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{draft}</p>
              <p className="text-sm text-muted-foreground">Nháp</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{scheduled}</p>
              <p className="text-sm text-muted-foreground">Đã lên lịch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-eco-orange/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-eco-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inviting}</p>
              <p className="text-sm text-muted-foreground">Đang mời</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-eco-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{active}</p>
              <p className="text-sm text-muted-foreground">Đang diễn ra</p>
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
              <p className="text-2xl font-bold text-foreground">{completed}</p>
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
              <p className="text-2xl font-bold text-foreground">{cancelled}</p>
              <p className="text-sm text-muted-foreground">Đã hủy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}