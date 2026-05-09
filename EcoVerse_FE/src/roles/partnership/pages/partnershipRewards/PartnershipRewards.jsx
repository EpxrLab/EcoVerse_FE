import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter , DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Gift, Flag, Trophy, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePartnershipCampaigns } from '../../features/campaigns/hooks/usePartnershipCampaigns';
import { toast } from 'sonner';
import { RewardStatusLogsDialog } from '../../features/rewards/components/RewardStatusLogsDialog';

export default function PartnershipRewards() {
  const { campaigns, fetchRewardDeliveries, markRewardShipped, loading: campaignLoading } = usePartnershipCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [rewardDeliveries, setRewardDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [shippingNotes, setShippingNotes] = useState('');


  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedDeliveryForLogs, setSelectedDeliveryForLogs] = useState(null);

  // Local Campaigns list for the selector
  const activeAndCompletedCampaigns = campaigns.filter(c =>c.status === 'completed');

  useEffect(() => {
    if (activeAndCompletedCampaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(activeAndCompletedCampaigns[0].id);
    }
  }, [activeAndCompletedCampaigns, selectedCampaignId]);

  useEffect(() => {
    const loadDeliveries = async () => {
      if (selectedCampaignId) {
        setLoading(true);
        const data = await fetchRewardDeliveries(selectedCampaignId);
        setRewardDeliveries(data);
        setLoading(false);
      }
    };
    loadDeliveries();
  }, [selectedCampaignId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PREPARING':
        return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25';
      case 'SHIPPING':
        return 'bg-eco-blue/15 text-eco-blue border-eco-blue/25';
      case 'ARRIVED':
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'bg-eco-green/15 text-eco-green border-eco-green/25';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PREPARING':
        return 'Chờ gửi';
      case 'SHIPPING':
        return 'Đang gửi';
      case 'ARRIVED':
        return 'Đã đến trường';
      case 'DELIVERED':
        return 'Trường đã giao';
      case 'CONFIRMED':
        return 'Đã nhận';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PREPARING':
        return <Clock className="w-4 h-4" />;
      case 'SHIPPING':
        return <Truck className="w-4 h-4" />;
      case 'ARRIVED':
      case 'DELIVERED':
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const getRankIcon = (rank) => {
    const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600', 'text-eco-blue', 'text-eco-green'];
    return <Trophy className={cn('w-5 h-5', colors[rank - 1] || 'text-muted-foreground')} />;
  };

  const getTableColSpan = (tab) => {
    let cols = 7; // Hạng, Học sinh, Trường, Tổng điểm, Trạng thái, Hình ảnh quà, Thao tác
    if (tab !== 'pending') cols += 3; // Ngày gửi, Ngày nhận, Ảnh xác nhận
    return cols;
  };

  const handleSendReward = (delivery) => {
    setSelectedDelivery(delivery);
    setIsShippingDialogOpen(true);
  };

  const handleViewLogs = (delivery) => {
    setSelectedDeliveryForLogs(delivery);
    setIsLogDialogOpen(true);
  };

  const handleConfirmShipping = async () => {
    if (!selectedDelivery) return;
    
    setLoading(true);
    const success = await markRewardShipped(selectedDelivery.id, {
      notes: shippingNotes
    });

    if (success) {
      toast.success('Đã cập nhật trạng thái đang gửi quà');
      // Refresh list
      const data = await fetchRewardDeliveries(selectedCampaignId);
      setRewardDeliveries(data);
      setIsShippingDialogOpen(false);
      setShippingNotes('');
      setSelectedDelivery(null);
    } else {
      toast.error('Cập nhật thất bại');
    }
    setLoading(false);
  };

  const getDeliveriesByStatus = (tab) => {
    if (tab === 'pending') {
      return rewardDeliveries.filter(d => d.status === 'PREPARING');
    }
    if (tab === 'shipping') {
      return rewardDeliveries.filter(d => d.status === 'SHIPPING');
    }
    if (tab === 'arrived') {
      return rewardDeliveries.filter(d => d.status === 'ARRIVED');
    }
    if (tab === 'delivered') {
      return rewardDeliveries.filter(d => d.status === 'DELIVERED');
    }
    if (tab === 'confirmed') {
      return rewardDeliveries.filter(d => d.status === 'CONFIRMED');
    }
    return [];
  };

  const renderStudentTable = (deliveries, currentTab) => (
    <div className="border-2 rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold w-20 text-center">Hạng</TableHead>
            <TableHead className="font-bold">Học sinh</TableHead>
            <TableHead className="font-bold">Trường</TableHead>
            <TableHead className="text-center font-bold">Tổng điểm</TableHead>
            <TableHead className="text-center font-bold">Trạng thái</TableHead>
            {currentTab !== 'pending' && (
              <>
                <TableHead className="text-center font-bold">Ngày gửi</TableHead>
                <TableHead className="text-center font-bold">Xác nhận tại trường</TableHead>
                <TableHead className="text-center font-bold">Ảnh xác nhận</TableHead>
              </>
            )}
            <TableHead className="text-center font-bold">Hình ảnh quà</TableHead>
            <TableHead className="text-right font-bold w-32">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={getTableColSpan(currentTab)} className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-eco-blue" />
                  <p className="text-muted-foreground animate-pulse font-medium">Đang tải dữ liệu...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={getTableColSpan(currentTab)} className="text-center py-24">
                <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-semibold">
                    {selectedCampaignId ? "Không có dữ liệu trong danh sách này" : "Vui lòng chọn chiến dịch để xem dữ liệu"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => (
              <TableRow key={delivery.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getRankIcon(delivery.rankPosition)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-eco-blue/10">
                      <AvatarFallback className="bg-eco-blue/5 text-eco-blue">{getInitials(delivery.studentName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{delivery.studentName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{delivery.studentCode}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-sm text-foreground">{delivery.schoolName}</p>
                    <div className="flex items-start gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-eco-blue/60" />
                      <span className="leading-relaxed">
                        {[delivery.schoolAddress, delivery.schoolWard, delivery.schoolProvince]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>

                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg font-bold text-eco-green leading-none">{delivery.totalScore}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn("px-2 py-0.5", getStatusColor(delivery.status))}>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold">
                      {getStatusIcon(delivery.status)}
                      {getStatusLabel(delivery.status)}
                    </span>
                  </Badge>
                </TableCell>
                {currentTab !== 'pending' && (
                  <>
                    <TableCell className="text-center">
                      <span className="text-xs font-bold whitespace-nowrap">
                        {delivery.shippedAt ? new Date(delivery.shippedAt).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        {delivery.arrivedAt && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Trường nhận:</span>
                            <span className="text-xs font-semibold">{new Date(delivery.arrivedAt).toLocaleDateString('vi-VN')}</span>
                            {delivery.arrivedConfirmedByName && <span className="text-[9px] italic text-muted-foreground">Bởi: {delivery.arrivedConfirmedByName}</span>}
                          </div>
                        )}
                        {!delivery.arrivedAt && (
                          <span className="text-muted-foreground text-xs italic">-</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {delivery.deliveryImagePresignedUrl || delivery.deliveryImageUrl ? (
                        <div className="flex justify-center">
                          <img 
                            src={delivery.deliveryImagePresignedUrl || delivery.deliveryImageUrl} 
                            alt="Delivery proof"
                            className="w-10 h-10 object-cover rounded border cursor-pointer hover:border-eco-blue transition-all"
                            onClick={() => window.open(delivery.deliveryImagePresignedUrl || delivery.deliveryImageUrl, '_blank')}
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">Chưa có</span>
                      )}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-center">
                  {delivery.rewardImagePresignedUrl || delivery.rewardImageUrl ? (
                    <div className="flex justify-center group relative">
                      <img 
                        src={delivery.rewardImagePresignedUrl || delivery.rewardImageUrl} 
                        alt={delivery.rewardName}
                        className="w-12 h-12 object-cover rounded-md border-2 border-muted cursor-pointer hover:border-eco-blue transition-all"
                        onClick={() => window.open(delivery.rewardImagePresignedUrl || delivery.rewardImageUrl, '_blank')}
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[11px] italic">Chưa có ảnh</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewLogs(delivery)}
                      className="h-8 w-8 text-muted-foreground hover:text-eco-blue hover:bg-eco-blue/5"
                      title="Xem lịch sử"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    
                    {currentTab === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendReward(delivery)}
                        className="bg-eco-blue hover:bg-eco-blue/90 text-[11px] h-8 px-3 font-bold gap-2"
                      >
                        <Truck className="w-3 h-3" />
                        Gửi quà
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-eco-blue/20 to-eco-blue/5 flex items-center justify-center border-2 border-eco-blue/10 shadow-sm">
            <Gift className="w-8 h-8 text-eco-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý phần thưởng</h1>
            <p className="text-muted-foreground text-sm font-medium">Trao thưởng cho những nỗ lực bảo vệ môi trường</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Campaign Selection */}
        <div className="lg:col-span-3">
          <div className="bg-card p-6 rounded-3xl border-2 border-eco-blue/5 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-eco-blue/10">
                <Flag className="w-5 h-5 text-eco-blue" />
              </div>
              <h3 className="font-bold text-lg text-foreground/90 tracking-tight">Chiến dịch đang thực hiện</h3>
            </div>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger className="w-full bg-muted/20 border-2 border-muted-foreground/10 font-bold h-14 rounded-2xl focus:ring-2 focus:ring-eco-blue/20 transition-all text-base px-6">
                <SelectValue placeholder="Chọn một chiến dịch để quản lý phần thưởng" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2 shadow-xl overflow-hidden">
                {activeAndCompletedCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id} className="rounded-xl my-1 focus:bg-eco-blue/5 focus:text-eco-blue cursor-pointer px-4">
                    <div className="flex flex-row items-center justify-between gap-4 py-2 w-full">
                      <span className="text-base font-bold leading-tight">{campaign.campaignName}</span>
                    </div>
                  </SelectItem>
                ))}
                {activeAndCompletedCampaigns.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-eco-blue/40" />
                    <p className="italic font-medium">Đang tải danh sách chiến dịch...</p>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="bg-card p-6 rounded-3xl border-2 border-eco-blue/5 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[140px] group transition-all hover:shadow-md h-full">
            <div className="relative z-10 flex items-center gap-5">
                <div className="p-4 bg-eco-blue/10 rounded-2xl border border-eco-blue/10">
                    <Trophy className="w-8 h-8 text-eco-blue" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tổng học sinh</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black tracking-tighter text-eco-blue">{rewardDeliveries.length}</span>
                        <span className="text-xs font-bold text-muted-foreground">đạt giải</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="pending" className="space-y-8">
        <TabsList className="bg-muted/30 p-1.5 grid w-full grid-cols-5 rounded-[20px] border-2 border-muted/20 min-h-[64px] shadow-inner">
          <TabsTrigger 
            value="pending" 
            className="rounded-[16px] font-black py-3 data-[state=active]:bg-card data-[state=active]:text-eco-blue data-[state=active]:shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm tracking-tight group"
          >
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue transition-colors">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Chờ gửi</span>
            <Badge variant="secondary" className="ml-0.5 bg-muted/50 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue rounded-full px-1.5 py-0 min-w-[20px] text-[10px]">
              {rewardDeliveries.filter(d => d.status === 'PREPARING').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="shipping" 
            className="rounded-[16px] font-black py-3 data-[state=active]:bg-card data-[state=active]:text-eco-blue data-[state=active]:shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm tracking-tight group"
          >
            <div className="p-1.5 rounded-lg bg-eco-blue/10 text-eco-blue transition-colors">
              <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Đang gửi</span>
            <Badge variant="secondary" className="ml-0.5 bg-muted/50 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue rounded-full px-1.5 py-0 min-w-[20px] text-[10px]">
              {rewardDeliveries.filter(d => d.status === 'SHIPPING').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="arrived" 
            className="rounded-[16px] font-black py-3 data-[state=active]:bg-card data-[state=active]:text-eco-blue data-[state=active]:shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm tracking-tight group"
          >
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue transition-colors">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Tại trường</span>
            <Badge variant="secondary" className="ml-0.5 bg-muted/50 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue rounded-full px-1.5 py-0 min-w-[20px] text-[10px]">
              {rewardDeliveries.filter(d => d.status === 'ARRIVED').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="delivered" 
            className="rounded-[16px] font-black py-3 data-[state=active]:bg-card data-[state=active]:text-eco-blue data-[state=active]:shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm tracking-tight group"
          >
            <div className="p-1.5 rounded-lg bg-eco-green/10 text-eco-green group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue transition-colors">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Đã trao HS</span>
            <Badge variant="secondary" className="ml-0.5 bg-muted/50 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue rounded-full px-1.5 py-0 min-w-[20px] text-[10px]">
              {rewardDeliveries.filter(d => d.status === 'DELIVERED').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="confirmed" 
            className="rounded-[16px] font-black py-3 data-[state=active]:bg-card data-[state=active]:text-eco-blue data-[state=active]:shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm tracking-tight group"
          >
            <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue transition-colors">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Xác nhận</span>
            <Badge variant="secondary" className="ml-0.5 bg-muted/50 group-data-[state=active]:bg-eco-blue/10 group-data-[state=active]:text-eco-blue rounded-full px-1.5 py-0 min-w-[20px] text-[10px]">
              {rewardDeliveries.filter(d => d.status === 'CONFIRMED').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
          {renderStudentTable(getDeliveriesByStatus('pending'), 'pending')}
        </TabsContent>

        <TabsContent value="shipping" className="mt-0 focus-visible:outline-none">
          {renderStudentTable(getDeliveriesByStatus('shipping'), 'shipping')}
        </TabsContent>

        <TabsContent value="arrived" className="mt-0 focus-visible:outline-none">
          {renderStudentTable(getDeliveriesByStatus('arrived'), 'arrived')}
        </TabsContent>

        <TabsContent value="delivered" className="mt-0 focus-visible:outline-none">
          {renderStudentTable(getDeliveriesByStatus('delivered'), 'delivered')}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-0 focus-visible:outline-none">
          {renderStudentTable(getDeliveriesByStatus('confirmed'), 'confirmed')}
        </TabsContent>
      </Tabs>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-eco-blue to-eco-blue/80 p-6 text-white">
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              Cập nhật vận chuyển
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium mt-2">
              Xác nhận bắt đầu gửi phần thưởng cho học sinh <span className="text-white font-black underline">{selectedDelivery?.studentName}</span>
            </DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="p-5 bg-muted/40 rounded-2xl border-2 border-eco-blue/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">Địa chỉ nhận (Trường)</p>
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-eco-blue/10 rounded-full">
                    <MapPin className="w-5 h-5 text-eco-blue" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-bold text-lg text-foreground leading-tight">{selectedDelivery?.schoolName}</p>
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground font-medium">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-eco-blue" />
                      <span>
                        {[selectedDelivery?.schoolAddress, selectedDelivery?.schoolWard, selectedDelivery?.schoolProvince]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">

              <div className="space-y-2.5">
                <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest px-1 text-muted-foreground">Ghi chú gửi hàng</Label>
                <Textarea
                  id="notes"
                  placeholder="Nhập thông tin ghi chú..."
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  rows={4}
                  className="rounded-xl border-2 focus:ring-eco-blue font-medium p-4"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-end gap-3 px-8">
            <Button variant="ghost" className="font-bold px-6 rounded-xl h-12" onClick={() => setIsShippingDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleConfirmShipping}
              disabled={loading}
              className="bg-eco-blue hover:bg-eco-blue/90 font-black px-8 rounded-xl h-12 gap-2 shadow-lg shadow-eco-blue/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              Xác nhận bắt đầu gửi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <RewardStatusLogsDialog
        isOpen={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        deliveryId={selectedDeliveryForLogs?.id}
        studentName={selectedDeliveryForLogs?.studentName}
      />
    </div>
  );
}
