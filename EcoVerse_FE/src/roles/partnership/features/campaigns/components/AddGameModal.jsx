import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  ChevronRight, ChevronLeft, Loader2, AlertCircle, Check,
  Gamepad2, Zap, RotateCcw, Save, Clock, Package, Shield, Layers
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { partnershipCampaignService } from '../../../services/partnershipCampaign.service';

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Coin thưởng' },
  { id: 2, label: 'Loại game' },
  { id: 3, label: 'Độ khó' },
  { id: 4, label: 'Danh mục rác' },
  { id: 5, label: 'Xem trước' },
];

const DIFFICULTY_META = {
  EASY:   { label: 'Easy',   color: 'text-eco-green',    border: 'border-eco-green',     bg: 'bg-eco-green/5' },
  MEDIUM: { label: 'Medium', color: 'text-eco-green',    border: 'border-eco-green',     bg: 'bg-eco-green/5' },
  HARD:   { label: 'Hard',   color: 'text-emerald-700',  border: 'border-emerald-700',   bg: 'bg-emerald-700/5' },
};

const DEFAULT_COIN = 20;

const WASTE_LABEL = { ORGANIC: 'Hữu cơ', RECYCLABLE: 'Tái chế', GENERAL: 'Chung', HAZARDOUS: 'Nguy hại' };

