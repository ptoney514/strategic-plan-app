import React from 'react';

export function TestTailwind() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          Tailwind CSS + Vite Configuration Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Colors Test */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Custom Theme Colors
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-md"></div>
                <span className="text-primary">Primary Color</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-md"></div>
                <span className="text-secondary-foreground">Secondary Color</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-md"></div>
                <span className="text-muted-foreground">Muted Color</span>
              </div>
            </div>
          </div>
          
          {/* Standard Tailwind Classes */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Standard Tailwind Classes
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Blue Button
              </button>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                Green Button
              </button>
              <button className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                Red Button
              </button>
            </div>
          </div>
        </div>
        
        {/* Custom Radius Test */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Custom Border Radius
          </h2>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-primary rounded-sm"></div>
            <div className="w-20 h-20 bg-primary rounded-md"></div>
            <div className="w-20 h-20 bg-primary rounded-lg"></div>
            <div className="w-20 h-20 bg-primary rounded-full"></div>
          </div>
        </div>
        
        {/* Success Message */}
        <div className="bg-green-50 border-2 border-green-400 text-green-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">✓ Configuration Successful!</h3>
          <p>Tailwind CSS 3 is working correctly with PostCSS and Vite.</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>• Custom theme colors via CSS variables</li>
            <li>• Standard Tailwind utility classes</li>
            <li>• Custom border radius values</li>
            <li>• Responsive design utilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}