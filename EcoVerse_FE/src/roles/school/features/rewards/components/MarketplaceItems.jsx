import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

export function MarketplaceItems({ items, onEdit, onDelete }) {
  return (
    <div className="space-y-2.5">
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có quà thật nào</p>
      ) : (
        items.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border/50 ${!item.isActive ? "opacity-50" : ""}`}
          >
            <div className="w-11 h-11 rounded-xl bg-eco-leaf/10 flex items-center justify-center text-xl border border-eco-leaf/20 overflow-hidden">
              {typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') ? (
                <img src={item.imageUrl} alt={item.rewardName} className="w-full h-full object-cover" />
              ) : (
                item.imageUrl
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{item.rewardName}</h4>
                <Badge 
                  variant={item.isActive ? "default" : "secondary"} 
                  className={item.isActive ? "bg-eco-green text-xs" : "text-xs"}
                >
                  {item.isActive ? "Hoạt động" : "Tạm ngưng"}
                </Badge>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-eco-green/30 text-eco-green">
                  {item.rewardType}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="font-bold text-eco-orange">{item.coinCost} xu</span>
                {' '}
                <span className="text-muted-foreground">• SL: {item.isUnlimited ? '∞' : item.stockQuantity}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-eco-green/10 hover:text-eco-green"
                onClick={() => onEdit(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}