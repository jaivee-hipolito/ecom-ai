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
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-[#050b2c] bg-white hover:bg-[#ffa509] hover:text-white hover:border-[#ffa509] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#050b2c] transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Previous
      </button>

      {getVisiblePages().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500 font-semibold"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${
              currentPage === page
                ? 'bg-[#ffa509] text-white border-2 border-[#ffa509] shadow-lg'
                : 'border-2 border-gray-200 text-[#050b2c] bg-white hover:bg-[#ffa509] hover:text-white hover:border-[#ffa509]'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-[#050b2c] bg-white hover:bg-[#ffa509] hover:text-white hover:border-[#ffa509] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#050b2c] transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Next
      </button>
    </div>
  );
}
