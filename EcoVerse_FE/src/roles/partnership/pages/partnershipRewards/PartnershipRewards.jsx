import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Gift, Flag, Trophy, Package, Truck, CheckCircle, Clock, MapPin, Upload, Image as ImageIcon, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';

// Mock data
const mockCampaigns = [
  { id: '1', name: 'Chiến dịch Thu gom rác thải nhựa 2024' },
  { id: '2', name: 'Tuần lễ môi trường xanh' },
];

const mockTop5Students = [
  { 
    id: '1', 
    rank: 1, 
    studentName: 'Nguyễn Văn An', 
    schoolId: 's1',
    schoolName: 'Trường Tiểu học Nguyễn Du',
    schoolAddress: '123 Nguyễn Du, Quận 1, TP. Hồ Chí Minh',
    totalPoints: 1250,
    rewardStatus: 'delivered',
    rewardImage: 'https://via.placeholder.com/400x300',
    shippingDate: '2024-01-18',
    deliveryDate: '2024-01-20'
  },
  { 
    id: '2', 
    rank: 2, 
    studentName: 'Trần Thị Bình', 
    schoolId: 's2',
    schoolName: 'Trường Tiểu học Lê Quý Đôn',
    schoolAddress: '456 Lê Quý Đôn, Quận 3, TP. Hồ Chí Minh',
    totalPoints: 1180,
    rewardStatus: 'shipping',
    rewardImage: 'https://via.placeholder.com/400x300',
    shippingDate: '2024-01-19',
    deliveryDate: null
  },
  { 
    id: '3', 
    rank: 3, 
    studentName: 'Lê Hoàng Cường', 
    schoolId: 's1',
    schoolName: 'Trường Tiểu học Nguyễn Du',
    schoolAddress: '123 Nguyễn Du, Quận 1, TP. Hồ Chí Minh',
    totalPoints: 1050,
    rewardStatus: 'delivered',
    rewardImage: 'https://via.placeholder.com/400x300',
    shippingDate: '2024-01-18',
    deliveryDate: '2024-01-20'
  },
  { 
    id: '4', 
    rank: 4, 
    studentName: 'Phạm Thị Dung', 
    schoolId: 's3',
    schoolName: 'Trường Tiểu học Võ Thị Sáu',
    schoolAddress: '321 Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    totalPoints: 980,
    rewardStatus: 'pending',
    rewardImage: null,
    shippingDate: null,
    deliveryDate: null
  },
  { 
    id: '5', 
    rank: 5, 
    studentName: 'Hoàng Văn Em', 
    schoolId: 's4',
    schoolName: 'Trường Tiểu học Trần Hưng Đạo',
    schoolAddress: '789 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
    totalPoints: 920,
    rewardStatus: 'pending',
    rewardImage: null,
    shippingDate: null,
    deliveryDate: null
  },
];

