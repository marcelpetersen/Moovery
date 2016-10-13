var App = angular.module('ionicApp');

App.controller('PlanController', function($scope, $rootScope, $translate, $state) {

	// Holds user's current day in plan
	// Starts with 1, every finished day is one number higher
	var planIndex = $rootScope.userData.data.planDay;

	var currentWeek;
	var currentDay;

	function getWeekOfPlan(planIndex){
		if(planIndex < 6){
			currentWeek = 1;
		}
		else if(planIndex < 11){
			currentWeek = 2;
		}
		else if(planIndex < 16){
			currentWeek = 3;
		}
		else if(planIndex < 21){
			currentWeek = 4;
		}
		else if(planIndex < 26){
			currentWeek = 5;
		}
		else if(planIndex < 31){
			currentWeek = 6;
		}
		else if(planIndex < 36){
			currentWeek = 7;
		}
		else if(planIndex < 41){
			currentWeek = 8;
		}
		else if(planIndex < 46){
			currentWeek = 9;
		}
		else if(planIndex < 51){
			currentWeek = 10;
		}
		else if(planIndex < 56){
			currentWeek = 11;
		}
		else if(planIndex < 61){
			currentWeek = 12;
		}
	}

	// Get day of week in user's plan (Monday = 1, Tuesday = 2 etc)
	function getDayOfPlan(planIndex){
		currentDay = planIndex - (currentWeek - 1) * 5;
	}

	function getProgressValues(planIndex) {
		$scope.progressBarValue = planIndex - (Math.ceil(currentWeek / 4) - 1) * 20 - 1;
		$scope.daysLeft = 20 - $scope.progressBarValue;

		if($scope.daysLeft > 1){
			$scope.daysLeftText = $translate.instant('PLAN_DAYS_LEFT_MULTIPLE');
		}
		else {
			$scope.daysLeftText = $translate.instant('PLAN_DAYS_LEFT_SINGLE');
		}
	}

	function predictCurrentTraining(callback){
		getWeekOfPlan(planIndex);
		getDayOfPlan(planIndex);
		getProgressValues(planIndex);
		callback(currentWeek, currentDay);
	}

	predictCurrentTraining(getExerciseData);

	function getExerciseData(currentWeek, currentDay){

		var exercises = new Firebase('https://moovery.firebaseio.com/exercises/week/' + currentWeek + '/day/' + currentDay + '/exercise/');
		exercises.on('value', function(exerciseData) {
			$scope.exerciseData = exerciseData.val();
			$scope.planTitle = exerciseData.val()[0].planTitle;
			$scope.planDescription = exerciseData.val()[0].planDescription;
		});
	}
		
	$scope.goToExercise = function(){
		if($scope.showWelcomeToPlanMessage){
			setShowWelcomeMessageFalse();
		}
		else {
			$state.go('tabs.exercise', { exerciseData: $scope.exerciseData });	
		}
	};

	if(planIndex === 1){
		showWelcomeMessage('PLAN_WELCOME_TO_PLAN_M1');
	}
	else if(planIndex === 21){
		showWelcomeMessage('PLAN_WELCOME_TO_PLAN_M2');
	}
	else if(planIndex === 41){
		showWelcomeMessage('PLAN_WELCOME_TO_PLAN_M3');
	}

	// Function to set $scope.showWelcomeToPlanMessage to false and change view
	function setShowWelcomeMessageFalse(){
		$scope.showWelcomeToPlanMessage = false;
	}

	// Function to show a welcome message when user is on first day of plan
	function showWelcomeMessage(translateCode){
		$scope.showWelcomeToPlanMessage = true;
		$scope.welcomeMessageHeadline = translateCode + '_HEADLINE';
		$scope.welcomeMessageText = translateCode + '_TEXT';
	}
});