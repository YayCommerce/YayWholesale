import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { formTitle, titleAlign } = attributes;

    return (
        <div {...useBlockProps()}>
            <div className='ywhs_request_form_block'>
                <BlockControls>
                    <AlignmentToolbar
                        value={titleAlign}
                        onChange={(newAlign) => setAttributes({ titleAlign: newAlign })}
                    />
                </BlockControls>
                <RichText
                    tagName="p"
                    value={formTitle}
                    onChange={(newContent) => setAttributes({ formTitle: newContent })}
                    placeholder={__("Write your form title here...", "yay-wholesale")}
                    style={{textAlign: titleAlign}}
                />
                <div className='ywhs_skeleton_container'>
                    <div className='ywhs_skeleton_half'>
                        <div className='ywhs_skeleton ywhs_skeleton_label'></div>
                        <div className='ywhs_skeleton'></div>
                    </div>
                    <div className='ywhs_skeleton_half'>
                        <div className='ywhs_skeleton ywhs_skeleton_label'></div>
                        <div className='ywhs_skeleton '></div>
                    </div>
                    <div className='ywhs_skeleton_full'>
                        <div className='ywhs_skeleton ywhs_skeleton_label'></div>
                        <div className='ywhs_skeleton '></div>
                    </div>
                    <div className='ywhs_skeleton_full'>
                        <div className='ywhs_skeleton ywhs_skeleton_label'></div>
                        <div className='ywhs_skeleton ywhs_skeleton_textarea'></div>
                    </div>
                    <div className='ywhs_skeleton_half'>
                        <div className='ywhs_skeleton ywhs_skeleton_button'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
