'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiFileText, FiCheckCircle, FiXCircle, FiAlertCircle, FiFile } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';

export default function ProductImportExport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
        setError('Please select a CSV or Excel file');
        return;
      }
      setImportFile(file);
      setError('');
      setSuccessMessage('');
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError('');
    setSuccessMessage('');
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('fileType', importFile.name.split('.').pop() || 'csv');

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import products');
      }

      setSuccessMessage(
        `Import completed! ${data.success} products imported successfully, ${data.failed} failed.`
      );
      setImportResults({
        success: data.success,
        failed: data.failed,
        errors: data.errors || [],
      });
      setImportFile(null);

      // Clear file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Clear success message after 10 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setImportResults(null);
      }, 10000);
    } catch (err: any) {
      setError(err.message || 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: string) => {
    setExporting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/products/export?format=${format}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export products');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage(`Products exported successfully as ${format.toUpperCase()}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to export products');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/products/template?format=csv');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download template');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiUpload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#050b2c]">
              Import Products
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Upload a CSV or Excel file to import products in bulk. Download the template below to see the required format.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            </motion.div>
          )}

          {importResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <FiFileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-[#050b2c]">Import Results</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-green-200">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Successfully Imported</p>
                    <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-red-200">
                  <FiXCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                  </div>
                </div>
              </div>
              {importResults.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-bold text-red-700">Errors:</p>
                  </div>
                  <ul className="text-xs text-red-600 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#050b2c] mb-3">
                Select File (CSV or Excel)
              </label>
              <div className="relative">
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ffa509] file:text-white hover:file:bg-[#ff8c00] transition-all"
                />
                {importFile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 p-3 bg-gradient-to-r from-[#ffa509]/10 to-[#ff8c00]/10 rounded-lg border border-[#ffa509]/20"
                  >
                    <FiFile className="w-5 h-5 text-[#ffa509]" />
                    <p className="text-sm font-medium text-[#050b2c]">
                      Selected: <strong className="text-[#ffa509]">{importFile.name}</strong>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="border-2 border-gray-300 text-[#050b2c] hover:border-[#ffa509] transition-all font-semibold flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download Template
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                isLoading={importing}
                disabled={!importFile || importing}
                className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white border-none hover:from-[#ff8c00] hover:to-[#ffa509] shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
              >
                <FiUpload className="w-4 h-4" />
                Import Products
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
                <FiFileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-[#050b2c]">Import Format Guide</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your CSV/Excel file should have the following columns:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { field: 'Name', required: true, desc: 'Product name' },
                { field: 'Description', required: true, desc: 'Product description' },
                { field: 'Price', required: true, desc: 'Product price (number)' },
                { field: 'Category', required: true, desc: 'Category ID or Name' },
                { field: 'Stock', required: false, desc: 'Stock quantity (default: 0)' },
                { field: 'Featured', required: false, desc: 'true/false (default: false)' },
                { field: 'Images', required: false, desc: 'Comma-separated image URLs' },
                { field: 'Cover Image', required: false, desc: 'Cover image URL' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.required ? 'Required' : 'Optional'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#050b2c]">{item.field}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <FiDownload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#050b2c]">
              Export Products
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Export all products in your preferred format for backup, analysis, or migration purposes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { format: 'csv', label: 'Export as CSV', icon: FiFileText, color: 'from-blue-500 to-cyan-600', desc: 'Comma-separated values' },
              { format: 'excel', label: 'Export as Excel', icon: FiFileText, color: 'from-green-500 to-emerald-600', desc: 'Microsoft Excel format' },
              { format: 'pdf', label: 'Export as PDF', icon: FiFileText, color: 'from-red-500 to-pink-600', desc: 'Portable document format' },
            ].map((exportOption, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <Button
                  variant="primary"
                  onClick={() => handleExport(exportOption.format)}
                  isLoading={exporting}
                  disabled={exporting}
                  className={`w-full bg-gradient-to-r ${exportOption.color} text-white border-none hover:shadow-xl transition-all font-semibold flex flex-col items-center gap-2 py-6 h-auto`}
                >
                  <div className={`p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform`}>
                    <exportOption.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg">{exportOption.label}</span>
                  <span className="text-xs opacity-90">{exportOption.desc}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

