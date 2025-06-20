"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { LogHeader } from '@/components/logs/LogHeader';
import { LogTable } from '@/components/logs/LogTable';
import { LogPagination } from '@/components/logs/LogPagination';
import { Loader2 } from "lucide-react";

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs?page=${page}&limit=${limit}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerImport = async () => {
    setLoading(true);
    setImportMessage('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trigger-import`);
      setImportMessage(res.data.message);
      fetchLogs(); // Refresh logs after triggering import
    } catch (err) {
      console.error('Failed to trigger import:', err);
      setImportMessage('Failed to trigger job import. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]); // Re-fetch logs when page or filter changes

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="w-full">
        <LogHeader
          loading={loading}
          importMessage={importMessage}
          handleTriggerImport={handleTriggerImport}
        />
        <CardContent>
          {importMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{importMessage}</span>
            </div>
          )}

          {loading && !importMessage && (
            <div className="flex items-center justify-center mb-4 text-blue-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading logs...
            </div>
          )}

          <LogTable logs={logs} loading={loading} page={page} limit={limit} />

          <LogPagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            loading={loading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
