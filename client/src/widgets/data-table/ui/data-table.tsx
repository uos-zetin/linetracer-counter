import { useState } from "react";
import { cn } from "@/shared/lib";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Card } from "@/shared/ui";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T, value: unknown) => React.ReactNode;
  mobileRender?: (item: T) => React.ReactNode;
  className?: string;
  width?: string; // 예: "150px", "20%", "auto"
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  mobileCardView?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  pageSize?: number;
  fixedLayout?: boolean; // 고정 테이블 레이아웃 사용 여부
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  mobileCardView = true,
  onRowClick,
  className = "",
  pageSize = 10,
  fixedLayout = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 정렬 처리
  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // 정렬된 데이터
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle number and string comparison, fallback to string
    if (typeof aValue === "number" && typeof bValue === "number") {
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // Fallback: compare as strings
    const aStr = aValue?.toString() ?? "";
    const bStr = bValue?.toString() ?? "";
    if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // 페이지네이션 처리
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  // 로딩 상태
  if (loading) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // 빈 데이터
  if (data.length === 0) {
    return <div className={cn("p-8 text-center text-muted-foreground", className)}>{emptyMessage}</div>;
  }

  // 모바일 카드 뷰
  const MobileCardView = () => (
    <div className="space-y-4">
      {paginatedData.map((item, index) => (
        <Card
          key={index}
          className={cn("p-4 cursor-pointer hover:shadow-md transition-shadow", onRowClick && "cursor-pointer")}
          onClick={() => onRowClick?.(item)}
        >
          <div className="space-y-2">
            {columns.map((column) => {
              const value = item[column.key];
              const content = column.mobileRender
                ? column.mobileRender(item)
                : column.render
                  ? column.render(item, value)
                  : value?.toString() || "-";

              return (
                <div key={column.key.toString()} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1">{column.label}:</span>
                  <span className="text-sm ml-2 flex-1 text-right">{content}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );

  // 데스크톱 테이블 뷰
  const DesktopTableView = () => (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className={fixedLayout ? "table-fixed" : ""}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={cn(column.sortable && "cursor-pointer hover:bg-muted/50", column.className)}
                  onClick={() => handleSort(column.key.toString(), column.sortable)}
                  style={column.width ? { width: column.width } : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            "text-xs",
                            sortColumn === column.key && sortDirection === "asc"
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          ↑
                        </span>
                        <span
                          className={cn(
                            "text-xs -mt-1",
                            sortColumn === column.key && sortDirection === "desc"
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          ↓
                        </span>
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow
                key={index}
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => {
                  const value = item[column.key];
                  const content = column.render ? column.render(item, value) : value?.toString() || "-";

                  return (
                    <TableCell key={column.key.toString()} className={column.className}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // 페이지네이션
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length}{" "}
          results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
            .map((page, index, array) => {
              const showEllipsis = index > 0 && array[index - 1] !== page - 1;
              return (
                <div key={page} className="flex items-center">
                  {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </div>
              );
            })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* 모바일: 카드 뷰, 데스크톱: 테이블 뷰 */}
      {mobileCardView ? (
        <>
          <div className="block md:hidden">
            <MobileCardView />
          </div>
          <div className="hidden md:block">
            <DesktopTableView />
          </div>
        </>
      ) : (
        <DesktopTableView />
      )}

      {/* 페이지네이션 */}
      <Pagination />
    </div>
  );
}
