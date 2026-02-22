import { Card, CardContent } from '@/shared/components/ui/card';
import { FileQuestion, Users, TrendingUp } from 'lucide-react';

export function QuizStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card className="group border-2 border-eco-green/20 hover:border-eco-green/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion className="w-6 h-6 text-eco-green" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalQuizzes}</p>
              <p className="text-sm text-muted-foreground font-medium">Tổng số Quiz</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-eco-blue" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalCompletions}</p>
              <p className="text-sm text-muted-foreground font-medium">Lượt hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group border-2 border-eco-leaf/20 hover:border-eco-leaf/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-leaf/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-eco-leaf" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.avgScore}%</p>
              <p className="text-sm text-muted-foreground font-medium">Điểm trung bình</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}