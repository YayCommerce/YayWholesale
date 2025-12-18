jQuery(document).ready(() => {
    jQuery('.ywhs_requirement_content').hide();

    jQuery(document).off('click', '.ywhs_requirement_opener').on('click', '.ywhs_requirement_opener', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $opener = jQuery(this);
        var $content = $opener.closest('.ywhs_requirement_header').siblings('.ywhs_requirement_content');

        if($opener.hasClass('ywhs_rclosed')) {
            $content.slideDown();
            $opener.removeClass('ywhs_rclosed').addClass('ywhs_ropened');
        } else {
            $content.slideUp();
            $opener.removeClass('ywhs_ropened').addClass('ywhs_rclosed');
        }
    });
})