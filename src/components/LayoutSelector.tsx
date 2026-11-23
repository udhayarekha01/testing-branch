import React, { useState } from 'react';
import type { LayoutItem } from 'react-grid-layout/legacy';
import { LayoutGrid, Save, Trash2, RotateCcw, Plus } from 'lucide-react';

interface LayoutSelectorProps {
  activeLayoutName: string;
  savedLayouts: Record<string, LayoutItem[]>;
  currentLayout: LayoutItem[];
  onSelectLayout: (name: string) => void;
  onSaveLayout: (name: string, layout: LayoutItem[]) => boolean;
  onDeleteLayout: (name: string) => boolean;
  onResetToDefault: () => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  activeLayoutName,
  savedLayouts,
  currentLayout,
  onSelectLayout,
  onSaveLayout,
  onDeleteLayout,
  onResetToDefault
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayoutName.trim()) return;
    const ok = onSaveLayout(newLayoutName.trim(), currentLayout);
    if (ok) {
      setNewLayoutName('');
      setIsSaving(false);
    }
  };

  const layoutNames = Object.keys(savedLayouts);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
        <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
        <span>View:</span>
        <select
          value={activeLayoutName}
          onChange={e => onSelectLayout(e.target.value)}
          className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
        >
          {layoutNames.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {activeLayoutName !== 'Default' && (
        <button
          onClick={() => onDeleteLayout(activeLayoutName)}
          title="Delete current saved layout"
          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={onResetToDefault}
        title="Reset to default arrangement"
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 text-slate-500" />
        <span>Default</span>
      </button>

      {isSaving ? (
        <form onSubmit={handleSave} className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Layout name..."
            value={newLayoutName}
            onChange={e => setNewLayoutName(e.target.value)}
            autoFocus
            className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-slate-800 w-36"
          />
          <button
            type="submit"
            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSaving(false);
              setNewLayoutName('');
            }}
            className="text-xs px-2 py-1.5 text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsSaving(true)}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <Save className="w-3 h-3" />
          <span>Save Current View</span>
        </button>
      )}
    </div>
  );
};
