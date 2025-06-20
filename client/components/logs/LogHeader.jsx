import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LogHeader({
  loading,
  importMessage,
  handleTriggerImport,
}) {
  return (
    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <CardTitle className="text-3xl font-extrabold text-gray-800 mb-2">📊 Import History Logs</CardTitle>
        <CardDescription className="text-gray-600">Overview of all job import activities, including status and details.</CardDescription>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleTriggerImport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </span>
          ) : (
            'Trigger Manual Import'
          )}
        </Button>
      </div>
    </CardHeader>
  );
}
