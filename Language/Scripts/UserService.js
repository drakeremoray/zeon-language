AngularApp.service('UserService', ['$http', '$location', 'HelperService', function ($http, $location, HelperService) {
	var userService = this;
	userService.Settings = {};
	userService.CurrentUser = null;

	userService.GetCurrentUser = function () {
		if (userService.CurrentUser == null) {
			userService.Settings.LoadingUser = true;
			if (window.AppInterface != null) {
				var userJson = window.AppInterface.ReadFile("User.txt");
				console.log(userJson);
				if (userJson != "") {
					userService.CurrentUser = JSON.parse(userJson);
					userService.Settings.LoadingUser = false;
				} else {
					console.log("no user");
				}
			}
			if (userService.CurrentUser == null) {
				console.log("current user");
				return $http.post("/Api/Home/GetCurrentUser").success(function (data) {
					userService.CurrentUser = data;
					userService.Settings.LoadingUser = false;
					if (window.AppInterface != null) {
						window.AppInterface.WriteFile("User.txt", JSON.stringify(data));
					}
					if ($location.url().indexOf("Home") == 0 || $location.url().indexOf("Home") == 1) {
						HelperService.Navigate("App");
					}
				}).error(function (data) {
					if ($location.url().indexOf("App") == 0 || $location.url().indexOf("App") == 1) {
						HelperService.Navigate("Home");
					}
					userService.Settings.LoadingUser = false;
				});

			}
		}

		console.log("fell in");
		return {
			success: function (fn) {
				fn(userService.CurrentUser);
				return { error: function (fn) { } };
			}
		};
	};



	userService.Logout = function () {
		$http.post(HelperService.Settings.BaseUrl + "/Api/Login/Logout", {}).success(function (data) {
			userService.CurrentUser = null;
			HelperService.Navigate("Home");
		}).error(function (data) {
			HelperService.ErrorHandler(data.Message);
		});
	};

	userService.SaveSettings = function () {
		$http.post(HelperService.Settings.BaseUrl + "/Api/Settings/SaveUserLessons", userService.CurrentUser.Lessons).error(function (data) {
			HelperService.ErrorHandler(data.Message);
		});
		//Save to file
		//Save to server

		//Set next alarm
		if (window.AppInterface != null) {
			var now = new Date();
			var currentTimeIndex = now.getHours() * 60 + now.getMinutes();
			for (var i = 0; i < userService.CurrentUser.Lessons.length; i++) {
				var reminders = userService.CurrentUser.Lessons[i].Reminders;
				if (reminders != null && reminders.length > 0) {
					var bestTime = reminders[0];
					for (var j = 1; j < reminders.length; j++) {
						if ((reminders[j] < bestTime && ((reminders[j] > currentTimeIndex) || (reminders[j] < currentTimeIndex && bestTime < currentTimeIndex))) || (reminders[j] > bestTime && reminders[j] > currentTimeIndex && bestTime < currentTimeIndex)) {
							bestTime = reminders[j];
						}
					}
					window.AppInterface.SetAlarm(userService.CurrentUser.Lessons[i].Name, bestTime);
				}
			}
			window.AppInterface.WriteFile("User.txt", JSON.stringify(data));
		}
	};
}]);