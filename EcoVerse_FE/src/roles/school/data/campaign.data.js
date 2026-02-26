// Mock data for campaigns - Elementary school (Cấp 1: Khối 1-5)

export const mockCampaigns = [
  // 1. Completed Campaign
  {
    id: '1',
    school_id: 'school-1',
    name: 'Tuần lễ xanh',
    description: 'Chiến dịch thu gom rác tái chế trong tuần lễ bảo vệ môi trường. Đã kết thúc thành công rực rỡ.',
    start_date: '2024-03-01',
    end_date: '2024-03-07',
    invitation_send_date: '2024-02-26',
    invitation_deadline: '2024-02-29',
    status: 'completed',
    created_at: '2024-02-25',
    updated_at: '2024-03-07',
    selected_quizzes: [
      { quiz_id: 'default-1', quiz_title: 'Nhập môn Phân loại Rác', difficulty: 'easy', questions_count: 5 },
    ],
    selected_games: ['sorting'],
    participating_classes: [
      { id: 'pc1', campaign_id: '1', class_id: 'c1', class_name: '1A', grade: 1, students_count: 30, items_collected: 450, joined_at: '2024-02-26' },
      { id: 'pc2', campaign_id: '1', class_id: 'c2', class_name: '1B', grade: 1, students_count: 28, items_collected: 380, joined_at: '2024-02-26' },
    ],
    total_students: 58,
    total_items_collected: 830,
    progress_percentage: 100,
    origin: 'school',
  },
  // 2. Active Campaign (Standard)
  {
    id: '2',
    school_id: 'school-1',
    name: 'Tháng hành động vì môi trường',
    description: 'Chiến dịch tháng 4. Học sinh thi đua phân loại rác để tích điểm đổi quà.',
    start_date: '2024-04-01',
    end_date: '2024-04-30',
    status: 'active',
    created_at: '2024-03-20',
    updated_at: '2024-04-01',
    selected_quizzes: [
      { quiz_id: 'default-2', quiz_title: 'Biết Thêm Về Nhựa', difficulty: 'medium', questions_count: 8 },
    ],
    selected_games: ['runner', 'sorting'],
    participating_classes: [
      { id: 'pc3', campaign_id: '2', class_id: 'c3', class_name: '2A', grade: 2, students_count: 32, items_collected: 120, joined_at: '2024-03-25' },
      { id: 'pc4', campaign_id: '2', class_id: 'c4', class_name: '2B', grade: 2, students_count: 30, items_collected: 90, joined_at: '2024-03-25' },
    ],
    total_students: 62,
    total_items_collected: 210,
    progress_percentage: 45,
    origin: 'school',
  },
  // 3. Draft Campaign
  {
    id: '3',
    school_id: 'school-1',
    name: 'Ngày Trái Đất 2025',
    description: 'Kế hoạch cho sự kiện lớn năm sau. Đang trong quá trình soạn thảo nội dung.',
    start_date: '2025-04-22',
    end_date: '2025-04-22',
    status: 'draft',
    created_at: '2024-04-10',
    updated_at: '2024-04-10',
    selected_quizzes: [],
    selected_games: [],
    participating_classes: [],
    total_students: 0,
    total_items_collected: 0,
    progress_percentage: 0,
    origin: 'school',
  },
  // 4. Cancelled Campaign
  {
    id: '4',
    school_id: 'school-1',
    name: 'Chiến dịch Tết xanh',
    description: 'Đã bị hủy do trùng lịch với kỳ nghỉ lễ kéo dài.',
    start_date: '2024-02-10',
    end_date: '2024-02-20',
    status: 'cancelled',
    created_at: '2024-01-15',
    updated_at: '2024-02-05',
    total_students: 0,
    progress_percentage: 0,
    origin: 'school',
  },
  // 5. Scheduled Campaign
  {
    id: '5',
    school_id: 'school-1',
    name: 'Giải chạy xanh mở rộng',
    description: 'Chiến dịch chạy bộ kết hợp nhặt rác quanh khu vực trường.',
    start_date: '2026-05-01',
    end_date: '2026-05-07',
    invitation_send_date: '2026-04-20',
    status: 'scheduled',
    created_at: '2026-01-20',
    updated_at: '2026-01-20',
    total_students: 0,
    total_items_collected: 0,
    progress_percentage: 0,
    origin: 'school',
  },
  // 6. Active Campaign - Recycling Competition
  {
    id: '6',
    school_id: 'school-1',
    name: 'Cuộc thi Tái chế Sáng tạo',
    description: 'Học sinh thi đua sáng tạo đồ dùng từ vật liệu tái chế.',
    start_date: '2024-04-10',
    end_date: '2024-05-10',
    status: 'active',
    created_at: '2024-03-25',
    updated_at: '2024-04-10',
    selected_quizzes: [
      { quiz_id: 'default-3', quiz_title: 'Tái chế Thông minh', difficulty: 'medium', questions_count: 10 },
    ],
    selected_games: ['sorting'],
    participating_classes: [
      { id: 'pc5', campaign_id: '6', class_id: 'c5', class_name: '3A', grade: 3, students_count: 28, items_collected: 85, joined_at: '2024-04-10' },
    ],
    total_students: 28,
    total_items_collected: 85,
    progress_percentage: 35,
    origin: 'school',
  },
  // 7. Draft Campaign - Summer Project
  {
    id: '7',
    school_id: 'school-1',
    name: 'Dự án Hè Xanh 2024',
    description: 'Kế hoạch chiến dịch mùa hè cho học sinh.',
    start_date: '2024-06-15',
    end_date: '2024-08-15',
    status: 'draft',
    created_at: '2024-04-18',
    updated_at: '2024-04-18',
    selected_quizzes: [],
    selected_games: [],
    participating_classes: [],
    total_students: 0,
    total_items_collected: 0,
    progress_percentage: 0,
    origin: 'school',
  },
  // 8. Active Campaign - Waste Reduction
  {
    id: '8',
    school_id: 'school-1',
    name: 'Giảm thiểu Rác thải Nhựa',
    description: 'Chiến dịch nâng cao nhận thức về giảm thiểu rác thải nhựa.',
    start_date: '2024-04-05',
    end_date: '2024-05-05',
    status: 'active',
    created_at: '2024-03-28',
    updated_at: '2024-04-05',
    selected_quizzes: [
      { quiz_id: 'default-4', quiz_title: 'Nhựa và Môi trường', difficulty: 'hard', questions_count: 12 },
    ],
    selected_games: ['runner', 'sorting'],
    participating_classes: [
      { id: 'pc6', campaign_id: '8', class_id: 'c1', class_name: '1A', grade: 1, students_count: 30, items_collected: 150, joined_at: '2024-04-05' },
      { id: 'pc7', campaign_id: '8', class_id: 'c2', class_name: '1B', grade: 1, students_count: 28, items_collected: 130, joined_at: '2024-04-05' },
    ],
    total_students: 58,
    total_items_collected: 280,
    progress_percentage: 55,
    origin: 'school',
  },
  // 9. Completed Campaign - Paper Recycling
  {
    id: '9',
    school_id: 'school-1',
    name: 'Thu gom Giấy Tái chế',
    description: 'Chiến dịch thu gom giấy cũ để tái chế. Đã hoàn thành xuất sắc.',
    start_date: '2024-02-15',
    end_date: '2024-03-15',
    status: 'completed',
    created_at: '2024-02-01',
    updated_at: '2024-03-15',
    selected_quizzes: [
      { quiz_id: 'default-5', quiz_title: 'Giấy và Tái chế', difficulty: 'easy', questions_count: 6 },
    ],
    selected_games: ['sorting'],
    participating_classes: [
      { id: 'pc8', campaign_id: '9', class_id: 'c3', class_name: '2A', grade: 2, students_count: 32, items_collected: 520, joined_at: '2024-02-15' },
      { id: 'pc9', campaign_id: '9', class_id: 'c4', class_name: '2B', grade: 2, students_count: 30, items_collected: 480, joined_at: '2024-02-15' },
    ],
    total_students: 62,
    total_items_collected: 1000,
    progress_percentage: 100,
    origin: 'school',
  },
];

