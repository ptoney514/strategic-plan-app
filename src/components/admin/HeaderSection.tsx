import { Edit2 } from 'lucide-react';
import type { Goal } from '../../lib/types';
import { HeaderEditForm } from './HeaderEditForm';

interface HeaderSectionProps {
  objective: Goal;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Goal>) => Promise<void>;
  onCancel: () => void;
}

export function HeaderSection({ objective, isEditing, onEdit, onSave, onCancel }: HeaderSectionProps) {
  if (isEditing) {
    return <HeaderEditForm objective={objective} onSave={onSave} onCancel={onCancel} />;
  }

  return (
    <div className="mb-8 relative group">
      <div className="flex items-start justify-between mb-4">
        {/* Left: Status + Title + Description */}
        <div className="flex-1">
          {/* Status Badge - Default to "On Target" if not set */}
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-white"
              style={{ backgroundColor: objective.indicator_color || '#22c55e' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {objective.indicator_text || 'On Target'}
            </span>
          </div>

          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight mb-3">
            {objective.title}
          </h1>

          {/* Description */}
          {objective.description && (
            <p className="text-[14px] text-[#6a6a6a] leading-relaxed max-w-3xl">
              {objective.description}
            </p>
          )}
        </div>

        {/* Edit Button - Visible on hover */}
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-[#fafaf8] hover:text-[#1a1a1a] hover:border-[#d4d1cb] flex-shrink-0 ml-6"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
      </div>
    </div>
  );
}
