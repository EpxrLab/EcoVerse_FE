import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Package, Zap, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PRESETS = [
  { id: 1, name: "Preset Cơ bản", gameType: "sorting", difficulty: "Dễ", levels: [
    { levelNumber: 1, itemCount: 15, timeLimitSeconds: 60, lives: null, binTypes: ["plastic", "paper", "organic"] }
  ]},
  { id: 2, name: "Preset Thử thách", gameType: "sorting", difficulty: "Trung bình", levels: [
    { levelNumber: 1, itemCount: 20, timeLimitSeconds: 45, lives: 3, binTypes: ["plastic", "paper"] }
  ]},
  { id: 3, name: "Preset Khởi động", gameType: "runner", difficulty: "Dễ", levels: [
    { levelNumber: 1, itemCount: 10, timeLimitSeconds: 0, lives: null, binTypes: ["organic", "others"] }
  ]},
  { id: 4, name: "Preset Tăng tốc", gameType: "runner", difficulty: "Trung bình", levels: [
    { levelNumber: 1, itemCount: 20, timeLimitSeconds: 45, lives: 3, binTypes: ["plastic", "paper"] },
    { levelNumber: 2, itemCount: 25, timeLimitSeconds: 40, lives: 3, binTypes: ["plastic", "paper", "organic"] }
  ]},
];

const WASTE_ITEMS = [
  { id: 1, image: "🥤", name: "Chai nhựa", category: "plastic" },
  { id: 5, image: "🧃", name: "Hộp sữa", category: "plastic" },
  { id: 2, image: "📄", name: "Giấy A4", category: "paper" },
  { id: 6, image: "📰", name: "Báo cũ", category: "paper" },
  { id: 3, image: "🍎", name: "Vỏ táo", category: "organic" },
  { id: 7, image: "🍌", name: "Vỏ chuối", category: "organic" },
  { id: 4, image: "🥡", name: "Hộp xốp", category: "others" },
  { id: 8, image: "🔋", name: "Pin", category: "others" },
];

const BIN_LABEL = { plastic: "Nhựa", paper: "Giấy", organic: "Hữu cơ", others: "Khác" };
const BIN_COLOR = { plastic: "blue", paper: "green", organic: "amber", others: "gray" };

// ─── Component ────────────────────────────────────────────────────────────────

export function AddGameModal({ isOpen, onClose, campaign, onSubmit }) {
  const [gameType, setGameType] = useState('');
  const [presetId, setPresetId] = useState(null);
  const [selectedWasteIds, setSelectedWasteIds] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      setGameType(campaign?.selected_games?.[0] || '');
      setPresetId(campaign?.game_configs?.presetId || null);
      setSelectedWasteIds(campaign?.waste_item_ids || []);
    }
  }, [isOpen, campaign]);

  const handleGameTypeChange = (type) => {
    setGameType(type);
    setPresetId(null);
    setSelectedWasteIds([]);
  };

  const handlePresetChange = (id) => {
    setPresetId(id);
    setSelectedWasteIds([]);
  };

  const filteredPresets = DEMO_PRESETS.filter(p => p.gameType === gameType);

  const selectedPreset = DEMO_PRESETS.find(p => p.id === presetId);
  const allowedBinTypes = (() => {
    if (!selectedPreset) return [];
    const bins = new Set();
    selectedPreset.levels.forEach(l => (l.binTypes || []).forEach(b => bins.add(b)));
    return [...bins];
  })();

  const availableWaste = WASTE_ITEMS.filter(w => allowedBinTypes.includes(w.category));
  const groupedWaste = allowedBinTypes.map(bin => ({
    bin, label: BIN_LABEL[bin], color: BIN_COLOR[bin],
    items: availableWaste.filter(w => w.category === bin)
  }));

  const toggleWasteItem = (itemId) => {
    setSelectedWasteIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = () => {
    onSubmit(campaign.id, {
      selected_games: gameType ? [gameType] : [],
      game_configs: { presetId },
      waste_item_ids: selectedWasteIds,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-bold">Thêm Game cho chiến dịch</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Step 1: Game Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">1. Chọn Loại Game</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'sorting', icon: <Package className="w-5 h-5" />, label: 'Thu thập & Phân loại', color: 'eco-blue' },
                { value: 'runner', icon: <Zap className="w-5 h-5" />, label: 'Chạy & Phân loại', color: 'eco-green' },
              ].map(({ value, icon, label, color }) => (
                <div
                  key={value}
                  onClick={() => handleGameTypeChange(value)}
                  className={cn(
                    "p-3 rounded-xl border-2 cursor-pointer transition-all",
                    gameType === value
                      ? `bg-${color}/5 border-${color} shadow-sm`
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={gameType === value ? `text-${color}` : "text-muted-foreground"}>{icon}</span>
                    <span className={cn("font-semibold text-sm", gameType === value ? `text-${color}` : "text-foreground")}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Preset */}
          {gameType && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">2. Chọn Preset</Label>
              <div className="flex flex-col gap-2">
                {filteredPresets.map(preset => {
                  const presetBins = new Set();
                  preset.levels.forEach(l => (l.binTypes || []).forEach(b => presetBins.add(b)));
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetChange(preset.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all text-sm",
                        presetId === preset.id ? "bg-green-50 border-green-500 shadow-sm" : "bg-background border-border hover:border-green-300"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={cn("font-semibold", presetId === preset.id ? "text-green-800" : "text-foreground")}>{preset.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{preset.levels.length} Cấp độ • Độ khó: {preset.difficulty}</p>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {[...presetBins].map(bin => (
                              <span key={bin} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-${BIN_COLOR[bin]}-100 text-${BIN_COLOR[bin]}-700`}>
                                {BIN_LABEL[bin]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                          presetId === preset.id ? "border-green-500 bg-green-500" : "border-muted-foreground/30"
                        )}>
                          {presetId === preset.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredPresets.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-lg">Chưa có preset nào</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Waste Items */}
          {presetId && availableWaste.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">3. Chọn rác xuất hiện trong game</Label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedWasteIds(availableWaste.map(i => i.id))} className="text-xs text-eco-blue hover:underline font-medium">Chọn tất cả</button>
                  <span className="text-xs text-muted-foreground">|</span>
                  <button type="button" onClick={() => setSelectedWasteIds([])} className="text-xs text-muted-foreground hover:underline font-medium">Bỏ chọn</button>
                </div>
              </div>
              <div className="space-y-3">
                {groupedWaste.map(group => (
                  <div key={group.bin}>
                    <p className={`text-xs font-bold mb-2 uppercase tracking-wider text-${group.color}-600`}>Thùng {group.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map(item => {
                        const selected = selectedWasteIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleWasteItem(item.id)}
                            className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm",
                              selected ? `bg-${group.color}-50 border-${group.color}-400 shadow-sm` : "bg-background border-border hover:border-muted-foreground/40"
                            )}
                          >
                            <span className="text-xl leading-none">{item.image}</span>
                            <span className={cn("font-medium flex-1", selected ? `text-${group.color}-800` : "text-foreground")}>{item.name}</span>
                            <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                              selected ? `border-${group.color}-500 bg-${group.color}-500` : "border-muted-foreground/30"
                            )}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                Đã chọn <span className="font-bold text-foreground">{selectedWasteIds.length}</span> / {availableWaste.length} loại rác
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 shrink-0">
          <Button variant="ghost" onClick={onClose} className="mr-auto">Hủy</Button>
          <Button onClick={handleSubmit} disabled={!gameType || !presetId} className="bg-eco-blue hover:bg-eco-blue/90 text-white">
            Lưu cấu hình Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
