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

  //$scope.states = ["Alabama", "Alaska", "Arizona", "Arkansas", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
	$scope.headerTitle = "Jose DeLavalle";
  getStates.get().then(function (msg) {

        $scope.states = msg.data;
        console.log($scope.states);
    });
}]);

app.controller("detailController", ['$scope', '$location', 'getStates', 'getStateData', function($scope, $location, getStates, getStateData) {
	$scope.headerTitle = "Go Back";
  //$scope.states = ["Alabama", "Alaska", "Arizona", "Arkansas", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  $scope.thisState = $location.search().s;

  getStates.get().then(function (msg) {

        $scope.states = msg.data;
        console.log($scope.states);
        for (x = 0; x < $scope.states.length; x++) {
          if($scope.thisState == $scope.states[x].abbreviation) {
            console.log("here - " + $scope.states[x].abbreviation)
            $scope.stateImage = $scope.states[x].image;
						$scope.stateFullName = $scope.states[x].name;
						// the file name contains the text description so format text for readability (remove path and extension, replace hyphens with spaces)
						$scope.stateImageText = $scope.stateImage.replace(/^.*[\\\/]/, '').replace(/-/g, ' ').replace('.jpg','').toUpperCase().replace($scope.stateFullName.toUpperCase(), "");

          }
        }
    });

  $scope.thisState = $location.search().s;

  getStateData.get($scope.thisState).then(function (msg) {

        $scope.stateDetails = msg.data;
        console.log($scope.stateDetails);
    });


  // getImages.get().then(function (msg) {
  //
  //       $scope.details = msg.data;
  //       console.log($scope.details);
  //   });
}]);
app.factory('getStates', function ($http) {
    return {
        get: function () {
            console.log("inside function");
            return $http.get('./assets/states.json');
        }
    };
});
app.factory('getImages', function ($http) {
    return {
        get: function () {
            console.log("inside function");
            return $http.get('https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&format=json&search=italy&namespace=0');
        }
    };
});

app.factory('getStateData', function ($http) {
    return {
        get: function (thisState) {
            console.log("inside function");
            return $http.get('http://api.sba.gov/geodata/county_links_for_state_of/' + thisState + '.json');
        }
    };
});
