import { useEffect, useState } from 'react';
import { Download, File, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { downloadAsset } from '@/lib/helpers/assets.helper';
import { getErrorMsg } from '@/lib/helpers/response.helper';
import {
  useIsMutatingPricing,
  usePricingExportMutation,
  usePricingImportMutation,
} from '@/lib/queries/pricings.queries';
import { cn, isPro } from '@/lib/utils';
import { AttachmentDropzone, AttachmentDropzoneError } from '@/components/ui/attachment';
import { Button, LoadingButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UpgradeToProBadge } from '@/components/ui/custom/upgrate-to-pro';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';

export default function ImportExportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setError] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [importProgress, setProgress] = useState(0);
  const [importLogs, setLogs] = useState<{ success: number; failed: string[] } | null>(null);

  const { mutateAsync: exportPricing, isPending: isExportPending } = usePricingExportMutation();
  const { mutateAsync: importPricing, isPending: isImportPending } = usePricingImportMutation();
  const isMutatingPricing = useIsMutatingPricing();

  const onUploadError = (err: AttachmentDropzoneError | null) => {
    switch (err) {
      case 'invalid_type':
        setError(__('This file type is not allowed.', 'yay-wholesale-b2b'));
        return;
      case 'file_too_large':
        setError(__('The selected file is too large. Maximum file size is 5 MB.', 'yay-wholesale-b2b'));
        return;
      case null:
        setError('');
    }
  };

  const exportPricingCSV = async () => {
    if (isMutatingPricing) return;
    try {
      const blob = await exportPricing();
      const url = URL.createObjectURL(blob);
      downloadAsset(url, 'yaywholesaleb2b_products_price.csv');
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };

  const importPricingCSV = async () => {
    if (isMutatingPricing) return;
    if (!file) return;

    setProgress(0);
    setShowProgress(true);
    setLogs(null);
    const formData = new FormData();
    setTimeout(() => setProgress(50), 500);
    setTimeout(() => setProgress(75), 1000);
    formData.append('file', file);

    try {
      const response = await importPricing(formData);
      setLogs(response.logs);
      toast.success(__('Imported completed', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    } finally {
      setProgress(100);
    }
  };

  useEffect(() => {
    setProgress(0);
    setShowProgress(false);
    setLogs(null);
  }, [file]);

  return (
    <div className="flex flex-col gap-4">
      {/* Export */}
      <div className="flex items-center justify-between gap-4 rounded-md border p-4">
        <div>
          <h2 className="flex items-center gap-2 leading-3.5 font-medium">
            {__('Export Price List', 'yay-wholesale-b2b')}
            {!isPro && <UpgradeToProBadge />}
          </h2>
          <span className="text-muted-foreground mt-2 text-xs font-normal">
            {__('Download the full list of all product prices in CSV format', 'yay-wholesale-b2b')}
          </span>
        </div>
        <LoadingButton
          variant="outline"
          loading={isExportPending}
          className="flex w-23 items-center gap-2"
          onClick={exportPricingCSV}
          disabled={!isPro}
        >
          <Download className="size-4" />
          <span className="text-[13px]">{__('Export', 'yay-wholesale-b2b')}</span>
        </LoadingButton>
      </div>

      {/* Import */}
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 leading-3.5 font-medium">
              {__('Import Price List', 'yay-wholesale-b2b')}
              {!isPro && <UpgradeToProBadge />}
            </h2>
            <span className="text-muted-foreground mt-2 text-xs font-normal">
              {__('Bulk update all product prices with CSV file', 'yay-wholesale-b2b')}
            </span>
          </div>
          <LoadingButton
            loading={isImportPending}
            variant="outline"
            className="flex w-23 items-center gap-2"
            disabled={!file || !isPro}
            onClick={importPricingCSV}
          >
            <span className="text-[13px]">{__('Import', 'yay-wholesale-b2b')}</span>
          </LoadingButton>
        </div>

        <div className="relative flex flex-col gap-1">
          {file && (
            <WholeSaleToolTip
              trigger={
                <Button
                  variant="ghost"
                  className="absolute top-3 right-3 z-1 size-6 rounded-full bg-white"
                  onClick={() => setFile(null)}
                >
                  <X className="size-3.5" />
                </Button>
              }
              content={__('Remove file', 'yay-wholesale-b2b')}
            />
          )}
          <AttachmentDropzone
            value={file}
            onChange={setFile}
            accept=".csv"
            maxSize={5 * 1024 * 1024} //  Max size: 5MB
            onUploadError={onUploadError}
            disabled={!isPro}
            className="min-h-45"
          >
            {!file ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="bg-muted-foreground-400 rounded-[50%] p-3 text-white">
                  <Upload className="min-size-6 size-6" />
                </div>
                <span className="text-sm">
                  {createInterpolateElement(__('Drop file here, or <click/> to upload'), {
                    click: <span className="font-semibold">{__('Chose file', 'yay-wholesale-b2b')}</span>,
                  })}
                </span>
              </div>
            ) : (
              <div className="relative w-full">
                <div className="-z-1 flex flex-col items-center justify-center gap-2">
                  <div className="bg-muted-foreground-400 rounded-full p-3 text-white">
                    <File className="min-size-6 size-6" />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>
            )}
          </AttachmentDropzone>
          {uploadError && <span className="text-destructive px-2">{uploadError}</span>}
        </div>
        {showProgress && (
          <div className="border-border flex w-full flex-col gap-2 rounded-md border p-3">
            <h2 className="font-medium">
              {isImportPending ? __('Importing...', 'yay-wholesale-b2b') : __('Imported', 'yay-wholesale-b2b')}
            </h2>
            <div className="bg-muted relative h-3.25 w-full rounded-full">
              <div
                className={cn(
                  'absolute top-0 left-0 size-full rounded-full transition-all duration-500',
                  importProgress === 100 ? 'bg-success' : 'bg-primary',
                )}
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        {importLogs && (
          <div className="bg-muted text-muted-foreground flex flex-col gap-1 rounded-md p-3 font-mono text-sm">
            <h2 className="text-foreground mb-2 text-[16px] font-medium">{__('Import Logs', 'yay-wholesale-b2b')}</h2>
            <span>
              <span className="font-medium">{__('Successfully imported', 'yay-wholesale-b2b')}: </span>
              {sprintf(__('%d row(s)', 'yay-wholesale-b2b'), importLogs.success)}
            </span>
            <span>
              <span className="font-medium">{__('Failed to imported', 'yay-wholesale-b2b')}: </span>
              {sprintf(__('%d row(s)', 'yay-wholesale-b2b'), importLogs.failed.length)}
            </span>
            {importLogs.failed.map((log, index) => (
              <span key={index}>{log}</span>
            ))}
          </div>
        )}
        {isPro && <ImportHelpBanner />}
      </div>
    </div>
  );
}

const ImportHelpBanner = () => {
  const [visible, setVisible] = useState(true);
  return (
    visible && (
      <Card className="bg-primary/7 border-primary-accent text-primary-accent relative border px-4 py-2">
        <Button
          variant="primary-soft"
          className="absolute top-3 right-3 z-1 size-2 bg-transparent"
          onClick={() => setVisible(false)}
        >
          <X className="size-3" />
        </Button>
        <div className="flex flex-col items-start justify-start gap-1 text-left">
          <p className="font-medium">{__('Recommended Workflow', 'yay-wholesale-b2b')}</p>{' '}
          <p>{__('1. Export the current pricing list as a CSV file.', 'yay-wholesale-b2b')}</p>{' '}
          <p>
            {__(
              '2. Modify the price values in the exported CSV file. Ensure the first column contains valid product IDs.',
              'yay-wholesale-b2b',
            )}
          </p>
          <p>
            {__('3. Import the modified CSV file to apply the new prices, discounts and tiers.', 'yay-wholesale-b2b')}
          </p>
        </div>
      </Card>
    )
  );
};
