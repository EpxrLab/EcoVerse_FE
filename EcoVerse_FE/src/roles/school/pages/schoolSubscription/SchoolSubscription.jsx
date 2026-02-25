import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, Users, Zap, AlertTriangle, Info, History, Calendar, Receipt } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'Miễn phí',
    priceValue: 0,
    period: '',
    students: 20,
    features: [
      '20 học sinh',
      'Báo cáo cơ bản',
      'Hỗ trợ email',
    ],
    icon: Users,
    color: 'eco-blue',
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '₫1,200,000',
    priceValue: 1200000,
    period: '/tháng',
    students: 50,
    features: [
      '50 học sinh',
      'Báo cáo chi tiết',
      'Tạo Quiz riêng',
      'Hỗ trợ email',
    ],
    icon: Zap,
    color: 'eco-green',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₫3,500,000',
    priceValue: 3500000,
    period: '/tháng',
    students: 200,
    features: [
      '200 học sinh',
      'Báo cáo nâng cao',
      'Tạo Quiz riêng',
      'Hỗ trợ ưu tiên',
      'Tùy chỉnh branding',
    ],
    icon: Crown,
    color: 'eco-orange',
    popular: false,
  },
];

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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentSubscription = null;

  const handleSelectPlan = async (planId) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Đăng ký thành công!",
      description: `Bạn đã đăng ký gói ${plans.find(p => p.id === planId)?.name}. Vui lòng hoàn tất thanh toán.`,
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
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colorClass = plan.color;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                plan.popular && "border-eco-green shadow-eco-green/10 shadow-lg scale-105 z-10"
              )}
            >
              {plan.popular && (
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
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>Tối đa {plan.students} học sinh</CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
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
                    plan.popular 
                      ? "bg-eco-green hover:bg-eco-green/90" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    "Đang xử lý..."
                  ) : (
                    `Chọn gói ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

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