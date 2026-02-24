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
            className={`flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border/50 ${!item.active ? "opacity-50" : ""}`}
          >
            <div className="w-11 h-11 rounded-xl bg-eco-leaf/10 flex items-center justify-center text-xl border border-eco-leaf/20">
              {item.image}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{item.name}</h4>
                <Badge 
                  variant={item.active ? "default" : "secondary"} 
                  className={item.active ? "bg-eco-green text-xs" : "text-xs"}
                >
                  {item.active ? "Hoạt động" : "Tạm ngưng"}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="font-bold text-eco-orange">{item.coins} xu</span>
                {' '}
                <span className="text-muted-foreground">• SL: {item.stock}</span>
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