export const mockSchoolInvitations = [
  // 5. Sending Invites (Accepted Partnership -> Inviting Students)
  {
    id: 'inv-5',
    school_id: 'school-1',
    name: 'Thử thách Tái chế Nhựa',
    description: 'Cuộc thi tái chế nhựa do Plastic Free Vietnam tổ chức.',
    start_date: '2024-05-01',
    end_date: '2024-05-30',
    status: 'inviting_students',
    created_at: '2024-04-15',
    updated_at: '2024-04-16',
    origin: 'partnership',
    partnership_name: 'Plastic Free Vietnam',
    student_limit: 100,
    invitation_status: 'accepted',
    invitation_send_date: '2024-04-16',
    invitation_deadline: '2024-04-25',
    selected_games: ['sorting'],
    participating_students: ['s1', 's2', 's3', 's4', 's5'],
    total_students: 5,
    total_items_collected: 0,
    progress_percentage: 0,
    rewards: [
      { id: 'r1', name: 'Bộ dụng cụ học tập', quantity: 20, image: 'https://cdn-icons-png.flaticon.com/512/2625/2625886.png' }
    ]
  },
  // 6. Active Partnership
  {
    id: 'inv-6',
    school_id: 'school-1',
    name: 'Ươm mầm xanh',
    description: 'Dự án trồng cây xanh tại trường học.',
    start_date: '2024-04-15',
    end_date: '2024-05-15',
    status: 'active',
    created_at: '2024-04-01',
    updated_at: '2024-04-15',
    origin: 'partnership',
    partnership_name: 'City Green Project',
    student_limit: 50,
    invitation_status: 'accepted',
    selected_games: ['runner'],
    participating_students: ['s6', 's7', 's8', 's9', 's10'],
    total_students: 5,
    total_items_collected: 45,
    progress_percentage: 30,
    rewards: [
        { id: 'r2', name: 'Chậu cây mini', quantity: 50, image: 'https://cdn-icons-png.flaticon.com/512/628/628324.png' }
    ]
  },
  // 7. Pending Invitation 1
  {
    id: 'inv-1',
    school_id: 'school-1',
    name: 'Chiến dịch Mùa Hè Xanh',
    description: 'Mời tham gia chiến dịch tình nguyện hè.',
    start_date: '2024-06-01',
    end_date: '2024-08-31',
    status: 'active',
    created_at: '2024-05-01',
    updated_at: '2024-05-01',
    origin: 'partnership',
    partnership_name: 'Green Earth Foundation',
    student_limit: 50,
    invitation_status: 'pending',
    total_students: 0,
    rewards: [
         { id: 'r3', name: 'Huy hiệu', quantity: 100 }
    ]
  },
  // 8. Pending Invitation 2
  {
    id: 'inv-3',
    school_id: 'school-1',
    name: 'Giải cứu Đại dương',
    description: 'Tìm hiểu về sinh vật biển và bảo vệ đại dương.',
    start_date: '2024-07-01',
    end_date: '2024-07-31',
    status: 'active',
    created_at: '2024-06-15',
    updated_at: '2024-06-15',
    origin: 'partnership',
    partnership_name: 'Blue Ocean Society',
    student_limit: 40,
    invitation_status: 'pending',
    total_students: 0,
  },
  {
    id: 'inv-4',
    school_id: 'school-1',
    name: 'Không khói bụi cho tương lai',
    description: 'Chiến dịch giảm thiểu khí thải và khói bụi.',
    start_date: '2024-06-01',
    end_date: '2024-07-31',
    status: 'active',
    created_at: '2024-01-25',
    updated_at: '2024-01-25',
    origin: 'partnership',
    partnership_name: 'Green Future Alliance',
    student_limit: 100,
    invitation_status: 'pending',
    total_students: 0,
    rewards: [
       { id: 'r4', name: 'Khẩu trang vải', quantity: 200 }
    ]
  }
];

