'use strict';


$(function() {
    let timers = [];

    const startTimers = function() {
	const updateTime = function(id) {
	    const column = $(`tr[data-id=${id}] span`);
	    column.each(function(index, span) {
		const split = $(span).text().split(' ');
		let digit = Number(split[0]);

		const isSeconds = $(span).hasClass('seconds'); 

		if(digit === 0 && isSeconds){
		    // we need to wrap
		    digit = 59;
		    //also need to decrement stuff.
		    const days = $(column[0]).text().split(' ');
		    const hours = $(column[1]).text().split(' ');
		    const minutes = $(column[2]).text().split(' ');

		    const day = Number(days[0]);
		    const hour = Number(hours[0]);
		    const min = Number(minutes[0]);

		    if(day !== 0 && hour === 0 && min === 0) {
			$(column[0]).text((day-1) + ' ' + days[1]);
		    }

		    if(hour !== 0 && min === 0){
			$(column[1]).text((hour-1) + ' ' + hour[1]);
		    }
		    
		    if(min !== 0){
			$(column[2]).text((min-1) + ' ' + minutes[1]);
		    }
		}
		else if(isSeconds) {
		    digit--;
		}
		
		$(span).text(digit + ' ' + split[1]);
	    });
	};


	const allRows = $('tbody tr');

	allRows.each(function(index, row){
	    timers.push(setInterval(function() {
		updateTime($(row).attr('data-id'));
	    }, 1000));
	});
    };

    const clearTimers = function() {
	for(var i = 0; i < timers.length; i++){
	    clearInterval(timers[i]);
	    timers.pop();
	}
    };
    
    const refreshGrid = function() {
	var name = $('#name').val();
	var category = $('#category').val();

	$.get("/items/search?name=" + name + "&category=" + category, function(results){
	    $("tbody").children('tr').remove();

	    results.forEach(function(item) {
		$('tbody').append(`<tr data-id='${item.Id}'> \
				  <td>${item.Name}</td> \
				  <td>${item.Category}</td>\
				  <td>${item.Amount || ''}</td>\
				  <td>${item.TimeStamp || ''}</td>\
				  <td>\
				  <span class='days'>${item.TimeRemaining.days} days,</span> \
				  <span class='hours'>${item.TimeRemaining.hours} hrs,</span> \
				  <span class='minutes'>${item.TimeRemaining.minutes} min,</span> \
				  <span class='seconds'>${item.TimeRemaining.seconds} sec</span> \
				  </td>\
				  </tr>`);
	    });
	});
    }

    $("#search").click(function() {
	clearTimers();
	refreshGrid();
	startTimers();
    });

    startTimers();
});

