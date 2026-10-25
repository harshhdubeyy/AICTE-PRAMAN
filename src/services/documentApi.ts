
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface BackendDocument {
  id: string;
  filename: string;
  review: string;
  flag: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getDocuments() {
  return apiRequest<BackendDocument[]>('/documents');
}

export function uploadPdf(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<BackendDocument>('/documents', {
    method: 'POST',
    body: formData,
  });
}

export async function downloadDocumentReport(id: string) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${encodeURIComponent(id)}/report`
  );

  if (!response.ok) {
    throw new Error('Could not generate the PDF report.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `AICTE_Report_${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