export default function PartnershipRewards() {
  const [selectedCampaign, setSelectedCampaign] = useState('1');
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shippingNotes, setShippingNotes] = useState('');
  const [rewardImageFile, setRewardImageFile] = useState(null);
  const [rewardImagePreview, setRewardImagePreview] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25';
      case 'shipping':
        return 'bg-eco-blue/15 text-eco-blue border-eco-blue/25';
      case 'delivered':
        return 'bg-eco-green/15 text-eco-green border-eco-green/25';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ gửi';
      case 'shipping':
        return 'Đang gửi';
      case 'delivered':
        return 'Đã giao';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'shipping':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getInitials = (name) => {
    const parts = name.split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const getRankIcon = (rank) => {
    const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600', 'text-eco-blue', 'text-eco-green'];
    return <Trophy className={cn('w-5 h-5', colors[rank - 1])} />;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRewardImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRewardImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReward = (student) => {
    setSelectedStudent(student);
    setIsShippingDialogOpen(true);
  };

  const handleConfirmShipping = () => {
    console.log('Shipping reward:', {
      student: selectedStudent,
      rewardImage: rewardImageFile,
      shippingNotes
    });
    setIsShippingDialogOpen(false);
    setShippingNotes('');
    setRewardImageFile(null);
    setRewardImagePreview(null);
    setSelectedStudent(null);
  };

  const getStudentsByStatus = (status) => {
    return mockTop5Students.filter(s => s.rewardStatus === status);
  };

  const renderStudentTable = (students, currentTab) => (
    <div className="border-2 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold w-20">Hạng</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Trường</TableHead>
            <TableHead className="text-center font-bold">Tổng điểm</TableHead>
            <TableHead className="text-center font-bold">Trạng thái</TableHead>
            {currentTab !== 'pending' && (
              <TableHead className="text-center font-bold">Ngày gửi</TableHead>
            )}
            {currentTab === 'delivered' && (
              <TableHead className="text-center font-bold">Ngày nhận</TableHead>
            )}
            <TableHead className="text-center font-bold">Hình ảnh quà</TableHead>
            {currentTab === 'pending' && (
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={currentTab === 'delivered' ? 9 : (currentTab === 'shipping' ? 8 : 8)} className="text-center py-8 text-muted-foreground">
                Không có học sinh nào
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getRankIcon(student.rank)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(student.studentName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{student.studentName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{student.schoolName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {student.schoolAddress}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg font-bold text-eco-green">{student.totalPoints}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={getStatusColor(student.rewardStatus)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(student.rewardStatus)}
                      {getStatusLabel(student.rewardStatus)}
                    </span>
                  </Badge>
                </TableCell>
                {currentTab !== 'pending' && (
                  <TableCell className="text-center">
                    {student.shippingDate ? (
                      <span className="text-sm">
                        {new Date(student.shippingDate).toLocaleDateString('vi-VN')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                )}
                {currentTab === 'delivered' && (
                  <TableCell className="text-center">
                    {student.deliveryDate ? (
                      <span className="text-sm">
                        {new Date(student.deliveryDate).toLocaleDateString('vi-VN')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-center">
                  {student.rewardImage ? (
                    <div className="flex justify-center">
                      <img 
                        src={student.rewardImage} 
                        alt="Phần thưởng"
                        className="w-16 h-16 object-cover rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(student.rewardImage, '_blank')}
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Chưa có</span>
                  )}
                </TableCell>
                {currentTab === 'pending' && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSendReward(student)}>
                          <Package className="w-4 h-4 mr-2" />
                          Gửi quà
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const pendingCount = getStudentsByStatus('pending').length;
  const shippingCount = getStudentsByStatus('shipping').length;
  const deliveredCount = getStudentsByStatus('delivered').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eco-orange to-yellow-500 flex items-center justify-center">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý phần thưởng</h1>
            <p className="text-muted-foreground">Gửi quà cho top 5 học sinh xuất sắc</p>
          </div>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border-2">
        <Flag className="w-5 h-5 text-eco-blue" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted-foreground mb-1">Chọn chiến dịch</p>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Chờ gửi ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="w-4 h-4" />
            Đang gửi ({shippingCount})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Đã giao ({deliveredCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {renderStudentTable(getStudentsByStatus('pending'), 'pending')}
        </TabsContent>

        <TabsContent value="shipping">
          {renderStudentTable(getStudentsByStatus('shipping'), 'shipping')}
        </TabsContent>

        <TabsContent value="delivered">
          {renderStudentTable(getStudentsByStatus('delivered'), 'delivered')}
        </TabsContent>
      </Tabs>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gửi phần thưởng</DialogTitle>
            <DialogDescription>
              Tải lên hình ảnh phần thưởng cho học sinh {selectedStudent?.studentName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">Địa chỉ gửi</p>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {selectedStudent?.schoolAddress}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-image">Hình ảnh phần thưởng *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {rewardImagePreview ? (
                  <div className="space-y-3">
                    <img 
                      src={rewardImagePreview} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRewardImageFile(null);
                        setRewardImagePreview(null);
                      }}
                    >
                      Chọn ảnh khác
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tải lên hình ảnh phần thưởng</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG tối đa 5MB</p>
                    </div>
                    <Input
                      id="reward-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Thông tin bổ sung về phần thưởng..."
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShippingDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmShipping}
              disabled={!rewardImageFile}
              className="bg-eco-orange hover:bg-eco-orange/90"
            >
              <Package className="w-4 h-4 mr-2" />
              Xác nhận gửi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}