import { useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { RequestField } from '@/lib/schema/requests.type';
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { handleDataByType, isImageAttachmentUrl } from '@/pages/requests/requests.helper';
import { AttachmentAction, AttachmentActions } from '../../../components/ui/attachment';

interface EditRequestFieldProps {
  requestId: number;
  field: RequestField;
}

export default function EditRequestField({ requestId, field }: EditRequestFieldProps) {
  switch (field.type.toLowerCase()) {
    case 'textarea':
      return <Textarea className="h-fit min-h-25 resize-none" readOnly value={handleDataByType(field)} />;
    case 'attachment':
      return <AttachmentField requestId={requestId} field={field} />;
    default:
      return <Input readOnly value={handleDataByType(field)} onChange={() => {}} />;
  }
}

const AttachmentField = ({ requestId, field }: EditRequestFieldProps) => {
  const { fileName, extension } = useMemo(() => {
    if (field.type.toLowerCase() !== 'attachment') return { fileName: '', extension: '' };
    const fileMap = field.value.split('/');
    const file = fileMap[fileMap.length - 1].split('.');
    const extension = file[file.length - 1];

    return {
      fileName: fileMap[fileMap.length - 1],
      extension,
    };
  }, [field.value, requestId]);

  const handleDownload = () => {
    if (field.type.toLowerCase() !== 'attachment') return '';
    const link = document.createElement('a');
    link.href = field.value;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Attachment className="hover:bg-muted-400 w-full cursor-pointer gap-4! rounded-lg">
      {isImageAttachmentUrl(field.value) ? (
        <AttachmentMedia variant="image">
          <img src={field.value} />
        </AttachmentMedia>
      ) : (
        <AttachmentMedia>
          <FileText />
        </AttachmentMedia>
      )}

      <AttachmentContent>
        <AttachmentTitle>{fileName}</AttachmentTitle>
        <AttachmentDescription className="flex items-center gap-1.5">
          {extension.toUpperCase()} <span>·</span>
          {isImageAttachmentUrl(field.value)
            ? __('View image', 'yay-wholesale-b2b')
            : __('View file', 'yay-wholesale-b2b')}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction onClick={handleDownload}>
          <Download />
        </AttachmentAction>
      </AttachmentActions>
      <AttachmentTrigger asChild>
        <a href={field.value} target="_blank" rel="noreferrer" />
      </AttachmentTrigger>
    </Attachment>
  );
};