export const mockStudentInvitations = [
    // For Campaign 1 (Completed) - Finalized statuses only
    { id: 'si1', campaign_id: '1', student_id: 's1', student_name: 'Nguyễn Văn An', class_id: 'c5', class_name: '3A', parent_name: 'Nguyễn Ba', parent_phone: '0901', status: 'accepted', sent_at: '2024-02-26T08:00:00Z', responded_at: '2024-02-27T09:00:00Z' },
    { id: 'si2', campaign_id: '1', student_id: 's2', student_name: 'Trần Thị Bình', class_id: 'c1', class_name: '1A', parent_name: 'Trần Bốn', parent_phone: '0902', status: 'rejected', sent_at: '2024-02-26T08:00:00Z', responded_at: '2024-02-28T10:00:00Z' },

    // For Campaign inv-5 (Sending Invites) - Mixed statuses
    { id: 'si3', campaign_id: 'inv-5', student_id: 's1', student_name: 'Nguyễn Văn An', class_id: 'c5', class_name: '3A', parent_name: 'Nguyễn Ba', parent_phone: '0901', status: 'accepted', sent_at: '2024-04-16T08:00:00Z', responded_at: '2024-04-17T09:00:00Z' },
    { id: 'si4', campaign_id: 'inv-5', student_id: 's2', student_name: 'Trần Thị Bình', class_id: 'c1', class_name: '1A', parent_name: 'Trần Bốn', parent_phone: '0902', status: 'pending', sent_at: '2024-04-16T08:00:00Z', responded_at: null },
    { id: 'si5', campaign_id: 'inv-5', student_id: 's3', student_name: 'Lê Hoàng Cường', class_id: 'c3', class_name: '2A', parent_name: 'Lê Năm', parent_phone: '0903', status: 'rejected', sent_at: '2024-04-16T08:00:00Z', responded_at: '2024-04-18T08:00:00Z' },
    { id: 'si6', campaign_id: 'inv-5', student_id: 's4', student_name: 'Phạm Minh Dũng', class_id: 'c2', class_name: '1B', parent_name: 'Phạm Sáu', parent_phone: '0904', status: 'pending', sent_at: '2024-04-16T08:00:00Z', responded_at: null },
    { id: 'si7', campaign_id: 'inv-5', student_id: 's5', student_name: 'Hoàng Thị Em', class_id: 'c5', class_name: '3A', parent_name: 'Hoàng Bảy', parent_phone: '0905', status: 'pending', sent_at: '2024-04-16T08:00:00Z', responded_at: null },

    // For Campaign inv-6 (Active) - Mostly accepted
    { id: 'si8', campaign_id: 'inv-6', student_id: 's6', student_name: 'Võ Văn Phúc', class_id: 'c4', class_name: '2B', parent_name: 'Võ Tám', parent_phone: '0906', status: 'accepted', sent_at: '2024-04-02T08:00:00Z', responded_at: '2024-04-03T09:00:00Z' },
    { id: 'si9', campaign_id: 'inv-6', student_id: 's7', student_name: 'Đặng Thị Giang', class_id: 'c1', class_name: '1A', parent_name: 'Đặng Chín', parent_phone: '0907', status: 'accepted', sent_at: '2024-04-02T08:00:00Z', responded_at: '2024-04-04T10:00:00Z' },
];

