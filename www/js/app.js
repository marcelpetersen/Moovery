var App = angular.module('ionicApp', ['ionic','ionic.service.core', 'ionic.service.analytics', 'firebase', 'ngCordova', 'pascalprecht.translate', 'com.2fdevs.videogular', 'com.2fdevs.videogular.plugins.poster'])

.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider

	.state('signup', {
		url: '/sign-up',
		templateUrl: 'templates/sign-up.html',
		controller: 'SignUpCtrl',
		cache : false
	})
	.state('signin', {
		url: '/sign-in',
		templateUrl: 'templates/sign-in.html',
		controller: 'SignInCtrl',
		cache : false
	})
	.state('forgotpassword', {
		url: '/forgot-password',
		templateUrl: 'templates/forgot-password.html',
		controller: 'ResetPasswordCtrl'
	})
	.state('tabs', {
		url: "/tab",
		abstract: true,
		templateUrl: "templates/tabs.html"
	})
	.state('tabs.home', {
		url: "/home",
		views: {
			'home-tab': {
				templateUrl: "templates/home.html",
				controller: 'NavCtrl'
			}
		},
		cache : false
	})
	.state('tabs.plan', {
		url: "/plan",
		views: {
			'home-tab': {
				templateUrl: "templates/plan.html",
			}
		},
		cache : false
	})
	.state('tabs.exercise', {
		url: "/exercise",
		views: {
			'home-tab': {
				templateUrl: "templates/exercise.html",
			}
		},
		params: {exerciseData: null, index: null},
		cache : false
	})
	.state('tabs.instantarea', {
		url: "/instant",
		views: {
			'home-tab': {
				templateUrl: "templates/instant-area.html"
			}
		}
	})
	.state('tabs.instantarea_neck', {
		url: "/neck-and-back",
		views: {
			'home-tab': {
				templateUrl: "templates/neck-and-back.html"
			}
		}
	})
	.state('tabs.instantarea_arms', {
		url: "/arms",
		views: {
			'home-tab': {
				templateUrl: "templates/arms.html"
			}
		}
	})
	.state('tabs.instantarea_trunk', {
		url: "/trunk",
		views: {
			'home-tab': {
				templateUrl: "templates/trunk.html"
			}
		}
	})
	.state('tabs.instantarea_legs', {
		url: "/legs",
		views: {
			'home-tab': {
				templateUrl: "templates/legs.html"
			}
		}
	})
	.state('tabs.settings', {
		url: "/settings",
		views: {
			'home-tab': {
				templateUrl: "templates/settings.html"
			}
		}
	})
	.state('tabs.company', {
		url: "/company",
		views: {
			'home-tab': {
				templateUrl: "templates/company.html"
			}
		}
	})
	.state('tabs.contact', {
		url: "/contact",
		views: {
			'home-tab': {
				templateUrl: "templates/contact.html"
			}
		}
	})
	.state('tabs.change-mail', {
		url: "/change-mail",
		views: {
			'home-tab': {
				templateUrl: "templates/change-mail.html",
				controller: 'ChangeMailCtrl'
			}
		},
		cache : false
	})
	.state('tabs.change-password', {
		url: "/change-password",
		views: {
			'home-tab': {
				templateUrl: "templates/change-password.html",
				controller: 'ChangePasswordCtrl'
			}
		},
		cache : false
	})
	.state('tabs.setup', {
		url: "/setup",
		views: {
			'home-tab': {
				templateUrl: "templates/setup.html"
			}
		}
	})
	.state('tabs.about', {
		url: "/about",
		views: {
			'home-tab': {
				templateUrl: "templates/about.html"
			}
		}
	})
	.state('tabs.sign-out', {
		url: "/sign-out",
		views: {
			'home-tab': {
				templateUrl: "templates/sign-out.html",
				controller: 'SignOutCtrl'
			}
		}
	});

	$urlRouterProvider.otherwise('/sign-in');

})

// Set current state (used for displaying settings & toggling settings by swiping)
.run(function ($state,$rootScope,$ionicPlatform) {
	$rootScope.$state = $state;
	$ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

