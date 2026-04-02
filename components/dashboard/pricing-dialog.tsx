"use client"

import { Check, Zap, Crown, Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: 'free' | 'pro' | 'unlimited'
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For hobbyists and learners',
    icon: Zap,
    features: [
      'Unlimited projects',
      'Local-first storage',
      'Git-like versioning',
      '10 AI credits/month',
      'Basic templates',
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious developers',
    icon: Crown,
    features: [
      'Everything in Free',
      '500 AI credits/month',
      'Priority AI responses',
      'Advanced templates',
      'Cloud backup (coming soon)',
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    disabled: false,
    popular: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$29',
    period: '/month',
    description: 'For power users and teams',
    icon: Infinity,
    features: [
      'Everything in Pro',
      'Unlimited AI credits',
      'Admin dashboard',
      'Team collaboration (coming soon)',
      'Custom AI models (coming soon)',
    ],
    buttonText: 'Go Unlimited',
    buttonVariant: 'default' as const,
    disabled: false,
  },
]

export function PricingDialog({ open, onOpenChange, currentPlan }: PricingDialogProps) {
  const handleUpgrade = (planId: string) => {
    // In a real app, this would integrate with Stripe or another payment provider
    alert(`Upgrade to ${planId} coming soon! For now, use admin key for unlimited access.`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Scale your coding superpowers with AI assistance
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = plan.id === currentPlan
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-2 rounded-full bg-primary/10 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <CardDescription className="text-xs">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={isCurrent ? 'outline' : plan.buttonVariant}
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrent ? 'Current Plan' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
