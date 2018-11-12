$('document').ready(function() {
    // 댓글 리스트 요청 ajax
    $.ajax({
        url: '/post/comment',
        type: 'get',
        data: {
            id: $('.post_content').attr('id')
        },
        success: function(data) {
            var dl = $('<dl></dl>');
            var comt = $('<div></div>').addClass('comt').addClass('box').append(dl);

            for (var i in data) {

                var div = $('<div></div>').attr('id', data[i].id).addClass('comment_box');
                var h3 = $('<h3></h3>').text(data[i].name + '  ');
                var dt = $('<dt></dt>').append(h3);
                if (data[i].commentType === 'sub') {
                    h3.append($('<span></span>').attr('class', 'fas fa-reply'));
                }
                div.append(dt);
                div.append($('<dd></dd>').append($('<p></p>').text(data[i].contents)));
                
                var btn = $('<div></div>').addClass('comment_btn');
                btn.append($('<a></a>').attr('class', 'button verysmall reply_btn').append($('<span></span>').attr('class', 'fas fa-comment').text('답글')));
                btn.append($('<a></a>').attr('class', 'button verysmall edit_btn').append($('<span></span>').attr('class', 'fas fa-edit').text('수정')));
                btn.append($('<a></a>').attr('class', 'button verysmall delete_btn').append($('<span></span>').attr('class', 'fas fa-eraser').text('삭제')));
                div.append(btn);

                var reply = $('<form></form>').attr('method', 'post').attr('action', '/post/sub_comment').attr('class', 'reply');
                reply.append($('<input></input>').attr('type', 'hidden').attr('name', 'content_id').val($('.post_content').attr('id')));
                reply.append($('<input></input>').attr('type', 'hidden').attr('name', 'category_title').val($('.content_title').text()));
                reply.append($('<div></div>').attr('class', 'error reply_error'));
                var uniform = $('<div></div>').attr('class', 'row uniform');
                uniform.append($('<div></div>').attr('class', '6u 12u$(xsmall)').append($('<input></input>').attr('type', 'text').attr('name', 'name').attr('class', 'comment_name').attr('placeholder','이름')));
                uniform.append($('<div></div>').attr('class', '6u 12u$(xsmall)').append($('<input></input>').attr('type', 'password').attr('name', 'password').attr('class', 'comment_password').attr('placeholder','비밀번호')));
                uniform.append($('<div></div>').attr('class', '12u$').append($('<textarea></textarea>').attr('name', 'message').attr('class', 'comment_message').attr('placeholder','Enter your message')));
                uniform.append($('<div></div>').addClass('12u$').append($('<ul></ul>').addClass('actions').append($('<li></li>').append($('<input></input>').attr('type', 'button').attr('value', '댓글 등록').addClass('special')))));
                reply.append(uniform);

                var edit = $('<form></form>').attr('method', 'post').attr('action', '/post/comment/edit/' + data[i].id).attr('class', 'edit');
                edit.append($('<input></input>').attr('type', 'hidden').attr('name', 'content_id').val($('.post_content').attr('id')));
                edit.append($('<input></input>').attr('type', 'hidden').attr('name', 'category_title').val($('.content_title').text()));
                edit.append($('<div></div>').attr('class', 'error edit_error'));
                uniform = $('<div></div>').attr('class', 'row uniform');
                uniform.append($('<div></div>').attr('class', '4u 12u$(xsmall)').append($('<input></input>').attr('type', 'password').attr('name', 'password').attr('class', 'comment_password').attr('placeholder','비밀번호')));
                uniform.append($('<div></div>').attr('class', '12u$').append($('<textarea></textarea>').attr('name', 'message').attr('class', 'comment_message').attr('placeholder','Enter your message')));
                uniform.append($('<div></div>').addClass('12u$').append($('<ul></ul>').addClass('actions').append($('<li></li>').append($('<input></input>').attr('type', 'button').attr('value', '댓글 수정').addClass('special')))));
                edit.append(uniform);

                var del = $('<form></form>').attr('method', 'post').attr('action', '/post/comment/del/' + data[i].id).attr('class', 'delete');
                del.append($('<input></input>').attr('type', 'hidden').attr('name', 'content_id').val($('.post_content').attr('id')));
                del.append($('<input></input>').attr('type', 'hidden').attr('name', 'category_title').val($('.content_title').text()));
                del.append($('<div></div>').attr('class', 'error delete_error'));
                uniform = $('<div></div>').attr('class', 'row uniform');
                uniform.append($('<div></div>').attr('class', '4u 12u$(xsmall)').append($('<input></input>').attr('type', 'password').attr('name', 'password').attr('class', 'comment_password').attr('placeholder','비밀번호')));
                uniform.append($('<div></div>').addClass('12u$').append($('<ul></ul>').addClass('actions').append($('<li></li>').append($('<input></input>').attr('type', 'submit').attr('value', '댓글 삭제').addClass('special')))));
                del.append(uniform);

                div.append(reply).append(edit).append(del);

                if (data[i].commentType === 'main') {
                    dl.append(div);
                }
                else {
                    var parentid = data[i].parentId;
                    var hr = $('<hr>');
                    $('div').filter('#' + parentid).after(hr);
                    hr.after($('<blockquote></blockquote>').append(div));
                }

                $('.post_comment').prev().before(comt);
            }

            // 답글 버튼 클릭한 경우
            $('.reply_btn').click(function() {
                // 댓글 인덱스 번호
                var post_num = $(this).parent().parent().attr('id');
                var reply_window = $('#' + post_num + ' .reply .uniform');

                if($('.edit_error').text() || $('.delete_error').text()) {
                    $('.edit_error').text('');
                    $('.delete_error').text('');
                }

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

                if($('.edit_error').text() || $('.delete_error').text()) {
                    $('.edit_error').text('');
                    $('.delete_error').text('');
                }

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

                if($('.edit_error').text() || $('.delete_error').text()) {
                    $('.edit_error').text('');
                    $('.delete_error').text('');
                }

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
            });

            $('.edit .special').click(function() {
                var form = $(this).closest('form');

                $.ajax({
                    url: '/post/comment/edit/' + data[i].id,
                    type: 'post',
                    data: {
                        content_id: $('.post_content').attr('id'),
                        category_title: $('.categoryTitle').attr('id'),
                        password: form.find('input').filter('.comment_password').val(),
                        message: form.find('input').filter('.comment_message').val()
                    },
                    success: function(data) {
                        if(!data) {
                            form.find('div').filter('.edit_error').text('비밀번호를 틀렸습니다.');
                            form.find('input').filter('.comment_password').val('');
                            form.find('textarea').val('')
                        }
                    }
                });
            });

            $('.delete .special').click(function() {
                var form = $(this).closest('form');

                $.ajax({
                    url: '/post/comment/del/' + data[i].id,
                    type: 'post',
                    data: {
                        content_id: $('.post_content').attr('id'),
                        category_title: $('.categoryTitle').attr('id'),
                        password: form.find('input').filter('.comment_password').val()
                    },
                    success: function(data) {
                        if(!data) {
                            form.find('div').filter('.edit_error').text('비밀번호를 틀렸습니다.');
                            form.find('input').filter('.comment_password').val('');
                        }
                    }
                });
            });
        }
    });
});