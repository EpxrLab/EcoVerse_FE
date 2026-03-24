import { useState, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { Search, Plus, Gift, Clock, CheckCircle, XCircle, AlertCircle, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRewards } from '../../features/rewards/hooks/useRewards';
import { useRewardForm } from '../../features/rewards/hooks';
import { RewardStats, RewardList, MarketplaceItems } from '../../features/rewards/components';
import { rewardService } from '../../services/reward.service';

export default function SchoolRewards() {
  const {
    pendingRewards,
    completedRewards,
    cancelledRewards,
    marketplaceItems,
    stats,
    topRewards,
    partnershipRewards,
    confirmPartnershipReward,
  } = useRewards();

  const [partnershipFilters, setPartnershipFilters] = useState({
    campaign: 'all',
    status: 'all'
  });

  const uniqueCampaigns = useMemo(() => {
    const campaigns = partnershipRewards.map(r => r.campaignName);
    return [...new Set(campaigns)];
  }, [partnershipRewards]);

  const filteredPartnershipRewards = useMemo(() => {
    return partnershipRewards.filter(reward => {
      const matchCampaign = partnershipFilters.campaign === 'all' || reward.campaignName === partnershipFilters.campaign;
      const matchStatus = partnershipFilters.status === 'all' || reward.status === partnershipFilters.status;
      return matchCampaign && matchStatus;
    });
  }, [partnershipRewards, partnershipFilters]);

  const {
    itemForm,
    updateItemForm,
    resetItemForm,
    loadItemForm,
    isAddItemOpen,
    setIsAddItemOpen,
    isEditItemOpen,
    setIsEditItemOpen,
    searchTerm,
    setSearchTerm,
  } = useRewardForm();

  const [deleteId, setDeleteId] = useState(null);

  const physicalItems = marketplaceItems.filter(item => item.type === 'physical');

  const handleMarkDelivered = (id) => {
    console.log('Mark delivered:', id);
    // TODO: Implement mark delivered logic
  };

  const handleEditItem = (item) => {
    loadItemForm(item);
    setIsEditItemOpen(true);
  };

  const handleDeleteItem = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await rewardService.deleteReward(deleteId);
      setDeleteId(null);
      fetchRewards();
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
      fetchRewards();
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
      fetchRewards();
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
      <RewardStats stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-green/15">
          <TabsTrigger value="pending" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-orange">
            <Clock className="w-4 h-4" />
            Đang chờ ({pendingRewards.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
            <CheckCircle className="w-4 h-4" />
            Hoàn thành
          </TabsTrigger>
        <TabsTrigger value="cancelled" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive">
            <XCircle className="w-4 h-4" />
            Đã hủy
          </TabsTrigger>
          <TabsTrigger value="partnership" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-blue">
            <Gift className="w-4 h-4" />
            Quà từ Chiến dịch
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
                rewards={pendingRewards} 
                status="pending" 
                onMarkDelivered={handleMarkDelivered}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border-2 border-eco-green/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <CheckCircle className="w-5 h-5 text-eco-green" />
                Đã giao thành công
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RewardList rewards={completedRewards} status="completed" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card className="border-2 border-destructive/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <XCircle className="w-5 h-5 text-destructive" />
                Đã hủy & Hết hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RewardList rewards={cancelledRewards} status="cancelled" />
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
                        <SelectContent>
                          <SelectItem value="all">Tất cả chiến dịch</SelectItem>
                          {uniqueCampaigns.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
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
                onConfirm={confirmPartnershipReward}
              />
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
                Cửa hàng quà thật
              </CardTitle>
              <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold">
                    <Plus className="w-4 h-4 mr-2" />Thêm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm quà thật mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                      <Label>Tên sản phẩm *</Label>
                      <Input 
                        placeholder="VD: Voucher Rạp phim" 
                        value={itemForm.rewardName}
                        onChange={(e) => updateItemForm({ rewardName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hình ảnh</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await rewardService.uploadImage(formData);
                              const url = res.data?.data || res.data?.url || res.data;
                              if (typeof url === 'string') {
                                updateItemForm({ imageUrl: url });
                              } else if (res.data?.data?.url) {
                                updateItemForm({ imageUrl: res.data.data.url });
                              }
                            } catch (error) {
                              console.error('Upload failed', error);
                            }
                          }}
                          className="cursor-pointer file:cursor-pointer file:bg-eco-green/10 file:text-eco-green file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:font-semibold hover:file:bg-eco-green/20 transition-all text-xs"
                        />
                        {itemForm.imageUrl && (
                          <div className="shrink-0 w-10 h-10 border rounded-lg overflow-hidden relative">
                            <img src={itemForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea 
                        placeholder="Mô tả ngắn gọn về phần thưởng..." 
                        value={itemForm.description}
                        onChange={(e) => updateItemForm({ description: e.target.value })}
                        className="resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Giá (Xu) *</Label>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          value={itemForm.coinCost || ''}
                          onChange={(e) => updateItemForm({ coinCost: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          value={itemForm.stockQuantity || ''}
                          onChange={(e) => updateItemForm({ stockQuantity: parseInt(e.target.value) || 0 })}
                          disabled={itemForm.isUnlimited}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="unlimited" 
                        checked={itemForm.isUnlimited}
                        onCheckedChange={(checked) => updateItemForm({ isUnlimited: !!checked })}
                      />
                      <label 
                        htmlFor="unlimited" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Không giới hạn số lượng
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label>Điều khoản sử dụng</Label>
                      <Textarea 
                        placeholder="Nhập điều khoản khi sử dụng hoặc đổi quà..." 
                        value={itemForm.termsConditions}
                        onChange={(e) => updateItemForm({ termsConditions: e.target.value })}
                        className="resize-none"
                      />
                    </div>
                    <Button 
                      className="w-full bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
                      onClick={handleAddItem}
                      disabled={!itemForm.rewardName || itemForm.coinCost === undefined || itemForm.coinCost === null || itemForm.coinCost < 0}
                    >
                      Thêm sản phẩm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditItemOpen} onOpenChange={(open) => { setIsEditItemOpen(open); if (!open) resetItemForm(); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cập nhật quà tặng</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                      <Label>Tên sản phẩm *</Label>
                      <Input 
                        placeholder="VD: Voucher Rạp phim" 
                        value={itemForm.rewardName}
                        onChange={(e) => updateItemForm({ rewardName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hình ảnh</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await rewardService.uploadImage(formData);
                              const url = res.data?.data || res.data?.url || res.data;
                              if (typeof url === 'string') {
                                updateItemForm({ imageUrl: url });
                              } else if (res.data?.data?.url) {
                                updateItemForm({ imageUrl: res.data.data.url });
                              }
                            } catch (error) {
                              console.error('Upload failed', error);
                            }
                          }}
                          className="cursor-pointer file:cursor-pointer file:bg-eco-green/10 file:text-eco-green file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:font-semibold hover:file:bg-eco-green/20 transition-all text-xs"
                        />
                        {itemForm.imageUrl && (
                          <div className="shrink-0 w-10 h-10 border rounded-lg overflow-hidden relative">
                            <img src={itemForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea 
                        placeholder="Mô tả ngắn gọn về phần thưởng..." 
                        value={itemForm.description}
                        onChange={(e) => updateItemForm({ description: e.target.value })}
                        className="resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Giá (Xu) *</Label>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          value={itemForm.coinCost !== null && itemForm.coinCost !== undefined ? itemForm.coinCost : ''}
                          onChange={(e) => updateItemForm({ coinCost: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          value={itemForm.stockQuantity !== null && itemForm.stockQuantity !== undefined ? itemForm.stockQuantity : ''}
                          onChange={(e) => updateItemForm({ stockQuantity: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                          disabled={itemForm.isUnlimited}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="unlimited-edit" 
                        checked={itemForm.isUnlimited}
                        onCheckedChange={(checked) => updateItemForm({ isUnlimited: !!checked })}
                      />
                      <label 
                        htmlFor="unlimited-edit" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Không giới hạn số lượng
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label>Điều khoản sử dụng</Label>
                      <Textarea 
                        placeholder="Nhập điều khoản khi sử dụng hoặc đổi quà..." 
                        value={itemForm.termsConditions}
                        onChange={(e) => updateItemForm({ termsConditions: e.target.value })}
                        className="resize-none"
                      />
                    </div>
                    <Button 
                      className="w-full bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
                      onClick={handleUpdateItem}
                      disabled={!itemForm.rewardName || itemForm.coinCost === undefined || itemForm.coinCost === null || itemForm.coinCost < 0}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <MarketplaceItems 
              items={physicalItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
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
              <BarChart data={topRewards} layout="vertical">
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
    </div>
  );
}