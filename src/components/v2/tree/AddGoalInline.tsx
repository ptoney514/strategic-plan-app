import { useState, useRef, useEffect } from 'react';
import { useCreateGoal } from '../../../hooks/v2/useGoals';

interface AddGoalInlineProps {
  planId: string;
  districtId: string;
  parentId: string | null;
  level: 0 | 1 | 2 | 3;
  onCancel: () => void;
}

export function AddGoalInline({ planId, districtId, parentId, level, onCancel }: AddGoalInlineProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createGoal = useCreateGoal(planId);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) return;

    await createGoal.mutateAsync({
      title: trimmed,
      plan_id: planId,
      district_id: districtId,
      parent_id: parentId,
      level,
    });

    setTitle('');
    onCancel();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }

  const levelLabels: Record<number, string> = {
    0: 'objective',
    1: 'goal',
    2: 'strategy',
  };

  return (
    <div className="flex items-center gap-2 py-2 px-3">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        placeholder={`New ${levelLabels[level] || 'goal'} title...`}
        disabled={createGoal.isPending}
        className="flex-1 px-3 py-1.5 rounded-md text-sm outline-hidden"
        style={{
          backgroundColor: 'var(--editorial-bg)',
          border: '1px solid var(--editorial-border)',
          color: 'var(--editorial-text-primary)',
        }}
      />
      {createGoal.isPending && (
        <div
          className="animate-spin rounded-full h-4 w-4 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      )}
    </div>
  );
}
