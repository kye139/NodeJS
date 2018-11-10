$('document').ready(function() {
    // 댓글 리스트 요청 ajax
    $.ajax({
        url: '/post/content',
        type: 'get',
        data: {
            id: $('.post_content').attr('id')
        },
        success: function(data) {
            
        }
    })




    // 답글 버튼 클릭한 경우
    $('.reply_btn').click(function() {
        // 댓글 인덱스 번호
        var post_num = $(this).parent().parent().attr('id');
        var reply_window = $('#' + post_num + ' .reply .uniform');

        if(reply_window.hasClass('selected')) {
            reply_window.removeClass('selected');
            return;
        }

        // 다른 댓글에서 추가 창이 열려있거나 대상 댓글에서 다른 창이 열려 있는 경우 닫기
        $('.selected').removeClass('selected');

        if(reply_window.hasClass('selected')) {
            reply_window.removeClass('selected');
        }
        else {
            reply_window.addClass('selected');
        }
    });

    // 수정 버튼 클릭한 경우
    $('.edit_btn').click(function() {
        // 댓글 인덱스 번호
        var post_num = $(this).parent().parent().attr('id');
        var edit_window = $('#' + post_num + ' .edit .uniform');

        if(edit_window.hasClass('selected')) {
            edit_window.removeClass('selected');
            return;
        }

        // 다른 댓글에서 추가 창이 열려있거나 대상 댓글에서 다른 창이 열려 있는 경우 닫기
        $('.selected').removeClass('selected');

        if(edit_window.hasClass('selected')) {
            edit_window.removeClass('selected');
        }
        else {
            edit_window.addClass('selected');
        }
    });

    // 삭제 버튼 클릭한 경우
    $('.delete_btn').click(function() {
        // 댓글 인덱스 번호
        var post_num = $(this).parent().parent().attr('id');
        var del_window = $('#' + post_num + ' .delete .uniform');

        if(del_window.hasClass('selected')) {
            del_window.removeClass('selected');
            return;
        }

        // 다른 댓글에서 추가 창이 열려있거나 대상 댓글에서 다른 창이 열려 있는 경우 닫기
        $('.selected').removeClass('selected');

        if(del_window.hasClass('selected')) {
            del_window.removeClass('selected');
        }
        else {
            del_window.addClass('selected');
        }
    });

    $('.reply .special').click(function() {
        var id = $(this).closest('.comment_box').attr('id');
        var input = $('<input></input>').attr('type', 'hidden').attr('name', 'parent_id').val(id);
        $(this).parent().parent().append(input);

        $(this).closest('form').submit();
    })
});