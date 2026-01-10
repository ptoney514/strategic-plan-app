import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Globe, GraduationCap, Settings } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface HomepageHeaderProps {
  districtName: string;
  districtSlug: string;
  primaryColor?: string;
  tagline?: string;
  logoUrl?: string;
}

export function HomepageHeader({
  districtName,
  districtSlug,
  primaryColor = '#C03537',
  tagline = 'Community. Innovation. Excellence.',
  logoUrl
}: HomepageHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">HOME</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">OUR DISTRICT</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">OUR TEAM</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">ACADEMICS</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">FOR FAMILIES</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">COMMUNITY</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">RESOURCES</a>
            <Link
              to={`/${districtSlug}/goals`}
              className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide px-3 py-1 rounded"
              style={{ backgroundColor: primaryColor }}
            >
              STRATEGIC PLAN
            </Link>
            <Link
              to={`/${districtSlug}/admin`}
              className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              CLIENT ADMIN
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and School Name */}
            <div className="flex items-center space-x-4">
              {/* District Logo */}
              {logoUrl && (
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                  <ImageWithFallback
                    src={logoUrl}
                    alt={`${districtName} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{districtName}</h1>
                <p className="text-white/90 text-sm font-medium">{tagline}</p>
              </div>
            </div>

            {/* Utility Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded text-sm transition">
                <User className="w-4 h-4" />
                Sign In
              </button>
              <button className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded text-sm transition">
                <Globe className="w-4 h-4" />
                TRANSLATE
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded text-sm transition">
                <GraduationCap className="w-4 h-4" />
                SELECT A SCHOOL
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center py-2 text-sm">
            <Link to="/" className="text-[#808080] hover:opacity-80 transition-colors">Home</Link>
            <span className="mx-2 text-[#808080]">›</span>
            <Link to={`/${districtSlug}`} className="text-[#808080] hover:opacity-80 transition-colors">District Home</Link>
            <span className="mx-2 text-[#808080]">›</span>
            <span className="text-[#2C2C2C] font-medium">Strategic Plan</span>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Main Navigation */}
            <nav className="space-y-3">
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">HOME</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">OUR DISTRICT</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">OUR TEAM</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">ACADEMICS</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">FOR FAMILIES</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">COMMUNITY</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">RESOURCES</a>
              <Link
                to={`/${districtSlug}/goals`}
                className="block hover:opacity-80 transition-colors py-2 font-medium"
                style={{ color: primaryColor }}
              >
                STRATEGIC PLAN
              </Link>
              <Link
                to={`/${districtSlug}/admin`}
                className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                CLIENT ADMIN
              </Link>
            </nav>

            {/* Utility Buttons */}
            <div className="pt-4 border-t space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition">
                <User className="w-4 h-4" />
                Sign In
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition">
                <Globe className="w-4 h-4" />
                Translate
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition">
                <GraduationCap className="w-4 h-4" />
                Select a School
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
