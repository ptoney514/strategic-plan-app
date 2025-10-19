import React, { useState } from 'react';
import { Image as ImageIcon, Palette, Upload } from 'lucide-react';
import { DEFAULT_OBJECTIVE_IMAGES } from '../../lib/default-images';
import type { Goal } from '../../lib/types';

interface StrategicObjectiveEditorProps {
  objective: Goal;
  isEditing: boolean;
  onUpdate: (updates: Partial<Goal>) => void;
}

const DEFAULT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];

export function StrategicObjectiveEditor({ objective, isEditing, onUpdate }: StrategicObjectiveEditorProps) {
  const [headerMode, setHeaderMode] = useState<'color' | 'image'>(
    objective.image_url ? 'image' : 'color'
  );
  const [selectedColor, setSelectedColor] = useState(objective.header_color || '#3B82F6');
  const [selectedImage, setSelectedImage] = useState(objective.image_url || '');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onUpdate({ header_color: color, image_url: null });
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onUpdate({ image_url: imageUrl, header_color: null });
  };

  if (!isEditing) {
    // Display mode - show the header visual
    return (
      <div className="relative h-64 -mx-8 -mt-8 mb-6 rounded-t-lg overflow-hidden">
        {objective.image_url ? (
          <img
            src={objective.image_url}
            alt={objective.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${objective.header_color || '#3B82F6'} 0%, ${adjustBrightness(objective.header_color || '#3B82F6', -20)} 100%)`
            }}
          />
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>
    );
  }

  // Editing mode
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Header Style
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setHeaderMode('color');
              onUpdate({ header_color: selectedColor, image_url: null });
            }}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              headerMode === 'color'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <Palette className="w-4 h-4" />
            Color
          </button>
          <button
            onClick={() => {
              setHeaderMode('image');
              if (selectedImage) {
                onUpdate({ image_url: selectedImage, header_color: null });
              }
            }}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              headerMode === 'image'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
        </div>
      </div>

      {headerMode === 'color' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={`h-12 rounded-lg border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${color.value} 0%, ${adjustBrightness(color.value, -20)} 100%)`
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {headerMode === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Header Image
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_OBJECTIVE_IMAGES.map((image) => (
              <button
                key={image.id}
                onClick={() => handleImageSelect(image.url)}
                className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === image.url
                    ? 'border-blue-600 ring-2 ring-offset-2 ring-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-white text-xs font-medium">{image.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="relative h-32 rounded-lg overflow-hidden">
          {headerMode === 'image' && selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${selectedColor} 0%, ${adjustBrightness(selectedColor, -20)} 100%)`
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Helper function to adjust brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
