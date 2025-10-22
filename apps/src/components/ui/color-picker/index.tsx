import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import { focusVariants } from '@/components/ui/variants/focus.variants';

interface ColorPickerProps {
  id: number | string;
  value: string;
  defaultColor?: string;
  palettes?: boolean | string[];
  width?: number;
  className?: string;
  onChangeColor: (color: string) => void;
}

declare const jQuery: any;

const ColorPicker: React.FC<ColorPickerProps> = ({
  id,
  value,
  defaultColor = '#ffffff',
  palettes = true,
  width = 250,
  className,
  onChangeColor,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initPicker = useRef(false);

  useEffect(() => {
    if (
      typeof jQuery === 'undefined' ||
      !jQuery.fn.wpColorPicker ||
      !inputRef.current ||
      initPicker.current === true
    ) {
      return;
    }

    initPicker.current = true;

    jQuery(inputRef.current).wpColorPicker({
      change: (_event: any, ui: { color: { toString: () => string } }) => {
        onChangeColor(ui.color.toString());
      },
      palettes,
      width,
      result: (color: string) => {
        onChangeColor(color);
      },
    });

    return () => {
      if (inputRef.current && jQuery(inputRef.current).data('wpWpColorPicker')) {
        jQuery(inputRef.current).wpColorPicker('destroy');
      }
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && value !== jQuery(inputRef.current).val()) {
      jQuery(inputRef.current).val(value);
    }
  }, [value]);

  return (
    <div
      className={cn(
        focusVariants(),
        'yay-color-picker-wrap',
        '[&_.wp-color-result]:!border-input [&_.wp-color-result]:!m-0 [&_.wp-color-result]:!h-9 [&_.wp-color-result]:!overflow-hidden [&_.wp-color-result]:!rounded-md [&_.wp-color-result-text]:!py-[3px]',
        '[&_.wp-picker-input-wrap]:animate-in [&_.wp-picker-input-wrap]:!absolute [&_.wp-picker-input-wrap]:!z-999 [&_.wp-picker-input-wrap]:!m-0 [&_.wp-picker-input-wrap]:!mt-2 [&_.wp-picker-input-wrap]:!ml-0 [&_.wp-picker-input-wrap]:!block [&_.wp-picker-input-wrap]:!w-[250px] [&_.wp-picker-input-wrap]:!rounded-t-none [&_.wp-picker-input-wrap]:!border-t-0 [&_.wp-picker-input-wrap]:!bg-white [&_.wp-picker-input-wrap]:!p-2 [&_.wp-picker-input-wrap]:!shadow-sm [&_.wp-picker-input-wrap.hidden]:!hidden',
        '[&_.wp-picker-holder]:animate-in [&_.wp-picker-holder]:!absolute [&_.wp-picker-holder]:!z-999 [&_.wp-picker-holder]:!mt-[47px] [&_.wp-picker-holder]:!ml-0 [&_.wp-picker-holder]:!w-[250px] [&_.wp-picker-holder]:!shadow-sm',
        '[&_.iris-picker]:!border-0',
        className,
      )}
    >
      <input
        id={`YayColorPicker_${id}`}
        ref={inputRef}
        type="text"
        defaultValue={value}
        data-default-color={defaultColor}
        {...props}
      />
    </div>
  );
};

export { ColorPicker };
