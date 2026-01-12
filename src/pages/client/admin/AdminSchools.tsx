import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSchools } from '../../../hooks/useSchools';
import { useDistrict } from '../../../hooks/useDistricts';
import { Building2, Search, Plus, ExternalLink, Users, Target } from 'lucide-react';
import { AddSchoolModal } from '../../../components/admin/schools';

export function AdminSchools() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district } = useDistrict(slug!);
  const { data: schools, isLoading, refetch } = useSchools(slug!);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase();
    return schools.filter(school =>
      school.name.toLowerCase().includes(query) ||
      school.description?.toLowerCase().includes(query) ||
      school.principal_name?.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  // Calculate aggregate statistics
  const stats = useMemo(() => {
    if (!schools) return { totalSchools: 0, totalStudents: 0, avgStudents: 0 };

    const totalStudents = schools.reduce((sum, s) => sum + (s.student_count || 0), 0);
    const schoolsWithCount = schools.filter(s => s.student_count).length;

    return {
      totalSchools: schools.length,
      totalStudents,
      avgStudents: schoolsWithCount > 0 ? Math.round(totalStudents / schoolsWithCount) : 0
    };
  }, [schools]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schools Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all schools in your district
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add New School
          </button>
        </div>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalSchools}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalStudents > 0 ? stats.totalStudents.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Students/School</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.avgStudents > 0 ? stats.avgStudents.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools by name, principal, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-foreground">School Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Principal</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Students</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No schools match your search' : 'No schools found'}
                </td>
              </tr>
            ) : (
              filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="w-8 h-8 object-contain rounded"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${school.primary_color || '#0099CC'}15`
                          }}
                        >
                          <Building2
                            className="h-4 w-4"
                            style={{ color: school.primary_color || '#0099CC' }}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {school.name}
                        </div>
                        {school.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {school.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {school.principal_name || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {school.student_count ? school.student_count.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      school.is_public
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {school.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/${slug}/schools/${school.slug}/goals`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                      <Link
                        to={`/${slug}/schools/${school.slug}/admin`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted rounded transition"
                      >
                        Manage
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Each school can have its own strategic plan with independent goals and metrics.
          District admins can manage all schools. School admins can only manage their assigned school.
        </p>
      </div>

      {/* Add School Modal */}
      {district && (
        <AddSchoolModal
          districtId={district.id}
          districtSlug={slug!}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
