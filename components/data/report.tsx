'use client';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Download,
  Loader2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { useReportData } from '@/hooks/use-report-data';
import { cn } from '@/lib/css';
import type { ApiQuery } from '@/types/reporting/query';
import { ReportColumn } from '@/types/reporting/report';

const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
};

// First, let's define some consistent spacing constants
const CELL_PADDING = 'px-4 py-3';
const CELL_PADDING_SORTABLE = 'pl-7 pr-4 py-3'; // Extra left padding for sortable columns
const SELECTION_COLUMN_WIDTH = 'min-w-[32px]';

function ReportHeaderCell<T>({
  col,
  onSort,
  onToggleVisibility,
  sortDirection,
}: {
  col: ReportColumn<T>;
  onSort: (desc: boolean) => void;
  onToggleVisibility: () => void;
  sortDirection: false | 'asc' | 'desc';
}) {
  if (!col.sortable) {
    return (
      <div className="py-0.5">{col.headerFn ? col.headerFn() : col.header}</div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 py-1 data-[state=open]:bg-accent"
          size="sm"
          variant="ghost"
        >
          <span>{col.headerFn ? col.headerFn() : col.header}</span>
          {sortDirection === 'desc' ? (
            <ArrowDownIcon className="ml-2 size-4" />
          ) : sortDirection === 'asc' ? (
            <ArrowUpIcon className="ml-2 size-4" />
          ) : (
            <CaretSortIcon className="ml-2 size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onSort(false)}>
          <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort(true)}>
          <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onToggleVisibility}>
          <EyeNoneIcon className="mr-2 size-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type ReportProps<T, I> = {
  cacheKey?: string;
  className?: string;
  columns: Array<ReportColumn<T>>;
  enableRowSelection?: boolean;
  initialData?: Array<T>;
  initialQuery?: ApiQuery<T, I>;
  model: string;
  onSelectedRowsChange?: (selectedRows: Record<string, T>) => void;
  searchField?: keyof T & string;
  searchPlaceholder?: string;
  selectedRows?: Record<string, T>;
  showColumnToggle?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
  totalCount?: number;
};

export function Report<T, I>({
  cacheKey,
  model,
  columns: initialColumns,
  initialQuery,
  initialData,
  searchField,
  searchPlaceholder = 'Search...',
  selectedRows,
  showColumnToggle = false,
  showExport = false,
  showPagination = true,
  showSearch = true,
  showSelectedCount = false,
  totalCount: initialTotalCount = 0,
  enableRowSelection = false,
  className,
  onSelectedRowsChange,
}: ReportProps<T, I>) {
  const {
    data,
    loading,
    error,
    query,
    updateQuery,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    totalCount: reportTotalCount,
  } = useReportData<T, I>({
    cacheKey,
    initialData,
    initialQuery,
    model,
    initialTotalCount,
  });
  const totalCount =
    reportTotalCount === 0 ? initialTotalCount : reportTotalCount;

  // Use debounced search value
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Update filters when debounced search value changes
  useEffect(() => {
    if (searchField && debouncedSearchValue) {
      updateQuery({
        ...query,
        filters: debouncedSearchValue
          ? [
              {
                field: searchField,
                operator: 'contains',
                value: debouncedSearchValue,
              },
              ...(query.filters ?? []),
            ]
          : [],
        pagination: {
          ...query.pagination,
          start: 0, // Reset to first page when searching
        },
      });
    }
  }, [debouncedSearchValue, searchField, updateQuery]);

  // Maintain local column visibility state.
  const [columns, setColumns] = useState<ReportColumn<T>[]>(initialColumns);

  // Helper to get a unique row id.
  const getRowId = (row: T, idx: number): string =>
    (row as any).id ?? String(idx);

  // Internal state to track row selections
  const [rowSelection, setRowSelection] = useState<Record<string, T>>(
    selectedRows ?? {},
  );

  // *** Synchronize internal row selection with the external prop ***
  useEffect(() => {
    setRowSelection(selectedRows ?? {});
  }, [selectedRows]);

  // When row selection changes, call onSelectedRowsChange with the selected rows
  useEffect(() => {
    if (!onSelectedRowsChange) return;

    onSelectedRowsChange(rowSelection);
  }, [rowSelection, onSelectedRowsChange]);

  // if (error) {
  //   console.error('error', error);
  // }
  // Determine visible columns.
  const visibleColumns = columns.filter(col => col.visible !== false);

  // Update the handleSort function to properly handle direction changes
  const handleSort = (col: ReportColumn<T>, desc?: boolean) => {
    if (!col.sortable || !col.key) return;
    let newDirection: 'asc' | 'desc';
    if (typeof desc === 'boolean') {
      newDirection = desc ? 'desc' : 'asc';
    } else {
      const currentDirection = query.sort?.[0]?.direction;
      const currentField = query.sort?.[0]?.field;
      newDirection =
        currentField === col.key
          ? currentDirection === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc';
    }
    updateQuery({
      ...query,
      pagination: {
        ...query.pagination,
        start: 0, // Reset to first page when sorting changes
      },
      sort: [{ direction: newDirection, field: col.key }],
    });
  };
  const [paginatedData, setPaginatedData] = useState<Array<T>>(
    initialData ?? [],
  );

  // Helper to get current sort direction for a column
  const getColumnSort = (col: ReportColumn<T>): false | 'asc' | 'desc' => {
    if (!query.sort?.[0] || query.sort[0].field !== col.key) return false;
    return query.sort[0].direction;
  };

  // Pagination: assume query.pagination exists with start and count.

  // Update toggle all function to store full row objects
  const toggleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, T> = {};
    if (checked) {
      paginatedData.forEach((row, idx) => {
        newSelection[getRowId(row, idx)] = row;
      });
    }
    setRowSelection(newSelection);
  };

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) => !!rowSelection[getRowId(row, idx)]);
  const someSelected =
    paginatedData.some((row, idx) => !!rowSelection[getRowId(row, idx)]) &&
    !allSelected;

  const showPaginationControls =
    showPagination &&
    ((!loading && (totalCount ?? initialTotalCount > 0)) ||
      (loading && data?.length));

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [query.pagination?.start]);

  // Calculate current page and total pages
  const currentPage =
    Math.floor(
      (query.pagination?.start ?? 0) / (query.pagination?.count ?? 10),
    ) + 1;
  const totalPages = Math.ceil(
    (totalCount ?? initialTotalCount) / (query.pagination?.count ?? 10),
  );

  // Update pagination controls to preserve filters
  const goToFirstPage = () => {
    updateQuery({
      ...query, // Preserve existing query params including filters
      pagination: { ...query.pagination, start: 0 },
    });
  };

  const goToLastPage = () => {
    const lastPageStart = Math.max(
      0,
      Math.floor(
        (totalCount ?? initialTotalCount) / (query.pagination?.count ?? 10),
      ) * (query.pagination?.count ?? 10),
    );
    updateQuery({
      ...query, // Preserve existing query params including filters
      pagination: { ...query.pagination, start: lastPageStart },
    });
  };

  // Update the rows per page handler
  const handleRowsPerPageChange = (value: string) => {
    updateQuery({
      ...query, // Preserve existing query params including filters
      pagination: {
        ...query.pagination,
        count: Number(value),
        start: 0,
      },
    });
  };

  // useEffect(() => {
  //   setColumns(initialColumns);
  // }, [initialColumns]);

  useEffect(() => {
    // setColumns(initialColumns);
    setColumns(initialColumns);
    setPaginatedData(data ?? initialData ?? []);
  }, [data, initialColumns, initialData]);

  return (
    <div className="flex grow flex-col" ref={tableContainerRef}>
      {/* Controls */}
      {(showColumnToggle || showExport || showSearch) && (
        <div className="flex items-center justify-between space-x-2 pb-2 md:space-x-4">
          {showSearch && searchField && (
            <Input
              className="w-56 max-w-sm"
              onChange={e => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              type="search"
              value={searchValue}
            />
          )}
          <div className="flex items-center space-x-3">
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="ml-auto w-10 text-foreground/70"
                    variant="outline"
                  >
                    <Columns className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {columns
                    .filter(col => col.hideable ?? true)
                    .map((col, idx) => (
                      <DropdownMenuCheckboxItem
                        checked={col.visible !== false}
                        className="capitalize"
                        key={idx}
                        onCheckedChange={value =>
                          setColumns(prev =>
                            prev.map((c, i) =>
                              i === idx ? { ...c, visible: value } : c,
                            ),
                          )
                        }
                      >
                        {col.header || (col.headerFn && col.headerFn())}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showExport && (
              <Button className="ml-4" variant="secondary">
                <Download className="mr-2 size-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          'relative overflow-auto rounded-t-md border bg-background',
          !showPaginationControls ? 'rounded-b-md' : '',
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {enableRowSelection && (
                <TableHead
                  className={cn(
                    SELECTION_COLUMN_WIDTH,
                    // CELL_PADDING,
                    'flex grow items-center pl-0',
                  )}
                >
                  <Checkbox
                    aria-label="Select all"
                    checked={allSelected}
                    className="translate-y-[4px]"
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              {visibleColumns.map((col, idx) => (
                <TableHead
                  className={cn(
                    CELL_PADDING,
                    getAlignmentClass(col.align),
                    col.className,
                  )}
                  key={idx}
                  style={{ maxWidth: col.maxWidth, minWidth: col.minWidth }}
                >
                  <ReportHeaderCell
                    col={col}
                    onSort={(desc: boolean) => handleSort(col, desc)}
                    onToggleVisibility={() => {
                      setColumns(prev =>
                        prev.map((c, i) =>
                          i === idx ? { ...c, visible: false } : c,
                        ),
                      );
                    }}
                    sortDirection={getColumnSort(col)}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row, rowIndex) => {
                return (
                  <TableRow key={getRowId(row, rowIndex)}>
                    {enableRowSelection && (
                      <TableCell
                        className={cn(
                          SELECTION_COLUMN_WIDTH,
                          CELL_PADDING,
                          'flex items-center',
                        )}
                      >
                        <Checkbox
                          aria-label="Select row"
                          checked={!!rowSelection[getRowId(row, rowIndex)]}
                          className="translate-y-[2px]"
                          onCheckedChange={checked =>
                            setRowSelection(prev => {
                              const newSelection = { ...prev };
                              if (checked) {
                                newSelection[getRowId(row, rowIndex)] = row;
                              } else {
                                delete newSelection[getRowId(row, rowIndex)];
                              }
                              return newSelection;
                            })
                          }
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col, colIndex) => (
                      <TableCell
                        className={cn(
                          col.sortable ? CELL_PADDING_SORTABLE : CELL_PADDING,
                          getAlignmentClass(col.align),
                          col.className,
                        )}
                        key={colIndex}
                        style={{
                          maxWidth: col.maxWidth,
                          minWidth: col.minWidth,
                        }}
                      >
                        {col.cellFn
                          ? col.cellFn(row)
                          : col.key
                            ? (row[col.key] as React.ReactNode)
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : loading ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={(enableRowSelection ? 1 : 0) + visibleColumns.length}
                />
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={(enableRowSelection ? 1 : 0) + visibleColumns.length}
                >
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No results.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/50 pt-12">
            <Loader2 className="size-4 animate-spin text-muted-foreground/70" />
            <span className="text-sm text-muted-foreground/70">Loading...</span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {showPaginationControls ? (
        <div className="rounded-b-md border border-border bg-accent px-1 py-3">
          <div className="flex items-center justify-between gap-4 px-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs">Rows:</span>
              <Select
                disabled={loading}
                onValueChange={handleRowsPerPageChange}
                value={String(query.pagination?.count ?? 10)}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={String(query.pagination?.count ?? 10)}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map(pageSize => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-xs font-medium md:w-[100px] md:text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="hidden size-8 lg:flex"
                disabled={loading || !canPreviousPage}
                onClick={goToFirstPage}
                type="button"
                variant="outline"
              >
                <ChevronsLeft className="size-4" />
              </Button>

              <Button
                className="size-8"
                disabled={loading || !canPreviousPage}
                onClick={previousPage}
                type="button"
                variant="outline"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                className="size-8"
                disabled={loading || !canNextPage}
                onClick={nextPage}
                type="button"
                variant="outline"
              >
                <ChevronRight className="size-4" />
              </Button>

              <Button
                className="hidden size-8 lg:flex"
                disabled={loading || !canNextPage}
                onClick={goToLastPage}
                type="button"
                variant="outline"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading/Error Overlays */}
      {/* {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100">
          <p className="text-sm text-red-700">Error: {error.message}</p>
        </div>
      )} */}
    </div>
  );
}
