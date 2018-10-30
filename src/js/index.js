$(function () {
    // var vConsole = new VConsole();
    var $checkbox_sure = $('#checkbox_sure');
    var $sure = $('.sure')
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    var access_token = getQueryString('access_token')
    var isRead = getQueryString('isRead')
    if (isRead == 1) {
        $checkbox_sure.prop({ 'checked': true })
        $checkbox_sure.attr({ 'disabled': true })
        window.sure = function () {
            console.log(111111)
            window.synopsis.backToUserCenter();
        }
    } else {
        $checkbox_sure.prop({ 'checked': false })
        $checkbox_sure.change(function () {
            if ($(this).is(':checked')) {
                isRead = 1;
            } else {
                isRead = 0;
            }
        });
        window.sure = function () {
            if (isRead == 1) {
                $.get("/api/engineer/isRead?access_token=" + access_token, function (data, status) {
                    if (status == 'success' && data.result == 'success') {
                        window.synopsis.backToUserCenter();
                    }
                });
            }
        }
    }


})