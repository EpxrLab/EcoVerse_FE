import { useState, useMemo } from 'react';
import { getGameLevelsForPartnership } from '@/shared/data/admin-game-levels.data';

const mockCampaigns = [
  {
    id: '1',
    name: 'Chiến dịch Thu gom rác thải nhựa 2026',
    description: 'Chiến dịch thu gom và phân loại rác thải nhựa tại các trường học',
    status: 'active',
    start_date: '2026-01-15',
    end_date: '2026-03-15',
    invitation_send_date: '2026-01-10',
    schools_count: 12,
    students_count: 1580,
    participation_rate: 78,
    created_at: '2026-01-01',
    school_participations: [
      { school_id: 's1', school_name: 'Trường Tiểu học Nguyễn Du', status: 'accepted', student_limit: 150 },
      { school_id: 's2', school_name: 'Trường Tiểu học Lê Quý Đôn', status: 'accepted', student_limit: 120 },
    ],
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2026-01-05',
        end_date: '2026-01-10',
        quiz_ids: [],
        selected_game_type: 'collection-sorting',
        game_level_ids: [],
        advancement_limit: 100,
      },
    ],
  },
  {
    id: '2',
    name: 'Tuần lễ môi trường xanh 2025',
    description: 'Các hoạt động nâng cao nhận thức về bảo vệ môi trường',
    status: 'completed',
    start_date: '2025-11-01',
    end_date: '2025-11-07',
    invitation_send_date: '2025-10-25',
    schools_count: 8,
    students_count: 950,
    participation_rate: 92,
    created_at: '2025-10-15',
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2025-10-26',
        end_date: '2025-10-31',
        quiz_ids: [],
        selected_game_type: 'run-sorting',
        game_level_ids: [],
        advancement_limit: 50,
      },
    ],
  },
  {
    id: '3',
    name: 'Trồng cây xanh - Tương lai xanh',
    description: 'Chiến dịch trồng cây và chăm sóc cây xanh tại trường học',
    status: 'draft',
    start_date: '2026-04-01',
    end_date: '2026-05-31',
    invitation_send_date: '2026-03-15',
    schools_count: 0,
    students_count: 0,
    created_at: '2026-02-01',
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '',
        end_date: '',
        quiz_ids: [],
        selected_game_type: '',
        game_level_ids: [],
        advancement_limit: 10,
      },
    ],
  },
  {
    id: '4',
    name: 'Không khói bụi cho tương lai',
    description: 'Chiến dịch giảm thiểu khí thải và khói bụi',
    status: 'inviting',
    start_date: '2026-02-15',
    end_date: '2026-03-31',
    invitation_send_date: '2026-01-25',
    schools_count: 5,
    students_count: 500,
    created_at: '2026-01-25',
    school_participations: [
      { school_id: 's1', school_name: 'Trường Tiểu học Nguyễn Du', status: 'accepted', student_limit: 100 },
      { school_id: 's2', school_name: 'Trường Tiểu học Lê Quý Đôn', status: 'invited', student_limit: 100 },
      { school_id: 's3', school_name: 'Trường Tiểu học Trần Hưng Đạo', status: 'declined', student_limit: 100 },
      { school_id: 's4', school_name: 'Trường Tiểu học Võ Thị Sáu', status: 'invited', student_limit: 100 },
    ],
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2026-02-01',
        end_date: '2026-02-10',
        quiz_ids: [],
        selected_game_type: 'collection-sorting',
        game_level_ids: [],
        advancement_limit: 30,
      },
    ],
  },
  {
    id: '5',
    name: 'Giải cứu đại dương',
    description: 'Chiến dịch làm sạch bãi biển và tìm hiểu về sinh vật biển. Dành cho các trường ven biển.',
    status: 'scheduled',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    invitation_send_date: '2026-05-01',
    schools_count: 3,
    students_count: 300,
    created_at: '2026-01-26',
    school_participations: [
       { school_id: 's2', school_name: 'Trường Tiểu học Lê Quý Đôn', status: 'accepted', student_limit: 100 },
    ],
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2026-05-15',
        end_date: '2026-05-25',
        quiz_ids: [],
        selected_game_type: 'run-sorting',
        game_level_ids: [],
        advancement_limit: 20,
      },
    ],
  },
  {
    id: '6',
    name: 'Tái chế pin cũ',
    description: 'Thu gom pin cũ đổi lấy quà tặng xanh. Chương trình thí điểm.',
    status: 'cancelled',
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    invitation_send_date: '2025-11-15',
    schools_count: 2,
    students_count: 400,
    created_at: '2025-11-01',
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2025-11-20',
        end_date: '2025-11-25',
        quiz_ids: [],
        selected_game_type: 'collection-sorting',
        game_level_ids: [],
        advancement_limit: 15,
      },
    ],
  }
];

