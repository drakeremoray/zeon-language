AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'App.Settings',
        url: '/Settings',
        templateUrl: '/Html/App/Settings/Settings.html?' + version,
        controller: "SettingsController",
        params: { language: null }
    });
    $stateProvider.state({
        name: 'App.Settings.Language',
        url: '/{language}'
    });
}]);
AngularApp.controller('SettingsController', ['$scope', '$http', 'HelperService', '$timeout', '$stateParams', 'UserService', function ($scope, $http, HelperService, $timeout, $stateParams, UserService) {
    $scope.HelperService = HelperService;
    $scope.Settings = {};

    $scope.Lessons = [];
    for (var i = 0; i < 400; i++) {
    	$scope.Lessons.push(i + 1);
    }

    $scope.SetLesson = function (language, lesson) {
    	language.Lesson = lesson;
    };

    $scope.AddReminder = function (language) {
    	if (language.Reminders == null) {
    		language.Reminders = [];
    	}
    	if (language.Reminders.length == 0) {
    		language.Reminders.push(60 * 8);
    	} else {
    		language.Reminders.push((language.Reminders[language.Reminders.length - 1] + 60) % (24 * 60));
    	}		
    };

    $scope.RemoveReminder = function (language, reminder) {
    	language.Reminders.splice(language.Reminders.indexOf(reminder), 1);
    };

    console.log($stateParams);
    //Set current language as the url
    //Set current language object

    $scope.FormatAlarmTime = function (minutes) {
    	var hours = Math.floor(minutes / 60);
    	var ext = "AM";
    	minutes = minutes % 60;
    	if (hours == 24) {
    		hours = 12;
    	} else if (hours > 24) {
    		hours = (hours - 12) % 12;
    	} else if (hours > 12) {
    		ext = "PM";
    		hours = hours % 12;
    	} else if (hours == 12) {
    		ext = "PM";
    	}
    	return hours + ":" + (minutes == 0 ? "0" : "") + minutes + " " + ext;
    };

    $scope.SetReminder = function (language, reminderIndex, value) {
    	console.log(reminderIndex)
    	console.log(value)
    	language.Reminders[reminderIndex] = value;
    }

    $scope.AlarmTimes = [];

    for (var minutes = 480; minutes <= 1680; minutes += 30) {
    	$scope.AlarmTimes.push({
    		Name: $scope.FormatAlarmTime(minutes),
    		Value: minutes
    	});
    }
}]);
