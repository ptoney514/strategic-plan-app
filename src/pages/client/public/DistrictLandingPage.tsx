import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { HomepageHeader } from '../../../components/homepage/HomepageHeader';
import { HeroSection } from '../../../components/homepage/HeroSection';
import { StrategicPlanOverview } from '../../../components/homepage/StrategicPlanOverview';
import { MissionVisionValues } from '../../../components/homepage/MissionVisionValues';
import { HomepageFooter } from '../../../components/homepage/HomepageFooter';

export function DistrictLandingPage() {
  const { slug } = useParams();
  const { data: district, isLoading } = useDistrict(slug!);

  // Default configuration - this can be customized per district
  const [config] = useState({
    primaryColor: '#C03537',
    tagline: 'Community. Innovation. Excellence.',
    planYears: '2021-2026',
    planTagline: 'Charting our course for educational excellence through strategic pillars that guide our commitment to student success',
    mission: 'To ensure academic excellence and serve the unique needs of all learners through innovation, personalization, and community engagement.',
    vision: 'We will relentlessly pursue innovative educational ideals and promise to personalize student learning for every student. We invite the challenge of developing a community of learners who embrace a broader, richer definition of success.',
    values: [
      'Student-first Culture',
      'Academic Excellence',
      'Belonging for All',
      'Financial Stability and Efficiency',
      'Leaders in Innovation'
    ],
    contact: {
      email: 'info@district.edu',
      phone: '(555) 123-4567',
      address: '123 Education Way\nLearning City, State 12345'
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">District not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HomepageHeader
        districtName={district.name}
        districtSlug={slug!}
        primaryColor={config.primaryColor}
        tagline={config.tagline}
        logoUrl={district.logo_url}
      />

      <main>
        <HeroSection
          districtName={district.name}
          districtSlug={slug!}
          primaryColor={config.primaryColor}
          planYears={config.planYears}
          planTagline={config.planTagline}
        />

        <StrategicPlanOverview
          primaryColor={config.primaryColor}
          planYears={config.planYears}
          numGoals={4}
        />

        <MissionVisionValues
          primaryColor={config.primaryColor}
          mission={config.mission}
          vision={config.vision}
          values={config.values}
        />
      </main>

      <HomepageFooter
        districtName={district.name}
        districtSlug={slug!}
        primaryColor={config.primaryColor}
        contact={config.contact}
      />
    </div>
  );
}
