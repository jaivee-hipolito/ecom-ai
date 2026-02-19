interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return pages;
    }

    if (currentPage <= 4) {
      return [...pages.slice(0, 5), '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', ...pages.slice(totalPages - 5)];
    }

    return [
      1,
      '...',
      ...pages.slice(currentPage - 2, currentPage + 1),
      '...',
      totalPages,
    ];
  };

  return (
    <nav className="flex items-center justify-center flex-wrap gap-2 mt-6 sm:mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-xs sm:text-sm font-semibold text-[#1a1a1a] bg-[#FDE8F0] hover:bg-[#FC9BC2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FDE8F0] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer touch-manipulation min-h-[40px] min-w-[44px]"
      >
        Prev
      </button>

      <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 sm:px-3 py-2 text-gray-500 font-semibold text-xs sm:text-sm"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer touch-manipulation ${
                currentPage === page
                  ? 'bg-[#FC9BC2] text-[#1a1a1a] border border-gray-300 shadow-lg'
                  : 'border border-gray-300 text-[#1a1a1a] bg-[#FDE8F0] hover:bg-[#FC9BC2]'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-xs sm:text-sm font-semibold text-[#1a1a1a] bg-[#FDE8F0] hover:bg-[#FC9BC2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FDE8F0] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer touch-manipulation min-h-[40px] min-w-[44px]"
      >
        Next
      </button>
    </nav>
  );
}
