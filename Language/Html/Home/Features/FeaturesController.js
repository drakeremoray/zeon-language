AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'Home.Features',
        url: '/Features',
        templateUrl: '/Html/Home/Features/Features.html?' + version
    });
}]);
AngularApp.controller('FeaturesController', ['$scope', '$http', 'HelperService', function ($scope, $http, HelperService) {
    $scope.HelperService = HelperService;
    $scope.Translation = {};
    $scope.Settings = {};
    //Get the correct words
    //Start with simple nv sentences
    $scope.Settings.Language = { Label: "Russian", Code: "en" };
    $scope.Settings.Language = { Label: "Russian", Code: "ru" };

    var voices = speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = function() {
        voices = window.speechSynthesis.getVoices();
    };


    $scope.TranslatePhrase = function () {
        var phrase = $scope.Translation.Phrase;
        $scope.Translation.Phrase = "";

        $http.post("/Api/Home/Translate", { text: phrase, language: $scope.Settings.Language.Code }).success(function (data) {
            $scope.Translation.Result = data.Result;
            //document.getElementById("speech").src = "https://translate.googleapis.com/translate_tts?ie=UTF-8&q=" + data.Result + "&tl=" + $scope.Settings.Language.Code + "&total=1&idx=0&textlen=" + data.Result.length + "&client=gtx";
            //document.getElementById("speech").src = "https://translate.googleapis.com/translate_tts?ie=UTF-8&q=" + data.Result + "&tl=" + $scope.Settings.Language.Code + "&total=1&idx=0&textlen=" + data.Result.length + "&client=gtx";

            //known working command
            var newLink = "https://translate.googleapis.com/translate_tts?ie=UTF-8&q=" + data.Result + "&tl=ru&total=1&idx=0&textlen=16&client=gtx";
            //document.getElementById("speech").src = newLink;
            document.getElementById("speech").src = "data:audio/mpeg;base64," + data.Speech;
            //window.open(newLink);
            //https://translate.googleapis.com/translate_tts?ie=UTF-8&q=this%20doesnt%20work&tl=ru&total=1&idx=0&textlen=16&client=gtx
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
        }).error(function (data) {
            console.log(data);
        });
    };


}]);
