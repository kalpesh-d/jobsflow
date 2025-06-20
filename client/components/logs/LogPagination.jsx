import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function LogPagination({
  page,
  totalPages,
  setPage,
  loading
}) {
  return (
    <div className="flex justify-between items-center mt-6">
      <Button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1 || loading}
        variant="outline"
      >
        <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
      </Button>
      <span className="text-gray-600 text-sm">
        Page {page} of {totalPages}
      </span>
      <Button
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages || loading}
        variant="outline"
      >
        Next <ChevronRightIcon className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
