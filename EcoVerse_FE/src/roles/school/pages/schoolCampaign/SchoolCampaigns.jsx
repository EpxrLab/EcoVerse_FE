import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Plus, Search, Edit, Play, CheckCircle2, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaigns } from '../../features/campaigns/hooks/useCampaigns';
import { useCampaignForm } from '../../features/campaigns/hooks';
import { CampaignStats, CampaignList, CampaignForm, CampaignDetail, StudentSelectionDialog, InvitationList } from '../../features/campaigns/components';
import { AddGameModal } from '../../features/campaigns/components/AddGameModal';
import { AddQuizModal } from '../../features/campaigns/components/AddQuizModal';
import { GAME_TYPES } from '../../features/campaigns/types/campaign';
import { useStudents } from '../../hooks/useStudents';

export default function SchoolCampaigns() {
  const {
    allCampaigns,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCampaign,
    setSelectedCampaign,
    availableClasses,
    availableQuizzes,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    changeStatus,
    acceptInvitation,
    declineInvitation,
    addStudentsToCampaign,
    revertToDraft,
    activateCampaign
  } = useCampaigns();
  
  // Create an object wrapper to satisfy TS ignore below until hook types catch up
  const useCampaignsResult = { 
    acceptInvitation, 
    declineInvitation 
  };

  // Use campaign form hook for all form logic
  const {
    formData,
    handleFormChange,
    handleClassToggle,
    handleQuizToggle,
    handleGameToggle,
    handleLevelToggle,
    handleStudentSelection,
    resetForm,
    loadFormData,
  } = useCampaignForm();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCampaign, setInviteCampaign] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isAcceptInviteOpen, setIsAcceptInviteOpen] = useState(false);
  const [acceptInviteCampaign, setAcceptInviteCampaign] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addStudentCampaign, setAddStudentCampaign] = useState(null);
  // New: Add Game / Add Quiz modals
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [gameConfigCampaign, setGameConfigCampaign] = useState(null);
  const [quizConfigCampaign, setQuizConfigCampaign] = useState(null);

  // Partnership Invitation logic
  const invitations = allCampaigns.filter(c => c.origin === 'partnership' && c.invitation_status === 'pending');

  const handleOpenAcceptDialog = (campaign) => {
    setAcceptInviteCampaign(campaign);
    setIsAcceptInviteOpen(true);
  };

  const handleAcceptInvite = (studentIds) => {
    if (acceptInviteCampaign) {
      useCampaignsResult.acceptInvitation(acceptInviteCampaign.id, studentIds);
      setIsAcceptInviteOpen(false);
      setAcceptInviteCampaign(null);
    }
  };

  const handleDeclineInvite = (campaign) => {
    useCampaignsResult.declineInvitation(campaign.id);
  };

  const { allStudents } = useStudents();



  // Filter campaigns by search
  const filteredCampaigns = allCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const draftCampaigns = filteredCampaigns.filter(c => c.status === 'draft');
  const scheduledCampaigns = filteredCampaigns.filter(c => c.status === 'scheduled');
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active');
  const activeSchoolCampaigns = activeCampaigns.filter(c => c.origin === 'school');
  const activePartnershipCampaigns = activeCampaigns.filter(c => c.origin === 'partnership');
  const sendingInvitesCampaigns = filteredCampaigns.filter(c => c.status === 'inviting_students');
  const sendingInvitesSchoolCampaigns = sendingInvitesCampaigns.filter(c => c.origin === 'school');
  const sendingInvitesPartnershipCampaigns = sendingInvitesCampaigns.filter(c => c.origin === 'partnership');
  const completedCampaigns = filteredCampaigns.filter(c => c.status === 'completed');
  const completedSchoolCampaigns = completedCampaigns.filter(c => c.origin === 'school');
  const completedPartnershipCampaigns = completedCampaigns.filter(c => c.origin === 'partnership');
  const cancelledCampaigns = filteredCampaigns.filter(c => c.status === 'cancelled');

  // Handlers
  const handleCreateCampaign = () => {
    addCampaign(formData);
    resetForm();
    setIsCreateOpen(false);
    toast.success('Đã tạo bản nháp chiến dịch. Hãy thêm Game và Quiz từ menu hành động!');
  };

  const handleOpenAddGame = (campaign) => {
    setGameConfigCampaign(campaign);
    setIsAddGameOpen(true);
  };

  const handleSubmitGame = (campaignId, gameData) => {
    updateCampaign(campaignId, gameData);
    setIsAddGameOpen(false);
    setGameConfigCampaign(null);
    toast.success('Đã cập nhật cấu hình Game');
  };

  const handleOpenAddQuiz = (campaign) => {
    setQuizConfigCampaign(campaign);
    setIsAddQuizOpen(true);
  };

  const handleSubmitQuiz = (campaignId, quizIds) => {
    updateCampaign(campaignId, { quiz_ids: quizIds });
    setIsAddQuizOpen(false);
    setQuizConfigCampaign(null);
    toast.success('Đã cập nhật Quiz');
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    loadFormData({
      name: campaign.name,
      description: campaign.description || '',
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      invitation_send_date: campaign.invitation_send_date || '',
      class_ids: campaign.participating_classes?.map(c => c.class_id) || [],
      quiz_ids: campaign.selected_quizzes?.map(q => q.quiz_id) || [],
      game_types: campaign.selected_games || [],
      level_ids: campaign.selected_levels?.map(l => l.level_id) || [],
    });
    setIsEditOpen(true);
  };

  const handleUpdateCampaign = () => {
    if (!editingCampaign) return;
    updateCampaign(editingCampaign.id, formData);
    resetForm();
    setEditingCampaign(null);
    setIsEditOpen(false);
    toast.success('Đã cập nhật chiến dịch thành công');
  };

  const handleViewDetail = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
  };

  const handleOpenInviteDialog = (campaign) => {
    if (campaign.origin === 'partnership') {
      setAddStudentCampaign(campaign);
      setIsAddStudentOpen(true);
    } else {
      setInviteCampaign(campaign);
      setIsInviteOpen(true);
    }
  };

  const handleAddStudents = (selectedIds) => {
    if (!addStudentCampaign) return;
    addStudentsToCampaign(addStudentCampaign.id, selectedIds);
    setIsAddStudentOpen(false);
    setAddStudentCampaign(null);
  };

  const handleSendInvitations = async () => {
    if (!inviteCampaign) return;
    
    setIsSendingInvite(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const totalStudents = inviteCampaign.participating_classes?.reduce(
      (sum, cls) => sum + cls.students_count, 0
    ) || 0;
    
    toast.success(`Đã gửi thông báo mời đến ${totalStudents} phụ huynh`, {
      description: `Chiến dịch "${inviteCampaign.name}" - ${inviteCampaign.participating_classes?.length || 0} lớp`,
    });
    
    setIsSendingInvite(false);
    setIsInviteOpen(false);
    setInviteCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Chiến dịch</h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các chiến dịch thu gom rác tái chế
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-eco-green hover:bg-eco-green/90">
          <Plus className="w-4 h-4 mr-2" />
          Tạo chiến dịch mới
        </Button>
      </div>

      {/* Stats */}
      <CampaignStats stats={stats} />

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm chiến dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="draft" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-green/15">
          <TabsTrigger value="draft" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-muted-foreground">
            <Edit className="w-4 h-4" />
            Nháp ({draftCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-purple-500">
            <Clock className="w-4 h-4" />
            Đã lên lịch ({scheduledCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="sending_invites" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-indigo-600">
            <Send className="w-4 h-4" />
            Đang mời ({sendingInvitesCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
            <Play className="w-4 h-4" />
            Đang hoạt động ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue">
            <CheckCircle2 className="w-4 h-4" />
            Hoàn thành ({completedCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive">
            Đã hủy ({cancelledCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-purple-600 relative">
             <div className="flex items-center gap-2">
               Lời mời
               {invitations.length > 0 && (
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                   {invitations.length}
                 </span>
               )}
             </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft">
          <CampaignList
            campaigns={draftCampaigns}
            tableHeaderBg="bg-muted/30"
            rowHoverBg="hover:bg-muted/20"
            onView={handleViewDetail}
            onEdit={handleEditCampaign}
            onInvite={handleOpenInviteDialog}
            onChangeStatus={changeStatus}
            onDelete={deleteCampaign}
            onActivate={activateCampaign}
            onAddGame={handleOpenAddGame}
            onAddQuiz={handleOpenAddQuiz}
          />
        </TabsContent>

        <TabsContent value="scheduled">
          <CampaignList
            campaigns={scheduledCampaigns}
            tableHeaderBg="bg-purple-50/50"
            rowHoverBg="hover:bg-purple-50/30"
            onView={handleViewDetail}
            onEdit={handleEditCampaign}
            onInvite={handleOpenInviteDialog}
            onChangeStatus={changeStatus}
            onDelete={deleteCampaign}
            onRevertToDraft={revertToDraft}
          />
        </TabsContent>

        <TabsContent value="sending_invites">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="school" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green">
                Chiến dịch Trường ({sendingInvitesSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="partnership" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue">
                Chiến dịch Đối tác ({sendingInvitesPartnershipCampaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="school">
              <CampaignList
                campaigns={sendingInvitesSchoolCampaigns}
                tableHeaderBg="bg-indigo-50/50"
                rowHoverBg="hover:bg-indigo-50/30"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>

            <TabsContent value="partnership">
              <CampaignList
                campaigns={sendingInvitesPartnershipCampaigns}
                tableHeaderBg="bg-indigo-50/50"
                rowHoverBg="hover:bg-indigo-50/30"
                participantLabel="Học sinh tham gia"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="active">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="school" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green">
                Chiến dịch Trường ({activeSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="partnership" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue">
                Chiến dịch Đối tác ({activePartnershipCampaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="school">
              <CampaignList
                campaigns={activeSchoolCampaigns}
                tableHeaderBg="bg-eco-green/5"
                rowHoverBg="hover:bg-eco-green/5"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>

            <TabsContent value="partnership">
              <CampaignList
                campaigns={activePartnershipCampaigns}
                tableHeaderBg="bg-eco-blue/5"
                rowHoverBg="hover:bg-eco-blue/5"
                participantLabel="Học sinh tham gia"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="completed">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="school" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green">
                Chiến dịch Trường ({completedSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="partnership" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue">
                Chiến dịch Đối tác ({completedPartnershipCampaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="school">
              <CampaignList
                campaigns={completedSchoolCampaigns}
                tableHeaderBg="bg-eco-blue/5"
                rowHoverBg="hover:bg-eco-blue/5"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>

            <TabsContent value="partnership">
              <CampaignList
                campaigns={completedPartnershipCampaigns}
                tableHeaderBg="bg-eco-blue/5"
                rowHoverBg="hover:bg-eco-blue/5"
                participantLabel="Học sinh tham gia"
                onView={handleViewDetail}
                onEdit={handleEditCampaign}
                onInvite={handleOpenInviteDialog}
                onChangeStatus={changeStatus}
                onDelete={deleteCampaign}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="cancelled">
          <CampaignList
            campaigns={cancelledCampaigns}
            tableHeaderBg="bg-destructive/5"
            rowHoverBg="hover:bg-destructive/5"
            onView={handleViewDetail}
            onEdit={handleEditCampaign}
            onInvite={handleOpenInviteDialog}
            onChangeStatus={changeStatus}
            onDelete={deleteCampaign}
          />
        </TabsContent>

        <TabsContent value="invitations">
            <InvitationList 
              invitations={invitations}
              onAccept={handleOpenAcceptDialog}
              onDecline={handleDeclineInvite}
              onView={handleViewDetail}
            />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo chiến dịch mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản. Game và Quiz sẽ thêm sau khi tạo bản nháp.
            </DialogDescription>
          </DialogHeader>
          <CampaignForm
            mode="create"
            formData={formData}
            availableClasses={availableClasses}
            onFormChange={handleFormChange}
            onClassToggle={handleClassToggle}
            onStudentSelection={handleStudentSelection}
            onSubmit={handleCreateCampaign}
            onCancel={() => {
              resetForm();
              setIsCreateOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản của chiến dịch
            </DialogDescription>
          </DialogHeader>
          <CampaignForm
            mode="edit"
            formData={formData}
            availableClasses={availableClasses}
            onFormChange={handleFormChange}
            onClassToggle={handleClassToggle}
            onStudentSelection={handleStudentSelection}
            onSubmit={handleUpdateCampaign}
            onCancel={() => {
              resetForm();
              setEditingCampaign(null);
              setIsEditOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Game Modal */}
      {gameConfigCampaign && (
        <AddGameModal
          isOpen={isAddGameOpen}
          onClose={() => { setIsAddGameOpen(false); setGameConfigCampaign(null); }}
          campaign={gameConfigCampaign}
          onSubmit={handleSubmitGame}
        />
      )}

      {/* Add Quiz Modal */}
      {quizConfigCampaign && (
        <AddQuizModal
          isOpen={isAddQuizOpen}
          onClose={() => { setIsAddQuizOpen(false); setQuizConfigCampaign(null); }}
          campaign={quizConfigCampaign}
          availableQuizzes={availableQuizzes}
          onSubmit={handleSubmitQuiz}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCampaign && (
            <CampaignDetail campaign={selectedCampaign} gameTypes={GAME_TYPES} />
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi thông báo mời</DialogTitle>
            <DialogDescription>
              Gửi thông báo mời tham gia chiến dịch đến phụ huynh
            </DialogDescription>
          </DialogHeader>
          {inviteCampaign && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Chiến dịch:</span> {inviteCampaign.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Số lớp:</span> {inviteCampaign.participating_classes?.length || 0}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Tổng học sinh:</span>{' '}
                  {inviteCampaign.participating_classes?.reduce((sum, cls) => sum + cls.students_count, 0) || 0}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleSendInvitations}
                  disabled={isSendingInvite}
                  className="bg-eco-blue hover:bg-eco-blue/90"
                >
                  {isSendingInvite ? 'Đang gửi...' : 'Gửi thông báo'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Student Selection Dialog for Invitation Acceptance */}
      {acceptInviteCampaign && (
        <StudentSelectionDialog 
          isOpen={isAcceptInviteOpen}
          onClose={() => {
            setIsAcceptInviteOpen(false);
            setAcceptInviteCampaign(null);
          }}
          onConfirm={handleAcceptInvite}
          studentLimit={acceptInviteCampaign.student_limit || 0}
          students={allStudents}
          campaignName={acceptInviteCampaign.name}
        />
      )}
      
      {/* Student Selection Dialog for Adding More Students */}
      {addStudentCampaign && (
        <StudentSelectionDialog 
          isOpen={isAddStudentOpen}
          onClose={() => {
            setIsAddStudentOpen(false);
            setAddStudentCampaign(null);
          }}
          onConfirm={handleAddStudents}
          studentLimit={addStudentCampaign.student_limit || 0}
          students={allStudents}
          campaignName={addStudentCampaign.name}
        />
      )}
    </div>
  );
}