import { useState, useCallback } from 'react';
import { API_URL } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';

export type ComplianceUploadType =
  | 'income-tax'
  | 'authenticity'
  | 'certificates'
  | 'legal-documents';

export function useComplianceUpload(type: ComplianceUploadType, entityId?: string) {
  const { token } = useAdminAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const params = new URLSearchParams({ type });
        if (entityId) params.append('entityId', entityId);
        const res = await fetch(`${API_URL}/compliance/upload?${params}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Upload failed');
        }
        return data.url;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        setError(msg);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [token, type, entityId]
  );

  return { uploadFile, uploading, error };
}
