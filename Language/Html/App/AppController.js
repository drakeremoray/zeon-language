AngularApp.config(['$stateProvider', function ($stateProvider) {
	$stateProvider.state({
		name: 'App.Index',
		url: '',
		templateUrl: '/Html/App/App.html?' + version,
		controller: "AppController"
	});
}]);
AngularApp.controller('AppController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
	$scope.HelperService = HelperService;
	$scope.Settings = {};

	console.log($stateParams);
	//Set current language as the url
	//Set current language object

}]);
