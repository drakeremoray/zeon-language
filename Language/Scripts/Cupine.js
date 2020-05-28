function CustomInputClick(element) {
    element.click();
}

function CustomEnter(element, event) {
    if (event.key == "Enter" || event.keyCode == 13) {
        element.click();
        EventCatch(event);
    }
}

var LastDropDownSelected = null;
var DragItem = null;
/*
{
    Item
    Element
    Data

*/
var SizeElement = null;
var DragElement = null;
var DragType = null;
var DropElement = null;
var DragState = "";

function ToggleDropDown(element, event, force) {
    if (LastDropDownSelected != element || force == true) {
        if (LastDropDownSelected != null) {
            LastDropDownSelected.classList.remove("dropdown_open");
        }
        LastDropDownSelected = element;
        element.classList.add("dropdown_open");
        if (element.children[1].children.length > 0 && element.children[1].children[0].focus) {
            element.children[1].children[0].focus();
        }
    } else if (LastDropDownSelected != null) {
        LastDropDownSelected.classList.remove("dropdown_open");
        LastDropDownSelected = null;
    }
    EventCatch(event);
}

function SmartPositionDropDown(element, event) {

    if (LastDropDownSelected != element || force == true) {
        if (LastDropDownSelected != null) {
            LastDropDownSelected.classList.remove("dropdown_open");
        }
        LastDropDownSelected = element;
        element.classList.add("dropdown_open");
        var elementPosition = GetElementPosition(element, true);
        if (elementPosition.Height - elementPosition.Top - element.offsetHeight < 50) {
            element.children[1].style.bottom = element.offsetHeight + "px";
        } else {
            element.children[1].style.bottom = "";
        }
        console.log(elementPosition.Width + " - " + elementPosition.Left + " - " + element.offsetWidth + " < 50");
        if (elementPosition.Width - elementPosition.Left - element.offsetWidth < 50) {
            element.children[1].style.right = "0px";
            element.children[1].style.left = "auto";
        } else {
            element.children[1].style.right = "";
            element.children[1].style.left = "0px";
        }

        if (element.children[1].children.length > 0 && element.children[1].children[0].focus != null) {
            element.children[1].children[0].focus();
        }
    } else if (LastDropDownSelected != null) {
        LastDropDownSelected.classList.remove("dropdown_open");
        LastDropDownSelected = null;
    }
    EventCatch(event);

}

function AltDropDown(element, event, force) {
    element.classList.toggle("dropdown_open");
    EventCatch(event);
}

function EventCatch(event) {
    //event.preventDefault();
    event.stopPropagation();
}

document.onclick = function (event) {
    if (event.which == 1) {
        if (LastDropDownSelected) {
            LastDropDownSelected.classList.remove("dropdown_open");
            LastDropDownSelected = null;
        }
    }
};

document.onmouseup = function (event) {
    if (DragElement != null) {
        if (DropElement == null) {
            DragElement.DragSuccess();
        }
        DragElement.FinishDrag();
    } else if (SizeElement != null) {
        SizeElement.FinishDrag();
    }
};

document.onmousemove = function (event) {
    if (DragElement != null && DragElement.OnDrag != true) {
        DragElement.CheckDrag(event);
        DragElement.PositionElement(event);
    } else if (SizeElement != null) {
        SizeElement.CheckDrag(event);
    }
}

function MergeSort(list, property) {
    if (list == null || list.length < 2) {
        return list;
    }
    var result = [];
    var indexLeft = 0;
    var indexRight = 0;
    var left = MergeSort(list.slice(0, list.length / 2), property);
    var right = MergeSort(list.slice(list.length / 2), property);
    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft][property] < right[indexRight][property]) {
            result.push(left[indexLeft]);
            indexLeft += 1;
        } else {
            result.push(right[indexRight]);
            indexRight += 1;
        }
    }
    while (indexLeft < left.length) {
        result.push(left[indexLeft]);
        indexLeft += 1;
    } while (indexRight < right.length) {
        result.push(right[indexRight]);
        indexRight += 1;
    }
    return result;

}

function GlobalReplace(text, oldString, newString) {
    var replaceLocation = 0;
    while (text.indexOf(oldString, replaceLocation) > -1) {
        replaceLocation = text.indexOf(oldString, replaceLocation);
        text = text.replace(oldString, newString);
        replaceLocation += newString.length;
    }
    return text;
}

