import { useState, useMemo, useEffect } from 'react';
import { getGameLevelsForPartnership } from '@/shared/data/admin-game-levels.data';
import { partnershipCampaignService } from '../../../services/partnershipCampaign.service';
import { quizzesService } from '../../quizzes/services/quizzes.service';
import { toLocalISO, toUTCISO } from '@/utils/dateUtils';

const mockQuizzes = [];

const adminPartnershipLevels = getGameLevelsForPartnership().map(level => ({
  id: level.id.toString(),
  name: level.name,
  gameType: level.gameType === 'sorting' ? 'collection-sorting' : 'run-sorting',
  difficulty: level.difficulty,
  binTypes: level.binTypes || [],
}));

export function usePartnershipCampaigns() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [selectedCampaignForConfig, setSelectedCampaignForConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [availableSchools, setAvailableSchools] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [availableGameLevels] = useState(adminPartnershipLevels);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const isEditing = !!editingId;

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Xác nhận',
    onConfirm: () => {},
    variant: 'default'
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await partnershipCampaignService.getCampaigns();
      const normalizedData = (res.data?.data || []).map(campaign => ({
        ...campaign,
        status: (s => {
          const status = s?.toLowerCase();
          if (status === 'active') return 'on_going';
          if (status === 'joining') return 'inviting';
          return status || '';
        })(campaign.status),
        startDate: toLocalISO(campaign.startDate),
        endDate: toLocalISO(campaign.endDate),
        registrationDate: toLocalISO(campaign.registrationDate),
        registrationDeadline: toLocalISO(campaign.registrationDeadline || campaign.registrationDateDeadline),
        invitationDate: toLocalISO(campaign.invitationDate),
        invitationDeadline: toLocalISO(campaign.invitationDeadline),
        hasGame: campaign.hasGame ?? false,
        hasQuiz: campaign.hasQuiz ?? false,
        rounds: (campaign.rounds || campaign.qualifying_rounds || []).map(r => ({
          ...r,
          startTime: toLocalISO(r.startTime),
          endTime: toLocalISO(r.endTime)
        }))
      }));
      setCampaigns(normalizedData);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleSchools = async () => {
    try {
      const res = await partnershipCampaignService.getEligibleSchools();
      setAvailableSchools(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch eligible schools', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await quizzesService.getQuizzes();
      const published = (res.data?.data || []).filter(q => q.published);
      
      const quizzesWithDetails = await Promise.all(
        published.map(async (q) => {
          try {
            const detailRes = await quizzesService.getQuizDetail(q.id);
            const detail = detailRes.data?.data;
            return {
              ...q,
              title: detail?.name || q.name || q.title,
              difficulty: detail?.difficulty?.toLowerCase() || q.difficulty?.toLowerCase() || 'easy',
              question_count: detail?.questions?.length || detail?.questionsCount || 0
            };
          } catch (e) {
            console.error(`Failed to fetch detail for quiz ${q.id}`, e);
            return {
              ...q,
              title: q.name || q.title,
              difficulty: q.difficulty?.toLowerCase() || 'easy',
              question_count: q.questionsCount || 0
            };
          }
        })
      );
      
      setAvailableQuizzes(quizzesWithDetails);
    } catch (error) {
      console.error('Failed to fetch quizzes', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchEligibleSchools();
    fetchQuizzes();
  }, []);

  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDate: '',
    registrationDeadline: '',
    invitationDate: '',
    invitationDeadline: '',
    bannerImageUrl: '',
    maxStudentsPerSchool: 0,
    totalStudentQuota: 0,
    topRankingCount: 0,
    schoolIds: [],
    rewards: [
      {
        rankPosition: 1,
        rewardName: '',
        description: '',
        imageUrl: '',
        sponsorName: ''
      }
    ],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Vòng sơ loại',
        startTime: '',
        endTime: '',
        maxParticipants: 0,
        advanceCount: 0,
        isFinalRound: false
      }
    ],
  });

  const stats = useMemo(() => {
    const draft = campaigns.filter(c => c.status === 'draft').length;
    const scheduled = campaigns.filter(c => c.status === 'scheduled').length;
    const inviting = campaigns.filter(c => c.status === 'inviting').length;
    const on_going = campaigns.filter(c => c.status === 'on_going').length;
    const completed = campaigns.filter(c => c.status === 'completed').length;
    const cancelled = campaigns.filter(c => c.status === 'cancelled').length;
    
    const total_schools = campaigns.reduce((sum, c) => sum + c.schools_count, 0);
    const total_students = campaigns.reduce((sum, c) => sum + c.students_count, 0);

    return { draft, scheduled, inviting, on_going, completed, cancelled, total_schools, total_students };
  }, [campaigns]);


  const getCampaignsByStatus = (status) => {
    return campaigns.filter(c => c.status === status);
  };

  const handleViewDetail = async (campaign) => {
    try {
      setLoading(true);
      const [detailRes, rewardsRes] = await Promise.all([
        partnershipCampaignService.getCampaignById(campaign.id),
        partnershipCampaignService.getCampaignRewards(campaign.id)
      ]);

      const detailData = detailRes.data?.data;
      const rewardsData = rewardsRes.data?.data;

      if (detailData) {
        // Normalize
        setSelectedCampaign({
          ...detailData,
          status: (s => {
            const status = s?.toLowerCase();
            if (status === 'active') return 'on_going';
            if (status === 'joining') return 'inviting';
            return status || '';
          })(detailData.status),
          startDate: toLocalISO(detailData.startDate),
          endDate: toLocalISO(detailData.endDate),
          registrationDate: toLocalISO(detailData.registrationDate),
          registrationDeadline: toLocalISO(detailData.registrationDeadline || detailData.registrationDateDeadline),
          invitationDate: toLocalISO(detailData.invitationDate),
          invitationDeadline: toLocalISO(detailData.invitationDeadline),
          rounds: (detailData.rounds || detailData.qualifying_rounds || []).map(r => ({
            ...r,
            startTime: toLocalISO(r.startTime),
            endTime: toLocalISO(r.endTime)
          })),
          schoolParticipations: detailData.invitedSchools || [], // Mapping for UI compatibility
          rewards: rewardsData || []
        });
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch campaign details or rewards', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCampaign(null);
  };

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setEditingId(null);
    resetForm();
  };

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      campaignName: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDate: '',
      registrationDeadline: '',
      invitationDate: '',
      invitationDeadline: '',
      maxStudentsPerSchool: 0,
      totalStudentQuota: 0,
      topRankingCount: 0,
      bannerImageUrl: '',
      schoolIds: [],
      rewards: [
        {
          rankPosition: 1,
          rewardName: '',
          description: '',
          imageUrl: '',
          sponsorName: ''
        }
      ],
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Vòng sơ loại',
          startTime: '',
          endTime: '',
          maxParticipants: 0,
          advanceCount: 0,
          isFinalRound: false
        }
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Explicitly construct payload to match schema exactly
      const payload = {
        campaignName: formData.campaignName,
        description: formData.description,
        startDate: toUTCISO(formData.startDate),
        endDate: toUTCISO(formData.endDate),
        registrationDate: toUTCISO(formData.registrationDate),
        registrationDeadline: toUTCISO(formData.registrationDeadline),
        invitationDate: toUTCISO(formData.invitationDate),
        invitationDeadline: toUTCISO(formData.invitationDeadline),
        maxStudentsPerSchool: parseInt(formData.maxStudentsPerSchool) || 0,
        totalStudentQuota: parseInt(formData.totalStudentQuota) || 0,
        topRankingCount: parseInt(formData.topRankingCount) || 0,
        bannerImageUrl: formData.bannerImageUrl || '',
        schoolIds: formData.schoolIds,
        rewards: formData.rewards.map(r => ({
          rankPosition: parseInt(r.rankPosition) || 1,
          rewardName: r.rewardName || '',
          description: r.description || '',
          imageUrl: r.imageUrl || '',
          sponsorName: r.sponsorName || ''
        })),
        rounds: formData.rounds.map(r => ({
          roundNumber: parseInt(r.roundNumber),
          roundName: r.roundName,
          startTime: toUTCISO(r.startTime),
          endTime: toUTCISO(r.endTime),
          maxParticipants: parseInt(r.maxParticipants) || 0,
          advanceCount: parseInt(r.advanceCount) || 0,
          isFinalRound: r.isFinalRound
        }))
      };

      if (isEditing) {
        await partnershipCampaignService.updateCampaign(editingId, payload);
        console.log('Campaign updated successfully');
      } else {
        await partnershipCampaignService.createCampaign(payload);
        console.log('Campaign created successfully');
      }
      await fetchCampaigns();
      handleCloseCreate();
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} campaign`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (campaign) => {
    try {
      setLoading(true);
      const [detailRes, rewardsRes] = await Promise.all([
        partnershipCampaignService.getCampaignById(campaign.id),
        partnershipCampaignService.getCampaignRewards(campaign.id)
      ]);

      const detail = detailRes.data?.data;
      const rewards = rewardsRes.data?.data || [];

      if (detail) {
        setFormData({
          campaignName: detail.campaignName,
          description: detail.description,
          startDate: toLocalISO(detail.startDate),
          endDate: toLocalISO(detail.endDate),
          registrationDate: toLocalISO(detail.registrationDate || ''),
          registrationDeadline: toLocalISO(detail.registrationDeadline || detail.registrationDateDeadline || ''),
          invitationDate: toLocalISO(detail.invitationDate || ''),
          invitationDeadline: toLocalISO(detail.invitationDeadline || ''),
          bannerImageUrl: detail.bannerImageUrl || '',
          maxStudentsPerSchool: detail.maxStudentsPerSchool || 0,
          totalStudentQuota: detail.totalStudentQuota || 0,
          topRankingCount: detail.topRankingCount || 0,
          schoolIds: (detail.invitedSchools || []).map(s => s.schoolId),
          rewards: rewards.length > 0 ? rewards.map(r => ({
            rankPosition: r.rankPosition,
            rewardName: r.rewardName,
            description: r.description,
            imageUrl: r.imageUrl,
            previewUrl: r.imagePresignedUrl,
            sponsorName: r.sponsorName
          })) : [
            {
              rankPosition: 1,
              rewardName: '',
              description: '',
              imageUrl: '',
              sponsorName: ''
            }
          ],
          rounds: (detail.rounds || []).map(r => ({
            id: r.id,
            roundNumber: r.roundNumber,
            roundName: r.roundName,
            startTime: toLocalISO(r.startTime),
            endTime: toLocalISO(r.endTime),
            maxParticipants: r.maxParticipants,
            advanceCount: r.advanceCount,
            isFinalRound: r.isFinalRound
          })),
        });
        setEditingId(campaign.id);
        setIsCreateOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch campaign details for editing', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (campaign) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      description: `Bạn có chắc chắn muốn xóa chiến dịch "${campaign.campaignName}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa ngay',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setLoading(true);
          await partnershipCampaignService.deleteCampaign(campaign.id);
          await fetchCampaigns();
          console.log('Campaign deleted successfully');
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to delete campaign', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleActivate = async (campaign) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Kích hoạt chiến dịch',
      description: `Bạn có chắc chắn muốn kích hoạt chiến dịch "${campaign.campaignName}"? Chiến dịch sẽ sẵn sàng để mời các trường tham gia.`,
      confirmText: 'Kích hoạt ngay',
      variant: 'eco-blue',
      onConfirm: async () => {
        try {
          setLoading(true);
          await partnershipCampaignService.activateCampaign(campaign.id);
          await fetchCampaigns();
          console.log('Campaign activated successfully:', campaign.id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to activate campaign', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRevertToDraft = async (campaign) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Chuyển về bản nháp',
      description: `Chuyển chiến dịch "${campaign.campaignName}" về nháp để chỉnh sửa?`,
      confirmText: 'Đồng ý',
      variant: 'eco-orange',
      onConfirm: async () => {
        try {
          setLoading(true);
          await partnershipCampaignService.setDraftCampaign(campaign.id);
          await fetchCampaigns();
          console.log('Campaign reverted to draft successfully:', campaign.id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to revert campaign to draft', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCancel = async (campaign) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy chiến dịch',
      description: `Bạn có chắc chắn muốn hủy chiến dịch "${campaign.campaignName}"? Hành động này sẽ dừng toàn bộ hoạt động mời thầu.`,
      confirmText: 'Hủy chiến dịch',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          setLoading(true);
          await partnershipCampaignService.cancelCampaign(campaign.id);
          await fetchCampaigns();
          console.log('Campaign cancelled successfully:', campaign.id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to cancel campaign', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleOpenAddGame = async (campaign) => {
    try {
      if (!campaign.rounds && !campaign.qualifying_rounds) {
        setLoading(true);
        const res = await partnershipCampaignService.getCampaignById(campaign.id);
        const fullDetail = res.data?.data;
        if (fullDetail) {
          setSelectedCampaignForConfig(fullDetail);
        } else {
          setSelectedCampaignForConfig(campaign);
        }
      } else {
        setSelectedCampaignForConfig(campaign);
      }
      setIsAddGameOpen(true);
    } catch (error) {
      console.error('Failed to fetch campaign details for game configuration', error);
      setSelectedCampaignForConfig(campaign);
      setIsAddGameOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseAddGame = () => {
    setIsAddGameOpen(false);
    setSelectedCampaignForConfig(null);
  };

  const handleOpenAddQuiz = async (campaign) => {
    try {
      if (!campaign.rounds && !campaign.qualifying_rounds) {
        setLoading(true);
        const res = await partnershipCampaignService.getCampaignById(campaign.id);
        const fullDetail = res.data?.data;
        if (fullDetail) {
          setSelectedCampaignForConfig(fullDetail);
        } else {
          setSelectedCampaignForConfig(campaign);
        }
      } else {
        setSelectedCampaignForConfig(campaign);
      }
      setIsAddQuizOpen(true);
    } catch (error) {
      console.error('Failed to fetch campaign details for quiz configuration', error);
      setSelectedCampaignForConfig(campaign);
      setIsAddQuizOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseAddQuiz = () => {
    setIsAddQuizOpen(false);
    setSelectedCampaignForConfig(null);
  };

  const handleAddGameSubmit = async () => {
    try {
      setLoading(true);
      await fetchCampaigns();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      handleCloseAddGame();
    }
  };

  const handleAddQuizSubmit = async (roundsWithQuizzes) => {
    try {
      setLoading(true);
      const bindPromises = roundsWithQuizzes
        .filter(r => r.id) // Only bind rounds that have an ID
        .map(r => {
          // Wrapped in an array of objects with user-defined settings
          const payload = [
            {
              quizIds: r.quiz_ids,
              maxAttempts: r.maxAttempts,
              isRequired: r.isRequired
            }
          ];
          return partnershipCampaignService.bindQuizzesToRound(r.id, payload);
        });
      
      await Promise.all(bindPromises);
      console.log('Quizzes bound to rounds successfully');
      
      await fetchCampaigns();
      handleCloseAddQuiz();
    } catch (error) {
      console.error('Failed to bind quizzes to rounds', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    campaigns,
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
    handleRevertToDraft,
    
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

    confirmConfig,
    setConfirmConfig,

    isAddGameOpen,
    isAddQuizOpen,
    selectedCampaignForConfig,
    handleOpenAddGame,
    handleCloseAddGame,
    handleOpenAddQuiz,
    handleCloseAddQuiz,
    handleAddGameSubmit,
    handleAddQuizSubmit,
  };
}