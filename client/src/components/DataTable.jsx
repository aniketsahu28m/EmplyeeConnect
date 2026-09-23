import { useMemo, useState } from 'react';
import { LuPencil, LuTrash2, LuPlus, LuSearch } from 'react-icons/lu';

const ITEMS_PER_PAGE = 10;

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onAdd,
  title,
  subtitle,
  addButtonText = 'Add New',
  isLoading = false,
  searchable = true,
  emptyMessage = 'Nothing here yet.',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const hasActions = Boolean(onEdit || onDelete);

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      columns.some((column) =>
        String(column.searchValue ? column.searchValue(item) : item[column.key] ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, columns, query]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  // Stay on a valid page when rows are deleted or filtered away.
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">
            {title}
            {!isLoading && (
              <span className="ml-2 text-base font-normal text-gray-400">{filteredData.length}</span>
            )}
          </h1>
          {subtitle && <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative flex-1 sm:flex-none">
              <LuSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter"
                className="h-8 w-full !py-1 !pl-8 sm:w-52"
                aria-label={`Filter ${title ?? 'records'}`}
              />
            </div>
          )}
          {onAdd && (
            <button onClick={onAdd} className="btn-primary">
              <LuPlus className="h-3.5 w-3.5" />
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2 text-xs font-medium text-gray-500 first:pl-4">
                    {column.label}
                  </th>
                ))}
                {hasActions && <th className="sticky right-0 bg-gray-50 px-2 py-2" aria-label="Actions" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 4 }, (_, row) => (
                  <tr key={`skeleton-${row}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-3 py-3 first:pl-4">
                        <div className="h-3 w-2/3 rounded bg-gray-100" />
                      </td>
                    ))}
                    {hasActions && <td />}
                  </tr>
                ))}

              {!isLoading &&
                currentData.map((item, index) => (
                  <tr key={startIndex + index} className="group hover:bg-gray-50">
                    {columns.map((column, i) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-3 py-2.5 first:pl-4 ${i === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="sticky right-0 whitespace-nowrap bg-white px-2 py-1.5 text-right group-hover:bg-gray-50">
                        <div className="flex justify-end opacity-60 transition-opacity group-hover:opacity-100">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <LuPencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="rounded-md p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-700"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <LuTrash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && currentData.length === 0 && (
            <p className="px-4 py-10 text-center text-[13px] text-gray-500">
              {query ? `No results for “${query}”.` : emptyMessage}
            </p>
          )}
        </div>

        {!isLoading && filteredData.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-[13px] text-gray-500">
            <span className="tabular-nums">
              {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of{' '}
              {filteredData.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(page - 1)} disabled={page === 1} className="btn-ghost h-7 px-2">
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page + 1)}
                disabled={page === totalPages}
                className="btn-ghost h-7 px-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DataTable;
