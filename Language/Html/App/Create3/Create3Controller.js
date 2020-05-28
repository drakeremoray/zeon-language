AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'App.Create3',
        url: '/Create3',
        templateUrl: '/Html/App/Create3/Create3.html?' + version,
        controller: "Create3Controller",
        params: { lessonId: null }
    });
    $stateProvider.state({
        name: 'App.Create3.Lesson',
    	url: '/{lessonId}'
    });
}]);
AngularApp.controller('Create3Controller', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
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
    	$scope.Settings.CurrentLessonNumber = lessonId;
    	if (lessonId == null) {
    		HelperService.Navigate("App/Create3");
    		$scope.Settings.LessonTemplate = null;
    	} else {
    		HelperService.Navigate("App/Create3/" + lessonId);
    		var haveTemplate = false;
    		if (window.AppInterface != null) {
    			var templateJson = window.AppInterface.ReadFile("Templates/" + lessonId + ".txt");
    			if (templateJson != "") {
    				$scope.ProcessTemplate(JSON.parse(templateJson), lessonId);
    				haveTemplate = true;
    			}
    		}
    		if (haveTemplate == false) {
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
        var wordsRemaining = 0;
        for(var wordType in $scope.Settings.LessonTemplate.RemainingWords){
            wordsRemaining += $scope.Settings.LessonTemplate.RemainingWords[wordType].length;
        }
        $scope.Settings.RemainingPhrases = Math.floor(wordsRemaining * 140 / 500);

        for (var i = 0; i < $scope.Settings.LessonTemplate.RemainingWords["Verb"].length; i++) {
            if (Math.random() > 0.7) {
                //Questions
    			$scope.Settings.LessonTemplate.RemainingWords["Verb"][i].Question = true;
            }
            if (Math.random() > 0.7) {
                //Questions
                $scope.Settings.LessonTemplate.RemainingWords["Verb"][i].Negative = true;
            }
    	}
    	for (var i = 0; i < $scope.Settings.LessonTemplate.RemainingWords["Noun"].length; i++) {
    	    if (Math.random() > 0.7) {
                //Plurals
    			$scope.Settings.LessonTemplate.RemainingWords["Noun"][i].Plural = true;
    		}
    	}
    	for (var i = 0; i < $scope.Settings.LessonTemplate.Phrases.length; i++) {
    		$scope.Settings.LessonTemplate.Phrases[i].Index = i;
    	}
    	
    	$scope.AssignPhraseTypes();

    	$scope.Settings.UsingWords = {
    		"Noun": [],
    		"Verb": [],
    		"Adjective": [],
    		"Core": []
    	};
    };

    $scope.AssignPhraseTypes = function () {
        var totalPhrases = $scope.Settings.RemainingPhrases + $scope.Settings.LessonTemplate.Phrases.length;

        for (var i = 0; i < $scope.Settings.LessonTemplate.Phrases.length; i++) {
            if (i < totalPhrases* 40 / 140) {
                $scope.Settings.LessonTemplate.Phrases[i].Type = "R";
            } else if (i < totalPhrases* 70 / 140) {
                $scope.Settings.LessonTemplate.Phrases[i].Type = "W";
            } else if (i < totalPhrases* 90 / 140) {
                $scope.Settings.LessonTemplate.Phrases[i].Type = "Tc";
            } else if (i < totalPhrases* 110 / 140) {
                $scope.Settings.LessonTemplate.Phrases[i].Type = "Tl";
            } else {
                $scope.Settings.LessonTemplate.Phrases[i].Type = "L";
            }
        }
    }
    
    $scope.AddPhrase = function () {
    	var wordsUsed = 0;
    	for (wordType in $scope.Settings.UsingWords) {
    		wordsUsed += $scope.Settings.UsingWords[wordType].length;
    	}
    	if (wordsUsed > 0) {
    		$scope.ContinueAddPhrase();
    	} else {
    		ConfirmationDialog("Go with none?", function () { $scope.$apply($scope.ContinueAddPhrase) });
    	}
    };
    $scope.ContinueAddPhrase = function(){
    	if ($scope.Settings.NewPhrase != ""){
    		$scope.Settings.LessonTemplate.Phrases.push({Index:$scope.Settings.LessonTemplate.Phrases.length, Text: $scope.Settings.NewPhrase });
    		$scope.Settings.NewPhrase = "";
    		$scope.Settings.RemainingPhrases -= 1;
    	}
    	for (wordType in $scope.Settings.UsingWords) {
    		var words = $scope.Settings.UsingWords[wordType];
    		for (var i = 0; i < words.length; i++) {
    		    $scope.Settings.LessonTemplate.RemainingWords[wordType].splice($scope.Settings.LessonTemplate.RemainingWords[wordType].indexOf(words[i]), 1);
    		}
    	}
    	$scope.AssignPhraseTypes();

    	$scope.Settings.UsingWords = {
    		"Noun": [],
    		"Verb": [],
    		"Adjective": [],
    		"Core": []
    	};  

    }

    $scope.ToggleDebut = function (phrase) {
    	phrase.Debut = (phrase.Debut != true);
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
