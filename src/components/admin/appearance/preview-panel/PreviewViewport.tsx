import { motion } from 'framer-motion';
import { useAppearance } from '../AppearanceContext';
import { RENDERER_REGISTRY } from './renderers';
import { getMergedConfig } from '../../../public/templates/TemplateRegistry';
import type { DeviceMode } from './PreviewToolbar';

interface PreviewViewportProps {
  device: DeviceMode;
}

export function PreviewViewport({ device }: PreviewViewportProps) {
  const { state, districtName, districtTagline } = useAppearance();
  const mergedConfig = getMergedConfig(state.dashboardTemplate, state.dashboardConfig);
  const Renderer = RENDERER_REGISTRY[state.dashboardTemplate] || RENDERER_REGISTRY.hierarchical;

  const isMobile = device === 'mobile';

  return (
    <div
      className="flex-1 flex items-start justify-center overflow-auto p-6"
      style={{ backgroundColor: 'var(--editorial-bg)' }}
    >
      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`origin-top ${
          isMobile
            ? 'w-[375px] rounded-[2rem] border-[8px] border-slate-800 shadow-2xl'
            : 'w-full max-w-[1200px] rounded-lg border shadow-lg'
        }`}
        style={{
          borderColor: isMobile ? undefined : 'var(--editorial-border)',
        }}
      >
        <div
          className={`overflow-hidden bg-white ${
            isMobile ? 'rounded-[1.5rem]' : 'rounded-lg'
          }`}
          style={isMobile ? { height: '667px', overflowY: 'auto' } : {}}
        >
          <div
            style={
              isMobile
                ? {}
                : {
                    transform: 'scale(0.55)',
                    transformOrigin: 'top left',
                    width: `${100 / 0.55}%`,
                    height: `${100 / 0.55}%`,
                  }
            }
          >
            <Renderer
              primaryColor={state.primaryColor}
              secondaryColor={state.secondaryColor}
              logoUrl={state.logoUrl}
              districtName={districtName}
              tagline={districtTagline}
              config={mergedConfig}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
