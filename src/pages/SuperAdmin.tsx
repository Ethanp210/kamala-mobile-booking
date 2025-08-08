import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LogOut, UserPlus, Shield, Crown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const SuperAdmin = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: "",
    password: "",
    role: "admin"
  });
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

      if (!profileData || profileData.role !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setProfile(profileData);
      fetchProfiles();
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive"
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.email || !newAdminData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAdminData.email,
        password: newAdminData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Update the user's role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newAdminData.role as 'admin' | 'super_admin' })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Admin Created",
        description: `New ${newAdminData.role} account created successfully.`
      });

      setNewAdminData({ email: "", password: "", role: "admin" });
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been deleted.`
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete user",
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Crown className="h-6 w-6" />
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage admin accounts and system settings
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
        <div className="grid gap-8">
          {/* Create Admin Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create Admin Account
              </CardTitle>
              <CardDescription>
                Create new admin or super admin accounts. Only super admins can perform this action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Secure password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newAdminData.role} onValueChange={(value) => setNewAdminData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Admin Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage all user accounts in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(profile.role)} className="flex items-center gap-1 w-fit">
                            {getRoleIcon(profile.role)}
                            {profile.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {profile.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {profile.email}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(profile.id, profile.email)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;