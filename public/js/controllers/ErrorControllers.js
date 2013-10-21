function Error404Controller($scope, $routeParams, $rootScope, $http, $interval, CONFIG) {
    setError(404);
    $interval(setError, 1000);
    function setError(code) {
        $scope.error = code ? code : Math.round(Math.random() * 300) + 200;
    }
}