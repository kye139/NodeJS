$(document).ready(function() {
    // 카테고리를 클릭할 경우 -> 선택 상태로 변경
    $('.component').click(function() {
        $('.component.selected').removeClass('selected');
        $(this).addClass('selected');
    });

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
                prev.prev().before('.selected');
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
            // 그냥 아래로 이동하는 경우
            if(!($('.selected').next().next().next().hasClass('subcate'))) {
                $('.selected').next().next().after($('.selected'));
                
            }

        }
    })

    // // down 버튼을 누를 경우
    // $('#down_button').click(function() {
    //     // 마지막에서 2번째에 타겟이 위치할 때
    //     if(!($('.selected').next().next().length)) {
    //         // 서브카테고리의 메인일 경우
    //         if($('.selected').next().children().hasClass('subcate')) {
    //             return;
    //         }
    //         $('.selected').next().after($('.selected'));
    //     }
    //     // 서브카테고리를 뛰어 넘어야 하는 경우
    //     else if(!($('.selected').next().next().hasClass('component'))) {
    //         $('.selected').next().next().after($('.selected'));
    //     }
    //     else {
    //         var sub = $('.selected').next();

    //         // 일반적인 이동
    //         $('.selected').next().after($('.selected'));

    //         // 서브 카테고리가 있는 카테고리를 이동할 경우 같이 움직임
    //         if(sub.children().hasClass('subcate')) {
    //             $('.selected').next().after($('.selected'));
    //            sub.next().next().after(sub);
    //         }
    //     }
    // });

    // 삭제 버튼을 누른 경우 => ajax로 처리( 카테고리 안에 게시물이 존재할 경우 삭제 불가 )
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
})