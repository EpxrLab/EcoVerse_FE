import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { FileText, Clock, CheckCircle, XCircle, Flag, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePartnershipCampaigns } from '../../features/campaigns/hooks';
import { CampaignStats, CampaignList, CampaignForm, CampaignDetail, AddGameModal, AddQuizModal } from '../../features/campaigns/components';

export default function PartnershipCampaigns() {
  const {
    stats,
    getCampaignsByStatus,
    selectedCampaign,
    isDetailOpen,
    handleViewDetail,
    handleCloseDetail,
    handleEdit,
    handleDelete,
    handleCancel,
    handleActivate,
    isCreateOpen,
    handleOpenCreate,
    handleCloseCreate,
    formData,
    updateFormData,
    availableSchools,
    availableQuizzes,
    setAvailableQuizzes,
    availableGameLevels,
    handleSubmit,
    handleRevertToDraft,
    isEditing,

    isAddGameOpen,
    isAddQuizOpen,
    selectedCampaignForConfig,
    handleOpenAddGame,
    handleCloseAddGame,
    handleOpenAddQuiz,
    handleCloseAddQuiz,
    handleAddGameSubmit,
    handleAddQuizSubmit,

    confirmConfig,
    setConfirmConfig,
  } = usePartnershipCampaigns();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-blue flex items-center justify-center">
            <Flag className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý chiến dịch</h1>
            <p className="text-muted-foreground">Theo dõi và quản lý các chiến dịch môi trường</p>
          </div>
        </div>
        <Button 
          className="bg-eco-blue hover:bg-eco-blue/90 text-primary-foreground font-semibold"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo chiến dịch
        </Button>
      </div>

      {/* Stats */}
      <CampaignStats
        draft={stats.draft}
        scheduled={stats.scheduled}
        inviting={stats.inviting}
        active={stats.on_going}
        completed={stats.completed}
        cancelled={stats.cancelled}
      />

      {/* Campaign Tabs */}
      <Tabs defaultValue="on_going" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-blue/15">
          <TabsTrigger 
            value="draft" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-muted-foreground"
          >
            <FileText className="w-4 h-4" />
            Nháp ({stats.draft})
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-purple-500"
          >
            <Clock className="w-4 h-4" />
            Đã lên lịch ({stats.scheduled})
          </TabsTrigger>
          <TabsTrigger 
            value="inviting" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-orange"
          >
            <Clock className="w-4 h-4" />
            Đang mời ({stats.inviting})
          </TabsTrigger>
          <TabsTrigger 
            value="on_going" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue"
          >
            <Clock className="w-4 h-4" />
            Đang diễn ra ({stats.on_going})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green"
          >
            <CheckCircle className="w-4 h-4" />
            Hoàn thành ({stats.completed})
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive"
          >
            <XCircle className="w-4 h-4" />
            Đã hủy ({stats.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft">
          <CampaignList 
            campaigns={getCampaignsByStatus('draft')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
            onAddGame={handleOpenAddGame}
            onAddQuiz={handleOpenAddQuiz}
          />
        </TabsContent>

        <TabsContent value="scheduled">
          <CampaignList 
            campaigns={getCampaignsByStatus('scheduled')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
            onRevertToDraft={handleRevertToDraft}
          />
        </TabsContent>

        <TabsContent value="inviting">
          <CampaignList 
            campaigns={getCampaignsByStatus('inviting')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="on_going">
          <CampaignList 
            campaigns={getCampaignsByStatus('on_going')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="completed">
          <CampaignList 
            campaigns={getCampaignsByStatus('completed')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="cancelled">
          <CampaignList 
            campaigns={getCampaignsByStatus('cancelled')} 
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <CampaignForm
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        formData={formData}
        onFormChange={updateFormData}
        availableSchools={availableSchools}
        availableQuizzes={availableQuizzes}
        setAvailableQuizzes={setAvailableQuizzes}
        availableGameLevels={availableGameLevels}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />

      <AddGameModal
        isOpen={isAddGameOpen}
        onClose={handleCloseAddGame}
        campaign={selectedCampaignForConfig}
        onSubmit={handleAddGameSubmit}
      />

      <AddQuizModal
        isOpen={isAddQuizOpen}
        onClose={handleCloseAddQuiz}
        campaign={selectedCampaignForConfig}
        availableQuizzes={availableQuizzes}
        setAvailableQuizzes={setAvailableQuizzes}
        onSubmit={handleAddQuizSubmit}
      />

      {/* Campaign Detail Dialog */}
      <CampaignDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        campaign={selectedCampaign}
        availableQuizzes={availableQuizzes}
        availableGameLevels={availableGameLevels}
      />

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmConfig.isOpen} 
        onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(
              "text-xl font-bold",
              confirmConfig.variant === 'destructive' ? "text-destructive" : 
              confirmConfig.variant === 'eco-blue' ? "text-eco-blue" :
              confirmConfig.variant === 'eco-orange' ? "text-eco-orange" : "text-foreground"
            )}>
              {confirmConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {confirmConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 border-none font-medium">Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmConfig.onConfirm}
              className={cn(
                "text-white font-bold px-6",
                confirmConfig.variant === 'destructive' ? "bg-destructive hover:bg-destructive/90" : 
                confirmConfig.variant === 'eco-blue' ? "bg-eco-blue hover:bg-eco-blue/90" :
                confirmConfig.variant === 'eco-orange' ? "bg-eco-orange hover:bg-eco-orange/90" : "bg-primary"
              )}
            >
              {confirmConfig.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}