import { useState, useMemo } from 'react';
import { mockCampaigns, mockAvailableClasses, mockStudentInvitations, mockSchoolInvitations } from '../../../data/campaign.data';
import { defaultQuizzesData, customQuizzesData } from '../../../data/quiz.data';
import { getGameLevelsForSchool } from '@/shared/data/admin-game-levels.data';
import { toast } from '@/shared/hooks/use-toast';


export function useCampaigns() {
  // Link student invitations to campaigns

  const campaignsWithInvitations = useMemo(() => {
    // Helper to attach invitations
    const attachInvitations = (list) => list.map(campaign => ({
      ...campaign,
      student_invitations: mockStudentInvitations.filter(inv => inv.campaign_id === campaign.id),
    }));

    const campaignsList = attachInvitations(mockCampaigns);
    const partnershipList = attachInvitations(mockSchoolInvitations);
    
    return [...campaignsList, ...partnershipList];
  }, []);

  const [campaigns, setCampaigns] = useState(campaignsWithInvitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
      invitingCampaigns: campaigns.filter(c => c.status === 'inviting_students').length,
      completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
      cancelledCampaigns: campaigns.filter(c => c.status === 'cancelled').length,
      pendingInvitations: campaigns.filter(c => c.origin === 'partnership' && c.invitation_status === 'pending').length,
      totalItemsCollected: campaigns.reduce((sum, c) => sum + (c.total_items_collected || 0), 0),
    };
  }, [campaigns]);


  const availableClasses = mockAvailableClasses;
  
  // Get all available quizzes (both default and custom)
  const availableQuizzes = useMemo(() => {
    return [...defaultQuizzesData, ...customQuizzesData.filter(q => q.status === 'published')];
  }, []);

  const addCampaign = (data) => {
    const selectedClasses = availableClasses.filter(c => data.class_ids.includes(c.id));
    
    // Build selected quizzes from quiz_ids
    const selectedQuizzes = data.quiz_ids.map(quizId => {
      const quiz = availableQuizzes.find(q => q.id === quizId);
      return {
        quiz_id: quizId,
        quiz_title: quiz?.title || '',
        difficulty: quiz?.difficulty || 'easy',
        questions_count: quiz?.questions || 0,
      };
    });

    // Build selected levels from level_ids
    const schoolLevels = getGameLevelsForSchool();
    const selectedLevels = data.level_ids.map(levelId => {
      const level = schoolLevels.find(l => l.id === levelId);
      return {
        level_id: levelId,
        level_name: level?.name || '',
        game_type: level?.gameType || 'sorting',
        difficulty: level?.difficulty || 'Dễ',
      };
    });

    // Calculate invitation deadline (1 day before start_date)
    const invitationDeadline = data.start_date 
      ? new Date(new Date(data.start_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    const newCampaign = {
      id: Date.now().toString(),
      school_id: 'school-1',
      name: data.name,
      description: data.description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      invitation_send_date: data.invitation_send_date,
      invitation_deadline: invitationDeadline,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      selected_quizzes: selectedQuizzes,
      selected_games: data.game_types,
      selected_levels: selectedLevels,
      participating_classes: selectedClasses.map(c => ({
        id: `pc-${Date.now()}-${c.id}`,
        campaign_id: Date.now().toString(),
        class_id: c.id,
        class_name: c.name,
        grade: c.grade,
        students_count: c.students_count,
        items_collected: 0,
        joined_at: new Date().toISOString(),
      })),
      total_students: selectedClasses.reduce((sum, c) => sum + c.students_count, 0),
      total_items_collected: 0,
      progress_percentage: 0,
    };

    setCampaigns([newCampaign, ...campaigns]);
    toast({
      title: "Thành công",
      description: `Đã tạo chiến dịch "${data.name}"`,
    });
  };

  const updateCampaign = (id, data) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const updatedClasses = data.class_ids 
          ? availableClasses.filter(ac => data.class_ids?.includes(ac.id)).map(ac => ({
              id: `pc-${Date.now()}-${ac.id}`,
              campaign_id: id,
              class_id: ac.id,
              class_name: ac.name,
              grade: ac.grade,
              students_count: ac.students_count,
              items_collected: c.participating_classes?.find(pc => pc.class_id === ac.id)?.items_collected || 0,
              joined_at: new Date().toISOString(),
            }))
          : c.participating_classes;
        
        // Update selected quizzes if quiz_ids provided
        const updatedQuizzes = data.quiz_ids
          ? data.quiz_ids.map(quizId => {
              const quiz = availableQuizzes.find(q => q.id === quizId);
              return {
                quiz_id: quizId,
                quiz_title: quiz?.title || '',
                difficulty: quiz?.difficulty || 'easy',
                questions_count: quiz?.questions || 0,
              };
            })
          : c.selected_quizzes;
        
        // Update selected levels if level_ids provided
        const schoolLevels = getGameLevelsForSchool();
        const updatedLevels = data.level_ids
          ? data.level_ids.map(levelId => {
              const level = schoolLevels.find(l => l.id === levelId);
              return {
                level_id: levelId,
                level_name: level?.name || '',
                game_type: level?.gameType || 'sorting',
                difficulty: level?.difficulty || 'Dễ',
              };
            })
          : c.selected_levels;

        // Handle game config from AddGameModal
        const updatedGames = data.selected_games !== undefined ? data.selected_games : (data.game_types || c.selected_games);
        const updatedGameConfigs = data.game_configs !== undefined ? data.game_configs : c.game_configs;
        const updatedWasteItemIds = data.waste_item_ids !== undefined ? data.waste_item_ids : c.waste_item_ids;
        
        return {
          ...c,
          ...data,
          participating_classes: updatedClasses,
          selected_quizzes: updatedQuizzes,
          selected_levels: updatedLevels,
          selected_games: updatedGames,
          game_configs: updatedGameConfigs,
          waste_item_ids: updatedWasteItemIds,
          total_students: updatedClasses?.reduce((sum, pc) => sum + pc.students_count, 0) || 0,
          updated_at: new Date().toISOString(),
        };
      }
      return c;
    }));
    toast({
      title: "Thành công",
      description: "Đã cập nhật chiến dịch",
    });
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
    allCampaigns: campaigns,
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
    activateCampaign
  };
}