import { useEffect, useRef } from 'react';
import { X, Target } from 'lucide-react';

interface SlideoverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

/**
 * SlideoverPanel - A slide-in panel from the right side
 * Used for focused editing tasks like goal editing
 */
export function SlideoverPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  width = 'lg',
}: SlideoverPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap - focus the panel when it opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slideover-title"
        className={`fixed inset-y-0 right-0 z-50 w-full ${widthClasses[width]} bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#e8e6e1]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              {icon || (
                <div className="w-10 h-10 flex items-center justify-center bg-[#d1fae5] rounded-lg">
                  <Target className="h-5 w-5 text-[#10b981]" />
                </div>
              )}
              <div>
                <h2
                  id="slideover-title"
                  className="text-[18px] font-bold text-[#1a1a1a]"
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[13px] text-[#6a6a6a]">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8a8a8a] hover:bg-[#f5f3ef] hover:text-[#4a4a4a] transition-colors"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
