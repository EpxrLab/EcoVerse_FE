import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-card",
        glass: "bg-card/60 backdrop-blur-xl border border-border/50 shadow-card",
        eco: "bg-gradient-to-br from-[hsl(145,63%,42%)]/10 to-[hsl(90,60%,45%)]/10 border border-[hsl(145,63%,42%)]/20 shadow-soft",
        elevated: "bg-card border border-border shadow-card hover:shadow-glow hover:-translate-y-1",
        interactive: "bg-card border border-border shadow-card hover:shadow-glow hover:-translate-y-2 hover:border-primary/30 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Card = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, className }))}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-bold leading-none tracking-tight font-display", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };