interface PageIndicatorProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

export function PageIndicator({ total, current, onDotClick }: PageIndicatorProps) {
  // Limit dots displayed for better UX (max 8, then show condensed)
  const maxDots = 8;
  const showCondensed = total > maxDots;

  if (showCondensed) {
    // Show: first, ..., current-1, current, current+1, ..., last
    return (
      <div className="flex items-center justify-center gap-1.5">
        {/* First dot */}
        <button
          onClick={() => onDotClick?.(0)}
          className={`w-2 h-2 rounded-full transition-all ${
            current === 0 ? 'bg-district-red scale-125' : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to card 1`}
        />

        {current > 2 && <span className="text-gray-400 text-xs px-1">...</span>}

        {/* Show dots around current */}
        {Array.from({ length: total }, (_, i) => i)
          .filter(i => i !== 0 && i !== total - 1 && Math.abs(i - current) <= 1)
          .map(i => (
            <button
              key={i}
              onClick={() => onDotClick?.(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-district-red scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}

        {current < total - 3 && <span className="text-gray-400 text-xs px-1">...</span>}

        {/* Last dot */}
        {total > 1 && (
          <button
            onClick={() => onDotClick?.(total - 1)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === total - 1 ? 'bg-district-red scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to card ${total}`}
          />
        )}
      </div>
    );
  }

  // Standard dot display for 8 or fewer items
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick?.(i)}
          className={`rounded-full transition-all ${
            i === current
              ? 'w-2.5 h-2.5 bg-district-red'
              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to card ${i + 1}`}
        />
      ))}
    </div>
  );
}
