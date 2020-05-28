AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
    	name: 'App.Translate',
        url: '/Translate',
        templateUrl: '/Html/App/Translate/Translate.html?' + version,
        controller: "TranslateController",
        params: { language: { dynamic: true }, lesson: { dynamic: true } }
    });
    $stateProvider.state({
        name: 'App.Translate.Language',
        url: '/{language}'
    });
    $stateProvider.state({
    	name: 'App.Translate.Language.Lesson',
    	url: '/{lesson}'
    });
}]);
AngularApp.controller('TranslateController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', function ($scope, $http, HelperService, $timeout, $stateParams) {
    $scope.HelperService = HelperService;
    $scope.Settings = {};
    $scope.Settings.TranslateState = "Translate All";

    $scope.Languages = [
		{
			"Name": "Esperanto",
			"Code": "eo"
		},
		{
			"Name": "Japanese",
			"Code": "ja"
		},
		{
			"Name": "Russian",
			"Code": "ru"
		},
		{
			"Name": "French",
			"Code": "fr"
		},
		{
			"Name": "Greek",
			"Code": "el"
		},
		{
			"Name": "Korean",
			"Code": "ko"
		},
		{
			"Name": "German",
			"Code": "de"
		},
		{
			"Name": "Spanish",
			"Code": "es"
		},
		{
			"Name": "Romanian",
			"Code": "ro"
		},
		{
			"Name": "Thai",
			"Code": "th"
		},
		{
			"Name": "Swedish",
			"Code": "sv"
		},
		{
			"Name": "Italian",
			"Code": "it"
		},
		{
			"Name": "Swahili",
			"Code": "sw"
		}
    ];

    $scope.Lessons = [];
    for (var i = 0; i < 400; i++) {
    	$scope.Lessons.push(i + 1);
    }

    $scope.SetLanguage = function (language) {
    	$scope.Settings.CurrentLanguage = language;
    	if (language == null) {
    		HelperService.Navigate("App/Translate");
    	}else{
    		HelperService.Navigate("App/Translate/" + language.Name);
    	}
    };

	

    $scope.SetLesson = function (lesson) {
    	$scope.Settings.CurrentLesson = lesson;

    	if (lesson == null) {
    		HelperService.Navigate("App/Translate/" + $scope.Settings.CurrentLanguage.Name);
    		$scope.Settings.LessonTemplate = null;
    	}else{
    		HelperService.Navigate("App/Translate/" + $scope.Settings.CurrentLanguage.Name + "/" + lesson);

    		$http.post("/Api/Create/GetLessonTemplate", { lessonNumber: lesson }).success(function (data) {
    			$scope.Settings.LessonTemplate = data;
    		}).error(function (data) { HelperService.ErrorHandler(data.Message) });

    		$http.post("/Api/Lessons/Get", { lessonNumber: lesson, language: $scope.Settings.CurrentLanguage.Name }).success(function (data) {
				$scope.Settings.Lesson = data;
			}).error(function (data) { HelperService.ErrorHandler(data.Message) });
    	}
    };

    //Set 0
    //Esperanto
    
    //Set 1
    //Japanese
    //Russian
    //French
    //Greek

    //Set 2
    //Korean
    //German
    //Spanish
    //Romanian	x

    //Set 3
    //Thai
    //Swedish	
    //Italian
    //Swahili	x
    
    $scope.SaveLesson = function (lesson) {
        $http.post("/Api/Lessons/SaveGenerated", {
            Id: generator.Id,
            Words: generator.Phrases
        }).success(function (data) {

        }).error(function (data) {
            HelperService.ErrorHandler(data.Message);
        });
    };

    $scope.TranslateAll = function () {
    	$scope.Settings.TranslationsDone = 0;
    	for (var i = 0; i < $scope.Settings.LessonTemplate.Phrases.length; i++) {
    		$scope.TranslatePhrase(i).success(function () {
    			$scope.Settings.TranslationsDone += 1;
    			if ($scope.Settings.TranslationsDone == $scope.Settings.LessonTemplate.Phrases.length) {
    				$scope.Settings.TranslateState = "Translate All";
    			} else {
    				$scope.Settings.TranslateState = "Translating " + $scope.Settings.TranslationsDone + "/" + $scope.Settings.LessonTemplate.Phrases.length;
    			}				
    		});
    	}
    };

    $scope.TranslateAllMissing = function () {
    	$scope.Settings.TranslationsDone = 0;
    	for (var i = 0; i < $scope.Settings.LessonTemplate.Phrases.length; i++) {
    		if ($scope.Settings.Lesson.Phrases[i].TranslationSpeech == null) {
    			$scope.TranslatePhrase(i).success(function () {
    				$scope.Settings.TranslationsDone += 1;
    				if ($scope.Settings.TranslationsDone == $scope.Settings.LessonTemplate.Phrases.length) {
    					$scope.Settings.TranslateState = "Translate All";
    				} else {
    					$scope.Settings.TranslateState = "Translating " + $scope.Settings.TranslationsDone + "/" + $scope.Settings.LessonTemplate.Phrases.length;
    				}
    			});
    		}
    	}
    };

    $scope.TranslatePhrase = function (phraseIndex) {
    	$scope.Settings.Lesson.Phrases[phraseIndex].Speech = null;
    	$scope.Settings.Lesson.Phrases[phraseIndex].TranslationSpeech = null;
    	return $http.post("/Api/Create/Translate", { lessonNumber: $scope.Settings.CurrentLesson, language: $scope.Settings.CurrentLanguage.Name, languageCode: $scope.Settings.CurrentLanguage.Code, phraseIndex: phraseIndex, text: $scope.Settings.LessonTemplate.Phrases[phraseIndex].Text, debut: $scope.Settings.LessonTemplate.Phrases[phraseIndex].Debut }).success(function (data) {
    	    //$scope.Translation.Result = data.Result;
    	    $scope.Settings.Lesson.Phrases[phraseIndex].Translation = data.Translation;
    	    $scope.Settings.Lesson.Phrases[phraseIndex].TranslationExtra = data.TranslationExtra;
    		$scope.Settings.Lesson.Phrases[phraseIndex].Speech = data.Speech;
    		$scope.Settings.Lesson.Phrases[phraseIndex].TranslationSpeech = data.TranslationSpeech;
    		
    		
			/*
    		var utterance = new SpeechSynthesisUtterance(data.Result);
    		console.log("voices " + voices.length);
    		for (i = 0; i < voices.length ; i++) {
    			var currentLang = voices[i].lang;
    			if (currentLang.indexOf("-") > -1) {
    				currentLang = currentLang.substring(0, currentLang.indexOf("-"));
    			}
    			console.log(currentLang + " vs " + $scope.Settings.Language.Code);
    			if (currentLang == $scope.Settings.Language.Code) {
    				utterance.voice = voices[i];
    				console.log("chosen " + voices[i].name);
    			}
    		}


    		//speechSynthesis.speak(utterance);
			*/
    	}).error(function (data) {
    		console.log(data);
    	});
    };
	
    $scope.PlaySpeech = function (speech) {
    	document.getElementById("speech").playbackRate = 0.5;
    	document.getElementById("speech").src = "data:audio/mpeg;base64," + speech;
    };


    if ($stateParams["language"] != null) {
    	for (var i = 0; i < $scope.Languages.length; i++) {
    		if ($scope.Languages[i].Name == $stateParams["language"]) {
    			$scope.Settings.CurrentLanguage = $scope.Languages[i];
    			if ($stateParams["lesson"] != null) {
    				$scope.SetLesson($stateParams["lesson"]);
    			}
    		}
    	}
    }

}]);
