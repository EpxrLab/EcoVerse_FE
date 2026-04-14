import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { 
  ChevronDown,
  ChevronRight,
  Users,
  GraduationCap,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ClassCard } from "./ClassCard";

export function GradeGroup({ 
  group, 
  isExpanded, 
  onToggle, 
  onSelectClass,
}) {
  // Auto switch to compact view when more than 6 classes
  const [viewMode, setViewMode] = useState('auto');
  
  const effectiveViewMode = viewMode === 'auto' 
    ? (group.classes.length > 6 ? 'list' : 'grid')
    : viewMode;

  const showViewToggle = group.classes.length > 3;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        "border-2 rounded-xl overflow-hidden transition-all duration-300 bg-card",
        isExpanded ? "border-eco-green/40 shadow-md" : "border-border hover:border-eco-green/30"
      )}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
                isExpanded 
                  ? "bg-eco-green shadow-md" 
                  : "bg-eco-green/10"
              )}>
                <span className={cn(
                  "text-lg font-bold transition-colors",
                  isExpanded ? "text-white" : "text-eco-green"
                )}>
                  {group.grade}
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">Khối {group.grade}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {group.classes.length} lớp
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {group.totalStudents}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                isExpanded ? "bg-eco-green/10" : "bg-muted"
              )}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-eco-green" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* View mode toggle */}
            {showViewToggle && (
              <div className="flex items-center justify-between mb-3 pt-1">
                <span className="text-sm text-muted-foreground font-medium">
                  {group.classes.length} lớp học
                </span>
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6",
                      effectiveViewMode === 'grid' && "bg-background shadow-sm"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('grid');
                    }}
                  >
                    <LayoutGrid className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6",
                      effectiveViewMode === 'list' && "bg-background shadow-sm"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('list');
                    }}
                  >
                    <List className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Grid view */}
            {effectiveViewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.classes.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    onSelect={onSelectClass}
                  />
                ))}
              </div>
            )}

            {/* List view - better for many classes */}
            {effectiveViewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.classes.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    compact
                    onSelect={onSelectClass}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
