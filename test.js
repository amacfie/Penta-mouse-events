$(document).ready( function() {

    $('.dce').each(function () {
        $(this).on('click', function() {
            alert('hi');
        });
    });

    $('#vote1').on('click', function () {
        var oldCount = parseInt($('#score1').html(), 10);
        var newCount = oldCount + 1;
        $('#score1').html(newCount.toString());
    });

    $('#vote2').on('click', function () {
        var oldCount = parseInt($('#score2').html(), 10);
        var newCount = oldCount + 1;
        $('#score2').html(newCount.toString());
    });

    $('#dme').on('mouseover', function() {
        alert('hi');
    });

    $('#parListener').on('click', 'span', function(ev) {
        alert('hi');
    });

});

