import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function LogTable({ logs, loading, page, limit }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Total Fetched</TableHead>
            <TableHead>Imported</TableHead>
            <TableHead>New</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Failed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No import logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, i) => (
              <TableRow key={log._id} className={log.failedJobs.length > 0 ? 'bg-red-50 hover:bg-red-100' : ''}>
                <TableCell className="font-medium">{(page - 1) * limit + i + 1}</TableCell>
                <TableCell className="">
                  <Link href={log.fileName} target="_blank" className="hover:underline">{log.fileName}</Link>
                </TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.totalFetched}</TableCell>
                <TableCell>{log.totalImported}</TableCell>
                <TableCell>{log.newJobs}</TableCell>
                <TableCell>{log.updatedJobs}</TableCell>
                <TableCell>
                  {log.failedJobs.length > 0 ? (
                    <details className="cursor-pointer">
                      <summary><Badge variant="destructive">{log.failedJobs.length} Failed</Badge></summary>
                      <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                        {log.failedJobs.map((fail, index) => (
                          <li key={index} className="text-red-700">
                            <strong className="font-medium">{fail.title || 'N/A'}</strong> – {fail.reason || 'No reason provided'}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Badge variant="outline">0</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