function Encode(encodeObject) {
    return btoa(JSON.stringify(encodeObject));
}

function Decode(decodeString) {
    return JSON.parse(atob(GlobalReplace(decodeString, "%3D", "=")));
}

function ConfirmationDialog(message, continueFunction, attachedObject) {

    var confirmDialog = document.createElement("div");
    confirmDialog.className = "page_fill";

    var fillShadow = document.createElement("div");
    fillShadow.className = "fill_shadow";
    confirmDialog.appendChild(fillShadow);

    var fillFiller = document.createElement("div");
    fillFiller.className = "page_fill_filler";
    confirmDialog.appendChild(fillFiller);

    var fillContents = document.createElement("div");
    fillContents.className = "page_fill_contents bg_white shadow_dark spacing_10";
    confirmDialog.appendChild(fillContents);

    var confirmHeader = document.createElement("h4");
    confirmHeader.className = "border_bottom border_light break_20";
    confirmHeader.innerHTML = "Hi";
    fillContents.appendChild(confirmHeader);

    var confirmMessage = document.createElement("div");
    confirmMessage.className = "text";
    confirmMessage.innerHTML = message;
    fillContents.appendChild(confirmMessage);

    var confirmBreak = document.createElement("div");
    confirmBreak.className = "break_20";
    fillContents.appendChild(confirmBreak);

    var confirmButtonHolder = document.createElement("div");
    confirmButtonHolder.className = "cell_xs_12 spacing_10 break_10";
    fillContents.appendChild(confirmButtonHolder);

    var confirmButton = document.createElement("div");
    confirmButton.className = "button button_full bg_violet";
    confirmButton.innerHTML = "Yes";
    confirmButton.onclick = CompleteDialogFunction(confirmDialog, continueFunction, attachedObject);
    confirmButtonHolder.appendChild(confirmButton);

    var cancelButtonHolder = document.createElement("div");
    cancelButtonHolder.className = "cell_xs_12 spacing_10 break_10";
    fillContents.appendChild(cancelButtonHolder);

    var cancelButton = document.createElement("div");
    cancelButton.className = "button button_full";
    cancelButton.innerHTML = "No";
    cancelButton.onclick = CloseDialogFunction(confirmDialog);

    cancelButtonHolder.appendChild(cancelButton);
    document.body.appendChild(confirmDialog);
}

function AlertMessageDialog(message, continueFunction, attachedObject) {
    var alertDialog = document.createElement("div");
    alertDialog.className = "page_fill";

    var fillShadow = document.createElement("div");
    fillShadow.className = "fill_shadow";
    alertDialog.appendChild(fillShadow);

    var fillFiller = document.createElement("div");
    fillFiller.className = "page_fill_filler";
    alertDialog.appendChild(fillFiller);

    var fillContents = document.createElement("div");
    fillContents.className = "page_fill_contents bg_white shadow_dark spacing_10";
    alertDialog.appendChild(fillContents);

    var alertHeader = document.createElement("h4");
    alertHeader.className = "border_bottom border_light break_20";
    alertHeader.innerHTML = "Hi";
    fillContents.appendChild(alertHeader);


    var alertMessage = document.createElement("div");
    alertMessage.className = "text spacing_10";
    alertMessage.innerHTML = message;
    fillContents.appendChild(alertMessage);

    var alertBreak = document.createElement("div");
    alertBreak.className = "break_10";
    fillContents.appendChild(alertBreak);

    var alertButtonHolder = document.createElement("div");
    alertButtonHolder.className = "cell_xs_6 spacing_10 break_20";
    fillContents.appendChild(alertButtonHolder);

    var alertButton = document.createElement("div");
    alertButton.className = "button button_full bg_blue";
    alertButton.innerHTML = "Close";
    alertButton.onclick = CompleteDialogFunction(alertDialog, continueFunction, attachedObject);
    alertButtonHolder.appendChild(alertButton);

    document.body.appendChild(alertDialog);
}

function CompleteDialogFunction(dialogueContainer, continueFunction, attachedObject) {
    return function () {
        document.body.removeChild(dialogueContainer);
        if (continueFunction != null) {
            continueFunction(attachedObject);
        }
    };
}

function CloseDialogFunction(dialogueContainer) {
    return function () {
        document.body.removeChild(dialogueContainer);
    };
}

