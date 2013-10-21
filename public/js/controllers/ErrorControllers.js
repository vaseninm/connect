function Error404Controller($scope, $routeParams, $rootScope, $http, $interval, CONFIG) {
    setError(null, 404);
    $interval(setError, 1000);
    function setError(count, code) {
        $scope.error = code ? code : (Math.round(Math.random() * 300) + 200);
    }
}