AngularApp.config(['$stateProvider', function ($stateProvider) {
	$stateProvider.state({
		name: 'App.Generate',
		url: '/Generate',
		templateUrl: '/Html/App/Generate/Generate.html?' + version,
		controller: "GenerateController"
	});
}]);
AngularApp.controller('GenerateController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
	$scope.HelperService = HelperService;
	$scope.Settings = {};

	$scope.Words = {};

	$http.post("/Api/Generate/GetWords", {}).success(function (data) {
		$scope.Words = data;
	}).error(function (data) { HelperService.ErrorHandler(data.Message) });



	$scope.BoostWord = function (word) {
		var wordListIndex = $scope.Words[word.Category].indexOf(word);
		
		if (wordListIndex < 21) {
			$scope.Words[word.Category].splice(wordListIndex, 1);
			$scope.Words[word.Category].splice(0, 0, word);
			word.WordIndex = $scope.Words[word.Category][1].WordIndex - 1;
		} else {
			$scope.Words[word.Category].splice(wordListIndex, 1);
			wordListIndex -= 20;
			$scope.Words[word.Category].splice(wordListIndex, 0, word);

			word.WordIndex = ($scope.Words[word.Category][wordListIndex - 1].WordIndex + $scope.Words[word.Category][wordListIndex + 1].WordIndex) / 2;
		}
		
		$http.post("/Api/Generate/BoostWord", { wordId: word.Id,  wordIndex:word.WordIndex}).error(function (data) { HelperService.ErrorHandler(data.Message) });

	};
	
	$scope.PlaceInGeneratedLessons = function () {
		$http.post("/Api/Generate/PlaceInGeneratedLessons", { }).error(function (data) { HelperService.ErrorHandler(data.Message) });
	};

	$scope.Round = function (number) {
			number = Math.round(number * 100) / 100;
			number = number + "";
			
			var decimalIndex = number.indexOf(".");
			if (decimalIndex == -1) {
				return number;
			}
			if ((number + "").length - decimalIndex > 1) {
			
				number = (number + "").substring(0, decimalIndex + 3);
			}
			return number;
		
	};

}]);
