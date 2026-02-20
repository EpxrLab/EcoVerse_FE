import { useState, useEffect } from 'react';
import type { StudentCampaign } from '../types/campaign.types';

// Mock campaigns data
const mockCampaigns: StudentCampaign[] = [
  {
    id: 'sc1',
    name: 'Tái chế Nhựa',
    description: 'Chiến dịch phân loại và tái chế nhựa hiệu quả',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'active',
    type: 'school',
    studentProgress: {
      totalPoints: 1250,
      rank: 3,
      quizzesCompleted: 8,
      gamesPlayed: 15,
      accuracy: 87,
    },
    quizIds: ['q1', 'q2'],
    gameLevelIds: ['l1', 'l2', 'l3'],
    rewardIds: ['r1', 'r2'],
  },
  {
    id: 'sc2',
    name: 'Tiết kiệm Điện',
    description: 'Học cách tiết kiệm năng lượng trong sinh hoạt',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    status: 'active',
    type: 'school',
    studentProgress: {
      totalPoints: 890,
      rank: 7,
      quizzesCompleted: 5,
      gamesPlayed: 10,
      accuracy: 82,
    },
    quizIds: ['q3'],
    gameLevelIds: ['l4', 'l5'],
    rewardIds: ['r3'],
  },
  {
    id: 'pc1',
    name: 'Không khói bụi',
    description: 'Chiến dịch không khí sạch cùng đối tác',
    startDate: '2026-01-15',
    endDate: '2026-05-15',
    status: 'active',
    type: 'partnership',
    studentProgress: {
      totalPoints: 1580,
      rank: 4,
      quizzesCompleted: 10,
      gamesPlayed: 20,
      accuracy: 91,
    },
    quizIds: ['q4', 'q5'],
    gameLevelIds: ['l6', 'l7', 'l8'],
    rewardIds: ['r4', 'r5', 'r6'],
    qualifyingRounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2026-01-15',
        end_date: '2026-02-15',
        quiz_ids: ['q4'],
        selected_game_type: 'collection-sorting',
        game_level_ids: ['l6'],
        advancement_limit: 100, // Top 100 advance
      },
      {
        round_number: 2,
        round_name: 'Vòng loại 2',
        start_date: '2026-02-16',
        end_date: '2026-03-31',
        quiz_ids: ['q5'],
        selected_game_type: 'collection-sorting',
        game_level_ids: ['l7'],
        advancement_limit: 50, // Top 50 advance
      },
    ],
  },
  {
    id: 'pc2',
    name: 'Đại dương Xanh',
    description: 'Bảo vệ sinh vật biển và môi trường đại dương',
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    status: 'upcoming',
    type: 'partnership',
    quizIds: ['q6'],
    gameLevelIds: ['l9', 'l10'],
    rewardIds: ['r7'],
    qualifyingRounds: [
      {
        round_number: 1,
        round_name: 'Vòng loại 1',
        start_date: '2026-03-01',
        end_date: '2026-04-15',
        quiz_ids: ['q6'],
        selected_game_type: 'run-sorting',
        game_level_ids: ['l9'],
        advancement_limit: 200,
      },
      {
        round_number: 2,
        round_name: 'Vòng loại 2',
        start_date: '2026-04-16',
        end_date: '2026-05-31',
        quiz_ids: [],
        selected_game_type: 'run-sorting',
        game_level_ids: ['l10'],
        advancement_limit: 100,
      },
    ],
  },
  {
    id: 'sc3',
    name: 'Phân loại Rác 2025',
    description: 'Chiến dịch phân loại rác đã hoàn thành',
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'completed',
    type: 'school',
    studentProgress: {
      totalPoints: 2100,
      rank: 2,
      quizzesCompleted: 12,
      gamesPlayed: 25,
      accuracy: 94,
    },
    quizIds: ['q7', 'q8'],
    gameLevelIds: ['l11', 'l12', 'l13'],
    rewardIds: ['r8', 'r9'],
  },
];

export function useStudentCampaigns() {
  const [campaigns, setCampaigns] = useState<StudentCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const getActiveCampaigns = () => campaigns.filter(c => c.status === 'active');
  const getUpcomingCampaigns = () => campaigns.filter(c => c.status === 'upcoming');
  const getCompletedCampaigns = () => campaigns.filter(c => c.status === 'completed');
  const getCampaignById = (id: string) => campaigns.find(c => c.id === id);

  return {
    campaigns,
    loading,
    getActiveCampaigns,
    getUpcomingCampaigns,
    getCompletedCampaigns,
    getCampaignById,
  };
}