function Notification(message) {
    var notification= document.createElement("div");
    notification.className = "main_notification main_notification_active";

    var notificationBody = document.createElement("div");
    notificationBody.className = "bg_white shadow_dark padding_10";
    notification.appendChild(notificationBody);

    var notificationMessage = document.createElement("div");
    notificationMessage.className = "label";
    notificationMessage.innerHTML = message;
    notificationBody.appendChild(notificationMessage);

    document.getElementById("notification_container").appendChild(notification);
    
    //(function(notificationBody))
    setTimeout(function () {
        notification.classList.remove("main_notification_active");
    }, 5000);

    setTimeout(function () {
        document.getElementById("notification_container").removeChild(notification);
    }, 7000);
};

var AngularApp = angular.module('AngularApp', ["ui.router"]);


AngularApp.config(['$httpProvider', '$sceDelegateProvider', '$stateProvider', '$locationProvider', '$urlRouterProvider', function ($httpProvider, $sceDelegateProvider, $stateProvider, $locationProvider, $urlRouterProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self'
    ]);

    //$httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

    //$locationProvider.html5Mode(true);
    
}]);

AngularApp.directive('ngdatepicker', function () {
    return {
        scope: {
            ngowner: '=',
            ngproperty: '=',
            ngcontinue: '&',
            ngattached: '='
        },
        templateUrl: '/Content/DatePicker.html?' + version,
        link: function (scope, element) {
            scope.DateZooming = 2;
            scope.SetDateZooming = function (zooming) {
                scope.DateZooming = zooming;
            };

            if (scope.ngowner != null) {
                var currentDate = scope.ngowner[scope.ngproperty];
                if (currentDate == null) {
                    currentDate = new Date();
                } else if (currentDate.getDate == null) {
                    currentDate = new Date(currentDate);
                    if (currentDate == "Invalid Date") {
                        currentDate = new Date();
                    }
                }

                scope.CurrentYear = currentDate.getFullYear();
                scope.CurrentMonth = currentDate.getMonth();

                scope.SelectedYear = currentDate.getFullYear();
                scope.SelectedMonth = currentDate.getMonth();
                scope.SelectedDay = currentDate.getDate();
            }

            scope.TodayYear = new Date().getFullYear();
            scope.TodayMonth = new Date().getMonth();
            scope.TodayDay = new Date().getDate();

            scope.DaysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
            scope.Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            scope.MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            scope.Days = [];
            scope.BlankDays = [];
            scope.Years = [];

            for (var i = 0; i < 12; i++) {
                scope.Years.push(scope.CurrentYear + 5 - i);
            }

            scope.GetDays = function () {
                var dayCount = scope.MonthDays[scope.CurrentMonth];
                if (scope.CurrentMonth == 1 && scope.CurrentYear % 4 == 0) {
                    if (scope.CurrentYear % 100 != 0 || scope.CurrentYear % 400 == 0) {
                        dayCount = 29;
                    }
                }
                var days = [];
                for (var i = 1; i <= dayCount; i++) {
                    days.push(i);
                }
                scope.Days = days;
                var firstMonthDay = new Date(scope.CurrentYear, scope.CurrentMonth, 1);
                var blankDayCount = firstMonthDay.getDay();
                if (blankDayCount == 0) { blankDayCount = 6; } else { blankDayCount -= 1; }
                var blankDays = [];

                for (var i = 1; i <= blankDayCount; i++) {
                    blankDays.push({});
                }

                scope.BlankDays = blankDays;
            };
            scope.GetDays();

            scope.SetYear = function (year) {
                scope.CurrentYear = year;
                scope.DateZooming = 1;
            };
            scope.SetMonth = function (month) {
                scope.CurrentMonth = month;
                scope.GetDays();
                scope.DateZooming = 2;
            };

            scope.ScrollMonth = function (modifier) {
                scope.CurrentMonth += modifier;
                if (scope.CurrentMonth == -1) {
                    scope.CurrentYear -= 1;
                    scope.CurrentMonth = 11;
                } else if (scope.CurrentMonth == 12) {
                    scope.CurrentYear += 1;
                    scope.CurrentMonth = 0;
                }
                scope.GetDays();
            };

            scope.SetDate = function (date) {
                scope.SelectedYear = scope.CurrentYear;
                scope.SelectedMonth = scope.CurrentMonth;
                scope.SelectedDay = date;
                scope.ngowner[scope.ngproperty] = scope.CurrentYear + "-" + (scope.CurrentMonth + 1 < 10 ? "0" : "") + (scope.CurrentMonth + 1) + "-" + (date < 10 ? "0" : "") + date + "T00:00:00";
                var fn = scope.ngcontinue();
                fn(scope.ngattached);
            };
        }
    }
});

