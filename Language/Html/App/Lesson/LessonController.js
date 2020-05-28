AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'App.Lesson',
        url: '/Lesson',
        templateUrl: '/Html/App/Lesson/Lesson.html?' + version,
        controller: "LessonController",
        params: { language: { dynamic: true } }
    });
    $stateProvider.state({
        name: 'App.Lesson.Language',
        url: '/{language}'
    });
    $stateProvider.state({
        name: 'App.Lesson.Language.Lesson',
        url: '/{lesson}'
    });
}]);
AngularApp.controller('LessonController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', 'UserService', function ($scope, $http, HelperService, $timeout, $stateParams, UserService) {
    $scope.HelperService = HelperService;
    $scope.UserService = UserService;
    $scope.Settings = {};


    $scope.LoadLesson = function (lesson) {
        if (lesson == null) {
            lesson = $scope.Settings.CurrentLanguage.Lesson;
        }
        $scope.Settings.CurrentLessonNumber = lesson;

        var haveLesson = false;
        if (window.AppInterface != null) {
            var lessonJson = window.AppInterface.ReadFile("Lessons/" + $scope.Settings.CurrentLanguage.Name + "/" + lesson + ".txt");
            if (lessonJson != "") {
                $scope.Settings.CurrentLesson = JSON.parse(lessonJson);
                haveLesson = true;
                $scope.PrepareLesson();
            }
        }
        if (haveLesson == false) {
            $scope.DownloadLesson(lesson);
        }
    };

    $scope.DownloadLesson = function (lesson) {
        $http.post("/Api/Lessons/Get", { lessonNumber: lesson, language: $scope.Settings.CurrentLanguage.Name }).success(function (data) {
            $scope.Settings.CurrentLesson = data;

            if (window.AppInterface != null) {
                window.AppInterface.WriteFile("Lessons/" + $scope.Settings.CurrentLanguage.Name + "/" + lesson + ".txt", JSON.stringify(data));
            }

            $scope.PrepareLesson();
        }).error(function (data) { HelperService.ErrorHandler(data.Message) });
    };

    $scope.PrepareLesson = function () {
        for (var i = $scope.Settings.CurrentLesson.Phrases.length - 1; i >= 0; i--) {
            if ($scope.Settings.CurrentLesson.Phrases[i].Speech == null || $scope.Settings.CurrentLesson.Phrases[i].Speech == ""
			|| $scope.Settings.CurrentLesson.Phrases[i].TranslationSpeech == null || $scope.Settings.CurrentLesson.Phrases[i].TranslationSpeech == "") {
                $scope.Settings.CurrentLesson.Phrases.splice(i, 1);
            }
        }

        for (var i = 0; i < $scope.Settings.CurrentLesson.Phrases.length; i++) {
            if (i < $scope.Settings.CurrentLesson.Phrases.length * 40 / 140) {
                $scope.Settings.CurrentLesson.Phrases[i].Type = "Read";
            } else if (i < $scope.Settings.CurrentLesson.Phrases.length * 70 / 140) {
                $scope.Settings.CurrentLesson.Phrases[i].Type = "Write";
            } else if (i < $scope.Settings.CurrentLesson.Phrases.length * 90 / 140) {
                $scope.Settings.CurrentLesson.Phrases[i].Type = "Transcribe";
            } else if (i < $scope.Settings.CurrentLesson.Phrases.length * 110 / 140) {
                $scope.Settings.CurrentLesson.Phrases[i].Type = "Translate";
            } else {
                $scope.Settings.CurrentLesson.Phrases[i].Type = "Listen";
            }
        }
        if ($scope.Settings.CurrentLesson.Phrases.length == 0) {
            AlertMessageDialog("Looks like there's nothing in this lesson. Try again later.")
            HelperService.Navigate("App");
        } else {
            $scope.PlayLesson();
        }
    };

    $scope.PlayLesson = function () {
        $scope.SetCurrentPhrase(0);
        $scope.PlayPhrase();
    };

    $scope.PlaySpeech = function () {
        document.getElementById("speech").play();
    };

    $scope.PreviousPhrase = function () {
        if ($scope.Settings.PhrasePlayer != null) {
            $timeout.cancel($scope.Settings.PhrasePlayer);
        }
        $scope.SetCurrentPhrase($scope.Settings.CurrentPhraseIndex - 1);
    };

    $scope.NextPhrase = function () {
        if ($scope.Settings.PhrasePlayer != null) {
            $timeout.cancel($scope.Settings.PhrasePlayer);
        }
        if ($scope.Settings.CurrentPhraseIndex < $scope.Settings.CurrentLesson.Phrases.length - 1) {
            $scope.SetCurrentPhrase($scope.Settings.CurrentPhraseIndex + 1);
        } else {
            console.log("Finishing lesson");
            $scope.FinishLesson();
        }
    };

    $scope.SetCurrentPhrase = function (phraseIndex) {
        $scope.Settings.CurrentPhrase = $scope.Settings.CurrentLesson.Phrases[phraseIndex];
        $scope.Settings.CurrentPhraseIndex = phraseIndex;
        document.getElementById("speech").src = "data:audio/mpeg;base64," + $scope.Settings.CurrentLesson.Phrases[phraseIndex].TranslationSpeech;
        $scope.PlayPhrase();
    }

    $scope.PlayPhrase = function () {
        $scope.Settings.UserEffort = "";
        $scope.Settings.UserCorrect = null;
        if ($scope.Settings.CurrentPhrase.Type == "Read") {
            //Just read and listen
            $scope.Settings.ShowEnglish = true;
            $scope.Settings.ShowTranslation = true;
            $scope.Settings.ShowVoice = true;
            $scope.PlaySpeech();
        } else if ($scope.Settings.CurrentPhrase.Type == "Write") {
            //Hear and view the translation, write the english
            $scope.Settings.ShowEnglish = false;
            $scope.Settings.ShowTranslation = true;
            $scope.Settings.ShowVoice = true;
            $scope.PlaySpeech();
        } else if ($scope.Settings.CurrentPhrase.Type == "Transcribe") {
            //Hear the translation and view the translation, write the english
            $scope.Settings.ShowEnglish = true;
            $scope.Settings.ShowTranslation = false;
            $scope.Settings.ShowVoice = true;
            $scope.PlaySpeech();
        } else if ($scope.Settings.CurrentPhrase.Type == "Translate") {
            //Hear the translation, view the english, write the translation, view the translation
            $scope.Settings.ShowEnglish = true;
            $scope.Settings.ShowTranslation = false;
            $scope.Settings.ShowVoice = false;
        } else if ($scope.Settings.CurrentPhrase.Type == "Listen") {
            //Hear the translation, write the english, view the translation
            $scope.Settings.ShowEnglish = false;
            $scope.Settings.ShowTranslation = false;
            $scope.Settings.ShowVoice = true;
            $scope.PlaySpeech();
        }
    }

    $scope.UserInputFinish = function () {
        $scope.Settings.ShowEnglish = true;
        $scope.Settings.ShowTranslation = true;
        $scope.Settings.ShowVoice = true;
        if ($scope.Settings.CurrentPhrase.Type == "Read" || $scope.Settings.UserCorrect != null) {
            $scope.NextPhrase();
        } else {
            if ($scope.Settings.CurrentPhrase.Type == "Transcribe" || $scope.Settings.CurrentPhrase.Type == "Translate") {

                var convertedEffort = GlobalReplace(GlobalReplace($scope.Settings.UserEffort + "", " ", ""), "　", "");
                var convertedTranslation = GlobalReplace(GlobalReplace($scope.Settings.CurrentPhrase.Translation + "", " ", ""), "　", "");
                console.log(convertedEffort);
                console.log(convertedTranslation);
                if (convertedTranslation == convertedEffort) {
                    $scope.Settings.UserCorrect = true;
                } else {
                    $scope.Settings.UserCorrect = false;
                }
                $scope.PlaySpeech();

            } else {
                $scope.Settings.UserCorrect = true;
            }
        }
    }

    $scope.ManualFinish = function () {
        ConfirmationDialog("Are you sure you want to complete this lesson?", function () {
            $scope.$apply(function () {
                $scope.FinishLesson();
            });
        });
    };

    $scope.FinishLesson = function () {
        if ($scope.Settings.CurrentLessonNumber == $scope.Settings.CurrentLanguage.Lesson) {
            if ($scope.Settings.CurrentLanguage.Lesson < 300) {
                $scope.Settings.CurrentLanguage.Lesson += 1;
                UserService.SaveSettings();
            }
        }
        HelperService.Navigate("App");
    };

    UserService.GetCurrentUser().success(function (data) {
        if ($stateParams["language"] != null) {
            for (var i = 0; i < UserService.CurrentUser.Lessons.length; i++) {
                if (UserService.CurrentUser.Lessons[i].Name == $stateParams["language"]) {
                    $scope.Settings.CurrentLanguage = UserService.CurrentUser.Lessons[i];
                    $scope.Settings.LanguageOptions = HelperService.LanguageOptions[$scope.Settings.CurrentLanguage.Name];
                    if ($stateParams["lesson"] != null) {
                        $scope.LoadLesson($stateParams["lesson"]);
                    } else {
                        $scope.LoadLesson();
                    }
                }
            }
        }
    }).error(function (data) {
        HelperService.ErrorHandler(data.Message);
    });

    console.log($stateParams);

    //Check the current lesson
    //Set it as the current lesson
    //Start autoplaying audio

    //When the lesson has finished
    //Update next lesson
    //Save settings
    //Finish?
}]);
