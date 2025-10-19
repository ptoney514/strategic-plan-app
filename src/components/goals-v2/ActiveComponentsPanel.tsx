import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ComponentToggle {
  id: string;
  label: string;
  sublabel?: string;
  enabled: boolean;
}

interface ActiveComponentsPanelProps {
  components: ComponentToggle[];
  onToggle: (id: string) => void;
}

export function ActiveComponentsPanel({ components, onToggle }: ActiveComponentsPanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Active Components</h3>
        <Eye className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mb-6">Toggle components on/off</p>

      <div className="space-y-3">
        {components.map((component) => (
          <div
            key={component.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    component.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm font-medium text-gray-900">
                  {component.label}
                </span>
              </div>
              {component.sublabel && (
                <p className="text-xs text-gray-500 mt-1 ml-4">
                  {component.sublabel}
                </p>
              )}
            </div>

            <button
              onClick={() => onToggle(component.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                component.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  component.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
