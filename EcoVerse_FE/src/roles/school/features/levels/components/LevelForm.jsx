import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Zap, Recycle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Define BIN_TYPES constant locally or import if available.
// Assuming similar structure to Partnership but adapting to School's types if needed.
const BIN_TYPES = [
  { id: "plastic", label: "Rác nhựa", icon: "🥤", color: "bg-blue-500" },
  { id: "paper", label: "Rác giấy", icon: "📄", color: "bg-yellow-500" },
  { id: "organic", label: "Hữu cơ", icon: "🍎", color: "bg-green-500" },
  { id: "others", label: "Khác", icon: "🥡", color: "bg-gray-500" },
];

export function LevelForm({
  isOpen,
  onClose,
  mode,
  formData,
  selectedBinTypes,
  onFormChange,
  onBinTypeToggle,
  onSubmit,
}) {
  const isValid =
    formData.name && formData.items > 0 && selectedBinTypes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "create" ? "Tạo cấp độ game mới" : "Cập nhật cấp độ game"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Game Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-bold">Chọn loại game *</Label>
            <Tabs
              value={formData.gameType}
              onValueChange={(value) => onFormChange({ gameType: value })}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sorting" className="gap-2">
                  <Recycle className="w-4 h-4" />
                  Thu thập & Phân loại
                </TabsTrigger>
                <TabsTrigger value="runner" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Chạy & Phân loại
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên cấp độ *</Label>
              <Input
                id="name"
                placeholder="VD: Thu thập cơ bản - Cấp 1"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Độ khó *</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Dễ", "Trung bình", "Khó"].map((diff) => (
                  <Button
                    key={diff}
                    type="button"
                    variant={
                      formData.difficulty === diff ? "default" : "outline"
                    }
                    className={cn(
                      "border-2",
                      formData.difficulty === diff &&
                        diff === "Dễ" &&
                        "bg-eco-green hover:bg-eco-green/90",
                      formData.difficulty === diff &&
                        diff === "Trung bình" &&
                        "bg-eco-orange hover:bg-eco-orange/90",
                      formData.difficulty === diff &&
                        diff === "Khó" &&
                        "bg-destructive hover:bg-destructive/90",
                    )}
                    onClick={() => onFormChange({ difficulty: diff })}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả cấp độ</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về cấp độ này..."
                rows={2}
                value={formData.description || ""}
                onChange={(e) => onFormChange({ description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="items">Số vật phẩm *</Label>
                <Input
                  id="items"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.items}
                  onChange={(e) =>
                    onFormChange({ items: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passRate">Tỷ lệ đạt yêu cầu (%)</Label>
                <Input
                  id="passRate"
                  placeholder="VD: 70%"
                  value={formData.passRate || ""}
                  onChange={(e) => onFormChange({ passRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coinsReward">Phần thưởng xu</Label>
              <Input
                id="coinsReward"
                type="number"
                placeholder="VD: 100"
                value={formData.coinsReward || ""}
                onChange={(e) =>
                  onFormChange({ coinsReward: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Bin Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">
                Chọn loại thùng rác *
              </Label>
              <Badge variant="outline">{selectedBinTypes.length}/4 thùng</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BIN_TYPES.map((bin) => {
                const isSelected = selectedBinTypes.includes(bin.id);
                return (
                  <div
                    key={bin.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                      isSelected
                        ? "bg-eco-green/10 border-eco-green shadow-sm ring-1 ring-eco-green"
                        : "border-border hover:bg-muted/50 hover:border-muted-foreground/30",
                    )}
                    onClick={() => onBinTypeToggle(bin.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm",
                          bin.color,
                        )}
                      >
                        <span className="text-xl">{bin.icon}</span>
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-semibold",
                            isSelected && "text-eco-green-dark",
                          )}
                        >
                          {bin.label}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {bin.id}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedBinTypes.length === 0 && (
              <p className="text-sm text-destructive">
                ⚠️ Cần chọn ít nhất 1 loại thùng rác
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 border-2"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
              onClick={onSubmit}
              disabled={!isValid}
            >
              {mode === "create" ? "Tạo cấp độ" : "Cập nhật"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
