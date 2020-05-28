AngularApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state({
        name: 'Home',
        url: '/Home',
        templateUrl: '/Html/Home/Home.html?' + version
    });
    $stateProvider.state({
        name: 'App',
        url: '/App',
        templateUrl: '/Html/App/Index.html?' + version,
		abstract:true
    });

    $urlRouterProvider.otherwise('/Home');
}]);


AngularApp.controller('AngularParentController', ['$scope', '$http', 'HelperService', 'UserService', function ($scope, $http, HelperService, UserService) {
	$scope.UserService = UserService;
	UserService.GetCurrentUser();
    $scope.HelperService = HelperService;
}]);