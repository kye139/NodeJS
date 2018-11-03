$(document).ready(function() {

    /************* 카테고리 관리****************/

    // 카테고리를 클릭할 경우 -> 선택 상태로 변경
    var activate = function() {
        $('.component.selected').removeClass('selected');
        $(this).addClass('selected');
    }
    // 각 카테고리에 클릭 이벤트 연결
    $('.component').click(activate);



    $('#up_button').click(function() {
        var prev = $('.selected').prev();
        // selected된 대상이 일반 카테고리인 경우
        if(!($('.selected').next().hasClass('subcate'))) {
            // 그냥 위로 옮기는 경우
            if(!(prev.hasClass('subcate'))) {
                prev.before($('.selected'));
            }
            // 서브 카테고리를 넘어가야 하는 경우
            else {
                prev.prev().before($('.selected'));
            }
        }
        // selected된 대상이 서브카테고리가 존재하는 경우
        else {
            var sub = $('.selected').next();
            // 그냥 위로 옮기는 경우
            if(!(prev.hasClass('subcate'))) {
                // 맨 위에 위치한 경우
                if(!(prev.hasClass('component'))) {
                    return;
                }
                prev.before($('.selected'));
                sub.prev().before(sub);
            }
            // 서브 카테고리를 넘어가야 하는 경우
            else {
                prev.prev().before($('.selected'));
                sub.prev().prev().before(sub);
            }
        }
    });



    // down 버튼을 누를 경우
    $('#down_button').click(function() {
        // selected 된 대상이 일반 카테고리인 경우
        if(!($('.selected').next().hasClass('subcate'))) {
            // 그냥 아래로 내려가는 경우
            if(!($('.selected').next().next().hasClass('subcate'))) {
                $('.selected').next().after($('.selected'));
            }
            // 서브 카테고리를 넘어가는 경우
            else {
                $('.selected').next().next().after($('.selected'));
            }          
        }
        // selected 된 대상이 서브 카테고리인 경우
        else {
            var sub = $('.selected').next();
            // 그냥 아래로 이동하는 경우(다음 위치에 서브카테고리가 없는 경우)
            if(!($('.selected').next().next().next().hasClass('subcate'))) {  
                // 맨 밑에 위치한 경우
                if(!($('.selected').next().next().hasClass('component'))) {
                    return;
                }
                sub.next().after(sub);
                $('.selected').next().after($('.selected'));
            }
            // 서브 카테고리를 넘어가는 경우
            else {
                sub.next().next().after(sub);
                $('.selected').next().next().after($('.selected'));
            }
        }
    });



    // 추가 버튼을 누른 경우
    $('#update_cate').click(function() {
        var name = $('.add_cate').val();
        // 서브 카테고리 체크 여부 (true: 서브 카테고리, false: selected된 카테고리와 동일 레벨의 카테고리로 추가)
        var is_sub = $('#is_sub').is(':checked');

        // 추가할 카테고리 생성
        var li = $('<li></li>').html(name).addClass('component').on('click', activate);

        // 서브 카테고리로 추가하는 경우
        if(is_sub) {
            // .selected된 대상이 이미 서브 카테고리인 경우
            if($('.selected').parent().hasClass('subcate')) {
                alert('서브카테고리 대상으로 서브카테고리를 추가할 수 없습니다.')
                return;
            }
            // 이미 서브 카테고리를 가지고 있는 경우 - 마지막 서브카테고리로 추가
            if($('.selected').next().hasClass('subcate')) {
                $('.selected').next().children().append(li);
            }
            // 서브 카테고리로 가지고 있지 않은 경우 - 서브 카테고리(ul)을 생성한 후 다음 li로 추가
            else {
                var ul = $('<ul></ul>').html(li);
                var li = $('<li></li>').html(ul).addClass('subcate');
                $('.selected').after(li);
            }
        }
        // 동일 레벨의 카테고리로 추가하는 경우
        else {
            // .selected 되어있는 카테고리가 서브카테고리를 가진 카테고리 인 경우
            if($('.selected').next().hasClass('subcate')) {
                // 서브 카테고리 리스트 뒤에 추가
                $('.selected').next().after(li);
            }
            // .selected 되어있는 카테고리가 일반 카테고리인 경우
            else {
                $('.selected').after(li);
            }
        }
    })



    // 삭제 버튼을 누른 경우 => ajax로 처리( 카테고리 안에 게시물이 존재할 경우 삭제 불가 + 데이터베이스에서 한 번에 처리를 위한 비교가 힘듬.)
    $('#del_button').click(function() {
        if(confirm('정말 해당 카테고리를 삭제하시겠습니까?')) {
            // 해당 카테고리 삭제
            // 서브카테고리가 존재하는 경우
            if($('.selected').next().children().hasClass('subcate')) {
                alert('서브카테고리가 존재하는 경우 삭제가 불가능합니다.');
                return;
            }
            // 서브카테고리를 삭제하는 경우
            if($('.selected').parent().hasClass('subcate')) {
                // 자신이 마지막인 경우
                if($('.selected').parent().children().length == 1) {
                    var li = $('.selected').parent().parent();
                    li.remove();
                }
            }
            $('.selected').remove();
        }
    });



    // 저장 버튼을 누른 경우
    $('#save_cate').click(function() {
        var list_category = [];

        $('.component').each(function(index, item) {
            var type; // 카테고리 타입
            var title_category = null; // 제목 카테고리
            // 서브 카테고리인 경우
            if($(item).parent().parent().hasClass('subcate')) {
                type = 'sub';
                title_category = $(item).parent().parent().prev().text();
            }
            else {
                // 일반 카테고리인 경우
                type = 'main';
            }
            // 배열에 각 카테고리 정보 저장.
            list_category.push({
                type: type,
                parent: title_category,
                name: $(item).text()
            });
        });
        // input 태그에 삽입 후 submit
        $('#list_category').val(list_category);
        $('#submit_category').submit();
    });

    /************* 즐겨찾기 관리 ****************/

    // 카테고리를 클릭할 경우 -> 선택 상태로 변경
    var activate = function() {
        $('.bookmark_list li.selected').removeClass('selected');
        $(this).addClass('selected');
    }
    // 각 카테고리에 클릭 이벤트 연결
    $('.bookmark_list li').click(activate);
});