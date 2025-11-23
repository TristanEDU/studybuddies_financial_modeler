import { useState, useRef } from 'react';
import { FileImportUtils } from '../../utils/fileImportUtils';
import Button from './Button';

/**
 * Import Dialog Component
 * Handles file upload, preview, field mapping, and data import
 */
export function ImportDialog({ isOpen, onClose, onImport, currentCosts }) {
  const [step, setStep] = useState('upload'); // upload, preview, mapping, confirm
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [importStrategy, setImportStrategy] = useState('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    try {
      const result = await FileImportUtils.parseFile(selectedFile);
      setParseResult(result);
      setStep('preview');
    } catch (err) {
      setError(err.error || err.message || 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!parseResult?.data) return;

    // Validate data
    const validation = FileImportUtils.validateImportedData(parseResult.data);
    
    if (!validation.valid) {
      setError(`Validation errors: ${validation.errors.join(', ')}`);
      return;
    }

    // Merge with existing costs
    const mergedData = FileImportUtils.mergeImportedData(
      currentCosts,
      parseResult.data,
      importStrategy
    );

    // Pass to parent
    onImport(mergedData, {
      strategy: importStrategy,
      fileName: file.name,
      rowCount: parseResult.rowCount,
      warnings: validation.warnings
    });

    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    FileImportUtils.downloadCSVTemplate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Cost Data
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mt-4 space-x-2">
            {['upload', 'preview', 'confirm'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === s ? 'bg-blue-600 text-white' :
                  ['preview', 'confirm'].includes(step) && idx < ['upload', 'preview', 'confirm'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {['preview', 'confirm'].includes(step) && idx < ['upload', 'preview', 'confirm'].indexOf(step) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{idx + 1}</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {s}
                </span>
                {idx < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    ['preview', 'confirm'].includes(step) && idx < ['upload', 'preview', 'confirm'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-500">
                        {isProcessing ? 'Processing...' : 'Choose a file'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json,.txt"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    CSV, JSON, or TXT files up to 10MB
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Supported Formats
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                  <li><strong>CSV:</strong> Comma-separated values with headers (category, name, cost, etc.)</li>
                  <li><strong>JSON:</strong> Structured cost data matching the app format</li>
                  <li><strong>Template:</strong> Download our CSV template for the correct format</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="mt-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && parseResult && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Import Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">File:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{file?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Rows:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">{parseResult.rowCount || 'N/A'}</span>
                  </div>
                  {parseResult.headers && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Columns:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">
                        {parseResult.headers.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories Preview */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Detected Categories
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {parseResult.data.categories && Object.keys(parseResult.data.categories).length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(parseResult.data.categories).map(([key, category]) => (
                        <div key={key} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {Object.keys(category.items || {}).length} items
                            </span>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(category.items || {}).slice(0, 3).map(([itemKey, item]) => (
                              <div key={itemKey} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                  ${item.value?.toLocaleString() || 0}
                                </span>
                              </div>
                            ))}
                            {Object.keys(category.items || {}).length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                +{Object.keys(category.items).length - 3} more items...
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No categories detected. Check your file format.
                    </div>
                  )}
                </div>
              </div>

              {/* Unmapped Rows Warning */}
              {parseResult.data.unmappedRows && parseResult.data.unmappedRows.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {parseResult.data.unmappedRows.length} rows could not be mapped
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        These rows are missing required fields (category or name) and will be skipped.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm & Strategy */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Import Strategy
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'merge', label: 'Merge', desc: 'Combine with existing data, imported values take precedence' },
                    { value: 'replace', label: 'Replace All', desc: 'Replace all existing cost data with imported data' },
                    { value: 'add', label: 'Add Only', desc: 'Only add new items, keep existing values unchanged' }
                  ].map(strategy => (
                    <label key={strategy.value} className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="import-strategy"
                        value={strategy.value}
                        checked={importStrategy === strategy.value}
                        onChange={(e) => setImportStrategy(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{strategy.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{strategy.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {step === 'preview' && (
              <>
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button onClick={() => setStep('confirm')}>
                  Continue
                </Button>
              </>
            )}
            {step === 'confirm' && (
              <>
                <Button variant="outline" onClick={() => setStep('preview')}>
                  Back
                </Button>
                <Button onClick={handleImport}>
                  Import Data
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportDialog;
