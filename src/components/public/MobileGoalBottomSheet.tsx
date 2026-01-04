import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { GoalCardWithMetrics } from './GoalCardWithMetrics';

interface MobileGoalBottomSheetProps {
  goal: Goal;
  metrics: Metric[];
  colorClass: string;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 150;

export function MobileGoalBottomSheet({
  goal,
  metrics,
  colorClass,
  onClose,
}: MobileGoalBottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Handle vertical drag for dismiss
  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only track downward drag
    if (info.offset.y > 0) {
      setDragY(info.offset.y);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragY(0);
    // Dismiss if dragged down more than threshold with downward velocity
    if (info.offset.y > DISMISS_THRESHOLD && info.velocity.y > 0) {
      onClose();
    }
  };

  // Keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Focus sheet for accessibility
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.focus();
    }
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop - starts below mobile header */}
        <motion.div
          className="absolute inset-x-0 top-[25px] bottom-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <motion.div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Goal details"
          tabIndex={-1}
          className="absolute bottom-0 left-0 right-0 h-[75vh] bg-white rounded-t-2xl shadow-2xl flex flex-col outline-none"
          initial={{ y: '100%' }}
          animate={{
            y: dragY > 0 ? dragY : 0,
            transition: dragY > 0 ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }
          }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <header className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Goal Details
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="text-sm font-medium">Close</span>
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4">
            <GoalCardWithMetrics
              goal={goal}
              metrics={metrics}
              colorClass={colorClass}
            />
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-center text-xs text-gray-400">
              Swipe down to close
            </p>
          </div>
        </motion.div>

        {/* Visual feedback when dragging to dismiss */}
        {dragY > 50 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(dragY / 300, 0.3) }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
