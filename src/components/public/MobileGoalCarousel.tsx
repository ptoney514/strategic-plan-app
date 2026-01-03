import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { GoalCardWithMetrics } from './GoalCardWithMetrics';
import { PageIndicator } from './PageIndicator';

interface MobileGoalCarouselProps {
  goals: Goal[];
  metrics: Metric[];
  initialGoalId?: string;
  objectiveTitle: string;
  colorClass: string;
  onClose: () => void;
}

// Animation variants for card transitions
const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

// Swipe threshold configuration
const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function MobileGoalCarousel({
  goals,
  metrics,
  initialGoalId,
  objectiveTitle,
  colorClass,
  onClose,
}: MobileGoalCarouselProps) {
  // Find initial index based on initialGoalId
  const getInitialIndex = () => {
    if (!initialGoalId) return 0;
    const idx = goals.findIndex(g => g.id === initialGoalId);
    return idx >= 0 ? idx : 0;
  };

  const [[currentIndex, direction], setPage] = useState([getInitialIndex(), 0]);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [dragY, setDragY] = useState(0);

  const currentGoal = goals[currentIndex];

  // Navigate to specific index
  const paginate = useCallback((newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < goals.length) {
      setPage([newIndex, newDirection]);
      // Update URL hash for deep linking
      window.history.replaceState(null, '', `#goal-${goals[newIndex].id}`);
    }
  }, [currentIndex, goals]);

  // Jump to specific index
  const goToIndex = useCallback((index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setPage([index, newDirection]);
    window.history.replaceState(null, '', `#goal-${goals[index].id}`);
  }, [currentIndex, goals]);

  // Handle horizontal swipe
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);

    if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
      paginate(-1); // Swiped right, go to previous
    } else if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
      paginate(1); // Swiped left, go to next
    }
  };

  // Handle vertical drag for dismiss
  const handleDragY = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragYEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDraggingY(false);
    setDragY(0);

    // If dragged down more than 150px with downward velocity, dismiss
    if (info.offset.y > 150 && info.velocity.y > 0) {
      onClose();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate, onClose]);

  // Prevent body scroll when carousel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: dragY > 0 ? dragY * 0.3 : 0,
        scale: dragY > 0 ? 1 - dragY * 0.0005 : 1,
      }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center">
          <div className="text-xs text-gray-500 font-medium">
            {objectiveTitle}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Goal {currentIndex + 1} of {goals.length}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Carousel Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Drag handle indicator for vertical swipe */}
        <motion.div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-10"
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={0.2}
          onDragStart={() => setIsDraggingY(true)}
          onDrag={handleDragY}
          onDragEnd={handleDragYEnd}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing" />
        </motion.div>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 p-4 pt-6 overflow-y-auto"
          >
            <GoalCardWithMetrics
              goal={currentGoal}
              metrics={metrics}
              colorClass={colorClass}
            />
          </motion.div>
        </AnimatePresence>

        {/* Edge hints for adjacent cards */}
        {currentIndex > 0 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-gradient-to-r from-gray-200/50 to-transparent rounded-r-lg flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </div>
        )}
        {currentIndex < goals.length - 1 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-gradient-to-l from-gray-200/50 to-transparent rounded-l-lg flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </div>
        )}
      </div>

      {/* Footer with page indicator */}
      <footer className="px-4 py-4 bg-white border-t border-gray-200">
        <PageIndicator
          total={goals.length}
          current={currentIndex}
          onDotClick={goToIndex}
        />
        <p className="text-center text-xs text-gray-400 mt-2">
          Swipe left/right to navigate • Swipe down to close
        </p>
      </footer>

      {/* Dismiss overlay when dragging down */}
      {isDraggingY && dragY > 50 && (
        <motion.div
          className="absolute inset-0 bg-black/20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min(dragY / 300, 0.5) }}
        />
      )}
    </motion.div>
  );
}
