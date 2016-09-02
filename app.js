(function(){ 
	var express = require('express');
	var bodyParser = require('body-parser');
	var shortId = require('shortid');
	var app = express();
	app.use(bodyParser.json());
	app.use(express.static('public'));
	
	app.get('/', function (req, res) {
		res.sendfile('public/index.html');
	});
	
	app.post('/login', function(req, res) {
		var login = req.body.login;
		var pwd = req.body.password;
		
		var foundUser = false;
		var user = users.forEach(function(u) {
			if (u.login === login)
				if (u.pwd === pwd){
					res.json({
						success: true,
						name: u.name,
						id: u.id
					});
					foundUser = true;
				}
		})
		
		if (!foundUser)
			res.json({ success: false });
	});
	
	app.get('/booking/court/:id', function(req, res) {
		var bookings = getBookingsForCourt(req.params.id);
		
		if(bookings.length === 0)
			res.json([]);
		else {
			var results = [];
			bookings.forEach(function(b){
				results.push(new vmBooking(b));
			});
			res.json(results);
		}
	});
	
	app.get('/booking/user/:id', function(req, res){
		var bookings = getBookingsForUser(req.params.id);
		
		if(bookings === null)
			res.json([]);
		else {
			var results = [];
			bookings.forEach(function(b){
				results.push(new vmBooking(b));
			});
			res.json(results);
		}
	});
	
	app.get('/booking/:date/:timeslotId', function(req, res){
		var date = new Date(req.params.date);
		var timeslotId = req.params.timeslotId;
		
		var courts = getFreeCourtsForDateTime(date, timeslotId);
		
		if(courts.length === 0)
			res.json([]);
		else
			res.json(courts);
	});
	
	app.post('/booking', function(req, res){
		var userId = req.body.user;
		var courtId = req.body.court;
		var timeslotId = req.body.timeslot;
		var date = req.body.date;
		
		createBooking(userId, courtId, timeslotId, date);
		
		res.status = 200;
		res.end();
	});
	
	app.delete('/booking/:id', function(req, res){
		var booking = getItemById(req.body.id);

		if (booking)
			bookings.splice(bookings.indexOf(booking), 1);

		res.status = 200;
		res.end();
	});

	app.listen(3001, function(){
		console.log('App listening on port 3001');
	});
	
	/////////////////////////////////////////////////////////////////////////////////////////
	
	var users = [
		{ id: 0, login: 'jagan@jagan.sg', pwd: '123', name: 'Jagan' },
		{ id: 1, login: 'test1@test.com', pwd: 'test', name: 'Test User 1' },
		{ id: 2, login: 'test2@test.com', pwd: 'test', name: 'Test User 2' },
		{ id: 3, login: 'a', pwd: '123', name: 'A' }
	]
	
	var courts = [
		{ id: 0, club: 0, name: 'Court A' },
		{ id: 1, club: 0, name: 'Court B' },
		{ id: 2, club: 1, name: 'Court C' }
	]
	
	var timeslots = [
		{ id: 0, start: '7:00:00', end: '8:00:00' },
		{ id: 1, start: '8:00:00', end: '9:00:00' },
		{ id: 2, start: '9:00:00', end: '10:00:00' },
		{ id: 3, start: '10:00:00', end: '11:00:00' },
		{ id: 4, start: '11:00:00', end: '12:00:00' },
		{ id: 5, start: '12:00:00', end: '13:00:00' },
		{ id: 6, start: '13:00:00', end: '14:00:00' },
		{ id: 7, start: '14:00:00', end: '15:00:00' },
		{ id: 8, start: '15:00:00', end: '16:00:00' },
		{ id: 9, start: '16:00:00', end: '17:00:00' },
		{ id: 10, start: '17:00:00', end: '18:00:00' },
		{ id: 11, start: '18:00:00', end: '19:00:00' },
		{ id: 12, start: '19:00:00', end: '20:00:00' },
		{ id: 13, start: '20:00:00', end: '21:00:00' },
		{ id: 14, start: '21:00:00', end: '22:00:00' }
	]
	
	var bookings = [];
	
	function createBooking(userId, courtId, timeslotId, date){
		var booking = {
			id: shortId.generate(),
			user: userId,
			court: courtId,
			timeslot: timeslotId,
			date: new Date(date)
		};
		bookings.push(booking);
		
		return booking;
	}
	
	function cancelBooking(bookingId){
		var found = false;
		bookings.forEach(function(b){
			if (b.id === bookingId){
				bookings.splice(bookings.indexOf(b), 1);
				found = true;
			}
		});
		
		return found;
	}
	
	function getBookingsForCourt(courtId){
		var results = [];
		bookings.forEach(function(b){
			if (b.court === courtId)
				results.push(b);
		});
		
		return results;
	}
	
	function getBookingsForUser(userId){
		var results = [];
		bookings.forEach(function(b){
			if (b.user === userId)
				results.push(b);
		});
		
		return results;
	}
	
	function getFreeCourtsForDateTime(date, timeslotId){
		var results = [];
	
		courts.forEach(function(c){ results.push(c) });
		bookings.forEach(function(b){
			if (b.date.getFullYear() == date.getFullYear()
			 && b.date.getMonth() == date.getMonth()
			 && b.date.getDate() == date.getDate()
			 && b.timeslot === timeslotId){
				var court = getItemById(b.court, courts);
				results.splice(results.indexOf(court), 1);
			}
		});
		
		return results;
	}
	
	function getItemById(id, array){
		var result;
		array.forEach(function(i){
			if (i.id == id)
				result = i;
		});
		
		return result;
	}

	function vmBooking(booking){
		var timeslot = getItemById(booking.timeslot, timeslots);
		var year = booking.date.getFullYear();
		var month = booking.date.getMonth();
		var date = booking.date.getDate();
		var sHour = timeslot.start.split(':')[0];
		var sMin = timeslot.start.split(':')[1];
		var sSec = timeslot.start.split(':')[2];
		var eHour = timeslot.end.split(':')[0];
		var eMin = timeslot.end.split(':')[1];
		var eSec = timeslot.end.split(':')[2];
		var court = getItemById(booking.court, courts);
		
		this.start = new Date(year, month, date, +sHour + 8, sMin, sSec),
		this.end = new Date(year, month, date, +eHour + 8, eMin, eSec),
		this.court = court.name;
		this.id = booking.id;
	}
})();