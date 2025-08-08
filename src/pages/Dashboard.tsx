import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Clock, DollarSign, User, Phone, Mail, MapPin, FileText, Edit, Trash2, Plus } from "lucide-react";
import { AppointmentActions } from "@/components/AppointmentActions";
import { format } from "date-fns";

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
  user_id: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setProfile(profileData);
      
      // If user has admin role, redirect to admin page
      if (profileData && profileData.role === 'admin') {
        navigate("/admin");
        return;
      }

      // If user has super_admin role, redirect to super admin page
      if (profileData && profileData.role === 'super_admin') {
        navigate("/super-admin");
        return;
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && profile?.role === 'customer') {
      fetchMyAppointments();
    }
  }, [user, profile]);

  const fetchMyAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      toast({
        title: "Error loading appointments",
        description: "Failed to load your appointment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/booking">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'cancelled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + Number(a.total_price), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your appointments and account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link to="/booking">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </Link>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>
              View and manage your appointment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No appointments found</p>
                <Link to="/booking">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                          <div className="space-y-1">
                            <div className="font-medium">
                              {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {appointment.duration_minutes} mins
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-medium">${Number(appointment.total_price).toFixed(2)}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          {appointment.notes ? (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm max-w-32 truncate">{appointment.notes}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No notes</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <AppointmentActions
                            appointmentId={appointment.id}
                            status={appointment.status}
                            appointmentDate={appointment.appointment_date}
                            appointmentTime={appointment.appointment_time}
                            onUpdate={fetchMyAppointments}
                            userRole={profile?.role}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}