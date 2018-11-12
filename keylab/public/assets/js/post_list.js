// 처음 리스트 열었을 때, 목록 가져오기(1페이지)
var page_click = function(page_num) {
    var types = $('.category_header h2').attr('class');
    var name = $('.category_name').val();

    console.log(page_num);

    $.ajax({
        url: '/post/list/' + page_num,
        type: 'get',
        data: {
            types,
            name
        },
        success: function(data) {
            var page_count = Math.ceil(parseFloat(data.content_count) / 6.0);

            $('.contents_num').text(' (' + data.content_count + ')');
            
            $('.post_list').html('');

            for (var i in data.content_data) {
                var div = $('<div></div>').addClass('box').addClass('list_component');
                var h2 = $('<h2></h2>').attr('id', 'content').addClass(data.content_data[i].content.id.toString()).html(data.content_data[i].content.title);
                var p = $('<p></p>').html(data.content_data[i].summary);
                var div2 = $('<div></div>').addClass('about_post');
                var cate_name = $('<span></span>').addClass('small_cate_name').html(name);
                var time = $('<span></span>').addClass('write_time').html(new Date(data.content_data[i].content.createdAt).toLocaleDateString());
                
                div2.append(cate_name).append(time);
                div.append(h2).append(p).append(div2);

                $('.post_list').append(div);
            }

            $('.pagination').html('');

            var start = $('<li></li>').html($('<span></span>').html('첫 페이지').addClass('button').addClass('first'));
            if (page_num == 1) {
                start.children().addClass('disabled');
            }
            $('.pagination').append(start);

            if (page_count > 7) {
                for (var i=page_num-3; i<page_num; i++) {
                    var page = $('<li></li>').html($('<a></a>').text(i).addClass('page').attr('href', '#'));
                    $('.pagination').append(page);
                }
                var page = $('<li></li>').html($('<a></a>').text(page_num).addClass('page').addClass('active'));
                $('.pagination').append(page);
                for (var i=page_num+1; i<page_num+4; i++) {
                    var page = $('<li></li>').html($('<a></a>').text(i).addClass('page').attr('href', '#'));
                    $('.pagination').append(page);
                }
            }
            else {
                if (page_num != 1) {
                    for(var i=1; i<page_num; i++) {
                        var page = $('<li></li>').html($('<a></a>').text(i).addClass('page').attr('href', '#'));
                        $('.pagination').append(page);
                    }
                }
                var page = $('<li></li>').html($('<a></a>').text(page_num).addClass('page').addClass('active'));
                $('.pagination').append(page);
                for (var i=page_num+1; i<=page_count; i++) {
                    var page = $('<li></li>').html($('<a></a>').text(i).addClass('page').attr('href', '#'));
                    $('.pagination').append(page);
                }
            }

            var end = $('<li></li>').html($('<span></span>').html('끝 페이지').addClass('button').addClass('last'));
            if (page_count == page_num) {
                end.children().addClass('disabled');
            }

            $('.pagination').append(end);

            $('.pagination .page').click(function() {
                page_click(parseInt($(this).text(), 10));
            });
            
            $('.pagination .first').click(function() {
                page_click(1);
            });

            $('.pagination .last').click(function() {
                page_click(page_count);
            });

            $('.list_component').click(function() {
                var form = $('<form></form>').attr('method', 'get').attr('action', '/post/content');
                $('<input></input>').attr('name', 'content_id').attr('type', 'hidden').val($(this).children().filter('h2').attr('class')).appendTo(form);
                $('<input></input>').attr('name', 'category_title').attr('type', 'hidden').val($('.category_header h2').attr('class')).appendTo(form);
                $('.input_form').append(form);
                form.submit();
            });
        }
    });
}

var contentInit = function() {
    page_click(1);
}

$(document).ready(function() {
    contentInit();   
});