const mockSchools = [
  { id: 's1', school_name: 'Trường Tiểu học Nguyễn Du', address: '123 Nguyễn Du', district: 'Quận 1', city: 'TP. Hồ Chí Minh', student_count: 450 },
  { id: 's2', school_name: 'Trường Tiểu học Lê Quý Đôn', address: '456 Lê Quý Đôn', district: 'Quận 3', city: 'TP. Hồ Chí Minh', student_count: 380 },
  { id: 's3', school_name: 'Trường Tiểu học Trần Hưng Đạo', address: '789 Trần Hưng Đạo', district: 'Quận 5', city: 'TP. Hồ Chí Minh', student_count: 520 },
  { id: 's4', school_name: 'Trường Tiểu học Võ Thị Sáu', address: '321 Võ Thị Sáu', district: 'Quận 3', city: 'TP. Hồ Chí Minh', student_count: 410 },
];

const mockQuizzes = [
  { id: 'q1', title: 'Quiz Phân loại rác cơ bản', difficulty: 'easy', question_count: 10 },
  { id: 'q2', title: 'Quiz Tái chế nhựa', difficulty: 'medium', question_count: 15 },
  { id: 'q3', title: 'Quiz Bảo vệ môi trường', difficulty: 'hard', question_count: 20 },
  { id: 'q4', title: 'Quiz Rác thải hữu cơ', difficulty: 'easy', question_count: 8 },
];

const adminPartnershipLevels = getGameLevelsForPartnership().map(level => ({
  id: level.id.toString(),
  name: level.name,
  gameType: level.gameType === 'sorting' ? 'collection-sorting' : 'run-sorting',
  difficulty: level.difficulty,
}));

