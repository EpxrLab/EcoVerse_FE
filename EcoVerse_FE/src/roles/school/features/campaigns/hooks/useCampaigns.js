import { useState, useMemo, useEffect, useCallback } from 'react';
import { mockAvailableClasses, mockStudentInvitations, mockSchoolInvitations } from '../../../data/campaign.data';
import { defaultQuizzesData, customQuizzesData } from '../../../data/quiz.data';
import { getGameLevelsForSchool } from '@/shared/data/admin-game-levels.data';
import { toast } from '@/shared/hooks/use-toast';
import { campaignService } from '@/roles/school/services';


export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

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
        start_date: c.startDate?.split('T')[0] || c.start_date || '',
        end_date: c.endDate?.split('T')[0] || c.end_date || '',
        invitation_send_date: c.invitationDate?.split('T')[0] || c.invitation_send_date || '',
        invitation_deadline: c.invitationDeadline?.split('T')[0] || c.invitation_deadline || '',
        student_ids: c.studentIds || c.student_ids || [],
        status: (c.status || 'draft').toLowerCase(),
        origin: 'school',
      };
    }).filter(Boolean);

    const campaignsList = attachInvitations(mappedCampaigns);
    const partnershipList = attachInvitations(mockSchoolInvitations);
    
    return [...campaignsList, ...partnershipList];
  }, [campaigns]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = useMemo(() => {
    const safeSearchQuery = (searchQuery || '').toLowerCase();
    return allFormattedCampaigns.filter(campaign => {
      if (!campaign) return false;
      const name = (campaign.name || '').toLowerCase();
      const description = (campaign.description || '').toLowerCase();
      const matchesSearch = name.includes(safeSearchQuery) || 
                           description.includes(safeSearchQuery);
      const matchesStatus = statusFilter === 'all' || (campaign.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [allFormattedCampaigns, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const list = allFormattedCampaigns || [];
    return {
      totalCampaigns: list.length,
      activeCampaigns: list.filter(c => c.status === 'active').length,
      scheduledCampaigns: list.filter(c => c.status === 'scheduled').length,
      invitingCampaigns: list.filter(c => c.status === 'inviting_students').length,
      completedCampaigns: list.filter(c => c.status === 'completed').length,
      cancelledCampaigns: list.filter(c => c.status === 'cancelled').length,
      pendingInvitations: list.filter(c => c.origin === 'partnership' && c.invitation_status === 'pending').length,
      totalItemsCollected: list.reduce((sum, c) => sum + (c.total_items_collected || 0), 0),
    };
  }, [allFormattedCampaigns]);


  const availableClasses = mockAvailableClasses;
  
  // Get all available quizzes (both default and custom)
  const availableQuizzes = useMemo(() => {
    return [...defaultQuizzesData, ...customQuizzesData.filter(q => q.status === 'published')];
  }, []);

  const addCampaign = (data, dynamicClasses) => {
    const calculatedDeadline = data.start_date 
      ? new Date(new Date(data.start_date).getTime() - 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    const finalDeadline = (data.invitation_deadline ? new Date(data.invitation_deadline).toISOString() : null) || calculatedDeadline || null;

    const payload = {
      campaignName: data.name,
      description: data.description || "",
      startDate: data.start_date ? new Date(data.start_date).toISOString() : null,
      endDate: data.end_date ? new Date(data.end_date).toISOString() : null,
      invitationDate: data.invitation_send_date ? new Date(data.invitation_send_date).toISOString() : null,
      invitationDeadline: finalDeadline,
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
          invitation_deadline: finalDeadline?.split('T')[0] || '',
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
        campaignName: data.name || existing.name,
        description: data.description !== undefined ? data.description : existing.description,
        startDate: data.start_date ? new Date(data.start_date).toISOString() : (existing.start_date ? new Date(existing.start_date).toISOString() : null),
        endDate: data.end_date ? new Date(data.end_date).toISOString() : (existing.end_date ? new Date(existing.end_date).toISOString() : null),
        invitationDate: data.invitation_send_date ? new Date(data.invitation_send_date).toISOString() : (existing.invitation_send_date ? new Date(existing.invitation_send_date).toISOString() : null),
        invitationDeadline: data.invitation_deadline ? new Date(data.invitation_deadline).toISOString() : (existing.invitation_deadline ? new Date(existing.invitation_deadline).toISOString() : null),
        topRankingCount: data.top_ranking_count || 0,
        bannerImageUrl: data.banner_image_url || "",
        studentIds: data.student_ids || []
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

  const deleteCampaign = (id) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast({
      title: "Đã xóa",
      description: "Chiến dịch đã được xóa",
    });
  };

  const changeStatus = (id, status) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status, updated_at: new Date().toISOString() } : c
    ));
    const statusLabels = {
      draft: 'Nháp',
      scheduled: 'Đã lên lịch',
      active: 'Đang hoạt động',
      inviting_students: 'Đang mời',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    toast({
      title: "Cập nhật trạng thái",
      description: `Chiến dịch đã chuyển sang "${statusLabels[status]}"`,
    });
  };

  const acceptInvitation = (id, selectedStudentIds) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'inviting_students',
          invitation_status: 'accepted',
          participating_students: selectedStudentIds,
          invitation_send_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      return c;
    }));
    toast({
      title: "Đã chấp nhận lời mời",
      description: "Chiến dịch đã được thêm vào danh sách hoạt động",
    });
  };
  
  const declineInvitation = (id) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        return {
          ...c,
          invitation_status: 'cancelled',
          updated_at: new Date().toISOString()
        };
      }
      return c;
    }));
    toast({
      title: "Đã từ chối",
      description: "Đã từ chối lời mời tham gia chiến dịch",
    });
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

  const revertToDraft = (id) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: 'draft', updated_at: new Date().toISOString() } : c
    ));
    toast({
      title: "Đã chuyển về nháp",
      description: "Chiến dịch đã được chuyển về trạng thái nháp",
    });
  };

  const activateCampaign = (id) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const now = new Date();
        const startDate = new Date(c.start_date);
        const inviteDate = c.invitation_send_date ? new Date(c.invitation_send_date) : undefined;
        
        let newStatus = 'active';
        
        if (inviteDate && inviteDate > now) {
          newStatus = 'scheduled';
        } else if (!inviteDate && startDate > now) {
          newStatus = 'scheduled';
        } else if (inviteDate && inviteDate <= now) {
          newStatus = 'inviting_students';
        } else {
          newStatus = 'active';
        }

        return { ...c, status: newStatus, updated_at: new Date().toISOString() };
      }
      return c;
    }));
    toast({
      title: "Đã kích hoạt",
      description: "Chiến dịch đã được kích hoạt thành công",
    });
  };

  return {
    campaigns: filteredCampaigns,
    allCampaigns: allFormattedCampaigns,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
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
    activateCampaign,
    refreshCampaigns: fetchCampaigns,
    isLoading
  };
}