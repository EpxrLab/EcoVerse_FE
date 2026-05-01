import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  History, 
  Gamepad2, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Target, 
  Calendar,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { partnershipCampaignService } from '../../../services/partnershipCampaign.service';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function StudentHistoryModal({ isOpen, onClose, campaignId, roundId, student }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (isOpen && campaignId && roundId && student?.studentId) {
      fetchHistory();
    } else if (!isOpen) {
      setHistory(null);
    }
  }, [isOpen, campaignId, roundId, student]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await partnershipCampaignService.getStudentHistory(campaignId, roundId, student.studentId);
      setHistory(res.data?.data);
    } catch (error) {
      console.error('Failed to fetch student history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Lịch sử hoạt động</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Học sinh: <span className="font-semibold text-foreground">{student?.studentName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Đang tải lịch sử...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="games" className="flex-1 flex flex-col min-h-0">
              <div className="px-6 border-b">
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-2">
                  <TabsTrigger value="games" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Gamepad2 className="w-4 h-4" />
                    Trò chơi
                  </TabsTrigger>
                  <TabsTrigger value="quizzes" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <BookOpen className="w-4 h-4" />
                    Quiz
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="games" className="mt-0 space-y-6 outline-none">
                  {!history?.gameHistories?.length ? (
                    <EmptyState icon={Gamepad2} title="Chưa có dữ liệu trò chơi" description="Học sinh này chưa tham gia trò chơi nào trong vòng thi này." />
                  ) : (
                    history.gameHistories.map((game, gIdx) => (
                      <div key={game.roundGameConfigId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-eco-green/10 flex items-center justify-center">
                            <Gamepad2 className="w-4 h-4 text-eco-green" />
                          </div>
                          <h3 className="font-bold text-base text-foreground">{game.gameTypeName}</h3>
                          <Badge variant="outline" className="ml-auto bg-muted/30">
                            {game.sessions.length} lượt chơi
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {game.sessions.map((session) => (
                            <div key={session.sessionId} className="group p-4 rounded-2xl border bg-card hover:border-eco-green/30 hover:shadow-md transition-all">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                      session.isPassed ? "bg-eco-green/10 text-eco-green" : "bg-destructive/10 text-destructive"
                                    )}>
                                      {session.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                      {session.isPassed ? "Hoàn thành" : "Chưa đạt"}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(session.sessionStart)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6">
                                  <StatItem 
                                    icon={Target} 
                                    label="Chính xác" 
                                    value={`${session.accuracyPercentage}%`} 
                                    subValue={`${session.correctItems}/${session.totalItems}`}
                                    color="text-eco-blue"
                                  />
                                  <StatItem 
                                    icon={Clock} 
                                    label="Thời gian" 
                                    value={`${session.timeTakenSeconds}s`} 
                                    color="text-amber-500"
                                  />
                                  <StatItem 
                                    icon={Gamepad2} 
                                    label="Cấp độ" 
                                    value={session.currentLevel} 
                                    color="text-eco-green"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="quizzes" className="mt-0 space-y-6 outline-none">
                  {!history?.quizHistories?.length ? (
                    <EmptyState icon={BookOpen} title="Chưa có dữ liệu Quiz" description="Học sinh này chưa tham gia làm Quiz nào trong vòng thi này." />
                  ) : (
                    history.quizHistories.map((quiz) => (
                      <div key={quiz.quizId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-eco-blue/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-eco-blue" />
                          </div>
                          <h3 className="font-bold text-base text-foreground">{quiz.quizTitle}</h3>
                          <Badge variant="outline" className="ml-auto bg-muted/30">
                            {quiz.attempts.length} lần làm bài
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {quiz.attempts.map((attempt) => (
                            <div key={attempt.attemptId} className="group p-4 rounded-2xl border bg-card hover:border-eco-blue/30 hover:shadow-md transition-all">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                                      Lần {attempt.attemptNumber}
                                    </Badge>
                                    <span className={cn(
                                      "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                      attempt.isPassed ? "bg-eco-green/10 text-eco-green" : "bg-destructive/10 text-destructive"
                                    )}>
                                      {attempt.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                      {attempt.isPassed ? "Vượt qua" : "Chưa đạt"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Cập nhật: {formatDate(attempt.sessionEnd || new Date())}
                                  </p>
                                </div>

                                <div className="flex items-center gap-8">
                                  <StatItem 
                                    icon={TrendingUp} 
                                    label="Điểm số" 
                                    value={`${attempt.scorePercentage}%`} 
                                    color="text-eco-blue"
                                  />
                                  <StatItem 
                                    icon={Clock} 
                                    label="Thời gian" 
                                    value={`${attempt.timeTakenSeconds}s`} 
                                    color="text-amber-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatItem({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 border", color)}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-sm font-bold text-foreground leading-none">{value}</p>
          {subValue && <span className="text-[10px] text-muted-foreground">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 border-2 border-dashed">
        <Icon className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <h4 className="text-lg font-bold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-[300px]">{description}</p>
    </div>
  );
}
