import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, Flag, Plus } from 'lucide-react';
import { usePartnershipCampaigns } from '../../features/campaigns/hooks';
import { CampaignStats, CampaignList, CampaignForm, CampaignDetail } from '../../features/campaigns/components';

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
    handleActivate,
    isCreateOpen,
    handleOpenCreate,
    handleCloseCreate,
    formData,
    updateFormData,
    availableSchools,
    availableQuizzes,
    availableGameLevels,
    handleSubmit,
    handleRevertToDraft,
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
        active={stats.active}
        completed={stats.completed}
        cancelled={stats.cancelled}
      />

      {/* Campaign Tabs */}
      <Tabs defaultValue="active" className="space-y-5">
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
            value="active" 
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue"
          >
            <Clock className="w-4 h-4" />
            Đang diễn ra ({stats.active})
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
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="active">
          <CampaignList 
            campaigns={getCampaignsByStatus('active')} 
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
        availableGameLevels={availableGameLevels}
        onSubmit={handleSubmit}
      />

      {/* Campaign Detail Dialog */}
      <CampaignDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        campaign={selectedCampaign}
        availableQuizzes={availableQuizzes}
        availableGameLevels={availableGameLevels}
      />
    </div>
  );
}