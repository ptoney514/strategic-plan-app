import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useSchools } from '../../../hooks/useSchools';
import { School, Building2, Search } from 'lucide-react';

export function SchoolsDirectory() {
  const { slug } = useParams<{ slug: string }>();
  const { data: schools, isLoading, error } = useSchools(slug!);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter schools based on search query
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive">Error loading schools</p>
          <Link to={`/${slug}`} className="mt-4 inline-block text-primary hover:underline">
            Back to district
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Link to={`/${slug}`} className="hover:text-foreground transition">
                  District
                </Link>
                <span>/</span>
                <span className="text-foreground">Schools</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Schools Directory
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Schools Grid - 4 columns */}
      <div className="container mx-auto px-6 py-6">
        {filteredSchools.length === 0 ? (
          <div className="text-center py-12">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No schools match your search' : 'No schools found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSchools.map((school) => (
              <Link
                key={school.id}
                to={`/${slug}/schools/${school.slug}/goals`}
                className="group block bg-card rounded-lg border border-border hover:border-primary transition-all hover:shadow-md overflow-hidden"
              >
                {/* Thin color accent */}
                <div
                  className="h-1"
                  style={{
                    backgroundColor: school.primary_color || '#0099CC'
                  }}
                />

                {/* Compact Card Content */}
                <div className="p-4">
                  {/* School Icon & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    {school.logo_url ? (
                      <img
                        src={school.logo_url}
                        alt={school.name}
                        className="w-10 h-10 object-contain rounded flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${school.primary_color || '#0099CC'}15`
                        }}
                      >
                        <Building2
                          className="h-5 w-5"
                          style={{ color: school.primary_color || '#0099CC' }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition line-clamp-2">
                        {school.name}
                      </h3>
                    </div>
                  </div>

                  {/* School Type - Description */}
                  {school.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {school.description}
                    </p>
                  )}

                  {/* Quick Stats - Compact */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {school.principal_name && (
                      <div className="truncate">
                        <span className="font-medium">Principal:</span> {school.principal_name}
                      </div>
                    )}
                    {school.student_count && (
                      <div>
                        <span className="font-medium">Students:</span> {school.student_count.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* View Link - Minimal */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs font-medium text-primary group-hover:underline">
                      View Strategic Plan →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
