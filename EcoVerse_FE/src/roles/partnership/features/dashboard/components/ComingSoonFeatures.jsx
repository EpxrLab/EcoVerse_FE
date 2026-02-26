import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function ComingSoonFeatures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Các tính năng sắp ra mắt</CardTitle>
        <CardDescription>
          Chúng tôi đang phát triển thêm các tính năng dành cho đối tác
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium mb-2">📊 Báo cáo hoạt động</h4>
            <p className="text-sm text-muted-foreground">
              Xem thống kê chi tiết về các trường và học sinh tham gia chiến dịch của bạn
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium mb-2">🎯 Quản lý chiến dịch</h4>
            <p className="text-sm text-muted-foreground">
              Tạo và quản lý các chiến dịch môi trường cùng EcoVerse
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium mb-2">🏆 Phần thưởng tài trợ</h4>
            <p className="text-sm text-muted-foreground">
              Tài trợ phần thưởng cho học sinh đạt thành tích cao
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}