import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useWidgets, useCreateWidget, useUpdateWidget, useDeleteWidget } from '../../../hooks/v2/useWidgets';
import { WidgetGrid } from '../../../components/v2/widgets/WidgetGrid';
import { WidgetCatalog } from '../../../components/v2/widgets/WidgetCatalog';
import { WidgetConfigPanel } from '../../../components/v2/widgets/WidgetConfigPanel';
import { Button } from '../../../components/ui/Button';
import type { Widget, WidgetType, CreateWidgetPayload, UpdateWidgetPayload } from '../../../lib/types/v2';

type PageState = 'grid' | 'catalog' | 'config' | 'edit';

export function V2WidgetBuilder() {
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: widgets, isLoading } = useWidgets(slug || '');
  const createWidget = useCreateWidget(slug || '');
  const updateWidget = useUpdateWidget(slug || '');
  const deleteWidget = useDeleteWidget(slug || '');

  const [pageState, setPageState] = useState<PageState>('grid');
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  function handleSelectType(type: WidgetType) {
    setSelectedType(type);
    setPageState('config');
  }

  function handleEdit(widget: Widget) {
    setSelectedWidget(widget);
    setSelectedType(widget.type);
    setPageState('edit');
  }

  async function handleDelete(widget: Widget) {
    await deleteWidget.mutateAsync(widget.id);
  }

  async function handleSave(data: CreateWidgetPayload | UpdateWidgetPayload) {
    if (pageState === 'edit' && selectedWidget) {
      await updateWidget.mutateAsync({ id: selectedWidget.id, data: data as UpdateWidgetPayload });
    } else {
      await createWidget.mutateAsync(data as CreateWidgetPayload);
    }
    setPageState('grid');
    setSelectedType(null);
    setSelectedWidget(null);
  }

  function handleCancel() {
    setPageState('grid');
    setSelectedType(null);
    setSelectedWidget(null);
  }

  if (!district) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            Widget Builder
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--editorial-text-secondary)' }}
          >
            Create and manage dashboard widgets for your strategic plan.
          </p>
        </div>
        {pageState === 'grid' && (
          <Button onClick={() => setPageState('catalog')} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Widget
          </Button>
        )}
      </div>

      {/* Content based on state */}
      {pageState === 'grid' && (
        <WidgetGrid
          widgets={widgets ?? []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {pageState === 'catalog' && (
        <WidgetCatalog onSelect={handleSelectType} onClose={handleCancel} />
      )}

      {(pageState === 'config' || pageState === 'edit') && selectedType && (
        <WidgetConfigPanel
          type={selectedType}
          initialData={pageState === 'edit' ? (selectedWidget ?? undefined) : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
