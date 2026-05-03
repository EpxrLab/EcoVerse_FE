import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/shared/components/ui/pagination';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, Users, Zap, AlertTriangle, Info, History, Calendar } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { subscriptionService } from '@/roles/school/services';
import { Loader2 } from 'lucide-react';


// Helper to map API features object to array
const parseFeatures = (features) => {
  if (!features) return [];
  if (typeof features === 'object') {
    return Object.values(features);
  }
  return [];
};

// Map duration days to readable text
const getDurationLabel = (days) => {
  if (!days) return '';
  if (days >= 36500) return 'Vĩnh viễn';
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `/${months} tháng`;
  }
  return `/${days} ngày`;
};


// Map subscriber types to display colors
const getPlanColor = (subscriberType, planCode) => {
  if (planCode?.includes('PRO')) return 'eco-orange';
  if (planCode?.includes('BASIC')) return 'eco-green';
  return 'eco-blue';
};

// Map subscriber types to icons
const getPlanIcon = (planCode) => {
  if (planCode?.includes('PRO')) return Crown;
  if (planCode?.includes('BASIC')) return Zap;
  return Users;
};




export default function PartnershipSubscription() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyPage, historyStatusFilter]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await subscriptionService.getMySubscription();
      if (response.data && response.data.data) {
        setCurrentSubscription(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await subscriptionService.getMySubscriptionHistory({
        page: historyPage - 1,
        size: 5,
        pageNo: historyPage - 1,
        pageSize: 5,
        status: historyStatusFilter || undefined
      });
      if (response.data && (response.data.status === 0 || response.data.status === 200 || response.data.status === '0')) {
        let content = response.data.data?.content || [];
        // Hide cancelled subscriptions
        content = content.filter(s => s.status?.toUpperCase() !== 'CANCELLED');
        setHistory(content);
        setHistoryTotalPages(response.data.data?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await subscriptionService.getSubscriptionPlans({
        subscriberType: 'PARTNERSHIP'
      });
      if (response.data && response.data.data) {
        setPlans(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      const isRenew = currentSubscription && currentSubscription.status?.toUpperCase() === 'EXPIRED' && (currentSubscription.planId === plan.id || currentSubscription.planCode === plan.planCode);
      const payload = isRenew 
        ? { planId: plan.id, subscriptionId: currentSubscription.id || currentSubscription.subscriptionId }
        : { planId: plan.id };
      
      const response = isRenew 
        ? await subscriptionService.renewSubscription(payload)
        : await subscriptionService.createSubscription(payload);

      const resData = response.data;
      if (resData && (resData.status === 0 || resData.status === 200 || resData.status === '0' || resData.status === '200' || resData.status === 201 || resData.status === '201')) {
        const checkoutUrl = resData.data?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast({
            title: "Khởi tạo thành công!",
            description: `Vui lòng hoàn tất thanh toán cho gói ${plan.planName}.`,
          });
        }
      } else {
        toast({
          title: "Lỗi",
          description: resData?.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-eco-green/10 mb-4">
          <CreditCard className="w-7 h-7 text-eco-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Chọn gói phù hợp cho doanh nghiệp của bạn
        </h1>
        <p className="text-muted-foreground">
          Đăng ký gói để sử dụng đầy đủ các tính năng cho đối tác
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Lưu ý quan trọng về gói đăng ký</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Không thể thay đổi gói giữa chừng:</strong> Sau khi đăng ký, bạn không thể nâng cấp hoặc hạ cấp cho đến khi gói hiện tại hết hạn.</li>
                <li>• <strong>Thời gian gia hạn:</strong> Sau khi gói hết hạn, doanh nghiệp có <strong>10 ngày</strong> để cân nhắc và gia hạn gói mới.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-eco-green animate-spin mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách gói...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.planCode);
            const colorClass = getPlanColor(plan.subscriberType, plan.planCode);
            const isPopular = plan.planCode?.includes('BASIC') || plan.planCode === 'PARTNERSHIP_BASIC'; // Example logic for popular
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col",
                  isPopular && "border-eco-green shadow-eco-green/10 shadow-lg"
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-eco-green text-white">
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    `bg-${colorClass}/20`
                  )}>
                    <Icon className={cn("w-6 h-6", `text-${colorClass}`)} />
                  </div>
                  <CardTitle className="text-xl">{plan.planName}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {plan.description || "Gói đăng ký dành cho doanh nghiệp đối tác"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4 flex-grow">
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: plan.currency || 'VND' }).format(plan.price)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      {getDurationLabel(plan.durationDays)}
                    </span>
                  </div>

                  <ul className="space-y-3">

                    {plan.maxCampaignsPerMonth !== null && (
                      <li className="flex items-start gap-3 text-sm">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", `bg-${colorClass}/20`)}>
                          <Zap className={cn("w-3 h-3", `text-${colorClass}`)} />
                        </div>
                        <span className="text-muted-foreground">Tối đa {plan.maxCampaignsPerMonth} chiến dịch/tháng</span>
                      </li>
                    )}

                    {plan.maxRoundsPerCampaign !== null && (
                      <li className="flex items-start gap-3 text-sm">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", `bg-${colorClass}/20`)}>
                          <Sparkles className={cn("w-3 h-3", `text-${colorClass}`)} />
                        </div>
                        <span className="text-muted-foreground">{plan.maxRoundsPerCampaign} vòng/chiến dịch</span>
                      </li>
                    )}

                    {plan.maxSchoolsPerCampaign !== null && (
                      <li className="flex items-start gap-3 text-sm">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", `bg-${colorClass}/20`)}>
                          <Check className={cn("w-3 h-3", `text-${colorClass}`)} />
                        </div>
                        <span className="text-muted-foreground">{plan.maxSchoolsPerCampaign} trường/chiến dịch</span>
                      </li>
                    )}

                    {plan.gracePeriodDays !== null && (
                      <li className="flex items-start gap-3 text-sm">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", `bg-${colorClass}/20`)}>
                          <Calendar className={cn("w-3 h-3", `text-${colorClass}`)} />
                        </div>
                        <span className="text-muted-foreground">{plan.gracePeriodDays} ngày gia hạn</span>
                      </li>
                    )}

                    {parseFeatures(plan.features).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          `bg-${colorClass}/20`
                        )}>
                          <Check className={cn("w-3 h-3", `text-${colorClass}`)} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full",
                      isPopular && (!currentSubscription || currentSubscription.status?.toUpperCase() === 'EXPIRED' || (currentSubscription.status?.toUpperCase() === 'ACTIVE' && Number(plan.price || 0) > Number(currentSubscription.price || currentSubscription.amount || 0)))
                        ? "bg-eco-green hover:bg-eco-green/90" 
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={
                      (isProcessing && selectedPlan === plan.id) || 
                      (currentSubscription && currentSubscription.status?.toUpperCase() === 'ACTIVE' && (
                        (currentSubscription.planId === plan.id || currentSubscription.planCode === plan.planCode) ||
                        Number(plan.price || 0) <= Number(currentSubscription.price || currentSubscription.amount || 0)
                      ))
                    }
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : currentSubscription && currentSubscription.status?.toUpperCase() === 'ACTIVE' && (currentSubscription.planId === plan.id || currentSubscription.planCode === plan.planCode) ? (
                      "Đang sử dụng"
                    ) : currentSubscription && currentSubscription.status?.toUpperCase() === 'ACTIVE' && Number(plan.price || 0) <= Number(currentSubscription.price || currentSubscription.amount || 0) ? (
                      "Đã có gói hoạt động"
                    ) : (
                      currentSubscription && currentSubscription.status?.toUpperCase() === 'EXPIRED' && (currentSubscription.planId === plan.id || currentSubscription.planCode === plan.planCode) ? `Gia hạn gói ${plan.planName}` : `Chọn gói ${plan.planName}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không có gói đăng ký nào khả dụng.</p>
        </Card>
      )}


      {/* Purchase History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-eco-green" />
              Lịch sử mua gói
            </CardTitle>
            <CardDescription>Danh sách các gói đăng ký đã mua trước đây</CardDescription>
          </div>
          <div className="w-40">
            <Select value={historyStatusFilter} onValueChange={(val) => { setHistoryStatusFilter(val === 'ALL' ? '' : val); setHistoryPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">--</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                <SelectItem value="PENDING_RENEWAL">Chờ gia hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-eco-green animate-spin" />
            </div>
          ) : history.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gói</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((purchase) => {
                    const statusUpper = (purchase.status || '').toUpperCase();
                    let statusText = statusUpper;
                    if (statusUpper === 'ACTIVE') statusText = 'Đang hoạt động';
                    if (statusUpper === 'EXPIRED') statusText = 'Đã hết hạn';
                    if (statusUpper === 'CANCELLED') statusText = 'Đã hủy';
                    if (statusUpper === 'PENDING_RENEWAL') statusText = 'Chờ gia hạn';

                    return (
                      <TableRow key={purchase.id || purchase.transactionRef || Math.random()}>
                        <TableCell className="font-medium">{purchase.planName || purchase.subscriptionName || purchase.subscriptionCode || 'Gói đăng ký'}</TableCell>
                        <TableCell>
                          {(() => {
                            const amount = purchase.amount ?? purchase.price ?? purchase.transactions?.[0]?.amount;
                            const currency = (purchase.currency ?? purchase.transactions?.[0]?.currency) || 'VND';
                            return amount !== undefined && amount !== null 
                              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount) 
                              : '₫0';
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {purchase.startDate || purchase.createdAt || purchase.paidAt ? new Date(purchase.startDate || purchase.createdAt || purchase.paidAt).toLocaleDateString('vi-VN') : '--'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {purchase.endDate || purchase.expiredAt || purchase.validUntil ? new Date(purchase.endDate || purchase.expiredAt || purchase.validUntil).toLocaleDateString('vi-VN') : '--'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              statusUpper === 'ACTIVE' && 'text-eco-green border-eco-green/30 bg-eco-green/10',
                              statusUpper === 'EXPIRED' && 'text-muted-foreground border-muted-foreground/30 bg-muted/50',
                              statusUpper === 'CANCELLED' && 'text-destructive border-destructive/30 bg-destructive/10',
                              statusUpper === 'PENDING_RENEWAL' && 'text-amber-500 border-amber-500/30 bg-amber-500/10',
                              (statusUpper !== 'ACTIVE' && statusUpper !== 'EXPIRED' && statusUpper !== 'CANCELLED' && statusUpper !== 'PENDING_RENEWAL') && 'text-gray-500 border-gray-200 bg-gray-50'
                            )}
                          >
                            {statusText}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {historyTotalPages > 1 && (
                <div className="mt-4 flex justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                           onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                           disabled={historyPage === 1}
                           className={historyPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {[...Array(historyTotalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={historyPage === i + 1}
                            onClick={() => setHistoryPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                           onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                           disabled={historyPage === historyTotalPages}
                           className={historyPage === historyTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có lịch sử giao dịch gói</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-eco-blue" />
            Câu hỏi thường gặp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">Tôi có thể đổi gói giữa chừng không?</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Không.</strong> Sau khi đăng ký, bạn không thể thay đổi gói cho đến khi gói hiện tại hết hạn. 
              Vui lòng cân nhắc kỹ trước khi đăng ký.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Điều gì xảy ra khi gói hết hạn?</h4>
            <p className="text-sm text-muted-foreground">
              Khi gói hết hạn, doanh nghiệp có <strong>10 ngày</strong> để gia hạn. 
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Hỗ trợ thanh toán nào?</h4>
            <p className="text-sm text-muted-foreground">
              Chúng tôi hỗ trợ thanh toán trực tiếp qua PayOS bảo mật nhanh chóng.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
