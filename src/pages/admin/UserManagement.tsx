import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Search, Loader2, X, Building2, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import type { District } from '../../lib/types';

interface DistrictAdmin {
  id: string;
  user_id: string;
  district_id: string;
  district_slug: string;
  created_at: string;
  created_by: string | null;
  user_email?: string;
  district?: District;
}

/**
 * UserManagement - Manage district admin assignments
 * Only accessible to system administrators
 */
export function UserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch all district admins with their district info
  const { data: districtAdmins = [], isLoading, error } = useQuery({
    queryKey: ['district-admins'],
    queryFn: async () => {
      // First get all district admin assignments
      const { data: admins, error: adminsError } = await supabase
        .from('spb_district_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminsError) throw adminsError;
      if (!admins || admins.length === 0) return [];

      // Get all districts for lookup
      const { data: districts } = await supabase
        .from('spb_districts')
        .select('*');

      const districtMap = new Map((districts || []).map(d => [d.id, d]));

      // Return admins with district info
      return admins.map(admin => ({
        ...admin,
        district: districtMap.get(admin.district_id),
      }));
    },
  });

  // Fetch all districts for the add form
  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spb_districts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Delete district admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('spb_district_admins')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-admins'] });
      setDeleteConfirm(null);
    },
  });

  // Group admins by user_id for display
  const adminsByUser = districtAdmins.reduce((acc, admin) => {
    if (!acc[admin.user_id]) {
      acc[admin.user_id] = [];
    }
    acc[admin.user_id].push(admin);
    return acc;
  }, {} as Record<string, DistrictAdmin[]>);

  // Filter by search term
  const filteredUsers = Object.entries(adminsByUser).filter(([userId, admins]) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      userId.toLowerCase().includes(searchLower) ||
      admins.some(a =>
        a.district_slug.toLowerCase().includes(searchLower) ||
        a.district?.name.toLowerCase().includes(searchLower)
      )
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading district admins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load district admins</p>
        <p className="text-sm text-destructive/80 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage district administrator access
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">District Admins</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {Object.keys(adminsByUser).length}
              </p>
            </div>
            <Users className="h-12 w-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {districtAdmins.length}
              </p>
            </div>
            <Building2 className="h-12 w-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Districts with Admins</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {new Set(districtAdmins.map(a => a.district_id)).size}
              </p>
            </div>
            <Shield className="h-12 w-12 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">District Admins</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">
              {searchTerm
                ? 'No users match your search'
                : 'No district admins yet. Add your first admin!'}
            </div>
          ) : (
            filteredUsers.map(([userId, admins]) => (
              <div key={userId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">User ID</p>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {userId.slice(0, 8)}...{userId.slice(-4)}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                        >
                          {admin.district?.logo_url ? (
                            <img
                              src={admin.district.logo_url}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                            />
                          ) : (
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: admin.district?.primary_color || '#C03537' }}
                            >
                              {admin.district?.name.charAt(0) || 'D'}
                            </div>
                          )}
                          <span className="text-sm text-foreground">
                            {admin.district?.name || admin.district_slug}
                          </span>
                          <button
                            onClick={() => setDeleteConfirm(admin.id)}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Note about user management</p>
          <p className="text-blue-600 dark:text-blue-400">
            To create new users, use the Supabase dashboard or invite users via email.
            Users must sign up before they can be assigned as district admins.
          </p>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <AddAdminModal
          districts={districts}
          existingAdmins={districtAdmins}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['district-admins'] });
            setShowAddForm(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Remove Admin Access?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will remove the user's access to this district. They will no longer be able to manage its goals and metrics.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteAdminMutation.mutate(deleteConfirm)}
                disabled={deleteAdminMutation.isPending}
              >
                {deleteAdminMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Removing...
                  </>
                ) : (
                  'Remove Access'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddAdminModalProps {
  districts: District[];
  existingAdmins: DistrictAdmin[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddAdminModal({ districts, existingAdmins, onClose, onSuccess }: AddAdminModalProps) {
  const [userId, setUserId] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    if (!selectedDistrict) {
      setError('Please select a district');
      return;
    }

    // Check if this assignment already exists
    const exists = existingAdmins.some(
      a => a.user_id === userId && a.district_id === selectedDistrict
    );
    if (exists) {
      setError('This user is already an admin for this district');
      return;
    }

    const district = districts.find(d => d.id === selectedDistrict);
    if (!district) {
      setError('Selected district not found');
      return;
    }

    setIsLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('spb_district_admins')
        .insert({
          user_id: userId.trim(),
          district_id: selectedDistrict,
          district_slug: district.slug,
        });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Add District Admin</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              User ID *
            </label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the UUID of the user from Supabase Auth
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              District *
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a district...</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name} ({district.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Admin'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
