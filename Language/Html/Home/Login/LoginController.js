AngularApp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state({
        name: 'Home.Login',
        url: '/Login',
        abstract:true,
        templateUrl: '/Html/Home/Login/Index.html?' + version,
        controller:"LoginController"
    });
    $stateProvider.state({
        name: 'Home.Login.Index',
        url: '',
        templateUrl: '/Html/Home/Login/Login.html?' + version
    });
    $stateProvider.state({
        name: 'Home.Login.Register',
        url: '/Register',
        templateUrl: '/Html/Home/Login/Register.html?' + version,
        params: {
            EmailAddress: null
        }
    });
    $stateProvider.state({
        name: 'Home.Login.Forgot',
        url: '/Forgot',
        templateUrl: '/Html/Home/Login/Forgot.html?' + version
    });
    $stateProvider.state({
        name: 'Home.Login.Reset',
        url: '/Reset?EmailAddress&VerifyString',
        templateUrl: '/Html/Home/Login/Reset.html?' + version
    });
}]);

AngularApp.controller('LoginController', ['$scope', '$http', 'HelperService', 'UserService', '$stateParams', function ($scope, $http, HelperService, UserService, $stateParams) {
    $scope.HelperService = HelperService;

    $scope.LoginSettings = {
        Loading: false,
        Error: ""
    };
    $scope.LoginModel = {
        EmailAddress: "",
        Password: "",
        Confirm: "",
        Role: "User"
    };

    $scope.LoginModel.EmailAddress = $stateParams.EmailAddress;

    if ($stateParams.EmailAddress != null && $stateParams.Name == null) {
        //Try to get the persons name
        var nameAttempt = $scope.LoginModel.EmailAddress.substring(0, $scope.LoginModel.EmailAddress.indexOf("@"));
        nameAttempt = nameAttempt.replace(/[0-9]/g, '');
        nameAttempt = nameAttempt.replace(/\-\_/g, ' ');
        nameAttempt = nameAttempt.replace(/\./g, ' ');

        $scope.LoginModel.Name = HelperService.CapitalCase(nameAttempt);
    }
    $scope.Login = function () {
        console.log("called");
        if ($scope.LoginModel.EmailAddress == null || $scope.LoginModel.EmailAddress == "") {
            $scope.LoginSettings.Error = "Please enter your email address";
            return false;
        }
        $scope.LoginSettings.Loading = true;
        $http.post("/Api/Login/Login", { loginModel: $scope.LoginModel }).success(function (data) {
            $scope.LoginSettings.Loading = false;
            $scope.LoginSettings.Error = "";
            UserService.GetCurrentUser();
            HelperService.Navigate("App");

        }).error(function (data) {
            if (data.Message == "Please Verify") {
                HelperService.Navigate("/Home/Login/Verify");
                $scope.LoginSettings.Error = "";
            } else {
                $scope.LoginSettings.Error = data.Message;
            }
            $scope.LoginSettings.Loading = false;
        });
    };


    $scope.Register = function () {
        if ($scope.LoginSettings.Loading != true) {
            if ($scope.LoginModel.Name == null || $scope.LoginModel.Name == "") {
                $scope.LoginSettings.Error = "Please enter your name";
                return false;
            }
            if ($scope.LoginModel.EmailAddress == null || $scope.LoginModel.EmailAddress == "") {
                $scope.LoginSettings.Error = "Please enter your email address";
                return false;
            }
            var emailAt = $scope.LoginModel.EmailAddress.indexOf("@");
            console.log(emailAt);
            if (emailAt == -1 || $scope.LoginModel.EmailAddress.indexOf(".", emailAt) == -1) {
                $scope.LoginSettings.Error = "Please enter your email address";
                return false;
            }

            if ($scope.LoginModel.Password == null || $scope.LoginModel.Password == "") {
                $scope.LoginSettings.Error = "Please enter your password";
                return false;
            }
            if ($scope.LoginModel.Password != $scope.LoginModel.Confirm) {
                $scope.LoginSettings.Error = "Password and Confirm Password must match";
                return false;
            }
            $scope.LoginSettings.Loading = true;

            $http.post("/Api/Login/Register", { loginModel: $scope.LoginModel }).success(function (data) {
                AlertMessageDialog("Please check your emails for a verification code");

                HelperService.Navigate("/Home/Login/Verify");

                $scope.LoginSettings.Error = "";
                $scope.LoginSettings.Loading = false;
            }).error(function (data) {
                $scope.LoginSettings.Error = data.Message;
                $scope.LoginSettings.Loading = false;
            });
        }
    };
    $scope.Forgot = function () {
        if ($scope.LoginModel.EmailAddress == null || $scope.LoginModel.EmailAddress == "") {
            $scope.LoginSettings.Error = "Please enter your email address";
            return false;
        }
        $scope.LoginSettings.Loading = true;
        $http.post("/Api/Login/Forgot", { loginModel: $scope.LoginModel }).success(function (data) {
            AlertMessageDialog("Please check your emails for a password reset");
            $scope.LoginSettings.Error = "";
            $scope.LoginSettings.Loading = false;
        }).error(function (data) {
            $scope.LoginSettings.Error = data.Message;
            $scope.LoginSettings.Loading = false;
        });
    };
    
    $scope.Reset = function () {
        if ($scope.LoginModel.Password != $scope.LoginModel.Confirm) {
            $scope.LoginSettings.Error = "Password and Confirm Password must match";
            return false;
        }
        $scope.LoginSettings.Loading = true;
        $http.post("/Api/Login/Reset", { loginModel: $scope.LoginModel }).success(function (data) {
            $scope.LoginSettings.Error = "";
            UserService.GetCurrentUser();
            HelperService.Navigate("/App");
            $scope.LoginSettings.Loading = false;
        }).error(function (data) {
            if (data.Message == "Please Verify") {
                HelperService.Navigate("/Home/Login/Verify");
            } else {
                $scope.LoginSettings.Error = data.Message;
            }
            $scope.LoginSettings.Loading = false;
        });
    };

}]);