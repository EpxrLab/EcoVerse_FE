// Qualifying Round structure
export const QualifyingRound = {
  round_number: 1, // number: 1, 2, 3...
  round_name: "", // string: "Vòng loại 1"
  start_date: "", // string (ISO date)
  end_date: "", // string (ISO date)
  quiz_ids: [], // string[]
  selected_game_type: "", // 'collection-sorting' | 'run-sorting' | ''
  game_level_ids: [], // string[]
  advancement_limit: 0, // number
};

// Student Campaign structure
export const StudentCampaign = {
  id: "",
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "",
  type: "",

  studentProgress: {
    totalPoints: 0,
    rank: 0,
    quizzesCompleted: 0,
    gamesPlayed: 0,
    accuracy: 0,
  },

  // Campaign content IDs
  quizIds: [], // string[]
  gameLevelIds: [], // string[]
  rewardIds: [], // string[]

  // Partnership campaign specific
  qualifyingRounds: [],
};

// Campaign stats structure
export const CampaignStats = {
  totalStudents: 0,
  averageScore: 0,
  topScore: 0,
};
