'use strict';

var app = angular.module('coolwallApp');

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "=",
            filename: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var f = changeEvent.target.files[0];
                var reader = new FileReader();

                reader.onloadend = (function(theFile) {
                    return function(e) {
                        scope.$apply(function() {
                            scope.fileread = e.target.result;
                            scope.filename = theFile.name;
                        });
                    }
                })(f);
                
                reader.readAsDataURL(f);
            });
        }
    }
}]);