export const mockCampaignStats = {
  totalCampaigns: 4,
  activeCampaigns: 2,
  invitingCampaigns: 1,
  completedCampaigns: 1,
  cancelledCampaigns: 1,
  totalItemsCollected: 1040,
};

// Available classes mock
export const mockAvailableClasses = [
  { id: 'c1', academic_year_id: 'ay-2024', school_id: 'school-1', name: '1A', grade: 1, students_count: 30, created_at: '2024-01-01', updated_at: '2024-01-01', teacher_name: null, description: null },
  { id: 'c2', academic_year_id: 'ay-2024', school_id: 'school-1', name: '1B', grade: 1, students_count: 28, created_at: '2024-01-01', updated_at: '2024-01-01', teacher_name: null, description: null },
  { id: 'c3', academic_year_id: 'ay-2024', school_id: 'school-1', name: '2A', grade: 2, students_count: 32, created_at: '2024-01-01', updated_at: '2024-01-01', teacher_name: null, description: null },
  { id: 'c4', academic_year_id: 'ay-2024', school_id: 'school-1', name: '2B', grade: 2, students_count: 30, created_at: '2024-01-01', updated_at: '2024-01-01', teacher_name: null, description: null },
  { id: 'c5', academic_year_id: 'ay-2024', school_id: 'school-1', name: '3A', grade: 3, students_count: 28, created_at: '2024-01-01', updated_at: '2024-01-01', teacher_name: null, description: null },
];