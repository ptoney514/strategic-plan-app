import { ConfigPanelHeader } from './ConfigPanelHeader';
import { ConfigSection } from './ConfigSection';
import { CONFIG_SECTIONS } from './sections';

export function ConfigPanel() {
  const sortedSections = [...CONFIG_SECTIONS].sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex flex-col w-full h-full border-r"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        borderColor: 'var(--editorial-border)',
      }}
    >
      <ConfigPanelHeader />
      <div className="flex-1 overflow-y-auto">
        {sortedSections.map((section) => {
          const SectionComponent = section.component;
          const Icon = section.icon;
          return (
            <ConfigSection
              key={section.id}
              title={section.title}
              icon={<Icon className="w-4 h-4" />}
              defaultOpen={section.defaultOpen}
            >
              <SectionComponent />
            </ConfigSection>
          );
        })}
      </div>
    </div>
  );
}
