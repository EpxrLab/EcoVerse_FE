import { useMemo } from 'react';

import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Plus, Gamepad2, Recycle, Zap } from "lucide-react";
import { useLevels } from '../../features/levels/hooks/useLevels';
import { useLevelForm } from '../../features/levels/hooks';
import { LevelStats, LevelList, LevelForm } from '../../features/levels/components';

export default function SchoolLevels() {
  const {
    levels,
    isAddLevelOpen,
    setIsAddLevelOpen,
    isEditLevelOpen,
    setIsEditLevelOpen,
    editingLevel,
    handleEditLevel,
    handleDeleteLevel,
    getDifficultyBadgeColor,
    getBinTypeLabel,
    getBinTypeColor,
    stats,
  } = useLevels();

  const {
    formData,
    selectedGameType,
    setSelectedGameType,
    selectedBinTypes,
    updateFormData,
    toggleBinType,
    resetForm,
    loadFormData,
  } = useLevelForm();

  // Filter levels by game type
  const filteredLevels = useMemo(() => {
    return levels.filter(level => level.gameType === selectedGameType);
  }, [levels, selectedGameType]);

  // Get game type label
  const getGameTypeLabel = (type) => {
    return type === 'sorting' ? 'Thu thập & Phân loại' : 'Chạy & Phân loại';
  };

  // Handlers
  const handleCreateLevel = () => {
    // TODO: Implement create level logic
    console.log('Create level:', { ...formData, binTypes: selectedBinTypes });
    resetForm();
    setIsAddLevelOpen(false);
  };

  const handleUpdateLevel = () => {
    if (!editingLevel) return;
    // TODO: Implement update level logic
    console.log('Update level:', editingLevel.id, { ...formData, binTypes: selectedBinTypes });
    resetForm();
    setIsEditLevelOpen(false);
  };

  const openEditDialog = (level) => {
    handleEditLevel(level);
    loadFormData({
      name: level.name,
      difficulty: level.difficulty,
      gameType: level.gameType,
      binTypes: level.binTypes,
      items: level.items,
      passRate: level.passRate,
      coinsReward: level.coinsReward,
      description: level.description,
    });
    setIsEditLevelOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-blue flex items-center justify-center">
            <Gamepad2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Cấp độ Game</h1>
            <p className="text-muted-foreground">Tạo và quản lý cấp độ game cho học sinh</p>
          </div>
        </div>

        {/* Add Level Button */}
        <Button 
            className="bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
            onClick={() => setIsAddLevelOpen(true)}
        >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Cấp độ
        </Button>
        
        <LevelForm
            isOpen={isAddLevelOpen}
            onClose={() => {
                resetForm();
                setIsAddLevelOpen(false);
            }}
            mode="create"
            formData={formData}
            selectedBinTypes={selectedBinTypes}
            onFormChange={updateFormData}
            onBinTypeToggle={toggleBinType}
            onSubmit={handleCreateLevel}
        />

        {/* Edit Dialog - Render LevelForm when editing */}
        {editingLevel && (
            <LevelForm
                isOpen={isEditLevelOpen}
                onClose={() => {
                    resetForm();
                    setIsEditLevelOpen(false);
                }}
                mode="edit"
                formData={formData}
                selectedBinTypes={selectedBinTypes}
                onFormChange={updateFormData}
                onBinTypeToggle={toggleBinType}
                onSubmit={handleUpdateLevel}
            />
        )}
      </div>

      {/* Stats */}
      <LevelStats stats={stats} />

      {/* Game Type Tabs */}
      <Tabs value={selectedGameType} onValueChange={(value) => setSelectedGameType(value)}>
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger 
            value="sorting" 
            className="data-[state=active]:bg-eco-green/15 data-[state=active]:text-eco-green"
          >
            <Recycle className="w-4 h-4 mr-2" />
            Thu thập & Phân loại
          </TabsTrigger>
          <TabsTrigger 
            value="runner"
            className="data-[state=active]:bg-eco-blue/15 data-[state=active]:text-eco-blue"
          >
            <Zap className="w-4 h-4 mr-2" />
            Chạy & Phân loại
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sorting" className="mt-6">
          <LevelList
            levels={filteredLevels}
            onEdit={openEditDialog}
            onDelete={handleDeleteLevel}
            getDifficultyBadgeColor={getDifficultyBadgeColor}
            getBinTypeLabel={getBinTypeLabel}
            getBinTypeColor={getBinTypeColor}
          />
        </TabsContent>

        <TabsContent value="runner" className="mt-6">
          <LevelList
            levels={filteredLevels}
            onEdit={openEditDialog}
            onDelete={handleDeleteLevel}
            getDifficultyBadgeColor={getDifficultyBadgeColor}
            getBinTypeLabel={getBinTypeLabel}
            getBinTypeColor={getBinTypeColor}
          />
        </TabsContent>
      </Tabs>


    </div>
  );
}