application.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/game/list', {templateUrl: '/js/views/game/list.html', controller: GameListController}).
        when('/game/:id', {templateUrl: '/js/views/game/game.html', controller: GameController}).
        when('/game/create', {templateUrl: '/js/views/game/create.html', controller: GameCreateController}).

        when('/user/login', {templateUrl: '/js/views/user/login.html', controller: UserLoginController}).
        when('/user/reg', {templateUrl: '/js/views/user/reg.html', controller: UserRegController}).
        when('/user/logout', {templateUrl: '/js/views/user/logout.html', controller: UserLogoutController}).

        when('/error/404', {templateUrl: '/js/views/error/404.html', controller: Error404Controller}).

        otherwise({redirectTo: '/error/404'});
}])