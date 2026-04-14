import { Card, CardContent } from '@/shared/components/ui/card';
import { FileQuestion, Users, TrendingUp } from 'lucide-react';

export function QuizStats({ stats }) {
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card className="group border-2 border-eco-blue/15 hover:border-eco-blue/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion className="w-6 h-6 text-eco-blue" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalQuizzes || 0}</p>
              <p className="text-sm text-muted-foreground font-medium">Tổng số Quiz</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
