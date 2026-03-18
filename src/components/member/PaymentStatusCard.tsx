import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface PaymentStatusCardProps {
  paymentStatus: 'not-required' | 'pending' | 'marked-paid' | 'approved';
  progressionStage: 'new' | 'rules-test' | 'mechanics-course' | 'board-assigned' | 'active';
  paymentMarkedDate?: string;
}

export function PaymentStatusCard({ 
  paymentStatus, 
  progressionStage,
  paymentMarkedDate 
}: PaymentStatusCardProps) {
  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'not-required':
        return {
          icon: <Clock className="w-4 h-4 text-muted-foreground" />,
          status: 'Not Required Yet',
          description: 'Payment to board required after Mechanics Course completion',
          badge: null
        };
      case 'pending':
        return {
          icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
          status: 'Payment Pending',
          description: 'Waiting for board secretary approval',
          badge: <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300">Pending Approval</Badge>
        };
      case 'marked-paid':
        return {
          icon: <Clock className="w-4 h-4 text-blue-500" />,
          status: 'Payment Submitted',
          description: paymentMarkedDate 
            ? `Marked paid on ${new Date(paymentMarkedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : 'Awaiting board secretary verification',
          badge: <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300">Under Review</Badge>
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          status: 'Payment Approved',
          description: 'All set! Your payment has been verified',
          badge: <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300">Approved</Badge>
        };
    }
  };

  const { icon, status, description, badge } = getStatusDisplay();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
        <DollarSign className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-lg font-semibold">{status}</p>
          </div>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {paymentStatus === 'not-required' && (progressionStage === 'new' || progressionStage === 'rules-test') && (
          <div className="pt-2 mt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Focus on completing your training first. Payment will be required after Mechanics Course.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
