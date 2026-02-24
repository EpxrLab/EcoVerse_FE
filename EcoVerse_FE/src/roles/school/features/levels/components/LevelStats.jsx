import { Card, CardContent } from '@/shared/components/ui/card';
import { Layers, Trophy, Star, Gamepad2 } from 'lucide-react';

export function LevelStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="group border border-eco-blue/30 hover:border-eco-blue/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-blue/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalLevels}</p>
              <p className="text-xs text-muted-foreground">Tổng cấp độ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-green/30 hover:border-eco-green/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-green/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.easyLevels}</p>
              <p className="text-xs text-muted-foreground">Dễ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-orange/30 hover:border-eco-orange/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-orange/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-eco-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.mediumLevels}</p>
              <p className="text-xs text-muted-foreground">Trung bình</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-destructive/30 hover:border-destructive/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.hardLevels}</p>
              <p className="text-xs text-muted-foreground">Khó</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}