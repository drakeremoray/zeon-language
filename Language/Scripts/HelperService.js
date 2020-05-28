AngularApp.service('HelperService', ['$http', '$location', '$window', '$stateParams', '$state', function ($http, $location, $window, $stateParams, $state) {
    var helperService = this;
    helperService.Settings = {};
    
    helperService.Settings.BaseUrl = "";

    helperService.Random = Math.floor((Math.random() * 1000) + 1);



    helperService.Version = version;

    helperService.AppInterface = window.AppInterface;

    helperService.LanguageOptions = {
        Japanese: {
            TranslationStyle: {
                "font-family": "monospace, monospace",
                "word-break":"keep-all"
            }
        }
    }

    helperService.Hours = [];
    for (var i = 0; i < 24; i++) {
        helperService.Hours.push((i < 10 ? "0" : "") + i);
    }

    helperService.Minutes = [];
    for (var i = 0; i < 60; i += 5) {
        helperService.Minutes.push((i < 10 ? "0" : "") + i);
    }
    helperService.DaysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
    helperService.ShortDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    helperService.FullDaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    helperService.Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
    helperService.SetProperty = function (setObject, setProperty, setValue, continueFunction, attachedObject) {
        setObject[setProperty] = setValue;
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
    helperService.AddToArray = function (setObject, setArray, newElement, continueFunction, attachedObject) {
        if (setObject[setArray] == null) {
            setObject[setArray] = [];
        }
        if (newElement == null) {
            setObject[setArray].push({ Name: 'test' });
        } else {
            setObject[setArray].push(newElement);
        }
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
    helperService.RemoveFromArray = function (setArray, item, continueFunction, attachedObject) {
        setArray.splice(setArray.indexOf(item), 1);
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
    helperService.MoveInArray = function (setArray, item, positions, continueFunction, attachedObject) {
        var itemIndex = setArray.indexOf(item);
        setArray.splice(itemIndex, 1);
        setArray.splice(itemIndex + positions, 0, item);
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
    helperService.ToggleInArray = function (setObject, setArray, toggleElement, continueFunction, attachedObject) {
        if (setObject[setArray] == null) {
            setObject[setArray] = [];
        }
        var elementIndex = setObject[setArray].indexOf(toggleElement);
        if (elementIndex > -1) {
            setObject[setArray].splice(elementIndex, 1);
        } else {
            setObject[setArray].push(toggleElement);
        }
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
    helperService.FindInArray = function (setArray, setProperty, setValue) {
        if (setArray == null) {
            return {};
        }
        for (var i = 0; i < setArray.length; i++) {
            if (setArray[i][setProperty] == setValue) {
                return setArray[i];
            }
        }
        return {};
    };
    helperService.ParseFloatOrZero = function (number) {
        number = parseFloat(number);
        if (isNaN(number)) {
            return 0;
        } else {
            return number;
        }
    };
    helperService.MoneyFormat = function (money) {
        money = helperService.ParseFloatOrZero(money);
        var negative = (money < 0);
        money = Math.round(money * 100) / 100;
        money = money + "";
        var startIndex = money.indexOf(".");
        if (startIndex < 0) {
            startIndex = money.length;
            money = money + ".00";
        } else {
            while (money.length - startIndex < 3) {
                money = money + "0";
            }
        }
        money = money.substring(0, startIndex + 3);
        startIndex = startIndex - 3;
        while (startIndex > (negative ? 1 : 0)) {
            money = money.substring(0, startIndex) + "," + money.substring(startIndex);
            startIndex = startIndex - 3;
        }
        return "$" + money;
    };

    helperService.NiceDateString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate();
    };

    helperService.NiceFullDateString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate() + "T00:00:00";
    };


    helperService.NiceTimeString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return (displayDate.getHours() < 10 ? "0" : "") + displayDate.getHours() + ":" + (displayDate.getMinutes() < 10 ? "0" : "") + displayDate.getMinutes();
    };

    helperService.NiceDateTimeString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate() + " " + (displayDate.getHours() < 10 ? "0" : "") + displayDate.getHours() + ":" + (displayDate.getMinutes() < 10 ? "0" : "") + displayDate.getMinutes();
    };

    helperService.NiceFullDateTimeString = function (displayDate) {
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate() + " " + (displayDate.getHours() < 10 ? "0" : "") + displayDate.getHours() + ":" + (displayDate.getMinutes() < 10 ? "0" : "") + displayDate.getMinutes() + ":" + (displayDate.getSeconds() < 10 ? "0" : "") + displayDate.getSeconds();
    };

    helperService.MediumDateString = function (displayDate) {
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate();
    };

    helperService.ISODateString = function (displayDate) {
        if (displayDate == null) {
            return "";
        } else if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getFullYear() + "-" + ((displayDate.getMonth() + 1) < 10 ? "0" : "") + (displayDate.getMonth() + 1) + "-" + (displayDate.getDate() < 10 ? "0" : "") + displayDate.getDate() + "T00:00:00";
    };

    helperService.ISODateTimeString = function (displayDate) {
        if (displayDate == null) {
            return "";
        } else if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return displayDate.getUTCFullYear() + "-" + ((displayDate.getUTCMonth() + 1) < 10 ? "0" : "") + (displayDate.getUTCMonth() + 1) + "-" + (displayDate.getUTCDate() < 10 ? "0" : "") + displayDate.getUTCDate() + "T" + (displayDate.getUTCHours() < 10 ? "0" : "") + displayDate.getUTCHours() + ":" + (displayDate.getUTCMinutes() < 10 ? "0" : "") + displayDate.getUTCMinutes();
    }

    helperService.ISOFullDateTimeString = function (displayDate) {
        if (displayDate == null) {
            return "";
        } else if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        var ms = displayDate.getUTCMilliseconds() + "";
        while (ms.length < 3) {
            ms = "0" + ms;
        }
        return displayDate.getUTCFullYear() + "-" + ((displayDate.getUTCMonth() + 1) < 10 ? "0" : "") + (displayDate.getUTCMonth() + 1) + "-" + (displayDate.getUTCDate() < 10 ? "0" : "") + displayDate.getUTCDate() + "T" + (displayDate.getUTCHours() < 10 ? "0" : "") + displayDate.getUTCHours() + ":" + (displayDate.getUTCMinutes() < 10 ? "0" : "") + displayDate.getUTCMinutes() + ":" + (displayDate.getUTCSeconds() < 10 ? "0" : "") + displayDate.getUTCSeconds() + "." + ms;
    }

    helperService.CalendarDateString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return helperService.ShortDaysOfWeek[(displayDate.getDay() + 6) % 7] + " " + displayDate.getDate() + " - " + (displayDate.getMonth() + 1);
    };

    helperService.FullCalendarDateString = function (displayDate) {
        if (displayDate == null) {
            return "";
        }
        if (displayDate.getFullYear == null) {
            displayDate = new Date(displayDate);
        }
        return helperService.FullDaysOfWeek[(displayDate.getDay() + 6) % 7] + " - " + displayDate.getDate() + " " + helperService.Months[displayDate.getMonth()] + " " + displayDate.getUTCFullYear();
    };

    helperService.CapitalCase = function (s) {
        if (s == null) {
            return null;
        }
        s = s.toLowerCase();
        s = s.substring(0, 0) + s[0 + 0].toUpperCase() + s.substring(0 + 1);
        for (var i = 1; i < s.length - 1; i++) {
            if (s[i] == " ") {
                s = s.substring(0, i + 1) + s[i + 1].toUpperCase() + s.substring(i + 2);
            }
        }
        return s;
    }

    helperService.Navigate = function (location) {
        var newPath = $location.url(location).$$path;
    };


    helperService.NavigateNew = function (location) {
        $window.open(location, "_blank")
    };

    helperService.ErrorHandler = function (message) {
    	if (message == "Please log in again.") {
    		AlertMessageDialog(message, helperService.Navigate, "Home");
        } else if (message == "You do not have permission to do that.") {
            AlertMessageDialog(message, helperService.Navigate, "Home");
        } else {
            AlertMessageDialog(message);
        }
    };

    helperService.NameInitialise = function (s) {
        var initials = "";
        if (s == null || s == "") {
            return initials;
        }
        var splits = s.split(" ");
        for (var i = 0; i < splits.length && i < 2; i++) {
            initials += splits[i][0];
        }
        return initials;
    };



}]);