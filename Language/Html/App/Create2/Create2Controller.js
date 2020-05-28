AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'App.Create2',
        url: '/Create2',
        templateUrl: '/Html/App/Create2/Create2.html?' + version,
        controller: "Create2Controller",
        params: { lessonId: null }
    });
    $stateProvider.state({
    	name: 'App.Create2.Lesson',
    	url: '/{lessonId}'
    });
}]);
AngularApp.controller('Create2Controller', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
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

    $scope.PhraseOffsets = {
    	Noun:[
			0,3,9,12,18,27,36,42,48,60,66,72
    	],
    	Adjective:[
			39,45,57,69
    	],
    	Verb:[6,15,24,33,54],
		Core:[21,30,51,63]
    };

    $scope.WordOffsets = {
    	Noun:[7, 13, 20, 28, 37, 47, 58, 70, 83],
    	Adjective:[7, 13, 20, 28, 37, 47, 58, 70, 83],
    	Verb:[7, 12, 17, 22, 27, 32, 38, 44, 50, 56, 62, 68, 75, 82],
		 Core:[7 ,12 , 17 , 22 , 27 , 32 , 37 , 42 , 47 , 52 , 57 , 62 , 67 , 72 , 77 , 82]
    };

    $scope.SetLesson = function (lessonId) {
    	if (lessonId == null) {
    		HelperService.Navigate("App/Create2");
    		$scope.Settings.LessonTemplate = null;
    	} else {
    		HelperService.Navigate("App/Create2/" + lessonId);
    		var haveGenerator = false;
    		if (window.AppInterface != null) {
    			var templateJson = window.AppInterface.ReadFile("Templates/" + lessonId + ".txt");
    			if (templateJson != "") {
    				$scope.ProcessTemplate(JSON.parse(templateJson), lessonId);
    				haveGenerator = true;
    			}
    		}
    		if (haveGenerator == false) {
    			$scope.DownloadTemplate(lessonId);
    		}
    	}
    };

    $scope.DownloadTemplate = function (lessonId, force) {
    	$http.post("/Api/Create/GetLessonTemplate", { lessonNumber: lessonId }).success(function (data) {

    		if (window.AppInterface != null) {
    			window.AppInterface.WriteFile("Templates/" + lessonId + ".txt", JSON.stringify(data));
    		}
    		$scope.ProcessTemplate(data, lessonId, force);
    	}).error(function (data) { HelperService.ErrorHandler(data.Message) });
    };

    $scope.ProcessTemplate = function (data, lessonId, force) {
    	$scope.Settings.LessonTemplate = data;
    	if ($scope.Settings.LessonTemplate.Words == null) {
    		$scope.Settings.LessonTemplate.Words = {};
    		var haveGenerator = false;
    		if (window.AppInterface != null && force != true) {
    			var generatorJson = window.AppInterface.ReadFile("Generators/" + lessonId + ".txt");
    			if (generatorJson != "") {
    				$scope.ProcessLessonGenerator(JSON.parse(generatorJson));
    				haveGenerator = true;
    			}
    		}
    		if (haveGenerator == false) {
    			$scope.DownloadLessonGenerator(lessonId);
    		}
    	}
    	$scope.Settings.RemainingPhrases = 180 - $scope.Settings.LessonTemplate.Phrases.length;

    	$scope.Settings.UsingWords = {
    		"Noun": [],
    		"Verb": [],
    		"Adjective": [],
    		"Core": []
    	};
    };

    $scope.DownloadLessonGenerator = function (lessonId) {
    	$http.post("/Api/Create/GetLessonGenerator", { lessonId: lessonId }).success(function (data) {

    		if (window.AppInterface != null) {
    			window.AppInterface.WriteFile("Generators/" + lessonId + ".txt", JSON.stringify(data));
    		}
    		$scope.ProcessLessonGenerator(data);
    		//Shift all remaining words to words
    		//Sort remaining words
    		//Spread across debuts
    		//Spread words
    		//Sort again?


    	}).error(function (data) { HelperService.ErrorHandler(data.Message) });
		
    };

    $scope.ProcessLessonGenerator = function (data) {
    	for (var wordType in data.FocusWords) {
    		$scope.Settings.LessonTemplate.Words[wordType] = [];

    		var focusWords = data.FocusWords[wordType];
    		for (var i = 0; i < focusWords.length; i++) {
    			for (var j = 0; j < 3; j++) {
    				$scope.Settings.LessonTemplate.Words[wordType].push({
    					Word: focusWords[i],
    					Index: $scope.PhraseOffsets[wordType][i] + j,
    					Debut: 1 + j
    				});
    			}
    			for (var j = 0; j < $scope.WordOffsets[wordType].length; j++) {
    				$scope.Settings.LessonTemplate.Words[wordType].push({
    					Word: focusWords[i],
    					Index: $scope.PhraseOffsets[wordType][i] + $scope.WordOffsets[wordType][j],
    					Debut: 0
    				});
    			}
    		}

    		var studyWords = data.StudyWords[wordType];
    		for (var i = 0; i < studyWords.length; i++) {
    			for (var j = 0; j < 3; j++) {
    				$scope.Settings.LessonTemplate.Words[wordType].push({
    					Word: studyWords[i],
    					Index: Math.floor((Math.random() * 160) + 20),
    					Debut: -1
    				});
    			}
    		}

    		$scope.Settings.LessonTemplate.Words[wordType] = MergeSort($scope.Settings.LessonTemplate.Words[wordType], "Index");
    	}
    };

    $scope.AddPhrase = function () {
    	var wordsUsed = 0;
    	for (wordType in $scope.Settings.UsingWords) {
    		wordsUsed += $scope.Settings.UsingWords[wordType].length;
    	}
    	if (wordsUsed > 0) {
    		$scope.ContinueAddPhrase();
    	} else {
    		ConfirmationDialog("Go with none?", function () { $scope.$apply(function () { $scope.ContinueAddPhrase }) });
    	}
    };
    $scope.ContinueAddPhrase = function(){
    	if ($scope.Settings.NewPhrase != ""){
    		$scope.Settings.LessonTemplate.Phrases.push($scope.Settings.NewPhrase);
    		$scope.Settings.NewPhrase = "";
    		$scope.Settings.RemainingPhrases -= 1;
    	}
    	for (wordType in $scope.Settings.UsingWords) {
    		var words = $scope.Settings.UsingWords[wordType];
    		for (var i = 0; i < words.length; i++) {
    			$scope.Settings.LessonTemplate.Words[wordType].splice($scope.Settings.LessonTemplate.Words[wordType].indexOf(words[i]), 1);
    		}
    	}

    	$scope.Settings.UsingWords = {
    		"Noun": [],
    		"Verb": [],
    		"Adjective": [],
    		"Core": []
    	};  

    }

    $scope.Settings.SaveState = "Save";
    $scope.SaveTemplate = function () {
    	if ($scope.Settings.SaveState == "Save") {
    		$scope.Settings.SaveState = "Saving";
    		
    		if (window.AppInterface != null) {
    		    window.AppInterface.WriteFile("Templates/" + $scope.Settings.LessonTemplate.Id + ".txt", JSON.stringify($scope.Settings.LessonTemplate));
    		}

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
