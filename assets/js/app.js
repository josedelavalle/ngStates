var app = angular.module('myApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);
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

app.factory('appFactory', function($http) {
	return {
		getStates: function () {
            return $http.get('./assets/json/states.json');
        },
        getStateData: function(thisState) {
			return $http.get('./assets/json/' + thisState + '.json');
        },
        getPhotos: function(page_num, lat, lon) {
            var flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
            return $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&per_page=12&page='+page_num+'&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon);
        },
		getStreetView: function (lat, lon, thisDate) {
			//var thisURL = 'https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=' + thisDate + '&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA';
			// var thisURL = "https://maps.googleapis.com/maps/api/staticmap?lon=58.76&lon=-156.83&zoom=13&size=600x300&maptype=roadmap&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s";
			var thisURL = "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=46.414382,10.013988&heading=151.78&pitch=-0.76&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s"
			console.log(thisURL);
			return $http.get(thisURL);
			// return $http.get('https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=2014-02-01&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
        }
	};
});


app.controller("appController", ['$scope', 'appFactory', function($scope, appFactory) {

	$scope.headerTitle = "Jose DeLavalle";
  	appFactory.getStates().then(function (msg) {

        $scope.states = msg.data;
        //console.log($scope.states);
    });
}]);

app.controller('modalController', ['$scope', '$uibModalInstance', 'items', 'currentIndex', function($scope, $uibModalInstance, items, currentIndex) {
		console.log('modal controller', items, currentIndex);
		$scope.items = items;
		$scope.currentIndex = currentIndex;

		$scope.cancel = function () {
			$uibModalInstance.dismiss();
		};

		$scope.goNext = function(e) {
			e.stopPropagation();
			$scope.currentIndex++;
			if ($scope.currentIndex >= $scope.items.length) {
				$scope.currentIndex = 0;
			}
			console.log(e, $scope.currentIndex);
		};
		$scope.goPrev = function(e) {
			e.stopPropagation();
			$scope.currentIndex--;
			if ($scope.currentIndex < 0) {
				$scope.currentIndex = $scope.items.length - 1;
			}
			console.log(e, $scope.currentIndex);
		};

		$scope.$on('more-clicked', function() {
			console.log('more clicked event heard')
			$scope.cancel();
		});
	}]);

app.controller("detailController", ['$scope', '$location', '$filter', 'appFactory', '$uibModal', function($scope, $location, $filter, appFactory, $uibModal) {
	$scope.imagery = {};
	$scope.headerTitle = "Go Back";
	var states;
	thisState = $location.search().s;

	appFactory.getStates().then(function (msg) {
	    states = msg.data;
	    //console.log('got state details', msg.data, thisState)
	  
	    var x = states.findIndex(x => x.abbreviation === thisState);
	    $scope.state = states[x];
	    //console.log('this state ' + thisState, $scope.state, x)
	    appFactory.getStateData(thisState).then(function (msg) {
	    	console.log('got details', msg);
	        $scope.stateDetails = msg.data;
	        $scope.stateDetails.forEach(function(item) {
	        	item.fav = false;
	        });
	    });

		setupPaging(x);
		// console.log(x + ' ' + $scope.nextState + ' ' + $scope.prevState);
	});

	var setupPaging = function(x) {
		if (x===0) {
			$scope.nextState = states[x+1].abbreviation;
			$scope.prevState = states[states.length - 1].abbreviation;
		} else if(x==states.length -1) {
			$scope.nextState = states[0].abbreviation;
			$scope.prevState = states[x-1].abbreviation;
		} else {
			$scope.nextState = states[x+1].abbreviation;
			$scope.prevState = states[x-1].abbreviation;
		}
	}

	$scope.favorite = function(item) {
		item.fav = !item.fav;
		console.log(item);
	};

	$scope.getPhotos = function(item) {
		var page_num = 1;
		var lat = item.primary_latitude;
		var lon = item.primary_longitude;

		appFactory.getPhotos(page_num, lat, lon).then(function(res) {
			item.ndx = 0;
			console.log('got photos from ' + lat + ',' + lon, res);
			item.photos = res.data.photos;
			if (item.photos.photo.length == 0) {
				item.photos = null;
				item.nophotos = true;
			}
			console.log('item', item);
		}).catch(function(e) {
			console.log('error getting photos', e);
		});
	};
	$scope.ndx = 0;
	$scope.goNext = function(item) {
		if (!item.photos) return null;
		item.ndx++;
		if (item.ndx >= item.photos.photo.length) item.ndx = 0;
	};
	$scope.goPrev = function(item) {
		if (!item.photos) return null;
		item.ndx--;
		if (item.ndx <= 0) item.ndx = item.photos.photo.length - 1;
	};

	$scope.openModal = function(item) {
		var modalInstance = $uibModal.open({
      		  templateUrl: '/partials/modal.html',
		      controller: 'modalController',
		      windowClass: 'large-Modal',
		      resolve: {
		        items: function () {
		          return item.photos.photo;
		        },
		        currentIndex: function () {
		        	return item.ndx;
		        }
		      }
			});
	}
  	$scope.getStreetView = function(item) {
  		console.log('get photos', item);
  		appFactory.getStreetView(item.primary_latitude, item.primary_longitude).then(function(res) {
  			console.log('got imagery', res);
  			item.streetview = res.data;
  		}).catch(function(e) {
  			console.log('error getting imagery', e);
  		});
  	};

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

	$scope.getLocation = function(item) {
		var lat = item.primary_latitude;
		var lon = item.primary_longitude;
		var ndx = item.name;
		item.clicked = true;
		url = "https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lon+"&zoom=11&size=400x400&key=AIzaSyBy34i8mK7IXxcAqmZfOEX70XZtNEt7D7s";
		$scope.imagery[ndx] = url;


	};
}]);

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
