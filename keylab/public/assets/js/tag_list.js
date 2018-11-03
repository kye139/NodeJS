$(document).ready(function() {
    // 게시글 작성 버튼을 누른 경우
    $('#posting').click(function() {
        // 카테고리 지정이 안된 경우
        if(!$('#demo-category').val()) {
            alert('카테고리를 지정해주세요');
            return;
        }
        $('#post_submit').submit();
    })
});