import React from 'react';
import { visualizationOptions, type VisualizationType } from '../lib/metric-visualizations';
import { Check } from 'lucide-react';

interface MetricTypeSelectorProps {
  selectedType?: VisualizationType;
  onSelect: (type: VisualizationType) => void;
}

export function MetricTypeSelector({ selectedType, onSelect }: MetricTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Visualization Type</h3>
        <p className="text-sm text-muted-foreground">
          Select how you want to display your metric data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visualizationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;
          const isReady = option.status === 'ready';
          const isComingSoon = option.status === 'coming-soon';

          return (
            <div
              key={option.id}
              className={`
                relative cursor-pointer transition-all hover:shadow-lg
                border-2 rounded-lg
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isComingSoon
                  ? 'border-border hover:border-gray-300 opacity-60'
                  : 'border-border hover:border-gray-300'}
              `}
              onClick={() => onSelect(option.id)}
            >
              {/* Status Badge */}
              {isReady && !isSelected && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded">
                  Ready
                </div>
              )}
              {isComingSoon && !isSelected && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded">
                  Soon
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-blue-100' : 'bg-muted'}
                `}>
                  <Icon className={`
                    w-6 h-6
                    ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}
                  `} />
                </div>

                {/* Name */}
                <h4 className={`
                  font-medium text-sm
                  ${isSelected ? 'text-blue-900' : 'text-foreground'}
                `}>
                  {option.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {option.description}
                </p>

                {/* Visual Preview */}
                <div className="pt-2 border-t border-border">
                  {isReady ? (
                    <div className="h-16 rounded overflow-hidden bg-white border border-border">
                      <img
                        src={option.preview}
                        alt={`${option.name} preview`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-16 bg-gradient-to-br from-muted/50 to-muted rounded flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