// ─── Component ────────────────────────────────────────────────────────────────
export function AddGameModal({ isOpen, onClose, campaign, onSubmit }) {
  const [activeRoundTab, setActiveRoundTab] = useState(0);
  const rounds = campaign?.qualifying_rounds || campaign?.rounds || [];
  const existingRound = rounds[activeRoundTab];
  const roundId = existingRound?.id;

  const [step, setStep] = useState(1);
  const [coinPerSession, setCoinPerSession] = useState(DEFAULT_COIN);

  // Step 2 – Game Type
  const [gameTypes, setGameTypes] = useState([]);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState(null);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);

  // Step 3 – Presets (= difficulty selection)
  const [presets, setPresets] = useState([]);       // raw from API
  const [selectedPresetIds, setSelectedPresetIds] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);

  const [subCategoryData, setSubCategoryData] = useState([]); // Raw grouped from API
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState({}); // { presetId: [subCatId1, ...] }
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Holds IDs to apply once sub-categories are loaded (restoration flow)
  const pendingSubCategoryIdsRef = React.useRef({});

  // ── On open & on tab change: load game types, restore config ─────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      pendingSubCategoryIdsRef.current = {};
      setActiveRoundTab(0);
      return;
    }
    setError(null);

    const hasConfig = !!existingRound?.game_type_id || !!existingRound?.gameTypeId;
    const initialGameTypeId = existingRound?.game_type_id || existingRound?.gameTypeId;
    
    if (!hasConfig) {
      setStep(1);
      setCoinPerSession(DEFAULT_COIN);
      setSelectedGameTypeId(null);
      setSelectedPresetIds([]);
      setPresets([]);
      setSelectedSubCategoryIds({});
      pendingSubCategoryIdsRef.current = {};
    } else {
      setStep(1);
      setCoinPerSession(existingRound?.coin_per_session ?? existingRound?.coinPerSession ?? DEFAULT_COIN);
      setSelectedGameTypeId(initialGameTypeId);
      setSelectedPresetIds(existingRound.selected_preset_ids || existingRound.selectedPresetIds || []);

      const configDict = existingRound.preset_sub_category_config || existingRound.presetSubCategoryConfig;
      if (configDict && typeof configDict === 'object' && !Array.isArray(configDict)) {
        pendingSubCategoryIdsRef.current = { ...configDict };
      } else {
        pendingSubCategoryIdsRef.current = {};
      }
    }

    // Only load game types once if not already loaded
    if (gameTypes.length === 0) {
      const load = async () => {
        setLoadingGameTypes(true);
        try {
          const res = await partnershipCampaignService.getGameTypes();
          setGameTypes(res.data?.data || []);
        } catch {
          setError('Không thể tải danh sách game');
        } finally {
          setLoadingGameTypes(false);
        }
      };
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeRoundTab, campaign]);

  // ── Load presets when game type changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedGameTypeId) { setPresets([]); return; }
    setLoadingPresets(true);
    (async () => {
      try {
        const res = await partnershipCampaignService.getGameTypePresets(selectedGameTypeId);
        setPresets(res.data?.data || []);
      } catch {
        setError('Không thể tải preset');
      } finally {
        setLoadingPresets(false);
      }
    })();
  }, [selectedGameTypeId]);

  // ── Load sub-categories when presets change ───────────────────────────────
  useEffect(() => {
    if (selectedPresetIds.length === 0 || !roundId) { setSubCategoryData([]); return; }
    setLoadingSubCategories(true);
    (async () => {
      try {
        const res = await partnershipCampaignService.getAvailableSubCategories(roundId, selectedGameTypeId, selectedPresetIds);
        const rawData = res.data?.data || res.data || [];
        setSubCategoryData(rawData);
        // If we have pending IDs to restore (from a previous config), apply them now
        if (Object.keys(pendingSubCategoryIdsRef.current).length > 0) {
          setSelectedSubCategoryIds(pendingSubCategoryIdsRef.current);
          pendingSubCategoryIdsRef.current = {};
        }
      } catch {
        setError('Không thể tải danh mục rác');
      } finally {
        setLoadingSubCategories(false);
      }
    })();
  }, [selectedPresetIds, roundId, selectedGameTypeId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedGameType = gameTypes.find(g => g.id === selectedGameTypeId);
  
  const canGoNext = { 
    1: true, 
    2: !!selectedGameTypeId, 
    3: selectedPresetIds.length > 0, 
    4: selectedPresetIds.every(id => selectedSubCategoryIds[id]?.length > 0)
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleStepClick = (s) => { if (s <= step) setStep(s); };

  const togglePreset = (id) => {
    setSelectedPresetIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    // Clear pending restoration
    pendingSubCategoryIdsRef.current = {};
    
    // Also clean up selectedSubCategoryIds if a preset is removed
    setSelectedSubCategoryIds(prev => {
      if (prev[id]) {
        const newObj = { ...prev };
        delete newObj[id];
        return newObj;
      }
      return prev;
    });
  };

  const toggleSubCategory = (presetId, subCatId) => {
    setSelectedSubCategoryIds(prev => {
      const current = prev[presetId] || [];
      return {
        ...prev,
        [presetId]: current.includes(subCatId) 
          ? current.filter(i => i !== subCatId) 
          : [...current, subCatId]
      };
    });
  };

  const handleSubmit = async () => {
    if (!roundId) { setError('Không tìm thấy vòng chơi Mẫu'); return; }
    
    // Map selected SubCategory IDs to each preset's config
    const payload = {
      gameTypeId: selectedGameTypeId,
      difficultyOverride: null, 
      selectedPresetIds: selectedPresetIds,
      presetSubCategoryConfigs: selectedPresetIds.map(presetId => {
        const presetData = subCategoryData.find(d => d.presetId === presetId);
        const availableForThisPreset = (presetData?.availableSubCategories || []).map(sc => sc.id);
        const userSelected = selectedSubCategoryIds[presetId] || [];
        return {
          presetId: presetId,
          selectedSubCategoryIds: userSelected.filter(id => availableForThisPreset.includes(id))
        };
      }),
      coinPerSession: Number(coinPerSession) || 0,
    };

    setIsSubmitting(true);
    try {
      await partnershipCampaignService.saveGameConfig(roundId, payload);
      onSubmit && onSubmit(campaign.id, [payload]); // Refresh campaign
      onClose();
    } catch {
      setError('Không thể lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col overflow-hidden p-0 gap-0" style={{ height: '90vh', maxHeight: 680 }}>
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Gamepad2 className="w-5 h-5 text-eco-green" />
            Thêm Game vào Vòng Loại
            {campaign?.name && <span className="font-normal text-muted-foreground text-sm">— {campaign.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Round Tabs */}
        {rounds.length > 0 && (
          <div className="flex border-b mx-6 mt-4 shrink-0 overflow-x-auto no-scrollbar scroller-hide pt-2">
            {rounds.map((round, idx) => {
              const active = activeRoundTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveRoundTab(idx)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 text-sm font-bold border-b-2 -mb-px transition-colors whitespace-nowrap rounded-t-lg",
                    active ? "border-eco-green text-eco-green bg-eco-green/5" : "border-transparent text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  <Gamepad2 className="w-4 h-4" />
                  {round.roundName || round.round_name}
                </button>
              );
            })}
          </div>
        )}

        {/* Step Tabs */}
        <div className="flex border-b mx-6 mt-2 shrink-0 overflow-x-auto no-scrollbar scroller-hide">
          {STEPS.map(s => {
            const done   = step > s.id;
            const active = step === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                  active ? "border-eco-green text-eco-green" : "border-transparent",
                  done ? "text-eco-green cursor-pointer" : !active ? "text-muted-foreground cursor-default" : ""
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold shrink-0",
                  active ? "bg-eco-green text-white" : done ? "bg-eco-green/20 text-eco-green" : "bg-muted text-muted-foreground"
                )}>
                  {done ? <Check className="w-3 h-3" /> : s.id}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0 no-scrollbar">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* ── Step 1: Coin thưởng ─────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <SectionLabel>COIN THƯỞNG KHI HOÀN THÀNH GAME</SectionLabel>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      type="number" min={0}
                      value={coinPerSession}
                      onChange={e => setCoinPerSession(e.target.value)}
                      className="pr-28 text-lg font-semibold h-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">coin / session</span>
                  </div>
                  <Button variant="secondary" onClick={() => setCoinPerSession(DEFAULT_COIN)} className="h-12 shrink-0">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Dùng mặc định hệ thống
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2: Loại game ───────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <SectionLabel>LOẠI GAME</SectionLabel>
                {loadingGameTypes ? <LoadingCard /> : (
                  <div className="space-y-2">
                    {gameTypes.map(gt => {
                      const sel = selectedGameTypeId === gt.id;
                      return (
                        <div key={gt.id} onClick={() => { setSelectedGameTypeId(gt.id); setSelectedPresetIds([]); setSelectedSubCategoryIds({}); }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            sel ? "border-eco-green bg-eco-green/5 shadow-sm" : "border-border hover:border-eco-green/30"
                          )}>
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", sel ? "bg-eco-green/20" : "bg-muted")}>
                            {gt.iconPresignedUrl || gt.iconUrl
                              ? <img src={gt.iconPresignedUrl || gt.iconUrl} alt={gt.name} className="w-8 h-8 object-contain" />
                              : <Zap className={cn("w-6 h-6", sel ? "text-eco-green" : "text-muted-foreground")} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-semibold text-base", sel ? "text-eco-green" : "")}>{gt.name || gt.typeName}</p>
                            {gt.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{gt.description}</p>}
                          </div>
                          {sel && <div className="w-6 h-6 rounded-full bg-eco-green flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>}
                        </div>
                      );
                    })}
                    {!loadingGameTypes && gameTypes.length === 0 && <EmptyCard message="Không có loại game nào" />}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Độ khó (= chọn presets) ────────────── */}
            {step === 3 && (
              <div className="space-y-4">
                <SectionLabel>ĐỘ KHÓ</SectionLabel>
                {loadingPresets ? <LoadingCard /> : (
                  <div className="space-y-3">
                    {presets.map(preset => {
                      const meta = DIFFICULTY_META[preset.difficulty] || DIFFICULTY_META.MEDIUM;
                      const sel  = selectedPresetIds.includes(preset.id);
                      const lvls = preset.items || [];
                      const maxItems = Math.max(...lvls.map(l => l.itemCount), 0);
                      const minTime  = Math.min(...lvls.map(l => l.timeLimitSeconds), 999);

                      return (
                        <div key={preset.id} onClick={() => togglePreset(preset.id)}
                          className={cn(
                            "rounded-xl border-2 cursor-pointer transition-all overflow-hidden",
                            sel ? `${meta.border} ${meta.bg} shadow-sm` : "border-border hover:border-muted-foreground/40"
                          )}>
                          <div className="flex items-center justify-between px-4 pt-3 pb-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("font-bold text-base", sel ? meta.color : "")}>{meta.label}</span>
                                </div>
                              </div>
                            </div>
                            {sel && <div className="w-6 h-6 rounded-full bg-eco-green flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>}
                          </div>
                          <div className="grid grid-cols-3 divide-x border-t mx-0 text-center py-2 px-0 bg-background/50 text-xs">
                            <div className="px-3"><p className="font-bold flex items-center justify-center gap-1"><Package className="w-3.5 h-3.5" />{maxItems}</p><p className="text-[10px] text-muted-foreground">vật phẩm</p></div>
                            <div className="px-3"><p className="font-bold flex items-center justify-center gap-1"><Clock className="w-3.5 h-3.5" />{minTime === 999 ? 0 : minTime}s</p><p className="text-[10px] text-muted-foreground">thời gian</p></div>
                            <div className="px-3"><p className="font-bold flex items-center justify-center gap-1"><Shield className="w-3.5 h-3.5" />{lvls.length}</p><p className="text-[10px] text-muted-foreground">level</p></div>
                          </div>
                        </div>
                      );
                    })}
                    {!loadingPresets && presets.length === 0 && <EmptyCard message="Không có preset nào cho loại game này" />}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <SectionLabel>DANH MỤC RÁC SỬ DỤNG CHO TỪNG ĐỘ KHÓ</SectionLabel>
                {loadingSubCategories ? <LoadingCard /> : (
                  <div className="space-y-8">
                    {selectedPresetIds.map(presetId => {
                      const pData = subCategoryData.find(d => d.presetId === presetId);
                      const pMeta = presets.find(p => p.id === presetId);
                      const diffMeta = DIFFICULTY_META[pMeta?.difficulty] || DIFFICULTY_META.MEDIUM;
                      const availableSc = pData?.availableSubCategories || [];
                      const selectedCount = (selectedSubCategoryIds[presetId] || []).length;

                      return (
                        <div key={presetId} className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b">
                            <h3 className={cn("font-bold text-sm uppercase tracking-wider flex items-center gap-2", diffMeta.color)}>
                              CẤU HÌNH <Badge variant="outline" className={cn(diffMeta.color, diffMeta.border, diffMeta.bg)}>{diffMeta.label}</Badge>
                            </h3>
                            <span className="text-xs text-muted-foreground font-medium">
                              Đã chọn <span className={cn(selectedCount > 0 ? "text-eco-green font-bold" : "text-destructive font-bold")}>{selectedCount}</span>/{availableSc.length}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {availableSc.map(sc => {
                              const isSelected = (selectedSubCategoryIds[presetId] || []).includes(sc.id);
                              return (
                                <div key={sc.id} onClick={() => toggleSubCategory(presetId, sc.id)}
                                  className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center relative",
                                    isSelected ? "border-eco-green bg-eco-green/5 shadow-sm" : "border-border hover:border-eco-green/30"
                                  )}>
                                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", isSelected ? "bg-eco-green/20" : "bg-muted")}>
                                    {sc.iconPresignedUrl || sc.iconUrl
                                      ? <img src={sc.iconPresignedUrl || sc.iconUrl} alt={sc.displayName} className="w-9 h-9 object-contain" />
                                      : <Layers className={cn("w-7 h-7", isSelected ? "text-eco-green" : "text-muted-foreground")} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={cn("font-bold text-sm", isSelected ? "text-eco-green" : "")}>{sc.displayName}</p>
                                    <Badge variant="outline" className="text-[10px] uppercase mt-1">
                                      {WASTE_LABEL[sc.category] || sc.category}
                                    </Badge>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-eco-green flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {!loadingSubCategories && availableSc.length === 0 && (
                              <div className="col-span-2"><EmptyCard message={`Không có rác nào khả dụng cho chế độ ${pMeta?.difficulty}`} /></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!loadingSubCategories && selectedPresetIds.length === 0 && <EmptyCard message="Bạn chưa chọn độ khó nào" />}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5: Xem trước ──────────────────────────── */}
            {step === 5 && (
              <div className="space-y-4">
                <SectionLabel>XÁC NHẬN CẤU HÌNH GAME</SectionLabel>
                <div className="border-2 border-muted/30 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      {selectedGameType?.iconPresignedUrl || selectedGameType?.iconUrl
                        ? <img src={selectedGameType.iconPresignedUrl || selectedGameType.iconUrl} alt="" className="w-7 h-7 object-contain" />
                        : <Gamepad2 className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedGameType?.name || selectedGameType?.typeName || '—'}</p>
                      <p className="text-sm text-muted-foreground flex gap-1.5 flex-wrap">
                        {selectedPresetIds.map(id => {
                          const p = presets.find(pr => pr.id === id);
                          return <span key={id} className="text-eco-green">#{p?.difficulty}</span>;
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-b space-y-3">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cấu hình Độ khó & Rác</p>
                      <div className="space-y-3">
                        {selectedPresetIds.map(id => {
                          const p = presets.find(pr => pr.id === id);
                          const lvls = p?.items || [];
                          const pData = subCategoryData.find(d => d.presetId === id);
                          const availableSc = pData?.availableSubCategories || [];
                          const userSelected = selectedSubCategoryIds[id] || [];
                          
                          return (
                            <div key={id} className="p-3 bg-muted/20 rounded-lg">
                              <p className="font-bold text-xs text-muted-foreground flex justify-between uppercase border-b border-muted/50 pb-2 mb-2">
                                <span>{p?.difficulty} PRESET</span>
                                <span>{lvls.length} LEVELS</span>
                              </p>
                              
                              <div className="mb-3">
                                <p className="text-[10px] text-muted-foreground mb-1.5 uppercase font-medium">Danh mục rác:</p>
                                <div className="flex flex-wrap gap-1">
                                  {userSelected.length > 0 ? userSelected.map(scId => {
                                    const sc = availableSc.find(s => s.id === scId);
                                    return <Badge key={scId} variant="outline" className="bg-background text-[10px] py-0">{sc?.displayName || scId}</Badge>;
                                  }) : <span className="text-[10px] text-destructive">Chưa chọn</span>}
                                </div>
                              </div>
                              {lvls.slice(0, 3).map(lvl => (
                                <div key={lvl.id} className="flex items-center justify-between text-[11px] py-1 border-b last:border-0 border-dashed border-muted/50">
                                  <span>Level {lvl.levelNumber}</span>
                                  <div className="flex items-center gap-3 text-muted-foreground">
                                    <span>{lvl.itemCount} rác</span>
                                    <span>{lvl.timeLimitSeconds}s</span>
                                  </div>
                                </div>
                              ))}
                              {lvls.length > 3 && <p className="text-[10px] text-muted-foreground mt-1 italic">... và {lvls.length - 3} level khác</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 text-center bg-eco-orange/10">
                    <p className="text-2xl font-bold text-eco-orange">{coinPerSession}</p>
                    <p className="text-xs text-muted-foreground">Coin / session</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center bg-background shrink-0">
          {step > 1
            ? <Button variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4 mr-1" /> Quay lại</Button>
            : <Button variant="ghost" onClick={onClose}>Hủy</Button>
          }
          {step < 5 ? (
            <Button onClick={handleNext} disabled={!canGoNext[step]} className="bg-eco-green hover:bg-eco-green/90 text-white">
              Tiếp theo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-eco-green hover:bg-eco-green/90 text-white">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</> : <><Save className="w-4 h-4 mr-2" /> Lưu cấu hình ✓</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}
function LoadingCard() {
  return <div className="flex items-center justify-center py-10 text-muted-foreground gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải...</span></div>;
}
function EmptyCard({ message }) {
  return <p className="text-sm text-muted-foreground italic text-center py-6 bg-muted/20 rounded-lg">{message}</p>;
}
