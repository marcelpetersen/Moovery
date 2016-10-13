var App = angular.module('ionicApp');

App.factory('Authentication', ['$firebaseAuth', function($firebaseAuth) {
	
	var Authentication = {};
	var firebaseObjectUrl = new Firebase('https://moovery.firebaseio.com/');

	Authentication.firebaseAuth = function(){
		return ($firebaseAuth(firebaseObjectUrl));
	};

	Authentication.url = function(){
		return firebaseObjectUrl;
	};

	return Authentication;
}]);

App.controller('SignUpCtrl', function($scope, $rootScope,$ionicLoading, $state, $sce, $ionicSideMenuDelegate, $translate, Authentication, ShowAlert, User) {



	// Disable toggling of left menu by swipe
	$ionicSideMenuDelegate.canDragContent(false);

	// Get firebase token
	$scope.auth = Authentication.firebaseAuth();

	var created = Firebase.ServerValue.TIMESTAMP;
	
	$scope.signUp = function(mailAddress, password){
		
		

		// Confirm mail address in a popup
		var popUp = ShowAlert.confirm($translate.instant('SIGN_UP_POPUP_TITLE'), $translate.instant('SIGN_UP_POPUP_CONTENT_1') + mailAddress + $translate.instant('SIGN_UP_POPUP_CONTENT_2'), $translate.instant('SIGN_UP_POPUP_CANCEL'), $translate.instant('SIGN_UP_POPUP_CONFIRM'));

		popUp.then(function(res) {

			if(res) {
				//show progress bar
			    $ionicLoading.show();
				$scope.auth.$createUser({
					email: mailAddress,
					password: password
				})
				.then(function(userData) {
					// Sign in
					return $scope.auth.$authWithPassword({
						email: mailAddress,
						password: password
					});
				})
				.then(function(authData) {
					
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_SUCCESS'));
$
					// Add data to user's node (is not 'account'-node!)
					User.addToUsersNode(authData.uid, authData.password.email, 'first name', 'last name', created, 10, 'Abandoned Users', 36, 1, false, false);

					// Add data to companies-node
					User.addToCompaniesNode(authData.uid, authData.password.email, 'first name', 'last name', created, 10, 36, 'Abandoned Users');

					// Store each connection instance separately, since multiple devices or browser tabs could be connected
					// Any time that connectionsRef's value is null (i.e. has no children), user is logged out
					// Entry in user's database entry
					var userConnectionsRef = new Firebase('https://moovery.firebaseio.com/users/' + authData.uid + '/connections');

					// Entry in 'connections'-property of database
					// = This is a list of all users currently connected
					var generalConnectionsRef = new Firebase('https://moovery.firebaseio.com/connected');

					// Stores the timestamp of last disconnect (the last time user was seen online)
					var lastOnlineRef = new Firebase('https://moovery.firebaseio.com/users/' + authData.uid + '/data/lastOnline');
					var connectedRef = new Firebase('https://moovery.firebaseio.com/.info/connected');

					connectedRef.on('value', function(snap) {
							
						if (snap.val() === true) {
							// We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
							// add this device to my connections list
							// this value could contain info about the device or a timestamp too
								
							// Add device to list user's database entry
							var userConnection = userConnectionsRef.push(true);

							// Add device to general database entry (=list of all currently connected users)
							var generalConnection = generalConnectionsRef.push({'mobile': authData.uid});

							// When user disconnects, remove this device
							userConnection.onDisconnect().remove();
							generalConnection.onDisconnect().remove();

							// When user disconnects, update the last time he or she was seen online
							lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
						}
					});

					// Get data of a user
					// = Data from users' node, NOT account
					User.getData(authData.uid, function(data){
                        $ionicLoading.hide();
						$rootScope.userId = authData.uid;
						$rootScope.userData = data.val();
						$state.go('tabs.home');
					});
				})
				.catch(function(error) {
					$ionicLoading.hide();
					switch (error.code) {
						case 'EMAIL_TAKEN':
							ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_TAKEN_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_TAKEN_CONTENT_1') + mailAddress + $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_TAKEN_CONTENT_2'));
							break;
						case 'INVALID_EMAIL':
							ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_1') + mailAddress + $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_2'));
							break;
						case 'NETWORK_ERROR':
							ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_CONTENT'));
							break;
					default:
						ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_CONTENT'));
					}
					
				});
			} 
		});		
	};
});

