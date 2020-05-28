AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'App.Create',
        url: '/Create',
        templateUrl: '/Html/App/Create/Create.html?' + version,
        controller: "CreateController",
        params: { lessonId: null }
    });
    $stateProvider.state({
    	name: 'App.Create.Lesson',
    	url: '/{lessonId}'
    });
}]);
AngularApp.controller('CreateController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
    $scope.HelperService = HelperService;
    $scope.Settings = {};
	
    $scope.Lessons = [];
    for (var i = 0; i < 400; i++) {
    	$scope.Lessons.push(i + 1);
    }

    $scope.UseWord = function (word, wordType) {
    	var wordIndex = $scope.Settings.UsingWords[wordType].indexOf(word);
    	if (wordIndex > -1) {
    		$scope.Settings.UsingWords[wordType].splice(wordIndex, 1);
    	} else {
    		$scope.Settings.UsingWords[wordType].push(word);
    	}
    };

	

    $scope.SetLesson = function (lessonId) {
    	if (lessonId == null) {
    		HelperService.Navigate("App/Create");
    		$scope.Settings.LessonTemplate = null;
    	} else {
    		HelperService.Navigate("App/Create/" + lessonId);

    		$http.post("/Api/Create/GetLessonTemplate", { lessonNumber: lessonId }).success(function (data) {
    			$scope.Settings.LessonTemplate = data;

    			$scope.Settings.RemainingPhrases = 180 - $scope.Settings.LessonTemplate.Phrases.length;

    			$scope.Settings.UsingWords = {
    				"Noun": [],
    				"Verb": [],
    				"Adjective": [],
    				"Core": []
    			};
    		}).error(function (data) { HelperService.ErrorHandler(data.Message) });
    	}
    };

    $scope.AddPhrase = function () {
    	if ($scope.Settings.NewPhrase != ""){
    		$scope.Settings.LessonTemplate.Phrases.push($scope.Settings.NewPhrase);
    		$scope.Settings.NewPhrase = "";
    		$scope.Settings.RemainingPhrases -= 1;
    	}
    	for (wordType in $scope.Settings.UsingWords) {
			var words = $scope.Settings.UsingWords[wordType];
    		for (var i = 0; i < words.length; i++) {
    			$scope.Settings.LessonTemplate.RemainingWords[wordType].splice($scope.Settings.LessonTemplate.RemainingWords[wordType].indexOf(words[i]), 1);
    		}

    		for (var i = 0; i < $scope.Settings.LessonTemplate.RemainingWords[wordType].length; i++) {
    			var word = $scope.Settings.LessonTemplate.RemainingWords[wordType][i];
    			$scope.Settings.LessonTemplate.RemainingWords[wordType].splice(i, 1);
    			var newIndex = Math.floor((Math.random() * $scope.Settings.LessonTemplate.RemainingWords[wordType].length) + 1);
    			$scope.Settings.LessonTemplate.RemainingWords[wordType].splice(newIndex, 0, word);
    		}
    	}

    	$scope.Settings.UsingWords = {
    		"Noun": [],
    		"Verb": [],
    		"Adjective": [],
    		"Core": []
    	};    	
    };

    $scope.Settings.SaveState = "Save";
    $scope.SaveTemplate = function () {
    	if ($scope.Settings.SaveState == "Save") {
    		$scope.Settings.SaveState = "Saving";
    		console.log(JSON.stringify($scope.Settings.LessonTemplate));
    		$http.post("/Api/Create/SaveLessonTemplateJson", { lessonTemplate: JSON.stringify($scope.Settings.LessonTemplate) }).success(function (data) {
    			$scope.Settings.SaveState = "Save";
    		}).error(function (data) {
    			$scope.Settings.SaveState = "Save";
    			HelperService.ErrorHandler(data.Message)
    		});
    	}
    };

    if ($stateParams["lessonId"] != null) {
    	$scope.SetLesson($stateParams["lessonId"]);
    }
	
    $scope.Round = function (number) {
    	number = Math.round(number * 100) / 100;
    	number = number + "";
    	var decimalIndex = number.indexOf(".");
    	number = (number + "").substring(0, decimalIndex + 3);
    	return number;
    };

}]);
