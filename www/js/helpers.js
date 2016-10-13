var App = angular.module('ionicApp');

App.factory("ShowAlert", function($ionicPopup) {
	return {

		// Shows an alert with ok-button
		alert: function(title, content){
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: content,
				okType: 'button-balanced'
			});
		},

		// Shows an alert with ok and cancel button
		confirm: function(title, content, cancelText, okText){
			var confirmPopup = $ionicPopup.confirm({
				title: title,
				template: content,
				cancelText: cancelText,
				okText: okText,
				okType: 'button-balanced'
			});
			return confirmPopup;
		}
	};
});

// E-Mail validation service
App.directive('overwriteEmail', function() {
	var EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	return {
		require: 'ngModel',
		restrict: '',
		link: function(scope, elm, attrs, ctrl) {

			// only apply the validator if ngModel is present and Angular has added the email validator
			if (ctrl && ctrl.$validators.email) {

				// this will overwrite the default Angular email validator
				ctrl.$validators.email = function(modelValue) {
					return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
				};
			}
		}
	};
});

// Input-match service
App.directive('match', function($parse) {
	return {
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {
			scope.$watch(function() {        
				return $parse(attrs.match)(scope) === ctrl.$modelValue;
			}, 
			function(currentValue) {
				ctrl.$setValidity('mismatch', currentValue);
			});
		}
	};
});

// Translation service
App.config(['$translateProvider', function ($translateProvider) {

	// Automatically detect preferred language if browser
	$translateProvider.determinePreferredLanguage();
	$translateProvider.fallbackLanguage("en");

	// Use variables from language js-files
	$translateProvider.translations('en', translation_en);
	$translateProvider.translations('de', translation_de);
}]);

// Translation: Automatically detect preferred language if mobile device
App.run(function($ionicPlatform, $translate) {
	$ionicPlatform.ready(function() {

		if(typeof navigator.globalization !== "undefined") {
			navigator.globalization.getPreferredLanguage(function(language) {
				$translate.use((language.value).split("-")[0])
				.then(function(data) {
					console.log("SUCCESS -> " + data);
				}, 
				function(error) {
					console.log("ERROR -> " + error);
				});
			}, null);
		}
	});
});

// Enable swipe + toggle for navigation menu
App.controller('NavCtrl', function($scope, $ionicSideMenuDelegate) {
	
	// Enable toggling left menu
	$scope.showMenu = function () {
		$ionicSideMenuDelegate.toggleLeft();
	};

	// Enable swipe for left menu
	$ionicSideMenuDelegate.canDragContent(true);
	
});

App.controller('languageSelectCtlr', function($scope, $translate, $rootScope){
	
	$scope.changeLanguage = function(){
		$translate.use($scope.languageSelectModel);

		// Update in database
		var settings = new Firebase('https://moovery.firebaseio.com/users/' + $rootScope.userId + '/data/settings');
		settings.update({
			language: $scope.languageSelectModel 
		});
	};
});

App.controller('SettingsController', function($scope, $translate) {
	
	var value=false;
	
	if($translate.use() === 'en' ){
		$scope.languageSelectModel = 'en';
	}
	else {
		$scope.languageSelectModel = 'de';
	}
	 
	$scope.NotificationtoggleChange=function(){
	if(value==false)
	{
		value=true;
	}else{
		value=false;
	}
	$scope.isEnableNotification=value;
	};
	
	
});