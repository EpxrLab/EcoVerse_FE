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
import { Search, Plus, Gift, Clock, CheckCircle, XCircle, AlertCircle, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRewards } from '../../features/rewards/hooks/useRewards';
import { useRewardForm } from '../../features/rewards/hooks';
import { RewardStats, RewardList, MarketplaceItems } from '../../features/rewards/components';

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
    isAddItemOpen,
    setIsAddItemOpen,
    searchTerm,
    setSearchTerm,
  } = useRewardForm();

  const physicalItems = marketplaceItems.filter(item => item.type === 'physical');

  const handleMarkDelivered = (id) => {
    console.log('Mark delivered:', id);
    // TODO: Implement mark delivered logic
  };

  const handleEditItem = (item) => {
    console.log('Edit item:', item);
    // TODO: Implement edit item logic
  };

  const handleDeleteItem = (id) => {
    console.log('Delete item:', id);
    // TODO: Implement delete item logic
  };

  const handleAddItem = () => {
    console.log('Add item:', itemForm);
    // TODO: Implement add item logic
    resetItemForm();
    setIsAddItemOpen(false);
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
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tên sản phẩm</Label>
                      <Input 
                        placeholder="VD: Voucher Rạp phim" 
                        value={itemForm.name}
                        onChange={(e) => updateItemForm({ name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Giá (Xu)</Label>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          value={itemForm.coins || ''}
                          onChange={(e) => updateItemForm({ coins: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          value={itemForm.stock || ''}
                          onChange={(e) => updateItemForm({ stock: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
                      onClick={handleAddItem}
                    >
                      Thêm sản phẩm
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
    </div>
  );
}