export function usePartnershipCampaigns() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [availableSchools] = useState(mockSchools);
  const [availableQuizzes] = useState(mockQuizzes);
  const [availableGameLevels] = useState(adminPartnershipLevels);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    invitation_send_date: '',
    school_participations: [],
    quiz_ids: [],
    selected_game_type: '',
    game_level_ids: [],
    reward_images: [],
    status: 'draft',
    qualifying_rounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '',
        end_date: '',
        quiz_ids: [],
        selected_game_type: '',
        game_level_ids: [],
        advancement_limit: 10,
      },
    ],
  });

  const stats = useMemo(() => {
    const draft = campaigns.filter(c => c.status === 'draft').length;
    const scheduled = campaigns.filter(c => c.status === 'scheduled').length;
    const inviting = campaigns.filter(c => c.status === 'inviting').length;
    const active = campaigns.filter(c => c.status === 'active').length;
    const completed = campaigns.filter(c => c.status === 'completed').length;
    const cancelled = campaigns.filter(c => c.status === 'cancelled').length;
    
    const total_schools = campaigns.reduce((sum, c) => sum + c.schools_count, 0);
    const total_students = campaigns.reduce((sum, c) => sum + c.students_count, 0);

    return { draft, scheduled, inviting, active, completed, cancelled, total_schools, total_students };
  }, [campaigns]);

  if (campaigns.some(c => c.status === 'scheduled' && c.invitation_send_date && new Date(c.invitation_send_date) <= new Date())) {
      setCampaigns(prev => prev.map(c => {
         if (c.status === 'scheduled' && c.invitation_send_date && new Date(c.invitation_send_date) <= new Date()) {
           return { ...c, status: 'inviting' };
         }
         return c;
      }));
  }

  const getCampaignsByStatus = (status) => {
    return campaigns.filter(c => c.status === status);
  };

  const handleViewDetail = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailOpen(true);
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
    resetForm();
  };

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      invitation_send_date: '',
      school_participations: [],
      quiz_ids: [],
      selected_game_type: '',
      game_level_ids: [],
      reward_images: [],
      status: 'draft',
      qualifying_rounds: [
        {
          round_number: 1,
          round_name: 'Vòng loại 1',
          start_date: '',
          end_date: '',
          quiz_ids: [],
          selected_game_type: '',
          game_level_ids: [],
          advancement_limit: 10,
        },
      ],
    });
  };

  const handleSubmit = (asDraft) => {
    const totalStudents = formData.school_participations.reduce((sum, sp) => {
      const school = availableSchools.find(s => s.id === sp.school_id);
      if (!school) return sum;
      return sum + (sp.student_limit || school.student_count);
    }, 0);

    const rewardImageUrls = formData.reward_images?.map((file) => {
      return URL.createObjectURL(file);
    }) || [];

    const newCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      invitation_send_date: formData.invitation_send_date,
      status: asDraft ? 'draft' : 'active',
      schools_count: formData.school_participations.length,
      students_count: totalStudents,
      created_at: new Date().toISOString(),
      school_participations: formData.school_participations,
      quiz_ids: formData.quiz_ids,
      selected_game_type: formData.selected_game_type,
      game_level_ids: formData.game_level_ids,
      reward_image_urls: rewardImageUrls,
      qualifying_rounds: formData.qualifying_rounds,
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    handleCloseCreate();
    
    console.log('Creating campaign:', newCampaign);
  };

  const handleEdit = (campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      invitation_send_date: campaign.invitation_send_date || '',
      school_participations: campaign.school_participations || [],
      quiz_ids: campaign.quiz_ids || [],
      selected_game_type: campaign.selected_game_type,
      game_level_ids: campaign.game_level_ids,
      reward_images: [],
      status: 'draft',
      qualifying_rounds: campaign.qualifying_rounds && campaign.qualifying_rounds.length > 0 ? campaign.qualifying_rounds : [
        {
          round_number: 1,
          round_name: 'Vòng loại 1',
          start_date: '',
          end_date: '',
          quiz_ids: [],
          selected_game_type: '',
          game_level_ids: [],
          advancement_limit: 10,
        },
      ],
    });
    setIsCreateOpen(true);
    
    console.log('Editing campaign:', campaign);
  };

  const handleDelete = (campaign) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${campaign.name}"?`)) {
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
      
      console.log('Deleting campaign:', campaign.id);
    }
  };

  const handleActivate = (campaign) => {
    if (confirm(`Bạn có chắc chắn muốn kích hoạt chiến dịch "${campaign.name}"?`)) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaign.id) {
           const now = new Date();
           const inviteDate = c.invitation_send_date ? new Date(c.invitation_send_date) : now;
           
           if (inviteDate > now) {
             return { ...c, status: 'scheduled' };
           } else {
             return { ...c, status: 'inviting', invitation_send_date: (!c.invitation_send_date) ? now.toISOString() : c.invitation_send_date };
           }
        }
        return c;
      }));
      
      console.log('Activating campaign:', campaign.id);
    }
  };

  const handleRevertToDraft = (campaign) => {
    if (confirm(`Chuyển chiến dịch "${campaign.name}" về nháp để chỉnh sửa?`)) {
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, status: 'draft' } : c
      ));
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
    handleActivate,
    handleRevertToDraft,
    
    isCreateOpen,
    handleOpenCreate,
    handleCloseCreate,
    formData,
    updateFormData,
    availableSchools,
    availableQuizzes,
    availableGameLevels,
    handleSubmit,
  };
}