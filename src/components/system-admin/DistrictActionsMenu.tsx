import { useEffect, useRef } from 'react';
import { Eye, Settings, Edit2, Trash2, Target } from 'lucide-react';
import type { District } from '../../lib/types';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';

interface DistrictActionsMenuProps {
  district: District;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * DistrictActionsMenu - Dropdown menu for district actions
 * Provides quick access to View Public, Admin Panel, Edit, and Delete actions
 */
export function DistrictActionsMenu({
  district,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: DistrictActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleViewPublic = () => {
    const publicUrl = buildSubdomainUrlWithPath('district', '', district.slug);
    window.open(publicUrl, '_blank');
    onClose();
  };

  const handleManageObjectives = () => {
    const objectivesUrl = buildSubdomainUrlWithPath('district', '/admin/objectives', district.slug);
    window.location.href = objectivesUrl;
  };

  const handleGoToAdmin = () => {
    const adminUrl = buildSubdomainUrlWithPath('district', '/admin', district.slug);
    window.location.href = adminUrl;
  };

  const handleEdit = () => {
    onEdit();
  };

  const handleDelete = () => {
    onDelete();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="District actions"
      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#e8e6e1] py-1.5 z-50"
    >
      <button
        role="menuitem"
        onClick={handleViewPublic}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
      >
        <Eye className="h-4 w-4" />
        <span>View Public Site</span>
      </button>

      <button
        role="menuitem"
        onClick={handleManageObjectives}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
      >
        <Target className="h-4 w-4" />
        <span>Manage Objectives</span>
      </button>

      <button
        role="menuitem"
        onClick={handleGoToAdmin}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span>District Admin</span>
      </button>

      <button
        role="menuitem"
        onClick={handleEdit}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#f5f3ef] transition-colors"
      >
        <Edit2 className="h-4 w-4" />
        <span>Edit District</span>
      </button>

      <div className="my-1.5 border-t border-[#e8e6e1]" role="separator" />

      <button
        role="menuitem"
        onClick={handleDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#c03537] hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete District</span>
      </button>
    </div>
  );
}
