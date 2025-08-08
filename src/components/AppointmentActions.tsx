import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, X, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentActionsProps {
  appointmentId: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  onUpdate: () => void;
  userRole?: string;
}

export function AppointmentActions({ appointmentId, status, appointmentDate, appointmentTime, onUpdate, userRole }: AppointmentActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isPastAppointment = new Date(`${appointmentDate} ${appointmentTime}`) < new Date();
  const canCancel = status !== 'cancelled' && (!isPastAppointment || userRole === 'admin' || userRole === 'super_admin');

  const handleCancelAppointment = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellationReason || 'No reason provided'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been successfully cancelled."
      });

      setIsDialogOpen(false);
      setCancellationReason("");
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToCalendar = () => {
    const startDate = new Date(`${appointmentDate} ${appointmentTime}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kamala Massage//EN
BEGIN:VEVENT
UID:${appointmentId}@kamalamassage.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Massage Appointment
DESCRIPTION:Scheduled massage appointment
LOCATION:Client Location
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointmentDate}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Calendar Export",
      description: "Appointment has been exported to your calendar."
    });
  };

  return (
    <div className="flex gap-2">
      {canCancel && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelAppointment}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? "Cancelling..." : "Cancel Appointment"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <Button variant="outline" size="sm" onClick={handleExportToCalendar}>
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
}