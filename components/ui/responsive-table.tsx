'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/css';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface Column {
  key: string;
  header: string;
  priority?: number; // Higher number = higher priority (shown on mobile)
  format?: (value: any) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column[];
  keyField: keyof T;
  className?: string;
  mobilePriorityCount?: number; // Number of fields to show on mobile cards (default 3)
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  className,
  mobilePriorityCount = 3,
  emptyMessage = 'No data available',
  isLoading = false,
  onRowClick,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [sortedColumns, setSortedColumns] = useState<Column[]>([]);

  useEffect(() => {
    // Sort columns by priority (highest first) for mobile view
    const sorted = [...columns].sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA;
    });
    setSortedColumns(sorted);
  }, [columns]);

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={cn("w-full py-8 text-center text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    );
  }

  // Desktop view - standard table
  if (!isMobile) {
    return (
      <div className={cn("w-full overflow-x-auto", className)}>
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.key} className={cn("text-left py-3 px-4", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr 
                key={String(item[keyField])} 
                className={cn(
                  "border-b",
                  onRowClick ? "cursor-pointer hover:bg-accent/20 transition-colors" : ""
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column) => (
                  <td key={`${String(item[keyField])}-${column.key}`} className={cn("py-3 px-4", column.className)}>
                    {column.format 
                      ? column.format(item[column.key as keyof T]) 
                      : item[column.key as keyof T] as React.ReactNode
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile view - cards
  return (
    <div className={cn("w-full space-y-4", className)}>
      {data.map((item) => (
        <Card 
          key={String(item[keyField])} 
          className={onRowClick ? "cursor-pointer hover:border-primary transition-colors" : ""}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          <CardContent className="p-4">
            {sortedColumns.slice(0, mobilePriorityCount).map((column, index) => (
              <div key={column.key} className={cn(
                "flex justify-between items-center py-1.5",
                index !== mobilePriorityCount - 1 ? "border-b" : ""
              )}>
                <span className="text-sm font-medium">{column.header}</span>
                <span className="text-sm">
                  {column.format 
                    ? column.format(item[column.key as keyof T]) 
                    : item[column.key as keyof T] as React.ReactNode
                  }
                </span>
              </div>
            ))}
            
            {/* Add "Show more" dropdown if there are more fields */}
            {columns.length > mobilePriorityCount && (
              <details className="mt-2 pt-1.5 border-t">
                <summary className="text-xs text-muted-foreground cursor-pointer py-1">
                  Show more details
                </summary>
                <div className="space-y-2 pt-2">
                  {sortedColumns.slice(mobilePriorityCount).map((column) => (
                    <div key={column.key} className="flex justify-between items-center py-0.5">
                      <span className="text-xs font-medium">{column.header}</span>
                      <span className="text-xs">
                        {column.format 
                          ? column.format(item[column.key as keyof T]) 
                          : item[column.key as keyof T] as React.ReactNode
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
