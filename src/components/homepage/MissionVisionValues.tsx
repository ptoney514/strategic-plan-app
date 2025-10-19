import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye, Heart, Users, Plus, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface MVVProps {
  primaryColor?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

export function MissionVisionValues({
  primaryColor = '#C03537',
  mission = 'To ensure academic excellence and serve the unique needs of all learners through innovation, personalization, and community engagement.',
  vision = 'We will relentlessly pursue innovative educational ideals and promise to personalize student learning for every student.',
  values = [
    'Student-first Culture',
    'Academic Excellence',
    'Belonging for All',
    'Financial Stability and Efficiency',
    'Leaders in Innovation'
  ]
}: MVVProps) {
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const strategicContent = [
    {
      id: 'mission',
      title: 'Mission',
      subtitle: 'Why We Exist',
      icon: Target,
      color: primaryColor,
      image: 'https://images.unsplash.com/photo-1636772523547-5577d04e8dc1?w=800',
      summary: 'Defining excellence through innovation, personalization, and community engagement to ensure success for all learners.',
      content: mission
    },
    {
      id: 'vision',
      title: 'Vision',
      subtitle: 'What We Seek to Become',
      icon: Eye,
      color: '#808080',
      image: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?w=800',
      summary: 'Pursuing innovative educational ideals and personalizing learning for every student in our community.',
      content: vision
    },
    {
      id: 'values',
      title: 'Values',
      subtitle: 'Our Guiding Principles',
      icon: Heart,
      color: '#2C2C2C',
      image: 'https://images.unsplash.com/photo-1663246544917-9fa8f65b8359?w=800',
      summary: 'Core values that guide every decision and action in our educational community.',
      content: 'Our core values serve as the foundation for all decisions and actions within our educational community:',
      values: values
    },
    {
      id: 'goals',
      title: 'Strategic Goals',
      subtitle: 'Focus Areas',
      icon: Users,
      color: primaryColor,
      image: 'https://images.unsplash.com/photo-1740818576337-774016913c01?w=800',
      summary: 'Comprehensive strategic goals with detailed implementation strategies for student success.',
      content: 'Our strategic goals provide a roadmap for achieving our mission and vision through focused action areas.'
    }
  ];

  return (
    <section id="mission-vision" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-4">
            Strategic Plan Foundation
          </h2>
          <p className="text-xl text-[#808080] max-w-3xl mx-auto">
            Explore the comprehensive strategic plan that guides our commitment to educational excellence and community partnership.
          </p>
        </motion.div>

        {/* Card Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {strategicContent.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group-hover:-translate-y-2 bg-white rounded-lg"
                  onClick={() => setSelectedContent(item)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={`${item.title} image`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div
                        className="p-2 rounded-full backdrop-blur-sm border border-white/20"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                        <Plus className="w-4 h-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold mb-3" style={{ color: item.color }}>
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-[#808080] leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal for detailed content */}
        <AnimatePresence>
          {selectedContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setSelectedContent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${selectedContent.color}15` }}
                    >
                      {selectedContent.icon && (
                        <selectedContent.icon
                          className="w-6 h-6"
                          style={{ color: selectedContent.color }}
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedContent.title}</h2>
                      <p className="text-sm font-semibold mt-1" style={{ color: selectedContent.color }}>
                        {selectedContent.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={selectedContent.image}
                      alt={`${selectedContent.title} image`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <p className="text-base text-[#2C2C2C] leading-relaxed">
                    {selectedContent.content}
                  </p>
                  {selectedContent.values && (
                    <ul className="mt-4 space-y-2">
                      {selectedContent.values.map((value: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full mt-2"
                            style={{ backgroundColor: selectedContent.color }}
                          />
                          <span className="text-[#2C2C2C]">{value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
