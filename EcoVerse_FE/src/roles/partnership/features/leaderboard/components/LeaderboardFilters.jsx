import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Flag, Calendar } from 'lucide-react';

export function LeaderboardFilters({
  campaigns,
  rounds,
  selectedCampaignId,
  selectedRoundId,
  onCampaignChange,
  onRoundChange,
}) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FilterItem
          icon={<Flag className="w-5 h-5" />}
          iconClass="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center text-eco-blue shrink-0"
          label="Chiến dịch"
          value={selectedCampaignId}
          onChange={onCampaignChange}
          placeholder="Chọn chiến dịch"
          options={campaigns.map(c => ({ value: c.id, label: c.name }))}
        />
        <FilterItem
          icon={<Calendar className="w-5 h-5" />}
          iconClass="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green shrink-0"
          label="Vòng thi đấu"
          value={selectedRoundId}
          onChange={onRoundChange}
          placeholder="Chọn vòng thi"
          options={rounds.map(r => ({ value: r.id, label: r.name }))}
        />
      </div>
    </div>
  );
}

function FilterItem({
  icon,
  iconClass,
  label,
  value,
  onChange,
  placeholder,
  options,
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className={iconClass}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto text-sm font-bold focus:ring-0 shadow-none truncate">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="font-medium">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}