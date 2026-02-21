import { Card, CardContent } from '@/shared/components/ui/card';
import { Layers, GraduationCap, Users, Target } from 'lucide-react';

export function ClassStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="group border border-eco-leaf/30 hover:border-eco-leaf/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-leaf/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-eco-leaf" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalGrades}</p>
              <p className="text-xs text-muted-foreground">Khối</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-green/30 hover:border-eco-green/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-green/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalClasses}</p>
              <p className="text-xs text-muted-foreground">Lớp học</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-blue/30 hover:border-eco-blue/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-blue/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Học sinh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-orange/30 hover:border-eco-orange/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-orange/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-eco-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Độ chính xác</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}