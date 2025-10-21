import { useParams, Link } from 'react-router-dom';
import { useSchools } from '../../../hooks/useSchools';
import { School, Building2, Users, MapPin } from 'lucide-react';

export function SchoolsDirectory() {
  const { slug } = useParams<{ slug: string }>();
  const { data: schools, isLoading, error } = useSchools(slug!);

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
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to={`/${slug}`} className="hover:text-foreground transition">
                District Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Our Schools</span>
            </div>
            <h1 className="text-4xl font-bold text-card-foreground mb-4">
              Our Schools
            </h1>
            <p className="text-lg text-muted-foreground">
              {schools?.length || 0} schools serving our community with excellence
            </p>
          </div>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="container mx-auto px-6 py-12">
        {!schools || schools.length === 0 ? (
          <div className="text-center py-12">
            <School className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No schools found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Link
                key={school.id}
                to={`/${slug}/schools/${school.slug}/goals`}
                className="group block bg-card rounded-lg border border-border hover:border-primary transition-all hover:shadow-lg overflow-hidden"
              >
                {/* School Card Header - with color accent */}
                <div
                  className="h-2"
                  style={{
                    backgroundColor: school.primary_color || '#0099CC'
                  }}
                />

                {/* School Card Content */}
                <div className="p-6">
                  {/* School Logo or Icon */}
                  <div className="flex items-start gap-4 mb-4">
                    {school.logo_url ? (
                      <img
                        src={school.logo_url}
                        alt={school.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: `${school.primary_color || '#0099CC'}20`
                        }}
                      >
                        <Building2
                          className="h-8 w-8"
                          style={{ color: school.primary_color || '#0099CC' }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition line-clamp-2">
                        {school.name}
                      </h3>
                    </div>
                  </div>

                  {/* School Description */}
                  {school.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {school.description}
                    </p>
                  )}

                  {/* School Details */}
                  <div className="space-y-2 text-sm">
                    {school.principal_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Principal: {school.principal_name}</span>
                      </div>
                    )}
                    {school.student_count && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-4 w-4" />
                        <span>{school.student_count.toLocaleString()} students</span>
                      </div>
                    )}
                    {school.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{school.address}</span>
                      </div>
                    )}
                  </div>

                  {/* View Goals Link */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm font-medium text-primary group-hover:underline">
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
