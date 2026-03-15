import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, School, Send, FileQuestion, Gamepad2, Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function CampaignDetail({ isOpen, onClose, campaign, availableQuizzes = [], availableGameLevels = [] }) {
  if (!campaign) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground border-transparent';
      case 'inviting': return 'bg-eco-orange/10 text-eco-orange border-eco-orange/20';
      case 'active': return 'bg-eco-blue/10 text-eco-blue border-eco-blue/20';
      case 'completed': return 'bg-eco-green/10 text-eco-green border-eco-green/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'inviting': return 'Đang mời';
      case 'active': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const schoolStats = {
    total: campaign.school_participations?.length || 0,
    accepted: campaign.school_participations?.filter(s => s.status === 'accepted').length || 0,
    declined: campaign.school_participations?.filter(s => s.status === 'declined').length || 0,
    invited: campaign.school_participations?.filter(s => !s.status || s.status === 'invited').length || 0,
  };

  const selectedQuizzes = availableQuizzes.filter(q => campaign.quiz_ids?.includes(q.id));
  const selectedGameLevels = availableGameLevels.filter(g => campaign.game_level_ids?.includes(g.id));

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
      case 'Dễ':
        return 'bg-eco-green/10 text-eco-green border-eco-green/20';
      case 'medium':
      case 'Trung bình':
        return 'bg-eco-orange/10 text-eco-orange border-eco-orange/20';
      case 'hard':
      case 'Khó':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'TB';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-2xl bg-eco-blue/15 flex items-center justify-center shrink-0">
               {campaign.status === 'inviting' ? (
                 <Send className="w-6 h-6 text-eco-blue" />
               ) : (
                 <Calendar className="w-6 h-6 text-eco-blue" />
               )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                {campaign.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={cn('px-2.5 py-0.5 font-medium', getStatusColor(campaign.status))}>
                   {getStatusLabel(campaign.status)}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  Tạo ngày {new Date(campaign.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Trường tham gia</span>
              <span className="text-3xl font-bold text-eco-blue">{campaign.schools_count}</span>
            </div>
            
            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Tổng học sinh</span>
              <span className="text-3xl font-bold text-eco-green">{campaign.students_count}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">Tỷ lệ tham gia</span>
               <span className="text-3xl font-bold text-eco-orange">
                {campaign.participation_rate !== undefined ? `${campaign.participation_rate}%` : '-'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Description & School List */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-primary" />
                  Mô tả
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                   {campaign.description || "Chưa có mô tả cho chiến dịch này."}
                </p>
              </div>

              {/* Participating Schools Section */}
              {campaign.school_participations && campaign.school_participations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <School className="w-4 h-4 text-primary" />
                    Danh sách trường ({schoolStats.total})
                  </h3>

                  {/* Participation Summary Cards */}
                  <div className="grid grid-cols-4 gap-3">
                     <div className="p-3 rounded-lg bg-muted/50 text-center">
                       <p className="text-2xl font-bold">{schoolStats.total}</p>
                       <p className="text-xs text-muted-foreground">Tổng số</p>
                     </div>
                     <div className="p-3 rounded-lg bg-eco-orange/10 text-center">
                       <p className="text-2xl font-bold text-eco-orange">{schoolStats.invited}</p>
                       <p className="text-xs text-muted-foreground">Đã mời</p>
                     </div>
                     <div className="p-3 rounded-lg bg-eco-green/10 text-center">
                       <p className="text-2xl font-bold text-eco-green">{schoolStats.accepted}</p>
                       <p className="text-xs text-muted-foreground">Đã tham gia</p>
                     </div>
                     <div className="p-3 rounded-lg bg-destructive/10 text-center">
                       <p className="text-2xl font-bold text-destructive">{schoolStats.declined}</p>
                       <p className="text-xs text-muted-foreground">Từ chối</p>
                     </div>
                  </div>
                  
                  {/* Detailed Table */}
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên trường</th>
                          <th className="px-4 py-3 text-center font-medium text-muted-foreground">Học sinh tối đa</th>
                          <th className="px-4 py-3 text-right font-medium text-muted-foreground">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-card">
                        {campaign.school_participations.map((school) => (
                          <tr key={school.school_id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 align-middle font-medium text-foreground">
                              {school.school_name || school.school_id}
                            </td>
                            <td className="px-4 py-3 text-center align-middle text-muted-foreground">
                              {school.student_limit || '-'}
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                              {campaign.status === 'scheduled' ? (
                                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
                                  Chưa gửi
                                </Badge>
                              ) : (
                                <>
                                  {school.status === 'accepted' && (
                                    <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/20">
                                      Đã tham gia
                                    </Badge>
                                  )}
                                  {school.status === 'declined' && (
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                      Từ chối
                                    </Badge>
                                  )}
                                  {(!school.status || school.status === 'invited') && (
                                    <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/20">
                                      Đã mời
                                    </Badge>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Qualifying Rounds Section */}
              {campaign.qualifying_rounds && campaign.qualifying_rounds.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-eco-blue" />
                    Vòng loại ({campaign.qualifying_rounds.length})
                  </h3>
                  <div className="space-y-3">
                    {campaign.qualifying_rounds.map((round, index) => {
                      const roundQuizzes = availableQuizzes.filter(q => round.quiz_ids?.includes(q.id));
                      const roundGameLevels = availableGameLevels.filter(g => round.game_level_ids?.includes(g.id));
                      
                      return (
                        <div key={index} className="border-2 rounded-xl p-4 bg-muted/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-sm">
                                Vòng {round.round_number}
                              </Badge>
                              <span className="font-semibold">{round.round_name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Top {round.advancement_limit} học sinh
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Bắt đầu: {new Date(round.start_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Kết thúc: {new Date(round.end_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>

                          {/* Round Content */}
                          <div className="border-t pt-3 space-y-2">
                            {roundQuizzes.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Quiz ({roundQuizzes.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {roundQuizzes.map(quiz => (
                                    <Badge key={quiz.id} variant="outline" className="text-xs">
                                      {quiz.title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {round.selected_game_type && roundGameLevels.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Game: {round.selected_game_type === 'collection-sorting' ? 'Thu thập & Phân loại' : 'Chạy & Phân loại'} ({roundGameLevels.length})
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {roundGameLevels.map(level => (
                                    <Badge key={level.id} variant="outline" className="text-xs">
                                      {level.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quizzes Section */}
              {selectedQuizzes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-eco-orange" />
                    Quiz đã chọn ({selectedQuizzes.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedQuizzes.map((quiz) => (
                      <div key={quiz.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground">{quiz.question_count} câu hỏi</p>
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                          {getDifficultyLabel(quiz.difficulty)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Levels Section */}
              {campaign.selected_game_type && selectedGameLevels.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-eco-green" />
                    Game: {campaign.selected_game_type === 'collection-sorting' ? 'Thu thập & Phân loại' : 'Chạy & Phân loại'}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedGameLevels.map((level) => (
                      <div key={level.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                        <p className="text-sm font-semibold">{level.name}</p>
                        <Badge variant="outline" className={getDifficultyColor(level.difficulty)}>
                          {level.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reward Images Section */}
              {campaign.reward_image_urls && campaign.reward_image_urls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-eco-orange" />
                    Hình ảnh phần thưởng ({campaign.reward_image_urls.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {campaign.reward_image_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Reward ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Timeline & Meta */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2 border-b pb-2">
                  <Calendar className="w-4 h-4" />
                  Thời gian triển khai
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <span className="font-semibold">{new Date(campaign.start_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Kết thúc:</span>
                    <span className="font-semibold">{new Date(campaign.end_date).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {campaign.invitation_send_date && (
                    <div className="pt-3 mt-3 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Send className="w-3 h-3" /> Ngày gửi mời:
                        </span>
                        <span className="font-semibold text-eco-blue">
                          {new Date(campaign.invitation_send_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}