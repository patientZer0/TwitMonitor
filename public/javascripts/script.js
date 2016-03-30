$(function() {
    var $container = $('ul.tweets');
    var socket = io.connect();

    socket.on('twitter', function(data) {
        $container.append('<li>' + data.user.screen_name + ': ' + data.text + '</li>');
    });
});

$("action").submit(function(e) {
    //e.preventDefault();
    var self = $(this);
    $.get(
        self.attr("action"),
        self.serialize(),
        function(data) {
            //console.log(data);
            "json"
        }
    );
});