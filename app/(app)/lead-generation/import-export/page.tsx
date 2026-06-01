import { Metadata } from 'next';
import ImportExportClient from './client';

export const metadata: Metadata = {
  title: 'Import & Export | Lead Generation | AgencyBase',
  description: 'Import leads from CSV files or export your lead data in various formats.',
};

export default function ImportExportPage() {
  return <ImportExportClient />;
}