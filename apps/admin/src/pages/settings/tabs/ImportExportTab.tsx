import { useState } from 'react';
import { Download, File, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { downloadAsset } from '@/lib/helpers/assets.helper';
import { getErrorMsg } from '@/lib/helpers/response.helper';
import { usePricingExportMutation } from '@/lib/queries/settings.queries';
import { isPro } from '@/lib/utils';
import { AttachmentDropzone, AttachmentDropzoneError } from '@/components/ui/attachment';
import { Button, LoadingButton } from '@/components/ui/button';
import { UpgradeToProBadge } from '@/components/ui/custom/upgrate-to-pro';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';

export default function ImportExportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setError] = useState('');

  const { mutateAsync: exportPricing, isPending: isExportPending } = usePricingExportMutation();

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
    try {
      const response = await exportPricing();
      downloadAsset(response.file, 'yaywholesaleb2b_products_price.csv');
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };
  return (
    <div className="flex flex-col gap-4">
      {/* Export */}
      <div className="flex flex-col items-end justify-between gap-4 rounded-md border p-4 lg:flex-row lg:items-center lg:gap-15">
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
          className="flex items-center gap-2"
          onClick={exportPricingCSV}
        >
          <Download className="size-4" />
          <span className="text-[13px]">{__('Export', 'yay-wholesale-b2b')}</span>
        </LoadingButton>
      </div>

      {/* Import */}
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <div>
          <h2 className="flex items-center gap-2 leading-3.5 font-medium">
            {__('Import Price List', 'yay-wholesale-b2b')}
            {!isPro && <UpgradeToProBadge />}
          </h2>
          <span className="text-muted-foreground mt-2 text-xs font-normal">
            {__('Bulk update all product prices with CSV file', 'yay-wholesale-b2b')}
          </span>
        </div>
        <div className="relative flex flex-col gap-1">
          {file && (
            <WholeSaleToolTip
              trigger={
                <Button
                  variant="ghost"
                  className="absolute top-2.5 right-2.5 z-999 rounded-full bg-white"
                  onClick={() => setFile(null)}
                >
                  <X className="size-3.5" />
                </Button>
              }
              content={__('Delete file', 'yay-wholesale-b2b')}
            />
          )}
          <AttachmentDropzone
            value={file}
            onChange={setFile}
            accept=".csv"
            maxSize={5 * 1024 * 1024} //  Max size: 5MB
            onUploadError={onUploadError}
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
                  <div className="bg-muted-foreground-400 rounded-[50%] p-3 text-white">
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
        <div className="flex justify-end">
          <Button variant="outline" className="flex items-center gap-2" disabled={!file}>
            <span className="text-[13px]">{__('Import', 'yay-wholesale-b2b')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
