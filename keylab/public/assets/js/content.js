$('document').ready(function() {
    // 답글 버튼 클릭한 경우
    $('.reply_btn').click(function() {
        // 댓글 인덱스 번호
        var post_num = $(this).parent().parent().attr('id');
        var reply_window = $('#' + post_num + ' #reply .uniform');

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
        var edit_window = $('#' + post_num + ' #edit .uniform');

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
        var del_window = $('#' + post_num + ' #delete .uniform');

        // 다른 댓글에서 추가 창이 열려있거나 대상 댓글에서 다른 창이 열려 있는 경우 닫기
        $('.selected').removeClass('selected');

        if(del_window.hasClass('selected')) {
            del_window.removeClass('selected');
        }
        else {
            del_window.addClass('selected');
        }
    });
});