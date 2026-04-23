import { Card, CardContent } from '@/shared/components/ui/card';
import { Layers, GraduationCap, Users } from 'lucide-react';

export function ClassStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card className="group border border-eco-green/30 hover:border-eco-green/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-green/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalGrades}</p>
              <p className="text-sm text-muted-foreground font-medium">Khối</p>
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
              <p className="text-3xl font-bold text-foreground">{stats.totalClasses}</p>
              <p className="text-sm text-muted-foreground font-medium">Lớp học</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border border-eco-green/30 hover:border-eco-green/50 transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-eco-green/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground font-medium">Học sinh</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}