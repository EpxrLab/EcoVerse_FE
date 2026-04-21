import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("role") || "";
  
  const [isProcessing, setIsProcessing] = useState(true);
  
  const orderCode = searchParams.get('orderCode');
  const code = searchParams.get('code');
  const id = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');

  const isSuccess = cancel !== 'true' && status !== 'CANCELLED' && code === '00';

  useEffect(() => {
    // Simulate processing time for better UX
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 relative bg-background">
        <div className="absolute inset-0 bg-eco-green/5 blur-3xl rounded-full opacity-50 w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <Loader2 className="w-14 h-14 text-eco-green animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Đang đồng bộ dữ liệu...</h2>
        <p className="text-muted-foreground">Vui lòng đợi trong giây lát, hệ thống đang xử lý giao dịch của bạn.</p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full p-4 overflow-hidden bg-background">
      {/* Premium Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-eco-green/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-eco-yellow/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="w-full max-w-lg z-10 relative"
      >
        <Card className="border-border shadow-2xl overflow-hidden bg-card/80 backdrop-blur-md">
          <div className={`h-2 w-full absolute top-0 left-0 ${isSuccess ? 'bg-gradient-to-r from-eco-green to-emerald-400' : 'bg-gradient-to-r from-destructive to-red-400'}`} />
          
          <CardHeader className="text-center pb-2 pt-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              {isSuccess ? (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-eco-green/20 to-eco-green/5 flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 border border-eco-green/20 rounded-2xl" />
                  <CheckCircle2 className="w-12 h-12 text-eco-green" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 border border-destructive/20 rounded-2xl" />
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
              )}
            </motion.div>
            <CardTitle className="text-3xl font-display font-bold text-foreground">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </CardTitle>
            <CardDescription className="text-base mt-3 text-muted-foreground max-w-[80%] mx-auto">
              {isSuccess 
                ? 'Gói đăng ký của bạn đã được ghi nhận. Vui lòng kiểm tra trạng thái trong mục Lịch sử.' 
                : 'Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý với ngân hàng.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-8">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-4 text-sm">
              {orderCode && (
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground font-medium">Mã đơn hàng:</span>
                  <span className="font-semibold text-foreground font-mono">{orderCode}</span>
                </div>
              )}
              {id && (
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground font-medium">Mã giao dịch:</span>
                  <span className="font-medium text-foreground truncate max-w-[60%] font-mono" title={id}>{id}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground font-medium">Trạng thái:</span>
                <span className={`font-semibold ${isSuccess ? 'text-eco-green' : 'text-destructive'}`}>
                  {isSuccess ? 'Giao dịch thành công' : 'Đã hủy / Lỗi'}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 px-8 pb-10">
            <Button 
              variant="ghost" 
              size="lg"
              className="w-full text-md h-12 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(userRole === 'THIRD_PARTY_PARTNERSHIP' ? '/partnership' : '/school')}
            >
              Về bảng điều khiển chính <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