AngularApp.directive('ngfiles', function () {
    return {
        scope: {
            nguploadurl: '&',
            nguploadprogresslist: '&',
            nguploadsuccess: '&',
            nguploaderror: '&',
            nguploaditem: '='
        },
        link: function (scope, element) {
            element[0].addEventListener('change', function (e) {
                var files = this.files;

                for (var i = 0; i < files.length; i++) {
                    var formData = new FormData();
                    formData.append('file', files[i]);

                    var nguploadurl = scope.nguploadurl();

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', nguploadurl);

                    var fileUploadProgress = { Name: files[i].name, Progress: 0 };
                    xhr.upload.onprogress = (function (fileUpload) {
                        return function (event) {
                            fileUpload.Progress = Math.floor(event.loaded / event.total * 100);
                            scope.$apply();
                        }
                    })(fileUploadProgress);

                    var uploadProgressList = scope.nguploadprogresslist();
                    if (uploadProgressList != null) {
                        uploadProgressList.push(fileUploadProgress);
                    }

                    var uploadSuccess = scope.nguploadsuccess();
                    var uploadError = scope.nguploaderror();

                    xhr.onreadystatechange = (function (localxhr, fileUploadProgress, fileUploadProgressList, onsuccess, onerror, item) {
                        return function (event) {
                            if (localxhr.readyState == 4) {
                                if (localxhr.status == 200) {
                                    if (onsuccess != null) {
                                        onsuccess(JSON.parse(localxhr.responseText), item);
                                    }
                                } else {
                                    if (onerror != null) {
                                        onerror(JSON.parse(localxhr.responseText), item);
                                    }
                                }
                                if (fileUploadProgressList != null) {
                                    fileUploadProgressList.splice(fileUploadProgressList.indexOf(fileUploadProgress));
                                }
                                scope.$apply();
                            }
                        }
                    })(xhr, fileUploadProgress, uploadProgressList, uploadSuccess, uploadError, scope.nguploaditem);

                    xhr.send(formData);
                }
            },
            false);
        }
    }
});
AngularApp.directive('ngenter', function () {
    return {
        link: function (scope, element, attrs) {
            element[0].addEventListener('keydown', function (e) {
            	if (e.shiftKey != true && (e.key == "Enter" || e.keyCode == 13)) {
            		scope.$apply(function () {
            			var onEnter = scope.$eval(attrs.ngenter);
            		});
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }
});


AngularApp.directive('ngdropdown', function () {
    return {
        scope: {
            ngdropdownblur: '&'
        },
        link: function (scope, element) {
            element[0].tabIndex = 0;
            element[0].addEventListener('blur', function (e) {
                var ngblur = scope.ngdropdownblur();
                if (ngblur != null) {
                    ngblur();
                }
            });
        }
    }
});

AngularApp.directive('ngdraggable', function () {
    return {
        scope: {
            ngdraggable: '=', //what is the main item
            ngdragged: '&', //called when drag is stopped
            ngdragaction: '=', //can be copy or blank
            ngdragtype: '=', //sent on can drag
            ngcandrag: '=', 
            ngdraggrid: '=',
            ngsizeable: '=',
            ngsized: '&'
        },
        link: function (scope, element) {
            //We start with DragStart and transition to Dragging to we can prevent when dragging but not prevent when its a click

            element[0].addEventListener('mousedown', function (e) {
                DragElement = element[0];
                if (e.button == 0 && (scope.ngcandrag == null || scope.ngcandrag)) {
                    scope.OriginalX = e.clientX;
                    scope.OriginalY = e.clientY;

                    var actualElement = element[0];
                    var realPosition = GetElementPosition(actualElement);
                    var rightDiff = actualElement.offsetWidth - (scope.OriginalX - realPosition.Left);
                    var bottomDiff = actualElement.offsetHeight - (scope.OriginalY - realPosition.Top);
                    if (rightDiff < 6 && (scope.ngsizeable == true || scope.ngsizeable == 'x')) {
                        SizeElement = element[0];
                        DragItem = scope.ngdraggable;
                        DragType = scope.ngdragtype;
                        DragState = "SizeRight";
                        scope.OriginalWidth = actualElement.offsetWidth;
                        scope.OriginalHeight = actualElement.offsetHeight;
                    } else if (bottomDiff < 6 && (scope.ngsizeable == true || scope.ngsizeable == 'y')) {
                        SizeElement = element[0];
                        DragItem = scope.ngdraggable;
                        DragType = scope.ngdragtype;
                        DragState = "SizeBottom";
                        scope.OriginalWidth = actualElement.offsetWidth;
                        scope.OriginalHeight = actualElement.offsetHeight;
                    } else {
                        DragState = "DragStart";
                    }

                    //e.preventDefault();
                    e.stopPropagation();
                }
            });
            element[0].addEventListener('mouseup', function (e) {
                if (DragState == "DragStart") {
                    DragState = "";
                }
            });
            element[0].addEventListener('dragstart', function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            element[0].addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            element[0].addEventListener('select', function (e) {
                //e.preventDefault();
                //e.stopPropagation();
            });
            element[0].DragSuccess = function () {
                if (DragState == "Dragging") {
                    var dragged = scope.ngdragged();
                    if (dragged != null) {

                        var parentPosition = GetElementPosition(DragElement.parentNode);

                        var left = DragElement.offsetLeft - parentPosition.Left;
                        var top = DragElement.offsetTop - parentPosition.Top;

                        try {
                            dragged(scope.ngdraggable, {
                                left: left,
                                top: top,
                                width: DragElement.offsetWidth,
                                height:DragElement.offsetHeight
                            });
                        } catch (e) { }

                    }
                }
            };
            element[0].FinishDrag = function (reposition) {
                DragElement = null;
                SizeElement = null;
                DragItem = null;
                if (DragState == "Dragging") {
                    var actualElement = element[0];
                    actualElement.classList.remove("dragging");
                    if (scope.ngdragaction == null || scope.ngdragaction == "Copy") {
                        actualElement.style.left = "";
                        actualElement.style.top = "";
                        actualElement.style.width = "";
                        actualElement.style.height = "";
                    } else {
                        if (scope.ngcandrag == "x") {
                            actualElement.style.top = "";

                        } else if (scope.ngcandrag = "y") {
                            actualElement.style.left = "";
                        }
                    }
                } else if (DragState == "SizeRight" || DragState == "SizeBottom") {
                    var actualElement = element[0];

                    var sized = scope.ngsized();

                    var newWidth = actualElement.offsetWidth;

                    if (sized != null) {
                        sized(scope.ngdraggable, {
                            width: newWidth,
                            left: actualElement.offsetLeft,
                            height: actualElement.offsetHeight,
                            top: actualElement.offsetTop,
                        });
                    }
                    //actualElement.style.height = "";
                    //actualElement.style.width = "";

                }
                DragState = "";
            };
            element[0].PositionElement = function (e) {
                if (DragState == "Dragging") {
                    var actualElement = element[0];
                    var setLeft = (e.clientX - scope.DiffX);
                    if (scope.DiffX == null) {
                        alert("oh shit");
                    }
                    var setTop = (e.clientY - scope.DiffY);

                    if (scope.ngdraggrid != null) {
                        var parentPosition = GetElementPosition(actualElement.parentNode);                                               
                        setLeft = Math.round(setLeft / scope.ngdraggrid) * scope.ngdraggrid + parentPosition.Left % scope.ngdraggrid;
                        setTop = Math.round(setTop / scope.ngdraggrid) * scope.ngdraggrid + parentPosition.Top % scope.ngdraggrid;
                    }
                    var parentScroll = GetElementPosition(actualElement, true);
                    //console.log("scroll " + parentScroll.TotalScroll);
                    //setTop += parentScroll.TotalScroll;
                    
                    if (scope.ngcandrag == null || scope.ngcandrag == true || scope.ngcandrag == "x") {
                        actualElement.style.left = setLeft + "px";
                    } else {
                    }
                    if (scope.ngcandrag == null || scope.ngcandrag == true || scope.ngcandrag == "y") {
                        actualElement.style.top = setTop + "px";
                    } else {
                    }
                }
            };
            element[0].addEventListener('mousemove', function (e) {
                element[0].CheckDrag(e);
            });
            element[0].CheckDrag = function (e) {
                if (scope.ngcandrag != false) {
                    var actualElement = element[0];
                    if (element[0] == DragElement) {
                        if (element[0] == DragElement) {
                            e.OnDrag = true;
                        }
                        if (DragState == "DragStart") {
                            var diffX = e.clientX - scope.OriginalX;
                            var diffY = e.clientY - scope.OriginalY;
                            if (diffX > 2 || diffX < -2 || diffY > 2 || diffY < -2) {
                                DragItem = scope.ngdraggable;
                                DragType = scope.ngdragtype;
                                DragState = "Dragging";
                                
                                var realPosition = GetElementPosition(actualElement);

                                scope.DiffX = scope.OriginalX - realPosition.Left;
                                scope.DiffY = scope.OriginalY - realPosition.Top;
                                if (scope.ngcandrag == null || scope.ngcandrag == true || scope.ngcandrag == "x") {
                                    //actualElement.style.left = realPosition.Left + "px";
                                }
                                if (scope.ngcandrag == null || scope.ngcandrag == true || scope.ngcandrag == "y") {
                                    //actualElement.style.top = realPosition.Top + "px";

                                }
                                actualElement.style.left = realPosition.Left + "px";
                                actualElement.style.top = realPosition.Top + "px";


                                actualElement.style.width = actualElement.offsetWidth + "px";
                                actualElement.style.height = actualElement.offsetHeight + "px";
                                actualElement.classList.add("dragging");

                            }
                        } else if (DragState == "SizeRight") {
                            var width = scope.OriginalWidth + e.clientX - scope.OriginalX;
                            if (scope.ngdraggrid != null) {
                                width = Math.round(width / scope.ngdraggrid) * scope.ngdraggrid;
                            }
                            if (width < 10) {
                                width = 10;
                            }
                            actualElement.style.width = width + "px";
                        } else if (DragState == "SizeBottom") {
                            var height = scope.OriginalHeight + e.clientY - scope.OriginalY;
                            if (scope.ngdraggrid != null) {
                                height = Math.round(height / scope.ngdraggrid) * scope.ngdraggrid;
                            }
                            if (height < 20) {
                                height = 20;
                            }
                            actualElement.style.height = height + "px";
                        }
                    } else if(DragElement == null){
                        if (scope.ngsizeable != false) {
                            var realPosition = GetElementPosition(actualElement);
                            var rightDiff = actualElement.offsetWidth - (e.clientX - realPosition.Left);
                            var bottomDiff = actualElement.offsetHeight - (e.clientY - realPosition.Top);
                            if (rightDiff < 6 && (scope.ngsizeable == true || scope.ngsizeable == 'x')) {
                                actualElement.classList.add("sizeable_right");
                                actualElement.classList.remove("sizeable_bottom");
                                actualElement.classList.remove("draggable");
                            } else if (bottomDiff < 6 && (scope.ngsizeable == true || scope.ngsizeable == 'y')) {
                                actualElement.classList.remove("sizeable_right");
                                actualElement.classList.add("sizeable_bottom");
                                actualElement.classList.remove("draggable");
                            } else {
                                actualElement.classList.remove("sizeable_right");
                                actualElement.classList.remove("sizeable_bottom");
                                actualElement.classList.add("draggable");
                            }
                        } else {
                            actualElement.classList.add("draggable");

                        }
                    }
                }
            }


        }
    };
});

AngularApp.directive('ngdraginput', function () {
    return {
        link: function (scope, element) {

            element[0].addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                
            });
            element[0].addEventListener('dragstart', function (e) {
                e.stopPropagation();
            });
        }
    };
});

AngularApp.directive('ngdroparea', function () {
    return {
        scope: {
            ngdropposition: '=',
            ngdropowner: '=',
            ngondrop: '&',
            ngcandrop: '&'
        },
        link: function (scope, element) {
            scope.PlaceholderIndex = -2;
            scope.PlaceholderElement = null;
            scope.CanDrop = scope.ngcandrop();
            element[0].addEventListener('mouseup', function (e) {
                if (DragElement != null && DragState == "Dragging") {
                    //e.preventDefault();
                    e.stopPropagation();

                    var actualElement = element[0];

                    var ondrop = scope.ngondrop();
                    if (ondrop != null) {

                        var elementPosition = GetElementPosition(actualElement);
                        var left = DragElement.offsetLeft - elementPosition.Left;
                        var top = DragElement.offsetTop - elementPosition.Top;

                        if (left > actualElement.offsetWidth - DragElement.offsetWidth) {
                            left = actualElement.offsetWidth - DragElement.offsetWidth;
                        }
                        if (left < 0) {
                            left = 0;
                        }

                        if (top > actualElement.offsetHeight - DragElement.offsetHeight) {
                            top = actualElement.offsetHeight - DragElement.offsetHeight;
                        }
                        if (top < 0) {
                            top = 0;
                        }


                        try {
                            var result = ondrop(scope.ngdropowner, DragItem, scope.PlaceholderIndex, {
                                left: left,
                                top: top
                            });
                            if (result != true) {
                                DragElement.DragSuccess();
                            }
                        } catch (e) { }
                    } else {
                        DragElement.DragSuccess();
                    }
                    DragElement.FinishDrag(scope.ngdropposition != "absolute");

                    actualElement.DragLeft();
                }
            });

            element[0].addEventListener('mousemove', function (e) {
                if (DragState == "Dragging") {
                    if (scope.CanDrop != null) {
                        if (scope.CanDrop(scope.ngdropowner, DragType) != true) {
                            return false;
                        };
                    }
                    var actualElement = element[0];

                    if (DropElement == null) {
                        DropElement = actualElement;
                    }
                    if (DropElement == actualElement) {
                        element[0].PositionPlaceholder(e);
                    }
                }
            });
            element[0].addEventListener('mouseenter', function (e) {
                if (DragState == "Dragging") {
                    if (DropElement != null) {
                        DropElement.DragLeft();
                    }
                    if (scope.CanDrop != null) {
                        if (scope.CanDrop(DragType) != true) {
                            return false;
                        };
                    }
                    var actualElement = element[0];
                    DropElement = actualElement;
                }
            });
            element[0].addEventListener('mouseleave', function (e) {
                element[0].DragLeft();
                DropElement = null;
            });
            element[0].DragLeft = function () {
                if (scope.PlaceholderIndex != -2) {
                    var actualElement = element[0];
                    actualElement.removeChild(scope.PlaceholderElement);
                    scope.PlaceholderElement = null;
                    scope.PlaceholderIndex = -2;
                }
            }
            element[0].PositionPlaceholder = function (e) {
                var actualElement = element[0];
                var elementPosition = GetElementPosition(actualElement);

                if (scope.ngdropposition == "absolute") {
                    if (scope.PlaceholderIndex == -2) {
                        scope.PlaceholderElement = document.createElement("div");
                        scope.PlaceholderElement.classList.add("dnd_placeholder");
                        scope.PlaceholderElement.style.position = "absolute";

                        actualElement.appendChild(scope.PlaceholderElement);
                        scope.PlaceholderIndex = actualElement.children.length - 1;
                    } else {
                        scope.PlaceholderElement = actualElement.children[scope.PlaceholderIndex];
                    }
                    var left = e.clientX - elementPosition.Left - (scope.PlaceholderElement.offsetWidth / 2);
                    var top = e.clientY - elementPosition.Top - (scope.PlaceholderElement.offsetHeight / 2);
                    if (left < 0) {
                        left = 0;
                    } else if (left > actualElement.offsetWidth - scope.PlaceholderElement.offsetWidth) {
                        left = actualElement.offsetWidth - scope.PlaceholderElement.offsetWidth;
                    }
                    if (top < 0) {
                        top = 0;
                    } else if (top > actualElement.offsetHeight - scope.PlaceholderElement.offsetHeight) {
                        top = actualElement.offsetHeight - scope.PlaceholderElement.offsetHeight;
                    }
                    scope.PlaceholderElement.style.left = left + "px";
                    scope.PlaceholderElement.style.top = top + "px";
                } else {
                    //Loop through children, and see where it would be, left to right first, then top to bottom

                    var testingY = e.clientY - elementPosition.Top;
                    var testingX = e.clientX - elementPosition.Left;
                    var pastDrag = 0;
                    var pastPlaceholder = 0;
                    for (var i = 0; i <= actualElement.children.length; i++) {
                        var posTest = false;
                        if (i == actualElement.children.length) {
                            testingElement = null;
                            posTest = true;

                        } else {
                            var testingElement = actualElement.children[i];
                            if (testingElement == DragElement) {
                                pastDrag = 1;
                            } else if (testingElement == scope.PlaceholderElement) {
                                pastPlaceholder = 1;
                            } else {
                                //if it is higher than the bottom, this is it
                                var posTest = testingY < (testingElement.offsetTop + testingElement.offsetHeight);
                                if (posTest == true) {
                                    var posTest = testingX < (testingElement.offsetLeft + testingElement.offsetWidth);
                                }
                                //If it is higher than the top half, 
                            }
                        }

                        if (posTest == true) {
                            //This would be putting it in the same position?
                            if (scope.PlaceholderIndex == -2) {
                                scope.PlaceholderElement = document.createElement("div");
                                scope.PlaceholderElement.classList.add("dnd_placeholder");
                            }
                            actualElement.insertBefore(scope.PlaceholderElement, testingElement);
                            scope.PlaceholderIndex = i - pastDrag - pastPlaceholder;
                            i = actualElement.children.length;
                        }
                    }
                }


            };

        }
    };
});

AngularApp.directive('ngfocuscreate', function () {
    return {
        link: function (scope, element, attrs) {
            var create = scope.$eval(attrs.ngfocuscreate);
            if(create != false){
            setTimeout(function () {
                element[0].focus();
                element[0].selectionStart = element[0].selectionEnd = element[0].value.length;
            }, 100);
            }
        }
    }
});


AngularApp.directive('ngstickyscroll', function () {
    return {
        link: function (scope, element, attrs) {
            var sticky = scope.$eval(attrs.ngstickyscroll);
            sticky.CheckScroll = (function (element, sticky) {
                return function (force) {
                    if (force == true || (element.offsetHeight + element.scrollTop - element.scrollHeight) > 0) {
                        setTimeout(function () {
                            element.scrollTop = element.scrollHeight;
                        }, 100);
                    }
                };
            })(element[0], sticky);
        }
    }
});

AngularApp.directive('ngscrollto', function () {
    return {
        link: function (scope, element, attrs) {
            var scrollTo = scope.$eval(attrs.ngscrollto);
            setTimeout(function () {
                element[0].scrollTop = element[0].scrollHeight * scrollTo;
            }, 1000);
        }
    }
});


function GetElementPosition(element, stopAtScroll) {
    if (element.parentNode != null && element.parentNode.offsetLeft != null && (stopAtScroll == null || element.parentNode.style.overflowY == "")) {
        
        var elementPosition = GetElementPosition(element.parentNode, stopAtScroll);
        
        elementPosition.Left += element.offsetLeft;
        elementPosition.Left -= element.parentNode.scrollLeft;
        elementPosition.Top += element.offsetTop;
        elementPosition.Top -= element.parentNode.scrollTop;
        return elementPosition;
    } else {        
        return {
            Left: element.offsetLeft,
            Top: element.offsetTop,
            Height: element.parentNode.offsetHeight + element.parentNode.scrollTop,
            Width: element.parentNode.offsetWidth + element.parentNode.scrollLeft,
            TotalScroll: element.parentNode.scrollTop
        }
    }
}

function CreditCardFilter(element, event) {
    if ((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106)) {
        if (element.value.length > 18) {
            event.preventDefault();
            return false;
        }
        addingCharacter = 1;
    } else if (event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 173 || event.keyCode == 109 || event.keyCode == 46) {
        //Backspace, tab, dash
    } else if (event.keyCode == 37 || event.keyCode == 39) {
        //Backspace, tab, dash
    } else {
        if (event.ctrlKey) {
        } else {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }
}

function CreditCardKey(element, event) {
    if ((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106)) {
        if (element.value.length > 18) {
            event.preventDefault();
            return false;
        }
    } else if (event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 173 || event.keyCode == 109 || event.keyCode == 46) {
    } else if (event.keyCode == 37 || event.keyCode == 39) {
        return false;
    }

    var numberPosition = 0;

    var selectionStart = element.selectionStart;
    var cardNumber = element.value;

    var formattedNumber = "";
    var countedNumbers = 0;

    var digits = "0123456789";

    for (var i = 0; i < cardNumber.length && i < 19; i++) {
        if (digits.indexOf(cardNumber[i]) > -1) {

            if (i < selectionStart) {
                numberPosition += 1;
            }

            countedNumbers += 1;

            if(countedNumbers % 4 == 1 && i > 1){
                formattedNumber += "-";

                if (i < selectionStart) {
                    numberPosition += 1;
                }
            }
            formattedNumber += cardNumber[i];
        } else {
            if (i < selectionStart) {
                //selectionStart -= 1;
            }
        }
    }
    element.value = formattedNumber;

    element.selectionStart = numberPosition;

    if (!event.ctrlKey && event.keyCode != 17 && event.keyCode != 18) {
        element.selectionEnd = numberPosition;
    }

    //bspc 8
    // enter 13
    //tab 9
    //arrows 37 - 40
}