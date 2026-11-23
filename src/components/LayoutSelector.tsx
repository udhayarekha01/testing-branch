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
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs">
        <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>View:</span>
        <select
          value={activeLayoutName}
          onChange={e => onSelectLayout(e.target.value)}
          className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
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
          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={onResetToDefault}
        title="Reset to default arrangement"
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
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
            className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-36"
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
            className="text-xs px-2 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsSaving(true)}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <Save className="w-3 h-3" />
          <span>Save Current View</span>
        </button>
      )}
    </div>
  );
};
