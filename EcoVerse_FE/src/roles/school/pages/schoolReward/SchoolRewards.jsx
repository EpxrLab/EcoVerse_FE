import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { Search, Plus, Gift, Clock, CheckCircle, XCircle, AlertCircle, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RewardStats, RewardList, MarketplaceItems, RewardFormDialog, DeliveryFormDialog, RejectionFormDialog } from '../../features/rewards/components';
import { useRewards, useRewardForm, useRewardPagination } from '../../features/rewards/hooks';
import { rewardService } from '../../services/reward.service';

export default function SchoolRewards() {
  const rewards = useRewards();
  const {
    itemForm,
    updateItemForm,
    resetItemForm,
    loadItemForm,
    isAddItemOpen,
    setIsAddItemOpen,
    isEditItemOpen,
    setIsEditItemOpen,
  } = useRewardForm();

  const {
    pages,
    setPage,
    filtered,
    paged,
    PAGE_SIZE,
    searchTerm,
    setSearchTerm,
  } = useRewardPagination(rewards);

  const [rejectionId, setRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const [deliveryId, setDeliveryId] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    imageUrl: '',
    imagePresignedUrl: ''
  });
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryType, setDeliveryType] = useState('mission'); // 'mission' or 'partnership'
  
  const [partnershipFilters, setPartnershipFilters] = useState({
    campaign: '',
    status: 'all'
  });

  const uniqueCampaigns = useMemo(() => {
    return rewards.partnershipInvitations || [];
  }, [rewards.partnershipInvitations]);

  useEffect(() => {
    if (partnershipFilters.campaign) {
      rewards.fetchPartnershipRewards(partnershipFilters.campaign);
    }
  }, [partnershipFilters.campaign]);

  useEffect(() => {
    if (!partnershipFilters.campaign && uniqueCampaigns.length > 0) {
      setPartnershipFilters(prev => ({ ...prev, campaign: uniqueCampaigns[0].campaignId }));
    }
  }, [uniqueCampaigns]);

  const filteredPartnershipRewards = useMemo(() => {
    return (rewards.partnershipRewards || []).filter(reward => {
      const matchCampaign = !partnershipFilters.campaign || reward.campaignId === partnershipFilters.campaign;
      const matchStatus = partnershipFilters.status === 'all' || reward.status === partnershipFilters.status;
      return matchCampaign && matchStatus;
    });
  }, [rewards.partnershipRewards, partnershipFilters]);

  const [deleteId, setDeleteId] = useState(null);

  const handleApprove = async (id) => {
    try {
      await rewards.processRewardRequest(id, true);
    } catch (error) {
      console.error('Failed to approve request', error);
    }
  };

  const handleReject = (id) => {
    setRejectionId(id);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionId || !rejectionReason.trim()) return;
    try {
      await rewards.processRewardRequest(rejectionId, false, rejectionReason);
      setIsRejectDialogOpen(false);
      setRejectionId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject request', error);
    }
  };

  const handleDeliver = (id) => {
    setDeliveryId(id);
    setDeliveryType('mission');
    setDeliveryForm({ imageUrl: '', imagePresignedUrl: '' });
    setIsDeliverDialogOpen(true);
  };

  const handleConfirmDeliver = async () => {
    if (!deliveryId) return;
    try {
      setIsDelivering(true);
      if (deliveryType === 'partnership') {
        await rewards.confirmPartnershipReward(deliveryId, 'at_school', {
          deliveryImageUrl: deliveryForm.imageUrl
        });
        rewards.fetchPartnershipRewards(partnershipFilters.campaign);
      } else {
        await rewards.deliverRewardRequest(deliveryId, {
          imageUrl: deliveryForm.imageUrl
        });
      }
      setIsDeliverDialogOpen(false);
      setDeliveryId(null);
      setDeliveryForm({ imageUrl: '', imagePresignedUrl: '' });
    } catch (error) {
      console.error('Failed to deliver request', error);
    } finally {
      setIsDelivering(false);
    }
  };

  const handleEditItem = async (item) => {
    try {
      const res = await rewardService.getRewardById(item.id);
      const detail = res.data?.data || res.data;
      if (detail) {
        loadItemForm(detail);
        setIsEditItemOpen(true);
      } else {
        // Fallback to list data if detail not found
        loadItemForm(item);
        setIsEditItemOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch reward detail', error);
      // Fallback
      loadItemForm(item);
      setIsEditItemOpen(true);
    }
  };

  const handleDeleteItem = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await rewardService.deleteReward(deleteId);
      setDeleteId(null);
      rewards.fetchRewards();
    } catch (error) {
      console.error('Failed to delete reward', error);
    }
  };

  const handleAddItem = async () => {
    try {
      await rewardService.createReward({
        rewardName: itemForm.rewardName,
        rewardType: itemForm.rewardType || 'PHYSICAL',
        description: itemForm.description,
        coinCost: itemForm.coinCost,
        imageUrl: itemForm.imageUrl,
        stockQuantity: itemForm.stockQuantity,
        isUnlimited: itemForm.isUnlimited,
        termsConditions: itemForm.termsConditions
      });
      resetItemForm();
      setIsAddItemOpen(false);
      rewards.fetchRewards();
    } catch (error) {
      console.error('Failed to create reward', error);
    }
  };

  const handleUpdateItem = async () => {
    try {
      await rewardService.updateReward(itemForm.id, {
        rewardName: itemForm.rewardName,
        rewardType: itemForm.rewardType || 'PHYSICAL',
        description: itemForm.description,
        coinCost: itemForm.coinCost,
        imageUrl: itemForm.imageUrl,
        stockQuantity: itemForm.stockQuantity,
        isUnlimited: itemForm.isUnlimited,
        termsConditions: itemForm.termsConditions
      });
      resetItemForm();
      setIsEditItemOpen(false);
      rewards.fetchRewards();
    } catch (error) {
      console.error('Failed to update reward', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-eco-orange flex items-center justify-center">
          <Gift className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý phần thưởng</h1>
          <p className="text-muted-foreground">Theo dõi yêu cầu đổi quà và quản lý cửa hàng</p>
        </div>
      </div>

      {/* Stats */}
      <RewardStats stats={rewards.stats} />

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-green/15 flex-wrap h-auto gap-1 justify-start w-fit">
          <TabsTrigger value="pending" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-orange">
            <Clock className="w-4 h-4" />
            Chờ duyệt ({filtered.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue">
            <CheckCircle className="w-4 h-4" />
            Đã duyệt ({filtered.approved.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
            <Package className="w-4 h-4" />
            Đang giao ({filtered.delivered.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
            <CheckCircle className="w-4 h-4" />
            Hoàn thành ({filtered.confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive">
            <XCircle className="w-4 h-4" />
            Đã hủy/Từ chối ({filtered.cancelled.length})
          </TabsTrigger>
          <TabsTrigger value="partnership" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue">
            <Gift className="w-4 h-4" />
            Chiến dịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-2 border-eco-orange/15">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <AlertCircle className="w-5 h-5 text-eco-orange" />
                  Yêu cầu đang chờ
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 border-2" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList 
                rewards={paged.pending} 
                status="pending" 
                onApprove={handleApprove}
                onReject={handleReject}
                onDeliver={handleDeliver}
              />
              {filtered.pending.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('pending', p => Math.max(1, p - 1))}
                          className={pages.pending === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.pending.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.pending === i + 1}
                            onClick={() => setPage('pending', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('pending', p => Math.min(Math.ceil(filtered.pending.length / PAGE_SIZE), p + 1))}
                          className={pages.pending === Math.ceil(filtered.pending.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-2 border-eco-blue/15">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-eco-blue">
                  <CheckCircle className="w-5 h-5" />
                  Yêu cầu đã duyệt (Chờ giao)
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 border-2" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList 
                rewards={paged.approved} 
                status="pending" 
                onDeliver={handleDeliver}
              />
              {filtered.approved.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('approved', p => Math.max(1, p - 1))}
                          className={pages.approved === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.approved.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.approved === i + 1}
                            onClick={() => setPage('approved', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('approved', p => Math.min(Math.ceil(filtered.approved.length / PAGE_SIZE), p + 1))}
                          className={pages.approved === Math.ceil(filtered.approved.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card className="border-2 border-eco-green/15">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-eco-green">
                  <Package className="w-5 h-5" />
                  Yêu cầu đang giao (Chờ xác nhận)
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 border-2" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList rewards={paged.delivered} status="completed" />
              {filtered.delivered.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('delivered', p => Math.max(1, p - 1))}
                          className={pages.delivered === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.delivered.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.delivered === i + 1}
                            onClick={() => setPage('delivered', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('delivered', p => Math.min(Math.ceil(filtered.delivered.length / PAGE_SIZE), p + 1))}
                          className={pages.delivered === Math.ceil(filtered.delivered.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border-2 border-eco-green/15">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-eco-green">
                  <CheckCircle className="w-5 h-5" />
                  Giao thành công (Đã xác nhận)
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 border-2" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList rewards={paged.confirmed} status="completed" />
              {filtered.confirmed.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('confirmed', p => Math.max(1, p - 1))}
                          className={pages.confirmed === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.confirmed.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.confirmed === i + 1}
                            onClick={() => setPage('confirmed', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('confirmed', p => Math.min(Math.ceil(filtered.confirmed.length / PAGE_SIZE), p + 1))}
                          className={pages.confirmed === Math.ceil(filtered.confirmed.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card className="border-2 border-destructive/15">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                  <XCircle className="w-5 h-5" />
                  Yêu cầu đã hủy
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 border-2" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList rewards={paged.cancelled} status="cancelled" />
              {filtered.cancelled.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('cancelled', p => Math.max(1, p - 1))}
                          className={pages.cancelled === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.cancelled.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.cancelled === i + 1}
                            onClick={() => setPage('cancelled', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('cancelled', p => Math.min(Math.ceil(filtered.cancelled.length / PAGE_SIZE), p + 1))}
                          className={pages.cancelled === Math.ceil(filtered.cancelled.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnership">
          <Card className="border-2 border-eco-blue/15">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Gift className="w-5 h-5 text-eco-blue" />
                  Quà tặng từ đối tác
                </CardTitle>
                <div className="flex items-center gap-2">
                   <div className="relative w-40">
                      <Select value={partnershipFilters.campaign} onValueChange={(val) => setPartnershipFilters(prev => ({ ...prev, campaign: val }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chiến dịch" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 shadow-xl overflow-hidden p-1">

                          {uniqueCampaigns.map(invitation => (
                            <SelectItem key={invitation.campaignId} value={invitation.campaignId} className="rounded-xl my-1 cursor-pointer">
                              <div className="flex items-center justify-between gap-4 w-full min-w-[300px]">
                                <span className="font-bold text-sm truncate max-w-[200px]">{invitation.campaignName}</span>
                                {invitation.campaignStatus === 'on_going' && (
                                  <Badge variant="outline" className={cn(
                                    "whitespace-nowrap text-[9px] uppercase font-black px-2 py-0.5 rounded-lg border-0",
                                    "bg-blue-100 text-blue-700"
                                  )}>
                                    Đang diễn ra
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="relative w-40">
                      <Select value={partnershipFilters.status} onValueChange={(val) => setPartnershipFilters(prev => ({ ...prev, status: val }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả trạng thái</SelectItem>
                          <SelectItem value="shipping">Đang vận chuyển</SelectItem>
                          <SelectItem value="at_school">Đã về trường</SelectItem>
                          <SelectItem value="given">Đã trao</SelectItem>
                          <SelectItem value="collected">Đã hoàn thành</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RewardList 
                rewards={filteredPartnershipRewards} 
                status="partnership" 
                onConfirm={async (id, rewardStatus) => {
                  if (rewardStatus === 'at_school') {
                    setDeliveryId(id);
                    setDeliveryType('partnership');
                    setDeliveryForm({ imageUrl: '', imagePresignedUrl: '' });
                    setIsDeliverDialogOpen(true);
                  } else {
                    const success = await rewards.confirmPartnershipReward(id, rewardStatus);
                    if (success) {
                      rewards.fetchPartnershipRewards(partnershipFilters.campaign);
                    }
                  }
                }}
              />
              {filtered.partnership.length > PAGE_SIZE && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage('partnership', p => Math.max(1, p - 1))}
                          className={pages.partnership === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filtered.partnership.length / PAGE_SIZE) }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            isActive={pages.partnership === i + 1}
                            onClick={() => setPage('partnership', i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage('partnership', p => Math.min(Math.ceil(filtered.partnership.length / PAGE_SIZE), p + 1))}
                          className={pages.partnership === Math.ceil(filtered.partnership.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Store & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-2 border-eco-green/15">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Package className="w-5 h-5 text-eco-green" />
                Cửa hàng quà tặng
              </CardTitle>
              <Button 
                className="bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
                onClick={() => setIsAddItemOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm quà mới
              </Button>

              <RewardFormDialog 
                isOpen={isAddItemOpen}
                onOpenChange={setIsAddItemOpen}
                mode="add"
                form={itemForm}
                onUpdateForm={updateItemForm}
                onResetForm={resetItemForm}
                onSubmit={handleAddItem}
              />

              <RewardFormDialog 
                isOpen={isEditItemOpen}
                onOpenChange={setIsEditItemOpen}
                mode="edit"
                form={itemForm}
                onUpdateForm={updateItemForm}
                onResetForm={resetItemForm}
                onSubmit={handleUpdateItem}
              />
            </div>
          </CardHeader>
          <CardContent>
            <MarketplaceItems 
              items={paged.marketplace}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
            {filtered.marketplace.length > PAGE_SIZE && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage('marketplace', p => Math.max(1, p - 1))}
                        className={pages.marketplace === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(filtered.marketplace.length / PAGE_SIZE) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={pages.marketplace === i + 1}
                          onClick={() => setPage('marketplace', i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage('marketplace', p => Math.min(Math.ceil(filtered.marketplace.length / PAGE_SIZE), p + 1))}
                        className={pages.marketplace === Math.ceil(filtered.marketplace.length / PAGE_SIZE) ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-blue/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <TrendingUp className="w-5 h-5 text-eco-blue" />
              Thống kê đổi quà
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rewards.topRewards} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "2px solid hsl(var(--eco-green) / 0.2)", borderRadius: "12px" }} />
                <Bar dataKey="count" fill="hsl(var(--eco-green))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <RejectionFormDialog 
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onSubmit={handleConfirmReject}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phần thưởng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeliveryFormDialog 
        isOpen={isDeliverDialogOpen}
        onOpenChange={setIsDeliverDialogOpen}
        deliveryForm={deliveryForm}
        onUpdateForm={(updates) => setDeliveryForm(prev => ({ ...prev, ...updates }))}
        onSubmit={handleConfirmDeliver}
        isSubmitting={isDelivering}
      />
    </div>
  );
}