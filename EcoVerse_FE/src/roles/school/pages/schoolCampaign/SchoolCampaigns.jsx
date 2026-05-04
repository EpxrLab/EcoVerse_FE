import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Plus, Search, Edit, Play, CheckCircle2, Send, Clock } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { toast } from 'sonner';
import { useCampaigns } from '../../features/campaigns/hooks/useCampaigns';
import { useCampaignForm } from '../../features/campaigns/hooks';
import { CampaignStats, CampaignList, CampaignForm, CampaignDetail, InvitationList, ConfirmDeleteDialog, ConfirmCancelDialog, ExtendInvitingDialog, ConfirmInvitationDialog, PartnershipStudentAssignmentDialog } from '../../features/campaigns/components';
import { AddGameModal } from '../../features/campaigns/components/AddGameModal';
import { AddQuizModal } from '../../features/campaigns/components/AddQuizModal';
import { useStudents } from '../../hooks/useStudents';

export default function SchoolCampaigns() {
  const {
    allCampaigns,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCampaign,
    setSelectedCampaign,
    availableQuizzes,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    changeStatus,
    acceptInvitation,
    declineInvitation,
    revertToDraft,
    activateCampaign,
    assignStudentsToPartnership,
    fetchAssignedStudents,
    cancelCampaign,
    extendInviting,
    fetchCampaignDetail,
    bindQuizzesToRound,
    getCampaigns,
    currentSubscription,
    isLoadingSubscription,
  } = useCampaigns();

  const {
    formData,
    handleFormChange,
    handleClassToggle,
    handleStudentSelection,
    resetForm,
    loadFormData,
    dateValidation,
  } = useCampaignForm();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCampaign, setInviteCampaign] = useState(null);
  
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [campaignToCancel, setCampaignToCancel] = useState(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendingCampaign, setExtendingCampaign] = useState(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addStudentCampaign, setAddStudentCampaign] = useState(null);
  // New: Add Game / Add Quiz modals
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [gameConfigCampaign, setGameConfigCampaign] = useState(null);
  const [quizConfigCampaign, setQuizConfigCampaign] = useState(null);
  const [targetRoundId, setTargetRoundId] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isConfirmInvitationOpen, setIsConfirmInvitationOpen] = useState(false);
  const [invitationAction, setInvitationAction] = useState({ type: 'accept', campaign: null });

  // Partnership Invitation logic
  const invitationsPending = allCampaigns.filter(c => c.origin === 'partnership' && c.invitation_status === 'INVITED');
  const invitationsAccepted = allCampaigns
    .filter(c => c.origin === 'partnership' && c.invitation_status === 'APPROVED')
    .sort((a, b) => {
      if (a.campaignPartnershipStatus === 'JOINING' && b.campaignPartnershipStatus !== 'JOINING') return -1;
      if (a.campaignPartnershipStatus !== 'JOINING' && b.campaignPartnershipStatus === 'JOINING') return 1;
      return 0;
    });
  const invitationsRejected = allCampaigns.filter(c => c.origin === 'partnership' && (c.invitation_status === 'REJECTED' || c.invitation_status === 'DECLINED'));

  const handleOpenAcceptDialog = (campaign) => {
    setInvitationAction({ type: 'accept', campaign });
    setIsConfirmInvitationOpen(true);
  };

  const handleDeclineInvite = (campaign) => {
    setInvitationAction({ type: 'reject', campaign });
    setIsConfirmInvitationOpen(true);
  };

  const handleConfirmInvitationAction = () => {
    if (invitationAction.campaign) {
      if (invitationAction.type === 'accept') {
        acceptInvitation(invitationAction.campaign.id);
      } else {
        declineInvitation(invitationAction.campaign.id);
      }
      setIsConfirmInvitationOpen(false);
      setInvitationAction({ type: 'accept', campaign: null });
    }
  };

  const { allStudents, availableClasses } = useStudents();

  // Filter campaigns by search
  const filteredCampaigns = allCampaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const draftCampaigns = filteredCampaigns.filter((c) => c.status === "draft");
  const scheduledCampaigns = filteredCampaigns.filter(
    (c) => c.status === "scheduled",
  );
  const activeCampaigns = filteredCampaigns.filter(
    (c) => c.status === "on_going",
  );
  const activeSchoolCampaigns = activeCampaigns.filter(
    (c) => c.origin === "school",
  );
  const activePartnershipCampaigns = activeCampaigns.filter(
    (c) => c.origin === "partnership",
  );
  const sendingInvitesCampaigns = filteredCampaigns.filter(
    (c) => c.status === "inviting" || c.status === "EXTENDED",
  );
  const sendingInvitesSchoolCampaigns = sendingInvitesCampaigns.filter(
    (c) => c.origin === "school",
  );
  const sendingInvitesPartnershipCampaigns = sendingInvitesCampaigns.filter(
    (c) => c.origin === "partnership",
  );
  const completedCampaigns = filteredCampaigns.filter(
    (c) => c.status === "completed",
  );
  const completedSchoolCampaigns = completedCampaigns.filter(
    (c) => c.origin === "school",
  );
  const completedPartnershipCampaigns = completedCampaigns.filter(
    (c) => c.origin === "partnership",
  );
  const cancelledCampaigns = filteredCampaigns.filter(
    (c) => c.status === "cancelled",
  );

  // Handlers
  const handleCreateCampaign = () => {
    addCampaign(formData);
    resetForm();
    setIsCreateOpen(false);
    toast.success("Đã tạo bản nháp chiến dịch thành công!");
  };

  const handleOpenAddGame = async (campaign) => {
    setIsDetailLoading(true);
    try {
      const detail = await fetchCampaignDetail(campaign.id, campaign.origin);
      if (detail) {
        setGameConfigCampaign(detail);
      } else {
        setGameConfigCampaign(campaign);
      }
    } catch (error) {
      console.error("Error fetching detail for game config:", error);
      setGameConfigCampaign(campaign);
    } finally {
      setIsDetailLoading(false);
      setIsAddGameOpen(true);
    }
  };

  const handleSubmitGame = () => {
    setIsAddGameOpen(false);
    setGameConfigCampaign(null);
    toast.success("Đã cập nhật cấu hình Game");
    getCampaigns && getCampaigns();
  };

  const handleOpenAddQuiz = async (campaign, roundId = null) => {
    setIsDetailLoading(true);
    try {
      const detail = await fetchCampaignDetail(campaign.id, campaign.origin);
      if (detail) {
        setQuizConfigCampaign(detail);
      } else {
        setQuizConfigCampaign(campaign);
      }
    } catch (error) {
      console.error("Error fetching detail for quiz config:", error);
      setQuizConfigCampaign(campaign);
    } finally {
      setIsDetailLoading(false);
      setTargetRoundId(roundId);
      setIsAddQuizOpen(true);
    }
  };

  const handleSubmitQuiz = async (
    campaignId,
    quizIds,
    roundIdFromModal,
    maxAttempts,
  ) => {
    let rid = roundIdFromModal || targetRoundId;

    // If called from list and no roundId, fetch detail to get the single round
    if (!rid && campaignId) {
      const detail = await fetchCampaignDetail(campaignId); // Default to school since bind only for school
      if (detail?.rounds?.length > 0) {
        rid = detail.rounds[0].id;
      }
    }

    if (rid) {
      // BE supports PUT for both initial bind and update
      await bindQuizzesToRound(rid, quizIds, maxAttempts);
    } else {
      await updateCampaign(campaignId, { quiz_ids: quizIds });
    }

    setIsAddQuizOpen(false);
    setQuizConfigCampaign(null);
    setTargetRoundId(null);
    getCampaigns && getCampaigns();
  };

  const handleEditCampaign = async (campaign) => {
    setIsDetailLoading(true);
    const detail = await fetchCampaignDetail(campaign.id, campaign.origin);
    setIsDetailLoading(false);

    const target = detail || campaign;
    setEditingCampaign(target);

    loadFormData({
      name: target.name,
      description: target.description || "",
      start_date: target.start_date,
      end_date: target.end_date,
      invitation_send_date: target.invitation_send_date || "",
      invitation_deadline: target.invitation_deadline || "",
      class_ids:
        target.class_ids ||
        target.participating_classes?.map((c) => c.class_id) ||
        target.class_ids ||
        [],
      student_ids: target.student_ids || [],
      quiz_ids:
        target.rounds?.[0]?.quizzes?.map((q) => q.id) ||
        target.selected_quizzes?.map((q) => q.quiz_id) ||
        [],
      game_types: target.selected_games || [],
      level_ids: target.selected_levels?.map((l) => l.level_id) || [],
    });
    setIsEditOpen(true);
  };

  const handleUpdateCampaign = () => {
    if (!editingCampaign) return;
    updateCampaign(editingCampaign.id, formData);
    resetForm();
    setEditingCampaign(null);
    setIsEditOpen(false);
    toast.success("Đã cập nhật chiến dịch thành công");
  };

  const handleViewDetail = async (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);

    setIsDetailLoading(true);
    try {
      const detail = await fetchCampaignDetail(campaign.id, campaign.origin);
      if (detail) {
        setSelectedCampaign(detail);
      }
    } catch (error) {
      console.error("Error fetching campaign detail:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleConfirmDelete = (id) => {
    const campaign = allCampaigns.find((c) => c.id === id);
    if (campaign) {
      setCampaignToDelete(campaign);
      setIsDeleteConfirmOpen(true);
    }
  };

  const executeDelete = async () => {
    if (campaignToDelete) {
      await deleteCampaign(campaignToDelete.id);
      setIsDeleteConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleOpenCancelConfirm = (id) => {
    const campaign = allCampaigns.find((c) => c.id === id);
    if (campaign) {
      setCampaignToCancel(campaign);
      setIsCancelConfirmOpen(true);
    }
  };

  const handleConfirmCancel = async () => {
    if (campaignToCancel) {
      await cancelCampaign(campaignToCancel.id);
      setIsCancelConfirmOpen(false);
      setCampaignToCancel(null);
    }
  };
  const handleOpenExtendDialog = async (id) => {
    setIsDetailLoading(true);
    const detail = await fetchCampaignDetail(id); // default to school
    if (detail) {
      setExtendingCampaign(detail);
      setIsExtendDialogOpen(true);
    } else {
      const campaign = allCampaigns.find((c) => c.id === id);
      if (campaign) {
        setExtendingCampaign(campaign);
        setIsExtendDialogOpen(true);
      }
    }
    setIsDetailLoading(false);
  };

  const handleConfirmExtend = async (payload) => {
    if (extendingCampaign) {
      setIsDetailLoading(true);
      const success = await extendInviting(extendingCampaign.id, payload);
      if (success) {
        setIsExtendDialogOpen(false);
        setExtendingCampaign(null);
      }
      setIsDetailLoading(false);
    }
  };

  const [initialAssignedStudentIds, setInitialAssignedStudentIds] = useState([]);

  const handleOpenInviteDialog = async (campaign) => {
    if (campaign.origin === "partnership") {
      setIsDetailLoading(true);
      try {
        // Fetch full detail to get the student limit (maxStudentsPerSchool)
        const [detail, studentIds] = await Promise.all([
          fetchCampaignDetail(campaign.id, "partnership"),
          fetchAssignedStudents(campaign.id)
        ]);
        
        setInitialAssignedStudentIds(studentIds || []);
        setAddStudentCampaign(detail || campaign);
        setIsAddStudentOpen(true);
      } catch (error) {
        console.error("Error preparing student expansion:", error);
      } finally {
        setIsDetailLoading(false);
      }
    } else {
      setInviteCampaign(campaign);
      setIsInviteOpen(true);
    }
  };

  const handleAddStudents = (selectedIds) => {
    if (!addStudentCampaign) return;
    assignStudentsToPartnership(addStudentCampaign.id, selectedIds);
    setIsAddStudentOpen(false);
    setAddStudentCampaign(null);
  };

  const handleSendInvitations = async () => {
    if (!inviteCampaign) return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const totalStudents =
      inviteCampaign.participating_classes?.reduce(
        (sum, cls) => sum + cls.students_count,
        0,
      ) || 0;

    toast.success(`Đã gửi thông báo mời đến ${totalStudents} phụ huynh`, {
      description: `Chiến dịch "${inviteCampaign.name}" - ${inviteCampaign.participating_classes?.length || 0} lớp`,
    });

    setIsInviteOpen(false);
    setInviteCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Chiến dịch
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các chiến dịch thu gom rác tái chế
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {currentSubscription && (
            <div className="text-right mr-4 hidden md:block">
              <div className="text-lg font-bold text-eco-green">
                Chiến dịch: {currentSubscription.usedCampaignsCurrentMonth}/{currentSubscription.maxCampaignsPerMonth || '∞'}
              </div>
            </div>
          )}
          <Button 
            className="bg-eco-green hover:bg-eco-green/90 text-primary-foreground font-semibold"
            onClick={() => setIsCreateOpen(true)}
            disabled={isLoadingSubscription}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo chiến dịch
          </Button>
        </div>
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
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <TabsList className="h-12 bg-muted/50 p-1.5 border-2 border-eco-green/15 gap-1 justify-start w-fit">
          <TabsTrigger
            value="draft"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-muted-foreground whitespace-nowrap"
          >
            <Edit className="w-4 h-4" />
            Nháp ({draftCampaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-purple-500 whitespace-nowrap"
          >
            <Clock className="w-4 h-4" />
            Đã lên lịch ({scheduledCampaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="sending_invites"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-indigo-600 whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            Đang mời ({sendingInvitesCampaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            Đang hoạt động ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            Hoàn thành ({completedCampaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive whitespace-nowrap"
          >
            Đã hủy ({cancelledCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-purple-600 relative whitespace-nowrap">
             <div className="flex items-center gap-2">
               Lời mời
               {invitationsPending.length > 0 && (
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                   {invitationsPending.length}
                 </span>
               )}
             </div>
          </TabsTrigger>
        </TabsList>
      </div>

        <TabsContent value="draft">
          <CampaignList
            campaigns={draftCampaigns}
            tableHeaderBg="bg-muted/30"
            rowHoverBg="hover:bg-muted/20"
            onView={handleViewDetail}
            onEdit={handleEditCampaign}
            onInvite={handleOpenInviteDialog}
            onChangeStatus={changeStatus}
            onDelete={handleConfirmDelete}
            onActivate={activateCampaign}
            onCancel={handleOpenCancelConfirm}
            onExtend={handleOpenExtendDialog}
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
            onDelete={handleConfirmDelete}
            onRevertToDraft={revertToDraft}
            onCancel={handleOpenCancelConfirm}
            onExtend={handleOpenExtendDialog}
          />
        </TabsContent>

        <TabsContent value="sending_invites">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 justify-start w-fit">
              <TabsTrigger
                value="school"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green"
              >
                Chiến dịch Trường ({sendingInvitesSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger
                value="partnership"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue"
              >
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
                onDelete={handleConfirmDelete}
                onExtend={handleOpenExtendDialog}
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
                onDelete={handleConfirmDelete}
                onExtend={handleOpenExtendDialog}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="active">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 justify-start w-fit">
              <TabsTrigger
                value="school"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green"
              >
                Chiến dịch Trường ({activeSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger
                value="partnership"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue"
              >
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
                onDelete={handleConfirmDelete}
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
                onDelete={handleConfirmDelete}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="completed">
          <Tabs defaultValue="school" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 justify-start w-fit">
              <TabsTrigger
                value="school"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green"
              >
                Chiến dịch Trường ({completedSchoolCampaigns.length})
              </TabsTrigger>
              <TabsTrigger
                value="partnership"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-blue"
              >
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
                onDelete={handleConfirmDelete}
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
                onDelete={handleConfirmDelete}
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
            onDelete={handleConfirmDelete}
            onCancel={handleOpenCancelConfirm}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 justify-start w-fit">
              <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-purple-600">
                Chờ phản hồi ({invitationsPending.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-eco-green">
                Đã chấp nhận ({invitationsAccepted.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-destructive">
                Đã từ chối ({invitationsRejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <InvitationList 
                invitations={invitationsPending}
                onAccept={handleOpenAcceptDialog}
                onDecline={handleDeclineInvite}
                onView={handleViewDetail}
              />
            </TabsContent>

            <TabsContent value="accepted">
              <InvitationList 
                invitations={invitationsAccepted}
                onAccept={handleOpenAcceptDialog}
                onDecline={handleDeclineInvite}
                onView={handleViewDetail}
                onAddStudent={handleOpenInviteDialog}
                readOnly={true}
              />
            </TabsContent>

            <TabsContent value="rejected">
              <InvitationList 
                invitations={invitationsRejected}
                onAccept={handleOpenAcceptDialog}
                onDecline={handleDeclineInvite}
                onView={handleViewDetail}
                readOnly={true}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-5xl h-[85vh] overflow-hidden flex flex-col">
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
            dateValidation={dateValidation}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-5xl h-[85vh] overflow-hidden flex flex-col">
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
            dateValidation={dateValidation}
          />
        </DialogContent>
      </Dialog>

      {/* Add Game Modal */}
      {gameConfigCampaign && (
        <AddGameModal
          isOpen={isAddGameOpen}
          onClose={() => {
            setIsAddGameOpen(false);
            setGameConfigCampaign(null);
          }}
          campaign={gameConfigCampaign}
          onSubmit={handleSubmitGame}
        />
      )}

      {/* Add Quiz Modal */}
      {quizConfigCampaign && (
        <AddQuizModal
          isOpen={isAddQuizOpen}
          onClose={() => {
            setIsAddQuizOpen(false);
            setQuizConfigCampaign(null);
            setTargetRoundId(null);
          }}
          campaign={quizConfigCampaign}
          roundId={targetRoundId}
          availableQuizzes={availableQuizzes}
          onSubmit={handleSubmitQuiz}
          currentSubscription={currentSubscription}
          isLoadingSubscription={isLoadingSubscription}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Chi tiết chiến dịch</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 pt-0">
            {selectedCampaign && (
              <CampaignDetail
                campaign={selectedCampaign}
                isLoading={isDetailLoading}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      
      {/* Student Assigment Dialog for Partnership Campaigns */}
      {addStudentCampaign && (
        <PartnershipStudentAssignmentDialog 
          isOpen={isAddStudentOpen}
          initialSelectedIds={initialAssignedStudentIds}
          onClose={() => {
            setIsAddStudentOpen(false);
            setAddStudentCampaign(null);
            setInitialAssignedStudentIds([]);
          }}
          onConfirm={handleAddStudents}
          campaign={addStudentCampaign}
          availableClasses={availableClasses}
          allStudents={allStudents}
        />
      )}
      {/* Confirmation Dialogs */}
      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title={campaignToDelete?.name}
      />

      <ConfirmCancelDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title={campaignToCancel?.name}
      />

      <ExtendInvitingDialog
        isOpen={isExtendDialogOpen}
        onClose={() => setIsExtendDialogOpen(false)}
        onConfirm={handleConfirmExtend}
        campaign={extendingCampaign}
        allStudents={allStudents}
        availableClasses={availableClasses}
        isLoading={isDetailLoading}
      />
      <ConfirmInvitationDialog
        isOpen={isConfirmInvitationOpen}
        onClose={() => setIsConfirmInvitationOpen(false)}
        onConfirm={handleConfirmInvitationAction}
        type={invitationAction.type}
        campaignName={invitationAction.campaign?.name}
      />
    </div>
  );
}
