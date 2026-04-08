import { useState, useMemo, useEffect, useCallback } from 'react';
import { mockStudentInvitations, mockSchoolInvitations } from '../../../data/campaign.data';
import { defaultQuizzesData } from '../../../data/quiz.data';
import { toast } from '@/shared/hooks/use-toast';
import { campaignService } from '@/roles/school/services';
import { quizzesService } from '../../quizzes/services/quizzes.service';
import { toLocalISO, toUTCISO } from '@/utils/dateUtils';


export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [apiQuizzes, setApiQuizzes] = useState([]);
  const [partnershipInvitations, setPartnershipInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignService.getCampaigns();
      setCampaigns(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPartnershipInvitations = useCallback(async () => {
    try {
      const res = await campaignService.getPartnershipInvitations();
      setPartnershipInvitations(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch partnership invitations:', error);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await quizzesService.getQuizzes();
      setApiQuizzes(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchQuizzes();
    fetchPartnershipInvitations();
  }, [fetchCampaigns, fetchQuizzes, fetchPartnershipInvitations]);

  // Format and link invitations
  const allFormattedCampaigns = useMemo(() => {
    // Helper to attach invitations
    const attachInvitations = (list) => list.map(campaign => ({
      ...campaign,
      student_invitations: Array.isArray(mockStudentInvitations) ? 
        mockStudentInvitations.filter(inv => inv.campaign_id === campaign?.id) : [],
    }));

    if (!Array.isArray(campaigns)) return attachInvitations(mockSchoolInvitations);

    // Map raw campaigns to UI format
    const mappedCampaigns = campaigns.map(c => {
      if (!c) return null;
      // If it's already in UI format (from local optimistic update), ensure it has fallbacks
      if (c.origin === 'school') {
        return {
          ...c,
          name: c.name || 'Chưa đặt tên',
          description: c.description || '',
          status: (c.status || 'draft').toLowerCase(),
        };
      }

      return {
        id: c.id,
        name: c.campaignName || 'Chưa đặt tên',
        code: c.campaignCode || '',
        description: c.description || '',
        start_date: toLocalISO(c.startDate || c.start_date),
        end_date: toLocalISO(c.endDate || c.end_date),
        invitation_send_date: toLocalISO(c.invitationDate || c.invitation_send_date),
        invitation_deadline: toLocalISO(c.invitationDeadline || c.invitation_deadline),
        student_ids: c.studentIds || c.student_ids || c.participants?.map(p => p.studentId) || [],
        status: (c.status || 'draft').toLowerCase(),
        origin: 'school',
        has_quiz: c.hasQuiz ?? false,
        has_game: c.hasGame ?? false,
      };
    }).filter(Boolean);

    const campaignsList = attachInvitations(mappedCampaigns);
    
    // Map partnership invitations to UI format
    const partnershipList = attachInvitations(partnershipInvitations.map(inv => ({
      id: inv.invitationId,
      campaign_id: inv.campaignId,
      name: inv.campaignName || 'Chiến dịch đối tác',
      code: inv.campaignCode || '',
      description: inv.description || '',
      start_date: toLocalISO(inv.startDate),
      end_date: toLocalISO(inv.endDate),
      invitation_send_date: toLocalISO(inv.invitationDate),
      invitation_deadline: toLocalISO(inv.invitationDeadline),
      registration_date: toLocalISO(inv.registrationDate),
      registration_deadline: toLocalISO(inv.registrationDeadline),
      status: 'inviting', // Usually invitations are for inviting/on_going
      invitation_status: inv.status,
      origin: 'partnership',
      partnership_name: inv.partnershipName || 'Đối tác chưa xác định',
      student_limit: inv.maxStudentsPerSchool || 0,
      total_student_quota: inv.totalStudentQuota || 0,
      total_rounds: inv.totalRounds || 0,
      students_enrolled: inv.studentsEnrolled || 0,
      banner_image_url: inv.bannerImageUrl || '',
    })));
    
    return [...campaignsList, ...partnershipList];
  }, [campaigns, partnershipInvitations]);


  const stats = useMemo(() => {
    const list = allFormattedCampaigns || [];
    return {
      totalCampaigns: list.length,
      activeCampaigns: list.filter(c => c.status === 'on_going').length,
      scheduledCampaigns: list.filter(c => c.status === 'scheduled').length,
      invitingCampaigns: list.filter(c => c.status === 'inviting').length,
      completedCampaigns: list.filter(c => c.status === 'completed').length,
      cancelledCampaigns: list.filter(c => c.status === 'cancelled').length,
      pendingInvitations: list.filter(c => c.origin === 'partnership' && c.invitation_status === 'INVITED').length,
      rejectedInvitations: list.filter(c => c.origin === 'partnership' && (c.invitation_status === 'REJECTED' || c.invitation_status === 'DECLINED')).length,
      acceptedInvitations: list.filter(c => c.origin === 'partnership' && c.invitation_status === 'APPROVED').length,
      totalItemsCollected: list.reduce((sum, c) => sum + (c.total_items_collected || 0), 0),
    };
  }, [allFormattedCampaigns]);


  
  // Get all available quizzes (both default and custom)
  const availableQuizzes = useMemo(() => {
    const publishedApiQuizzes = apiQuizzes
      .filter(q => q.published || q.status === 'published')
      .map(q => ({
        id: q.id,
        title: q.title,
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        questions: q.questionCount || q.questions?.length || 0,
        isAI: false
      }));

    return [...defaultQuizzesData, ...publishedApiQuizzes];
  }, [apiQuizzes]);

  const addCampaign = (data) => {
    const calculatedDeadline = data.start_date 
      ? new Date(new Date(data.start_date).getTime() - 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    const finalDeadline = (data.invitation_deadline ? new Date(data.invitation_deadline).toISOString() : null) || calculatedDeadline || null;

    const payload = {
      campaignName: data.name,
      description: data.description || "",
      startDate: toUTCISO(data.start_date),
      endDate: toUTCISO(data.end_date),
      invitationDate: toUTCISO(data.invitation_send_date),
      invitationDeadline: toUTCISO(finalDeadline),
      topRankingCount: 0,
      bannerImageUrl: "",
      studentIds: data.student_ids || []
    };

    campaignService.createCampaign(payload)
      .then((res) => {
        // Build new campaign for local UI (keep as draft like before)
        const newCampaign = {
          id: res.data?.data?.id || Date.now().toString(),
          name: data.name,
          description: data.description || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          invitation_deadline: toLocalISO(finalDeadline),
          status: 'draft',
          origin: 'school',
        };

        setCampaigns([newCampaign, ...campaigns]);
        // Also refresh the overall list from the server to get full backend data
        fetchCampaigns();
        
        toast({
          title: "Thành công",
          description: `Đã tạo chiến dịch "${data.name}"`,
          variant: "default",
        });
      })
      .catch((error) => {
        console.error('Failed to create campaign:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tạo chiến dịch. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      });
  };

  const updateCampaign = async (id, data) => {
    try {
      // Find the existing campaign to merge data
      const existing = campaigns.find(c => c.id === id);
      if (!existing) return;

      // Prepare payload to match API expectation
      // Note: mapping UI fields back to API fields
      const payload = {
        campaignName: data.name || existing.campaignName,
        description: data.description !== undefined ? data.description : (existing.description || ""),
        startDate: toUTCISO(data.start_date || existing.startDate),
        endDate: toUTCISO(data.end_date || existing.endDate),
        invitationDate: toUTCISO(data.invitation_send_date || existing.invitationDate),
        invitationDeadline: toUTCISO(data.invitation_deadline || existing.invitationDeadline),
        topRankingCount: data.top_ranking_count || existing.topRankingCount || 0,
        bannerImageUrl: data.banner_image_url || existing.bannerImageUrl || "",
        studentIds: data.student_ids || existing.studentIds || []
      };

      await campaignService.updateCampaign(id, payload);
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật chiến dịch",
      });
      
      // Refresh to ensure everything is in sync
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await campaignService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa chiến dịch thành công",
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const changeStatus = (id, status) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status, updated_at: new Date().toISOString() } : c
    ));
    const statusLabels = {
      draft: 'Nháp',
      scheduled: 'Đã lên lịch',
      on_going: 'Đang hoạt động',
      inviting: 'Đang mời',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    toast({
      title: "Cập nhật trạng thái",
      description: `Chiến dịch đã chuyển sang "${statusLabels[status]}"`,
    });
  };

  const acceptInvitation = async (id) => {
    try {
      await campaignService.acceptPartnershipInvitation(id);
      toast({
        title: "Đã chấp nhận lời mời",
        description: "Chiến dịch đã được chuyển vào mục Đã chấp nhận. Hãy thêm học sinh tham gia.",
      });
      fetchPartnershipInvitations();
      // Optional: also refresh main campaigns list if the backend creates a campaign record immediately
      fetchCampaigns && fetchCampaigns();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chấp nhận lời mời. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  const declineInvitation = async (id) => {
    try {
      await campaignService.rejectPartnershipInvitation(id);
      toast({
        title: "Đã từ chối",
        description: "Đã từ chối lời mời tham gia chiến dịch",
      });
      fetchPartnershipInvitations();
    } catch (error) {
      console.error('Failed to reject invitation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể từ chối lời mời. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const assignStudentsToPartnership = async (id, studentIds) => {
    try {
      await campaignService.assignStudentsToPartnershipInvitation(id, studentIds);
      toast({
        title: "Đã thêm học sinh",
        description: `Đã thêm ${studentIds.length} học sinh vào chiến dịch đối tác`,
      });
      fetchPartnershipInvitations();
    } catch (error) {
      console.error('Failed to assign students to partnership invitation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm học sinh vào chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const addStudentsToCampaign = (id, newStudentIds) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const currentStudents = c.participating_students || [];
        const updatedStudents = Array.from(new Set([...currentStudents, ...newStudentIds]));
        
        return {
          ...c,
          participating_students: updatedStudents,
          total_students: updatedStudents.length,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    }));
    toast({
      title: "Đã thêm học sinh",
      description: `Đã thêm ${newStudentIds.length} học sinh vào chiến dịch`,
    });
  };

  const revertToDraft = async (id) => {
    try {
      await campaignService.setDraft(id);
      toast({
        title: "Đã chuyển về nháp",
        description: "Chiến dịch đã được chuyển về trạng thái nháp",
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to revert campaign to draft:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chuyển chiến dịch về nháp. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const activateCampaign = async (id) => {
    try {
      await campaignService.activateCampaign(id);
      toast({
        title: "Đã kích hoạt",
        description: "Chiến dịch đã được kích hoạt thành công",
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to activate campaign:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kích hoạt chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  const cancelCampaign = async (id) => {
    try {
      await campaignService.cancelCampaign(id);
      toast({
        title: "Đã hủy chiến dịch",
        description: "Chiến dịch đã được chuyển sang trạng thái đã hủy",
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to cancel campaign:', error);
      toast({
        title: "Lỗi",
        description: "Không thể hủy chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  const extendInviting = async (id, payload) => {
    try {
      await campaignService.extendInviting(id, payload);
      toast({
        title: "Đã gia hạn thành công",
        description: "Chiến dịch đã được gia hạn thời gian mời học sinh",
      });
      fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Failed to extend inviting:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gia hạn chiến dịch. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchCampaignDetail = async (id) => {
    try {
      const res = await campaignService.getCampaignById(id);
      const data = res.data?.data;
      if (!data) return null;

      // Map detailed API response to UI format
      return {
        id: data.id,
        name: data.campaignName,
        code: data.campaignCode,
        description: data.description,
        status: data.status?.toLowerCase() || 'draft',
        start_date: data.startDate,
        end_date: data.endDate,
        invitation_send_date: data.invitationDate,
        invitation_deadline: data.invitationDeadline,
        top_ranking_count: data.topRankingCount,
        origin: 'school',
        // Map rounds to existing UI format if possible, or new structure
        rounds: data.rounds?.map(r => ({
          id: r.id,
          number: r.roundNumber,
          name: r.roundName,
          status: r.status,
          start_time: r.startTime,
          end_time: r.endTime,
          game_type_id: r.gameTypeId,
          game_type_name: r.gameTypeName,
          difficulty: r.resolvedDifficulty,
          difficulty_override: r.difficultyOverride,
          coin_per_session: r.coinPerSession,
          selected_preset_ids: r.selectedPresetIds || [],
          preset_sub_category_config: r.presetSubCategoryConfig || {},
          quizzes: r.quizzes?.map(q => ({
            id: q.quizId,
            title: q.title,
            difficulty: q.difficulty,
            max_attempts: q.maxAttempts,
            is_required: q.isRequired
          }))
        })),
        // Map participants
        participants: data.participants?.map(p => ({
          id: p.studentId,
          code: p.studentCode,
          name: p.fullName,
          grade: p.gradeLevel,
          class_name: p.className,
          approval_status: p.parentApprovalStatus
        })),
        // Add flattened arrays for form selection
        student_ids: data.participants?.map(p => p.studentId) || [],
        class_ids: Array.from(new Set(data.participants?.map(p => `${p.gradeLevel || ''}${p.className || ''}`).filter(Boolean))) || []
      };
    } catch (error) {
      console.error('Failed to fetch campaign detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin chi tiết chiến dịch",
        variant: "destructive",
      });
      return null;
    }
  };

  const bindQuizzesToRound = async (roundId, quizIds, maxAttempts) => {
    try {
      await campaignService.bindQuizzesToRound(roundId, quizIds, maxAttempts);
      toast({
        title: "Thành công",
        description: "Đã cập nhật bộ quiz cho vòng chơi",
      });
      // Refresh detailed view if open
      if (selectedCampaign) {
        const detail = await fetchCampaignDetail(selectedCampaign.id);
        if (detail) setSelectedCampaign(detail);
      }
      return true;
    } catch (error) {
      console.error('Failed to bind quizzes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật quiz. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    allCampaigns: allFormattedCampaigns,
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
    addStudentsToCampaign,
    revertToDraft,
    activateCampaign,
    assignStudentsToPartnership,
    cancelCampaign,
    extendInviting,
    fetchCampaignDetail,
    bindQuizzesToRound,
    getCampaigns: fetchCampaigns,
    isLoading
  };
}