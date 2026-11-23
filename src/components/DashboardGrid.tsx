import React, { useState, useEffect, useRef } from 'react';
import { ReactGridLayout } from 'react-grid-layout/legacy';
import type { Layout, LayoutItem } from 'react-grid-layout/legacy';
import { GripHorizontal } from 'lucide-react';

interface DashboardGridProps {
  layout: LayoutItem[];
  onLayoutChange: (newLayout: LayoutItem[]) => void;
  childrenMap: Record<string, React.ReactNode>;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout,
  onLayoutChange,
  childrenMap
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(() => updateWidth());
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <ReactGridLayout
        className="layout"
        layout={layout as unknown as Layout}
        cols={12}
        rowHeight={60}
        width={containerWidth}
        margin={[16, 16]}
        draggableHandle=".drag-handle"
        onLayoutChange={(newLayout) => {
          onLayoutChange(Array.from(newLayout));
        }}
        isResizable={true}
        isDraggable={true}
      >
        {layout.map(item => {
          const content = childrenMap[item.i];
          if (!content) return null;

          return (
            <div
              key={item.i}
              className="relative group transition-shadow rounded-xl"
              data-grid={item}
            >
              {/* Drag Handle Top Bar */}
              <div
                className="drag-handle absolute top-2 right-2 z-20 p-1 rounded-md text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100"
                title="Drag to rearrange widget"
              >
                <GripHorizontal className="w-4 h-4" />
              </div>

              <div className="w-full h-full">
                {content}
              </div>
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};