App.controller('SignInCtrl', function($scope,$ionicLoading,$rootScope, $state, $ionicSideMenuDelegate, $translate, Authentication, ShowAlert, User) {
	
	// Disable toggling of left menu by swipe
	$ionicSideMenuDelegate.canDragContent(false);

	$scope.auth = Authentication.firebaseAuth();

	$scope.signIn = function(user, password) {
	    //show progress 
		$ionicLoading.show();
		// If no user defined, abandon
		// As send button is disabled before input, this should never trigger
		if (!user) {
			ShowAlert.alert($translate.instant('SIGN_IN_POPUP_NO_USERNAME_PROVIDED_TITLE'), $translate.instant('SIGN_IN_POPUP_NO_USERNAME_PROVIDED_CONTENT'));
			return false;
		}
		
		// If no password defined, abandon
		// As send button is disabled before input, this should never trigger
		if (!password) {
			ShowAlert.alert($translate.instant('SIGN_IN_POPUP_NO_PASSWORD_PROVIDED_TITLE'), $translate.instant('SIGN_IN_POPUP_NO_PASSWORD_PROVIDED_CONTENT'));
			return false;
		}

		$scope.auth.$authWithPassword({
			email 	 : user,
			password : password
		})
		.then(function(authData) {

			// Store each connection instance separately, since multiple devices or browser tabs could be connected
			// Any time that connectionsRef's value is null (i.e. has no children), user is logged out
			// Entry in user's database entry
			var userConnectionsRef = new Firebase('https://moovery.firebaseio.com/users/' + authData.uid + '/connections');

			// Entry in 'connections'-property of database
			// = This is a list of all users currently connected
			var generalConnectionsRef = new Firebase('https://moovery.firebaseio.com/connected');

			var lastOnlineRef = new Firebase('https://moovery.firebaseio.com/users/' + authData.uid + '/data/lastOnline');
			var connectedRef = new Firebase('https://moovery.firebaseio.com/.info/connected');

			// If device is connected
			connectedRef.on('value', function(snap) {
					
				// If there is a device
				if (snap.val() === true) {
					// We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
					// add this device to my connections list
					// this value could contain info about the device or a timestamp too
						
					// Add device to list user's database entry
					var userConnection = userConnectionsRef.push({'mobile': true});

					// Add device to general database entry (=list of all currently connected users)
					var generalConnection = generalConnectionsRef.push({'mobile': authData.uid});

					userConnection.onDisconnect().remove();
					generalConnection.onDisconnect().remove();
					lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
				}
			});

			// Get data of a user
			// = Data from users' node, NOT account
			User.getData(authData.uid, function(data){

			    $ionicLoading.hide();
				
				$rootScope.userId = authData.uid;
				$rootScope.userData = data.val();

				var settings = new Firebase('https://moovery.firebaseio.com/users/' + $rootScope.userId + '/data/settings');
				settings.on('value', function(exerciseData) {

					// If language is not undefined
					if(exerciseData.val().language !== undefined){
						$translate.use(exerciseData.val().language);
					}
				});
				$state.go('tabs.home');
			});
		})
		.catch(function(error) {
			$ionicLoading.hide();
			switch (error.code) {
				case 'INVALID_EMAIL':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_1') + user + $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_2'));
					break;
				case 'INVALID_PASSWORD':
					ShowAlert.alert($translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_PASSWORD_TITLE'), $translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_PASSWORD_CONTENT'));
					break;
				case 'INVALID_USER':
					ShowAlert.alert($translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_TITLE'), $translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_CONTENT'));
					break;
				case 'NETWORK_ERROR':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_CONTENT'));
					break;
				default:
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_CONTENT'));
			}
			
		});
	};
});

App.controller('ResetPasswordCtrl', function($scope, $ionicSideMenuDelegate, $ionicPopup, $translate, Authentication, ShowAlert) {

	$scope.auth = Authentication.firebaseAuth();

	// Disable toggling of left menu by swipe
	$ionicSideMenuDelegate.canDragContent(false);
	
	$scope.resetPassword = function() {
				
		// Reset password
		$scope.auth.$resetPassword({
			email: $scope.email
		})
		.then(function() {
			ShowAlert.alert($translate.instant('FORGOT_PASSWORD_POPUP_SUCCESS_TITLE'), $translate.instant('FORGOT_PASSWORD_POPUP_SUCCESS_CONTENT_1') + $scope.email + $translate.instant('FORGOT_PASSWORD_POPUP_SUCCESS_CONTENT_2'));
		})
		.catch(function(error) {
			switch (error.code) {
				case 'INVALID_EMAIL':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_1') + user + $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_2'));
					break;
				case 'INVALID_USER':
					ShowAlert.alert($translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_TITLE'), $translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_CONTENT'));
					break;
				case 'NETWORK_ERROR':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_CONTENT'));
					break;
				default:
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_CONTENT'));
			}	
		});
	};
});

