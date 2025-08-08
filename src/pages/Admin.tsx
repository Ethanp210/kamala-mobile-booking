import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { AppointmentActions } from "@/components/AppointmentActions";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
}

const Admin = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If admin, redirect to admin dashboard
      if (profileData && (profileData.role === 'admin' || profileData.role === 'super_admin')) {
        setProfile(profileData);
        setLoading(false);
        return;
      }

      // If not admin, redirect to customer dashboard
      navigate("/dashboard");
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && profile) {
      fetchAppointments();
    }
  }, [user, profile]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + Number(a.total_price), 0);
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const uniqueClients = new Set(appointments.map(a => a.client_email)).size;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage appointments and client information
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueClients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>
              Manage all client appointments and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.client_name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-32">
                            {appointment.client_address}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{appointment.client_email}</div>
                            <div className="text-sm text-muted-foreground">{appointment.client_phone}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>{appointment.duration_minutes} mins</TableCell>
                        
                        <TableCell>
                          <span className="font-medium">${Number(appointment.total_price).toFixed(2)}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="max-w-xs truncate">
                          {appointment.notes || '-'}
                        </TableCell>
                        
                        <TableCell>
                          <AppointmentActions
                            appointmentId={appointment.id}
                            status={appointment.status}
                            appointmentDate={appointment.appointment_date}
                            appointmentTime={appointment.appointment_time}
                            onUpdate={fetchAppointments}
                            userRole={profile?.role}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;