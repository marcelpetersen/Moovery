var App = angular.module('ionicApp');

// Controller for videos + exercise progress bars
App.controller('ExerciseController', function($scope, $rootScope, $interval, $timeout, $cordovaMedia, $stateParams, $ionicHistory, $ionicNavBarDelegate, $translate, $state, $sce,$ionicScrollDelegate) {

	// Holds all data of exercises
	var exerciseData = $stateParams.exerciseData;

	// If user came from 'Instant exercise'-area, index of the exercise is saved here
	var index = $stateParams.index;

	// If user comes from 'Instant exercise'-area, exerciseData consists just of a single exercise
	if(index !== null){
		exerciseData = [$stateParams.exerciseData[index]];
	}

	$scope.data = _.each(exerciseData, function(exercise, index){
		exercise.exerciseVideo = 'videos/exercises/' + exercise.exerciseVideo;
		exercise.introVideo = 'videos/exercises/' + exercise.introVideo;
		exercise.outroVideo = 'videos/exercises/' + exercise.outroVideo;
	});

	/*------------------------------------*\
	#  PLAY FUNCTIONS
	\*------------------------------------*/

	var introDone = false;
	var exerciseDone = false;
	var outroDone = false;
	var i = 0;

	function playIntro(){
		$scope.video = {sources: [{src: $scope.data[i].introVideo, type: 'video/mp4'}]};
		$scope.textDescription = $scope.data[i].introDescription;
		introDone = true;
	}

	function playExercise(){
		$scope.video = {sources: [{src: $scope.data[i].exerciseVideo, type: 'video/mp4'}]};
		$scope.textDescription = 'EXERCISE_DO_EXERCISE_NOW';
		exerciseDone = true;
		$scope.showFinishedButton = true;	
	}

	function playOutro(){
		$scope.video = {sources: [{src: $scope.data[i].outroVideo, type: 'video/mp4'}]};
		$scope.textDescription = $scope.data[i].outroDescription;
		outroDone = true;
		$scope.showFinishedButton = true;
	}

	$scope.playManually = function(){

		if(introDone === false){
			playIntro();
		}
		else if(exerciseDone === false){
			playExercise();
		}
		 $ionicScrollDelegate.scrollTop();
	};

	$scope.finishedExerciseManually = function(){

		// If there are exercises left
		if(i < $scope.data.length - 1 ){
			introDone = false;
			exerciseDone = false;

			if(outroDone === false){
				playOutro();
			}

			else {
				$scope.showFinishedButton = false;
				outroDone = false;
				i = i + 1;
				playIntro();
			}
		}
			
		// If there are no exercises left
		else {
			
			// If users did multiple exercises from plan
			if(index === null){

				// Indicate that exercises have been finished = show finished page
				$scope.exercisesFinished = true;

				// Set message after exercise has been finished
				$scope.successHeadline = exerciseData[0].successHeadline;
				$scope.successMessage = exerciseData[0].successMessage;
			}

			// If user did single exercise from 'Instant exercise'-section
			else {
				$state.go('tabs.instantarea');	
			}
		}
		 $ionicScrollDelegate.scrollTop();
	};

	playIntro();
	
	/*------------------------------------*\
	#  SAVE FUNCTIONS
	\*------------------------------------*/

	$scope.saveResults = function(){

		var planDay = $rootScope.userData.data.planDay + 1;
		var exercisePath = new Firebase('https://moovery.firebaseio.com/users/' + $rootScope.userId + '/data/');

		exercisePath.update({
			planDay: planDay 
		});

		// Hide back button in next view
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true,
			historyRoot: true
		});

		$state.go('tabs.home');

		// Stores the timestamp of this training = last training
		var lastTrainingRef = new Firebase('https://moovery.firebaseio.com/users/' + $rootScope.userId + '/data');
		var lastTrainingCompanyRef = new Firebase('https://moovery.firebaseio.com/companies/' + $rootScope.userData.data.companyId + '/users/data/' + $rootScope.userId + '/data/');

		// One could add 'live'-users that are currently doing an exercise here
		//var connectedRef = new Firebase('https://moovery.firebaseio.com/live');

		// Save date of training in database
		lastTrainingRef.update({'lastTraining': Firebase.ServerValue.TIMESTAMP});
		lastTrainingCompanyRef.update({'lastTraining': Firebase.ServerValue.TIMESTAMP});
	};
});