import { Link } from 'react-router-dom';
import { useDistricts } from '../../../hooks/useDistricts';
import { Building2, ChevronRight, Users, Target, TrendingUp } from 'lucide-react';

export function HomePage() {
  const { data: districts, isLoading, error } = useDistricts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading districts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading districts</p>
          <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-card-foreground">
            Strategic Plan Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Select a district to view and manage strategic goals
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!districts || districts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No districts found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first district to get started
            </p>
            <button className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
              Create District
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districts.map((district) => (
              <Link
                key={district.id}
                to={`/${district.slug}`}
                className="block bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">
                      {district.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {district.slug}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {district.logo_url && (
                  <img 
                    src={district.logo_url} 
                    alt={district.name}
                    className="h-12 mb-4 object-contain"
                  />
                )}

                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="h-4 w-4 mr-2" />
                    <span>Strategic Goals</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>Performance Metrics</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{district.admin_email}</span>
                  </div>
                </div>

                {district.is_public && (
                  <div className="mt-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Public
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}