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
        //console.log($scope.states);
    });
}]);

app.controller("detailController", ['$scope', '$location', '$filter', 'getStates', 'getStateData', 'getImagery', function($scope, $location, $filter, getStates, getStateData, getImagery) {
	$scope.imagery = {};
	$scope.headerTitle = "Go Back";
	thisState = $location.search().s;

	getStates.get().then(function (msg) {
	    $scope.states = msg.data;
	    
	    $scope.stateFullName = "State Not Found";
	    $scope.stateImageText = "You sneaky rascal... You entered an invalid state";
	    $scope.stateImage = "images/pic0" + Math.floor(Math.random() * 9) + ".jpg";
		for (x = 0, stateLen = $scope.states.length; x < stateLen; x++) {
			if (thisState == $scope.states[x].abbreviation) {
				$scope.stateFullName = $scope.states[x].name;
				$scope.stateImage = $scope.states[x].image;
				$scope.stateImageText = $scope.states[x].imagetext;
				getStateData.get(thisState).then(function (msg) {

			        $scope.stateDetails = msg.data;
			        
			        for (var x=0; x < $scope.stateDetails.length; x++) {
			        	$scope.stateDetails[x].clicked = false;
			        	$scope.stateDetails[x].showRemove = false;
			        	$scope.stateDetails[x].removed = false;
			        }
			    });
				break;
			}
		}

		if (x===0) {
			$scope.nextState = $scope.states[x+1].abbreviation;
			$scope.prevState = $scope.states[stateLen - 1].abbreviation;
		} else if(x==stateLen-1) {
			$scope.nextState = $scope.states[0].abbreviation;
			$scope.prevState = $scope.states[x-1].abbreviation;
		} else {
			$scope.nextState = $scope.states[x+1].abbreviation;
			$scope.prevState = $scope.states[x-1].abbreviation;
		}
		// console.log(x + ' ' + $scope.nextState + ' ' + $scope.prevState);
	});
  	
	$scope.icons = ["fa-globe","fa-map","fa-flag","fa-map-marker","fa-road"];
	
	function formatDate(thisdate) {
		return $filter('date')(thisdate,'yyyy-MM-dd');
	}

	$scope.removeMap = function(i) {
		$scope.stateDetails[i].showRemove = false;
		$scope.stateDetails[i].removed = true;
		$scope.stateDetails[i].url = null;
		$scope.$apply();
	};

	$scope.getAllLocations = function() {
		for (var x=0; x < $scope.stateDetails.length; x++) {
			$scope.stateDetails[x].showRemove=true;
			$scope.stateDetails[x].removed=false;
		}
		setTimeout(function() {
    		$('.pinned').click();
		}, 1);
		
	};

	$scope.getLocation = function(lat, lon, ndx) {

		url = "https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lon+"&zoom=11&size=400x400&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s";
		$scope.imagery[ndx] = url;


	};
}]);

app.factory('getStates', function ($http) {
    return {
        get: function () {

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

app.factory('getImagery', function ($http) {
    return {
        get: function (lat, lon, thisDate) {
						//var thisURL = 'https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=' + thisDate + '&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA';
						// var thisURL = "https://maps.googleapis.com/maps/api/staticmap?lon=58.76&lon=-156.83&zoom=13&size=600x300&maptype=roadmap&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s";
						var thisURL = "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=46.414382,10.013988&heading=151.78&pitch=-0.76&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s"
						console.log(thisURL);
            return $http.get(thisURL);
						// return $http.get('https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=2014-02-01&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
        }
    };
});

app.directive('animateOnChange', function($timeout) {
    return function(scope, element, attr) {
        scope.$watch(attr.animateOnChange, function(nv,ov) {
            if (nv!=ov) {
                element.addClass('changed');
                $timeout(function() {
                    element.removeClass('changed');
                }, 250);
            }
        });
    };
});
