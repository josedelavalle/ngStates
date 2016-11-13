var app = angular.module('myApp', ['ngRoute', 'ngAnimate']);
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){

	//ChartJsProvider.setOptions({ chartColors: myChartColors });
	$locationProvider.html5Mode(true);
	$routeProvider
   .when('/', {
    templateUrl: 'views/home.html',
    controller: 'appController'
  })
  .when('/1', {
    templateUrl: 'views/detail.html',
    controller: 'detailController'
  })
  .otherwise({
  	redirectTo: '/'
  });
}]);
app.controller("appController", ['$scope', 'getStates', function($scope, getStates) {

	$scope.headerTitle = "Jose DeLavalle";
  getStates.get().then(function (msg) {

        $scope.states = msg.data;
        console.log($scope.states);
    });
}]);

app.controller("detailController", ['$scope', '$location', 'getStates', 'getStateData', function($scope, $location, getStates, getStateData) {

	$scope.headerTitle = "Go Back";
  $scope.thisState = $location.search().s;

	$scope.icons = ["fa-globe","fa-map","fa-flag","fa-map-marker","fa-road"];
	switchState = function () {
		x = $scope.thisState;
		getStates.get().then(function (msg) {

	    $scope.states = msg.data;



	    $scope.stateImage = $scope.states[x].image;
			$scope.stateFullName = $scope.states[x].name;
			// the file name contains the text description so format text for readability (remove path and extension, replace hyphens with spaces)
			//$scope.stateImageText = $scope.stateImage.replace(/^.*[\\\/]/, '').replace(/-/g, ' ').replace('.jpg','').toUpperCase().replace($scope.stateFullName.toUpperCase(), "");
			$scope.stateImageText = $scope.states[x].imagetext;


		});
  };
	$scope.goForward = function() {
		if($scope.thisState == $scope.states.length - 1) {
			$scope.thisState = 0;
		} else {
			$scope.thisState++;
		}
		$scope.thisAbbreviation = $scope.states[$scope.thisState].abbreviation;
		goGetStateData();

	};
	$scope.goBack = function() {
		if($scope.thisState == 0) {
			$scope.thisState = $scope.states.length - 1;
		} else {
			$scope.thisState--;
		}
		$scope.thisAbbreviation = $scope.states[$scope.thisState].abbreviation;
		goGetStateData();
	};
  //$scope.thisState = $location.search().s;
	goGetStateData = function() {
		switchState();
	  getStateData.get($scope.thisAbbreviation).then(function (msg) {

	        $scope.stateDetails = msg.data;
	        console.log($scope.stateDetails);
	    });
	};
	goGetStateData();
}]);

app.factory('getStates', function ($http) {
    return {
        get: function () {
            console.log("inside function");
            return $http.get('./assets/json/states.json');
        }
    };
});

app.factory('getStateData', function ($http) {
    return {
        get: function (thisState) {
            return $http.get('./assets/json/' + thisState + '.json');
        }
    };
});
