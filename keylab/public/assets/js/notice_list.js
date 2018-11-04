$('document').ready(function() {
    $('.notice_list table tbody tr').click(function() {
        var id = $(this).children().filter('.notice_id').text();
        location.href = '/notice/' + id;
    })

    $('.pagination li .page').not($('.active')).click(function() {
        var num = $(this).text();

        location.href = '/notice/list/' + num;
    })

    // $('.pagination li .page').not($('.active')).click(function() {
    //     var num = $(this).text();

    //     var xhr = new XMLHttpRequest();
    //     xhr.onload = function() {
    //         if(xhr.status === 200) {
    //             var notices = JSON.parse(xhr.response);

    //             var tbody = document.querySelector('tbody');
    //             tbody.innerHTML = "";

    //             for (var i in notices) {
    //                 var notice = notices[i];
    //                 var tr = document.createElement('tr');
    //                 var td = document.createElement('td');
    //                 td.textContent = notice.id;
    //                 td.setAttribute('class', 'notice_id');
    //                 tr.appendChild(td);
    //                 td = document.createElement('td');
    //                 var date = new Date(notice.createdAt);
    //                 td.textContent = date.toLocaleDateString();
    //                 tr.appendChild(td);
    //                 td = document.createElement('td');
    //                 td.textContent = notice.title;
    //                 tr.appendChild(td);
    //                 tbody.appendChild(tr);
    //             }


    //         }
    //         else {
    //             console.error(xhr.responseText);
    //         }
    //     }
    //     xhr.open('GET', '/notice/list/' + num);
    //     xhr.send();
    // })
})