$(document).ready(function() {
    $('#before tr').click(function() {
        if($(this).attr('before-selected') === 'true') {
            $(this).children(':first').css('border', '0.5px solid rgba(210, 215, 217, 0.75)');
            $(this).attr('before-selected', 'false');
        }
        else {
            $(this).children(':first').css('border', '1px solid #f56a6a');
            $(this).attr('before-selected', 'true');
        }
    });

    $('#right_button').click(function() {
        $("tr[before-selected='true']").each(function(index, item) {
            $(item).children(':first').css('border', '0.5px solid rgba(210, 215, 217, 0.75)');
            $(item).attr('before-selected', 'false');
            $('#after tbody').append(item);
        })
    });

    $('#left_button').click(function() {
        $("tr[before-selected='true']").each(function(index, item) {
            $(item).children(':first').css('border', '0.5px solid rgba(210, 215, 217, 0.75)');
            $(item).attr('before-selected', 'false');
            $('#before tbody').append(item);
        })
    });
    
    $('#posting').click(function() {
        var tag_str = "";
        $('#after td').each(function(index, item) {
            tag_str += $(item).text() + ':';
        });

        $('#tag').val(tag_str);
        $('#post_submit').submit();
    })
})