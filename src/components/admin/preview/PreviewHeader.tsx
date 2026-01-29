import { User, Globe, GraduationCap, ChevronDown, Settings } from 'lucide-react';

interface PreviewHeaderProps {
  primaryColor: string;
  districtName: string;
  tagline?: string;
  logoUrl?: string;
}

/**
 * PreviewHeader - Simplified header preview for the appearance settings
 * Shows the key visual elements from HomepageHeader without functional navigation
 */
export function PreviewHeader({
  primaryColor,
  districtName,
  tagline = 'Community. Innovation. Excellence.',
  logoUrl,
}: PreviewHeaderProps) {
  return (
    <header>
      {/* Top Navigation Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8 py-3">
            <span className="text-white text-sm font-medium tracking-wide">HOME</span>
            <span className="text-white text-sm font-medium tracking-wide">OUR DISTRICT</span>
            <span className="text-white text-sm font-medium tracking-wide">OUR TEAM</span>
            <span className="text-white text-sm font-medium tracking-wide">ACADEMICS</span>
            <span className="text-white text-sm font-medium tracking-wide">FOR FAMILIES</span>
            <span className="text-white text-sm font-medium tracking-wide">COMMUNITY</span>
            <span className="text-white text-sm font-medium tracking-wide">RESOURCES</span>
            <span
              className="text-white text-sm font-medium tracking-wide px-3 py-1 rounded"
              style={{ backgroundColor: primaryColor }}
            >
              STRATEGIC PLAN
            </span>
            <span className="text-white text-sm font-medium tracking-wide flex items-center gap-1">
              <Settings className="w-4 h-4" />
              CLIENT ADMIN
            </span>
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and District Name */}
            <div className="flex items-center space-x-4">
              {logoUrl ? (
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={`${districtName} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {districtName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{districtName}</h1>
                <p className="text-white/90 text-sm font-medium">{tagline}</p>
              </div>
            </div>

            {/* Utility Buttons (decorative) */}
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-2 text-white px-3 py-2 text-sm">
                <User className="w-4 h-4" />
                Sign In
              </span>
              <span className="flex items-center gap-2 text-white px-3 py-2 text-sm">
                <Globe className="w-4 h-4" />
                TRANSLATE
                <ChevronDown className="w-4 h-4" />
              </span>
              <span className="flex items-center gap-2 text-white px-3 py-2 text-sm">
                <GraduationCap className="w-4 h-4" />
                SELECT A SCHOOL
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center py-2 text-sm">
            <span className="text-[#808080]">Home</span>
            <span className="mx-2 text-[#808080]">›</span>
            <span className="text-[#808080]">District Home</span>
            <span className="mx-2 text-[#808080]">›</span>
            <span className="text-[#2C2C2C] font-medium">Strategic Plan</span>
          </nav>
        </div>
      </div>
    </header>
  );
}