// Change email functionality
App.controller('ChangeMailCtrl', function($scope,$ionicLoading, $translate, $state, Authentication, ShowAlert) {

	var ref = new Firebase('https://moovery.firebaseio.com');

	$scope.user = ref.getAuth();

	$scope.newMail = {};

	$scope.changeMail = function(){
      
	 $ionicLoading.show();
	
		var firebase = Authentication.url();
	
		firebase.changeEmail({
			oldEmail: $scope.user.password.email,
			newEmail: $scope.newMail.mail,
			password: $scope.newMail.confirmPassword
		}, function(error) {
             
			 //hide progress
			$ionicLoading.hide();
			// If failure
			if(error) {
				switch(error.code) {
					case "INVALID_PASSWORD":
						ShowAlert.alert($translate.instant('CHANGE_MAIL_POPUP_FAILURE_WRONG_PASSWORT_TITLE'), $translate.instant('CHANGE_MAIL_POPUP_FAILURE_WRONG_PASSWORT_CONTENT'));
					break;
					case "INVALID_USER":
						ShowAlert.alert($translate.instant('CHANGE_MAIL_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('CHANGE_MAIL_POPUP_FAILURE_DEFAULT_ERROR'));
					break;
					default:
						ShowAlert.alert($translate.instant('CHANGE_MAIL_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('CHANGE_MAIL_POPUP_FAILURE_DEFAULT_ERROR'));
				}
				
			}

			// If success
			else {
				ShowAlert.alert($translate.instant('CHANGE_MAIL_POPUP_SUCCESS_CHANGE_MAIL_TITLE'), $translate.instant('CHANGE_MAIL_POPUP_SUCCESS_CHANGE_MAIL_CONTENT'));
				$state.go('tabs.home');
			}
			
		});
	};
});

App.controller('ChangePasswordCtrl', function($scope,$ionicLoading,$translate, $state, Authentication, ShowAlert) {
	
	// Get user data
	$scope.auth = Authentication.firebaseAuth();
	$scope.user = $scope.auth.$getAuth();

	
	$scope.changePassword = function(oldPassword, newPassword){

	    $ionicLoading.show();
	
		$scope.auth.$changePassword({
			email: $scope.user.password.email,
			oldPassword: oldPassword,
			newPassword: newPassword
		})
		.then(function() {
			$ionicLoading.hide();
			ShowAlert.alert($translate.instant('CHANGE_PASSWORD_POPUP_SUCCESS_CHANGE_MAIL_TITLE'), $translate.instant('CHANGE_PASSWORD_POPUP_SUCCESS_CHANGE_MAIL_CONTENT'));
		    $state.go('tabs.home');
			
		})
		.catch(function(error) {
			
			$ionicLoading.hide();
			
			switch(error.code) {
				case 'INVALID_EMAIL':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_1') + user + $translate.instant('SIGN_UP_POPUP_FAILURE_EMAIL_INVALID_CONTENT_2'));
					break;
				case 'INVALID_PASSWORD':
					ShowAlert.alert($translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_PASSWORD_TITLE'), $translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_PASSWORD_CONTENT'));
					break;
				case 'INVALID_USER':
					ShowAlert.alert($translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_TITLE'), $translate.instant('SIGN_IN_POPUP_FAILURE_INVALID_USER_CONTENT'));
					break;
				case 'NETWORK_ERROR':
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_NETWORK_ERROR_CONTENT'));
					break;
				default:
					ShowAlert.alert($translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_TITLE'), $translate.instant('SIGN_UP_POPUP_FAILURE_DEFAULT_CONTENT'));
			}
			
		});
	};
});

App.controller('SignOutCtrl', function($scope, $state, Authentication) {

	$scope.auth = Authentication.firebaseAuth();

	$scope.logout = function() {

		$scope.auth.$unauth();
		$state.go('signin');

		// Manually disconnect from database
		// Firebase.goOffline();
	};
});

App.factory('User', function ($firebaseArray) {
	
	var user = {};
	var url = new Firebase('https://moovery.firebaseio.com');

	// Returns new Firebase instance with URL
	user.url = function() {
		return url;
	};

	// Adds user to users' node
	// This is just for listing users etc, it's NOT the actual account that enables login (partner of makeAccount)
	user.addToUsersNode = function(uid, mail, firstname, lastname, created, role, companyName, companyId, planDay, autoPlay, playWithAudio){
		
		var data = {};
		data.mail = mail;
		data.firstname = firstname;
		data.lastname = lastname;				
		data.created = 	created;	
		data.provider = 'mail';			
		data.role = role;				
		data.active = true;	
		data.company = companyName;				
		data.companyId = companyId;
		data.account = 'company';
		data.planDay = planDay;
		data.settings = {};
		data.settings.autoPlay = autoPlay;
		data.settings.playWithAudio = playWithAudio;
						
		return url.child('users').child(uid).child('data').setWithPriority(data, data.mail);
	};

	// Adds user to companies' node
	// Every company-node has a sub-node with all users that belong to company
	user.addToCompaniesNode = function(uid, mail, firstname, lastname, created, role, companyId, companyName){
		
		var data = {};
		data.mail = mail;
		data.firstname = firstname;
		data.lastname = lastname;
		data.created = 	created;
		data.provider = 'mail';	
		data.role = 	role;	
		data.active = true;
		data.company = companyName;				
		data.companyId = companyId;
		data.account = 'company';

		return url.child('companies').child(companyId).child('users').child('data').child(uid).child('data').setWithPriority(data, data.mail);
	};

	// Get data of a user
	// = Data from users' node, NOT account
	user.getData = function(uid, success){
		url.child('users').child(uid).on('value', success);
	};

	// Get company data of a user
	// = Data from user's company node
	user.getCompanyData = function(uid, success){
		url.child('users').child(uid).on('value', success);
	};

	return user;
});