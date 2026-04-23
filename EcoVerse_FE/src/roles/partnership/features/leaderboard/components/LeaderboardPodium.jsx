import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Crown, Medal, School } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const getInitials = (name) => {
  const parts = name.split(' ');
  return parts[parts.length - 1]?.charAt(0).toUpperCase() || '?';
};

const podiumConfig = [
  {
    order: 'order-1 md:order-2 z-10',
    maxW: 'max-w-[300px]',
    avatarSize: 'w-20 h-20',
    textSize: 'text-xl',
    pointsSize: 'text-3xl',
    padding: 'p-6',
    rankBg: 'bg-accent',
    rankText: 'text-accent-foreground',
    accentBorder: 'border-accent/30',
    accentBar: 'bg-accent',
    badgeClass: 'bg-accent/15 text-accent border-accent/25',
    icon: <Crown className="w-5 h-5" />,
    rankNum: 1,
  },
  {
    order: 'order-2 md:order-1',
    maxW: 'max-w-[260px]',
    avatarSize: 'w-16 h-16',
    textSize: 'text-lg',
    pointsSize: 'text-2xl',
    padding: 'p-5',
    rankBg: 'bg-muted',
    rankText: 'text-muted-foreground',
    accentBorder: 'border-border',
    accentBar: 'bg-muted-foreground/50',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    icon: <Medal className="w-4 h-4" />,
    rankNum: 2,
  },
  {
    order: 'order-3',
    maxW: 'max-w-[260px]',
    avatarSize: 'w-16 h-16',
    textSize: 'text-lg',
    pointsSize: 'text-2xl',
    padding: 'p-5',
    rankBg: 'bg-secondary/15',
    rankText: 'text-secondary',
    accentBorder: 'border-secondary/20',
    accentBar: 'bg-secondary',
    badgeClass: 'bg-secondary/15 text-secondary border-secondary/25',
    icon: <Medal className="w-4 h-4" />,
    rankNum: 3,
  },
];

// Reorder: display order in DOM is [1(2nd), 0(1st), 2(3rd)]
const displayOrder = [1, 0, 2];

export function LeaderboardPodium({ top3 }) {
  if (top3.length < 3) return null;

  return (
    <div className="relative py-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-28 bg-primary/10 blur-[80px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 px-4">
        {displayOrder.map((dataIdx) => {
          const student = top3[dataIdx];
          const config = podiumConfig[dataIdx];
          if (!student || !config) return null;

          return (
            <div key={config.rankNum} className={cn('flex-1 w-full', config.maxW, config.order)}>
              <div className={cn(
                'bg-card border rounded-2xl shadow-sm relative overflow-hidden text-center transition-all duration-300 hover:-translate-y-1',
                config.padding, config.accentBorder
              )}>
                {/* Accent bar */}
                <div className={cn('absolute top-0 inset-x-0 h-1', config.accentBar)} />

                {/* Rank badge */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3 border-2 border-background shadow-sm',
                  config.rankBg, config.rankText
                )}>
                  {config.icon}
                </div>

                {/* Avatar */}
                <Avatar className={cn('mx-auto border-2 border-border mb-3', config.avatarSize)}>
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getInitials(student.studentName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <h3 className={cn('font-bold text-foreground line-clamp-1 mb-1', config.textSize)}>
                  {student.studentName}
                </h3>
                <div className="flex items-center justify-center text-xs text-muted-foreground gap-1 mb-3">
                  <School className="w-3 h-3" />
                  <span className="line-clamp-1">{student.schoolName}</span>
                </div>


                <Badge variant="outline" className={cn('font-medium', config.badgeClass)}>
                  {student.level}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}