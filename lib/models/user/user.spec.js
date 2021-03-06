/* Test for lib/user.js */

var assert = require('chai').assert;
var sinon = require('sinon');

var db = require('../../db');
db.connect('mode_staging');	// Do not remove this or you will wipe your data

// Pass in dummy token for testing
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('test');

var User = require('.');
User.start(db, mixpanel);

describe('Users', function() {
	beforeEach(function(done) {
		// Wipe database before running tests. Note: Make _SURE_ you are on staging
		db.get().flushdb(function(err) {
			if(!err) {
				done();
			}
		});
	});
	describe('getHouse', function() {
		it('returns a house for a valid user', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _house = 'Gryffindor';

			db.get().hset('user:' + username, 'house', 'Gryffindor', function(err, data) {
				User.getHouse(username, function(err, house) {
					assert.equal(err, _err);
					assert.equal(house, _house);
					done();
				});
			});
		});
		it('returns null for a user that doens\'t have a house set', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _house = null;

			db.get().hset('user:' + username, 'uid', '0', function(err, data) {
				User.getHouse(username, function(err, house) {
					assert.equal(err, _err);
					assert.equal(house, _house);
					done();
				});
			});
		});
		it('returns an error if no user is passed in', function(done) {
			var username = null;

			var _err = 'no user provided';
			var _house = null;

			User.getHouse(username, function(err, house) {
				assert.equal(err, _err);
				assert.equal(house, null);
				done();
			});
		});
	});
	describe('setHouse', function() {
		it('sets a random house for an existing user', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _houses = ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'];;

			db.get().hset('user:' + username, 'uid', 0, function(err, data) {
				User.setHouse(username, function(err, house) {
					assert.equal(err, _err);
					assert.include(_houses, house);
					done();
				});
			});
		});
		it('returns an error if no user is passed in', function(done) {
			var username = null;

			var _err = 'no user provided';
			var _house = null;

			User.getHouse(username, function(err, house) {
				assert.equal(err, _err);
				assert.equal(house, null);
				done();
			});
		});
	});
	describe('exists', function() {
		it('returns true if a user has a uid', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _exists = true;

			db.get().hset('user:' + username, 'uid', 0, function(err, data) {
				User.exists(username, function(err, exists) {
					assert.equal(err, _err);
					assert.equal(exists, _exists);
					done();
				});
			});
		});
		it('returns false for a user that doens\'t exist (no uid)', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _exists = false;

			User.exists(username, function(err, exists) {
				assert.equal(err, _err);
				assert.equal(exists, _exists);
				done();
			});

		});
		it('returns an error if no user is passed in', function(done) {
			var username = null;

			var _err = 'no user provided';
			var _exists = null;

			User.exists(username, function(err, exists) {
				assert.equal(err, _err);
				assert.equal(exists, _exists);
				done();
			});
		});
	});
	describe('create', function() {
		it('User doesn\'t exist: Creates a user and returns the username', function(done) {
			var username = 'bdickason';

			var _err = null;
			var _user = 'bdickason';

			var _data = {
				uid: 0,
				house: 'muggle',
				username: 'bdickason'
			};

			User.create(username, function(err, user) {
				assert.equal(err, _err);
				assert.equal(user, _user);

				db.get().hgetall('user:' + username, function(err, data) {

					assert.equal(data.uid, _data.uid);
					assert.equal(data.house, _data.house);

					db.get().hkeys('users', function(err, data) {
						// Make sure we're populating the list of users
						assert.include(data, _data.username);
						done();
					})
				})
			});
		});
		it('User exists: Return error', function(done) {
			var username = 'bdickason';

			var _err = 'User already exists';
			var _user = null;

			db.get().hset('user:' + username, 'uid', 0, function(err, data) {
				User.create(username, function(err, user) {
					assert.equal(err, _err);
					assert.equal(user, _user);
					done();
				});
			});

		});
		it('returns an error if no user is passed in', function(done) {
			var username = null;

			var _err = 'no user provided';
			var _exists = null;

			User.create(username, function(err, exists) {
				assert.equal(err, _err);
				assert.equal(exists, null);
				done();
			});
		});
	});
	describe('getCommends', function() {
		it('User not found: Returns error', function(done) {
			var username = 'blah';

			var _err = 'User Not Found';
			var _commends = null;

			User.getCommends(username, function(err, commends) {
				assert.equal(err, _err);
				assert.equal(commends, _commends);
				done();
			});
		});
		it('User found but no commends: Returns error', function(done) {
			var username = 'bdickason';

			var _err = 'User Has No Commends';
			var _commends = null;

			User.create(username, function(err, user) {
				// Create dummy user but don't set commends
				User.getCommends(username, function(err, commends) {
					assert.equal(err, _err);
					assert.equal(commends, _commends);
					done();
				});
			})
		});
		it('Returns commends for a user with commends', function(done) {
			var username = 'bdickason';
			var commends = 53;

			var _err = null;
			var _commends = 53;

			User.create(username, function(err, user) {
				db.get().hset('user:' + username, 'commends', commends, function(err, data) {
					User.getCommends(username, function(err, commends) {
						assert.equal(err, _err);
						assert.equal(commends, _commends);
						done();
					});
				})
			})
		});
	});
	describe('setCommends', function() {
		it('User not found: Returns error', function(done) {
			var username = 'blah';

			var _err = 'User Not Found';
			var _commends = null;

			User.getCommends(username, function(err, commends) {
				assert.equal(err, _err);
				assert.equal(commends, _commends);
				done();
			});
		});
		it('User found but no commends: Returns error', function(done) {
			var username = 'bdickason';

			var _err = 'User Has No Commends';
			var _commends = null;

			User.create(username, function(err, user) {
				// Create dummy user but don't set commends
				User.getCommends(username, function(err, commends) {
					assert.equal(err, _err);
					assert.equal(commends, _commends);
					done();
				});
			})
		});
		it('Commends saved successfully', function(done) {
			var username = 'bdickason';
			var commends = 53;

			var _err = null;
			var _commends = 53;

			User.create(username, function(err, user) {
				db.get().hset('user:' + username, 'commends', commends, function(err, data) {
					User.getCommends(username, function(err, commends) {
						assert.equal(err, _err);
						assert.equal(commends, _commends);
						done();
					});
				})
			})
		});
	});
	describe('getAll', function() {
		it('User not found: Returns error', function(done) {
			var username = 'blah';

			var _err = 'User Not Found';
			var _data = null;

			User.getAll(username, function(err, data) {
				assert.equal(err, _err);
				assert.equal(data, _data);
				done();
			});
		});
		it('Returns status for a user with house and no commends', function(done) {
			var username = 'bdickason';
			var house = 'muggle';

			var _err = null;
			var _data = {
				'uid': '0',
				'house': 'muggle'
			};

			User.create(username, function(err, user) {
				db.get().hset('user:' + username, 'house', house, function(err, data) {
					User.getAll(username, function(err, data) {
						assert.equal(err, _err);
						assert.deepEqual(data, _data);
						done();
					});
				});
			});
		});
		it('Returns status for a user with house and no commends', function(done) {
			var username = 'bdickason';
			var house = 'muggle';
			var commends = 53;

			var _err = null;
			var _data = {
				'uid': '0',
				'house': 'muggle',
				'commends': '53'
			};

			User.create(username, function(err, user) {
				db.get().hmset('user:' + username, 'house', house, 'commends', commends, function(err, data) {
					User.getAll(username, function(err, data) {
						assert.equal(err, _err);
						assert.deepEqual(data, _data);
						done();
					});
				});
			});
		});
		it('No user passed in: Returns error', function(done) {
			var username = null;

			var _err = 'no user provided';
			var _data = null;

			User.getAll(username, function(err, data) {
				assert.equal(err, _err);
				assert.equal(data, _data);
				done();
			});
		});
		describe('Pick a random House', function() {
			it('Has an even distribution of randomness', function(done) {

				var outcomes = {
					Gryffindor: 0,
					Ravenclaw: 0,
					Hufflepuff: 0,
					Slytherin: 0
				};

				for(var i=0; i < 10000; i++) {
					var random = User.generateHouse();
					outcomes[random]++;
				}

				assert.isAtLeast(outcomes.Gryffindor, 2300);
				assert.isAtLeast(outcomes.Ravenclaw, 2300);
				assert.isAtLeast(outcomes.Hufflepuff, 2300);
				assert.isAtLeast(outcomes.Slytherin, 2300);

				done();

			});
		});
	});
});
