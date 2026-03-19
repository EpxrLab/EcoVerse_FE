import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, Users, Zap, AlertTriangle, Info, History, Calendar, Receipt } from 'lucide-react';
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


const purchaseHistory = [
  {
    id: '1',
    planName: 'Pro',
    price: '₫3,500,000',
    startDate: '15/11/2024',
    endDate: '15/12/2024',
    status: 'expired',
    paymentMethod: 'Chuyển khoản ngân hàng',
  },
  {
    id: '2',
    planName: 'Basic',
    price: '₫1,200,000',
    startDate: '15/10/2024',
    endDate: '15/11/2024',
    status: 'expired',
    paymentMethod: 'Thẻ tín dụng',
  },
  {
    id: '3',
    planName: 'Basic',
    price: '₫1,200,000',
    startDate: '15/09/2024',
    endDate: '15/10/2024',
    status: 'expired',
    paymentMethod: 'Ví MoMo',
  },
];

export default function SchoolSubscription() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await subscriptionService.getSubscriptionPlans({
        subscriberType: 'SCHOOL'
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

  const currentSubscription = null;

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan.id);
    setIsProcessing(true);

    // Simulate purchase for now as requested
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Đăng ký thành công!",
      description: `Bạn đã đăng ký gói ${plan.planName}. Vui lòng hoàn tất thanh toán.`,
    });

    setIsProcessing(false);
    setSelectedPlan(null);
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-eco-green/10 mb-4">
          <CreditCard className="w-7 h-7 text-eco-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Chọn gói phù hợp cho trường của bạn
        </h1>
        <p className="text-muted-foreground">
          Học sinh kiếm xu thông qua chơi game và hoàn thành quiz để đổi quà
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
                <li>• <strong>Thời gian gia hạn:</strong> Sau khi gói hết hạn, nhà trường có <strong>10 ngày</strong> để cân nhắc và gia hạn gói mới.</li>
                <li>• <strong>Cách học sinh nhận xu:</strong> Học sinh tự kiếm xu thông qua chơi game phân loại rác và hoàn thành quiz, không được cấp xu tự động.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current subscription status */}
      {currentSubscription ? (
        <Card className="border-eco-green/30 bg-eco-green/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-eco-green/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-eco-green" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Gói hiện tại: Pro</p>
                  <p className="text-sm text-muted-foreground">Hết hạn: 15/01/2025</p>
                </div>
              </div>
              <Badge variant="outline" className="text-eco-green border-eco-green/30">
                Đang hoạt động
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-eco-orange/30 bg-eco-orange/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-eco-orange/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-eco-orange" />
              </div>
              <div>
                <p className="font-medium text-foreground">Bạn chưa có gói đăng ký</p>
                <p className="text-sm text-muted-foreground">Chọn một gói bên dưới để bắt đầu sử dụng EcoVerse</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            const isPopular = plan.planCode === 'SCHOOL_BASIC'; // Example logic for popular
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col",
                  isPopular && "border-eco-green shadow-eco-green/10 shadow-lg scale-105 z-10"
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
                    {plan.description || "Gói đăng ký dành cho trường học"}
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
                    <li className="flex items-start gap-3 text-sm">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", `bg-${colorClass}/20`)}>
                        <Users className={cn("w-3 h-3", `text-${colorClass}`)} />
                      </div>
                      <span className="text-muted-foreground">
                        {plan.maxStudents ? `Tối đa ${plan.maxStudents} học sinh` : 'Không giới hạn học sinh'}
                      </span>
                    </li>

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
                      isPopular 
                        ? "bg-eco-green hover:bg-eco-green/90" 
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isProcessing && selectedPlan === plan.id}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      `Chọn gói ${plan.planName}`
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
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-eco-green" />
            Lịch sử mua gói
          </CardTitle>
          <CardDescription>Danh sách các gói đăng ký đã mua trước đây</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gói</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.planName}</TableCell>
                    <TableCell>{purchase.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {purchase.startDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {purchase.endDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          purchase.status === 'active' && 'text-eco-green border-eco-green/30 bg-eco-green/10',
                          purchase.status === 'expired' && 'text-muted-foreground border-muted-foreground/30 bg-muted/50',
                          purchase.status === 'cancelled' && 'text-destructive border-destructive/30 bg-destructive/10'
                        )}
                      >
                        {purchase.status === 'active' && 'Đang hoạt động'}
                        {purchase.status === 'expired' && 'Đã hết hạn'}
                        {purchase.status === 'cancelled' && 'Đã hủy'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có lịch sử mua gói</p>
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
            <h4 className="font-medium text-foreground mb-1">Học sinh nhận xu như thế nào?</h4>
            <p className="text-sm text-muted-foreground">
              Học sinh tự kiếm xu bằng cách chơi game phân loại rác và hoàn thành các bài quiz. 
              Mỗi rác phân loại đúng được +10 xu, hoàn thành quiz với điểm ≥80% được +25 xu.
            </p>
          </div>
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
              Khi gói hết hạn, nhà trường có <strong>10 ngày</strong> để gia hạn. 
              Trong thời gian này, học sinh vẫn có thể sử dụng tài khoản nhưng không thể đổi quà mới. 
              Sau 10 ngày, tài khoản sẽ bị tạm khóa cho đến khi gia hạn.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Hỗ trợ thanh toán nào?</h4>
            <p className="text-sm text-muted-foreground">
              Chúng tôi hỗ trợ chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, và các ví điện tử phổ biến.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}