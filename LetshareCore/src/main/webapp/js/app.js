var app = angular.module('app', ['app.config', 'ui.router', 'ngResource', 'Letshare', 'ui.bootstrap', 'underscore']);

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', 
        function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        //unmactched URLs return to monitor page
        $urlRouterProvider.otherwise('/home');
        $urlRouterProvider.when('/posts', '/posts/list');
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'partials/app.html'
            })
            .state('home', {
                url: '/home',
                templateUrl: 'partials/home.html',
                controller: 'HomeController',
                parent: 'app',
                authenticate: false
            })
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'LoginController',
                parent: 'app'
            })
            .state('user', {
                url: '/user',
                templateUrl: 'partials/user.html',
                controller: 'UserController',
                parent: 'app'
            })
           .state('user.register', {
                url: '/register',
                templateUrl: 'partials/user/user-register.html',
                controller: 'UserController',
                parent: 'user'
            })
            .state('user.logout', {
                url: '/logout',
                controller: 'SessionController',
                parent: 'user'
            })
            .state('posts', {
                url: '/posts',
                templateUrl: 'partials/posts.html',
                params: {
                    cityId: 0,
                    searchTitle: '',
                    categoryId: 0
                },
                parent: 'app',
                authenticate: false
            })
            .state('posts.list', {
                url: '/list',
                params: {
                    cityId: 0,
                    searchTitle: '',
                    categoryId: 0
                },
                templateUrl: 'partials/posts/posts-list.html',
                controller: 'PostsController',
                parent: 'posts',
                authenticate: false
            })
            .state('posts.new', {
                url: '/new',
                templateUrl: 'partials/posts/posts-new.html',
                controller: 'PostsNewController',
                parent: 'posts',
                authenticate: true
            })
            .state('posts.details', {
                url: '/:id',
                templateUrl: 'partials/posts/posts-details.html',
                controller: 'PostsDetailsController',
                parent: 'posts',
                authenticate: false
            });
            
            $httpProvider.interceptors.push('authInterceptor');
            
            $httpProvider.defaults.withCredentials = true;

            $locationProvider.html5Mode(true);

    }]);

    app.run(['$rootScope',  '$state', '$location', 'LoginService', function($rootScope,  $state, $location, LoginService) {
        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            $rootScope.currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
            if (to.authenticate) {
                $rootScope.currentUser = LoginService.loginCheck();

                $rootScope.$watch('currentUser',function(newVal, oldVal) {
                    if ($rootScope.currentUser != null && to.name === 'login') {
                        evt.preventDefault();
                    }
                  
                    if ($rootScope.currentUser == null) {
                        evt.preventDefault();
                        $rootScope.redirectTo = to;
                        $state.go('login', params);
                    } 
                });
            }
        });
    }]);

angular.module('Letshare', ['app.config', 'ui.router', 'ui.bootstrap',
    'isteven-multi-select', 'ngFileUpload', 'ngIdle', 'angucomplete-alt']);


(function() {

    var expandModule = angular.module('expand', []);

    expandModule.directive('expandModal', ["$compile", "ExpandService", function($compile, ExpandService) {
        return {
            scope: true,
            restrict: 'E',
            controller: 'expandButtonController',
            templateUrl: '../partials/expand-modal.html',
            link: function(scope, element) {

                var chartProperties = ExpandService.getChartScope();
                //making a clone of the "Monitor" and/or "Report" anchor elements
                var anchorElement = angular.element(document.getElementById(chartProperties.additionalLinksId)).clone();

                for (var i = 0; i < anchorElement.children().length; i++) {
                    //Adding the ng-click attribute to close the modal as the anchor leads to another page
                    angular.element(anchorElement.children()[i]).attr('ng-click', 'close()');
                    angular.element(anchorElement.children()[i]).removeAttr('ui-sref');
                    angular.element(anchorElement.children()[i]).removeAttr('ng-if');
                }
                //add anchorElement to div class="anchor-space"
                angular.element(element.children()[0].children[3]).append(anchorElement);
                $compile(anchorElement)(scope);

            }
        };
    }]);

    /**
     * The controller sets the scope properties that are used by the cloned chart for expansion, plus some few functions
     * for modal related operations
     */
    expandModule.controller('expandButtonController', ['$scope', 'svLocale', 'ExpandService', 'ChartSeriesService',
        '$sce', function($scope, svLocale, ExpandService, ChartSeriesService, $sce) {
            var scopeElements = ExpandService.getChartScope();
            var modalInst = ExpandService.modal();

            $scope.svLocale = svLocale;

            $scope.title = $sce.trustAsHtml(scopeElements.title);
            $scope.exportTitle = scopeElements.exportTitle;
            $scope.hideChartTitle = true;
            $scope.chartStyle = scopeElements.chartStyle;
            $scope.chartStyleLocked = scopeElements.chartStyleLocked;
            $scope.type = 'clone';
            $scope.clonedType = scopeElements.type;
            $scope.url = scopeElements.url;

            $scope.period = scopeElements.period;
            $scope.updateInterval = -1;
            $scope.yAxisTitle = scopeElements.yAxisTitle;
            $scope.seriesColors = scopeElements.seriesColors;

            $scope.data = [];
            $scope.autoUpdate = true;
            $scope.capacityLine = scopeElements.capacityLine;
            $scope.noLegend = scopeElements.noLegend;
            $scope.legendAlignment = 'right';
            $scope.lineWidth = scopeElements.lineWidth;

            $scope.plotAreaBorderWidth = scopeElements.plotAreaBorderWidth;
            $scope.plotAreaBorderColor = scopeElements.plotAreaBorderColor;
            $scope.resultSubset = scopeElements.resultSubset;
            $scope.helpContentKey = scopeElements.helpContentKey;

            if (scopeElements.chartStyle === 'pie') {
                $scope.seriesData = $scope.data = scopeElements.data;
            } else {
                $scope.data = scopeElements.data;
                $scope.seriesData = scopeElements.chart.series;
            }

            $scope.close = function() {
                ExpandService.close();
                ChartSeriesService.disableCloningBroadcast();
            };

            //stop the data broadcast service of the chart being expanded (not the cloned chart) when clicking outside
            //the modal which initiates the modal closure.
            modalInst.result.finally(function() {
                ChartSeriesService.disableCloningBroadcast();
            });

            $scope.legendTitle = '';
            $scope.legendType = 'bandwidth';
            $scope.legendModel = [];
            $scope.removeLegendLinks = false;
            $scope.toDisable = [];
            $scope.toDisableLegend = [];

            if (scopeElements.legendBarId) {
                var legendBarElement = angular.element(document.getElementById(scopeElements.legendBarId)).clone();
                $scope.legendBarScope = legendBarElement[0].attributes;
                $scope.legendTitleNode = $scope.legendBarScope.getNamedItem('title');
                $scope.legendTypeNode = $scope.legendBarScope.getNamedItem('type');

                if ($scope.legendTitleNode && $scope.legendTitleNode.value) {
                    $scope.legendTitle = $scope.legendTitleNode.value;
                }

                if ($scope.legendTypeNode && $scope.legendTypeNode.value) {
                    $scope.legendType = $scope.legendTypeNode.value;
                }

                $scope.legendModel = scopeElements.chartData;

                $scope.chartUpdate = function(legendEntry) {
                    var index = $scope.toDisable.indexOf(legendEntry.value.replace(/ /g, '-'));
                    var selectElement = angular.element(legendEntry.element.srcElement);
                    if (index === -1) {
                        $scope.toDisable.push(legendEntry.value.replace(/ /g, '-'));
                        selectElement.toggleClass('sv-toggle-text-color');
                    } else {
                        $scope.toDisable.splice(index, 1);
                        selectElement.toggleClass('sv-toggle-text-color');
                    }
                };

                if (scopeElements.disabledSeries.length > 0) {
                    $scope.toDisableLegend = scopeElements.disabledSeries;
                }
            }
        }
    ]);

    /**
     * Provides service for modal initiating and closure, plus gives access to scope of the chart to be expanded/cloned
     */
    expandModule.service('ExpandService', ['$modal', function($modal) {

        var instanceChartScope = '';
        this.getChartScope = function() {
            return instanceChartScope;
        };

        var modalInstance = {};

        this.open = function(animationEnabled, chartScope) {
            modalInstance = $modal.open({
                animation: animationEnabled,
                template: '<expand-modal></expand-modal>',
                windowClass: 'sv-expand-modal',
                resolve: {
                    chartScope: function() {
                        instanceChartScope = chartScope;
                    }
                }
            });
        };

        this.close = function() {
            modalInstance.close();
        };

        this.modal = function() {
            return modalInstance;
        };
    }]);

}());

angular.module('Letshare').controller('Header', ['$scope', 'svLocale',
    function($scope, svLocale) {

        $scope.languages = svLocale.getLocales();
        $scope.selected = svLocale.getSelectedLanguage();

        $scope.languageChanged = function(language) {
            svLocale.setSelectedLanguage(language);
        };
    }
]);

angular.module('Letshare').factory('authInterceptor', function() {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            var token = 'Bearer access';
            if (window.localStorage.token) {
                token = 'Bearer ' + window.localStorage.token;
            }
            
            config.headers.Authorization = config.headers.Authorization || token;
            return config;
        },
        response: function(response) {
          // do something on success
          if (response.data) {
              window.localStorage.token = response.data.token || window.localStorage.token;
          }
          return response;
        }
    }
});
angular.module('Letshare').controller('HomeController',
    ["$scope", "$http", "$state", "$modal", "svLocale", "categoryAPIService", "locationsAPIService", function($scope, $http, $state, $modal, svLocale, categoryAPIService, locationsAPIService) {
        console.log('Home');
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.categories = [{
            value: 0
        },{
            value: 1
        },{
            value: 2
        }];
        
        /*
        $scope.searchTitle = '';
        $scope.selection = {};
        $scope.onCitySelection = function() {
            $scope.selectedCity = $scope.selection.city.originalObject;
            //$('.area-selection-box').removeClass('in');
        }
        
        $scope.$watch('selectedCity', function(newVal, oldVal) {
            //if (newVal !== oldVal) {
                $('.area-selection-box').removeClass('in');
            //}
        })
        
        
        $scope.getCategories = function() {
            categoryAPIService.getAllCategories().then(function(response) {
                $scope.categoriesList = response.data.categories;
            }, function() {
                console.error('ERROR: While loading categories');
            });
        }
        
        $scope.selectPopularCity = function(city) {
            $scope.selectedCity = city;
        }
        $scope.getPosts = function(cityId, category, searchTitle) {
            var queryParams = {
                cityId: cityId, 
                searchTitle: searchTitle, 
                categoryId: category.categoryId
            };
            window.localStorage.setItem('queryParams', JSON.stringify(queryParams));
            $state.go('posts', queryParams);
        }
        locationsAPIService.getAllCities().then(function(response) {
           $scope.cities = response.data.cities;
           $scope.selectedCity = $scope.cities[0];
        }, function() {
           console.error('ERROR: While loading cities');
        });
        $scope.getCategories();
        */
    }]
);
angular.module('Letshare').factory('svLocale', ['$stateParams', '$state', '_',
    function($stateParams, $state, _) {
        var factory = {};
        var locales = [
            {value: 'en-us', title: 'English'},
            {value: 'ko-kr', title: '한국어'}
        ];
        var contentList = {
            //Menu
            'home': {
                'en-us': 'Home',
                'ko-kr': '지도'
            },
            'health' : {
                'en-us': 'Health',
                'ko-kr': '지도'
            },
            'closeBtn' : {
                'en-us': 'Close',
                'ko-kr': '지도'
            },
            'submitBtn' : {
                'en-us': 'Submit',
                'ko-kr': '지도'
            },
            'login' : {
                'en-us': 'Login',
                'ko-kr': '지도'
            },
            'register' : {
                'en-us': 'Register',
                'ko-kr': '지도'
            }
        };

        factory.selectedLanguage = locales[0];
        for (var i = 0; i < locales.length; i++) {
            if (locales[i].value.substring(0, 2) === $stateParams.lang) {
                factory.selectedLanguage = locales[i];
                break;
            }
        }

        factory.setSelectedLanguage = function(selected) {
            if (selected && factory.selectedLanguage !== selected) {
                factory.selectedLanguage = selected;
                $stateParams.lang = factory.selectedLanguage.value.substring(0, 2);
                $state.go($state.$current, null, {reload: true});
            }
        };

        factory.getSelectedLanguage = function() {
            return factory.selectedLanguage;
        };

        factory.getLocales = function() {
            return locales;
        };

        factory.translate = function(content, lang) {
            if (!lang) {
                lang = factory.selectedLanguage.value;
            }

            if (contentList.hasOwnProperty(content) &&
                contentList[content].hasOwnProperty(lang)) {
                return contentList[content][lang];
            } else {
                return null;
            }
        };

        // Returns the key for specified value, ie. value of "Top 10" would return "top10"
        factory.getKeyForValue = function(value, lang) {
            if (!value) {
                return null;
            }

            if (!lang) {
                lang = 'en-us';
            }

            var pair = _.find(contentList, function(content) {
                return content[factory.selectedLanguage.value] === value;
            });

            if (pair) {
                return pair[lang];
            } else {
                return null;
            }
        };

        return factory;
    }
]);

(function() {
    var vm = this;
    angular.module('Letshare').controller('LoginController', 
        ["$scope", "$rootScope", "$state", "LoginService", "authAPIService", function($scope, $rootScope, $state, LoginService, authAPIService) {
            console.log('login');
            var DEFAULT_REDIRECT = 'posts';
            $scope.formValid = true;
            //var currentUser = LoginService.loginCheck();
            if($rootScope.currentUser) {
                $state.go('home');
            }
            
            function validateForm(form) {
                if (form.$valid) {
                    $scope.formValid = true;
                    return true;
                } else {
                    $scope.formValid = false;
                    return false;
                }
            }
            
            $scope.doLogin = function() {
                var isFormValid = validateForm($scope.loginForm);
                if (isFormValid) {
                    $scope.errorMsg = '';
                    authAPIService
                    .authenticateUser($scope.user.username, $scope.user.password)
                    .then(function(response) {
                        var result = response.data;
                        if(result.success) {
                            window.localStorage.setItem('currentUser', JSON.stringify(result.user));
                            window.localStorage.setItem('loggedIn', true);
                            window.localStorage.setItem('token', result.token);
                            $rootScope.currentUser = result.user;
                            
                            if ($rootScope.redirectTo) {
                                $state.go($rootScope.redirectTo);
                            } else {
                                $state.go(DEFAULT_REDIRECT);
                            }
                        } else {
                            $scope.errorMsg = 'Invalid username or password';//result.message;
                        }
                    }, function() {
                        console.log('ERROR');
                    });
                }
                
            };

            
            
    }]);

    angular.module('Letshare').service('LoginService', ["$state", "$rootScope", "authAPIService", function($state, $rootScope, authAPIService) {
        var vm = this;
        
        vm.loginCheck = function() {
            if (window.localStorage && window.localStorage.getItem('loggedIn')) {
                var currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
                authAPIService.validateUserSession(currentUser).then(function(response) {
                    var result = response.data;
                    if (!result.validSession) {
                        $rootScope.currentUser = null;
                        window.localStorage.setItem('currentUser', null);
                        $state.go('login');
                    } else {
                        $rootScope.currentUser = currentUser;
                    }
                });
                return currentUser;
            }
            return null;
        }

    }]);

    angular.module('Letshare').factory('authAPIService', ["$http", "ENV", function($http, ENV) {
        var authService = {};
        authService.authenticateUser = function(email, password) {
            return $http({
                    method: 'POST',
                    url: ENV.api + 'user/auth',
                    data: {email: email, password: password},
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'prelogin'
                    },
                    transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            
                        return str.join("&");
                    }
                });
        };
        
        authService.validateUserSession = function(user) {
            return $http({
                    method: 'POST',
                    url: ENV.api + 'user/validatesession',
                    data: user
                });
        };
        
        return authService; 
    }]);
    
})();

angular.module('Letshare').service('svTabsData', [function() {
        var tabs = {
            'home': [
                'devices'
            ]
        };

        this.screen = function(screenId) {
            return tabs[screenId];
        };

        this.getDefaultTabId = function(screenId) {
            return Object.keys(tabs[screenId])[0];
        };
    }
]);

angular.module('Letshare').controller('Menu', ['$scope', '$rootScope', '$stateParams', '$http', '$location',
    '$state', 'svTabsData', '$document', 'svLocale', '_',
    function($scope, $rootScope, $stateParams, $http, $location, $state, svTabsData,
        $document, svLocale, _) {

        $scope.menuType = 'task';

        $scope.setCurrentState = function() {
            $scope.currentState = $state.current.name;
        };

        $scope.setCurrentState();
        $rootScope.$on('$stateChangeSuccess', $scope.setCurrentState);
        $scope.inState = function(state) {
            if (state === 'view') {
                return $scope.currentState.indexOf('monitor') === 0 ||
                    $scope.currentState.indexOf('report') === 0 ||
                    $scope.currentState.indexOf('tools') === 0;
            }
            return $scope.currentState.indexOf(state) === 0;
        };

        $scope.svLocale = svLocale;

        $scope.home = svLocale.translate('home');
        $scope.login = svLocale.translate('login');
        $scope.register = svLocale.translate('register');
        $scope.settings = svLocale.translate('settings');
        $scope.translation = svLocale.getSelectedLanguage().value.substring(0, 2);

        $scope.homeScreenId = 'home';
        $scope.defaultTabId = svTabsData.getDefaultTabId($scope.homeScreenId);
        $scope.tabs = svTabsData.screen($scope.homeScreenId);

        $scope.languages = svLocale.getLocales();
        $scope.selected = svLocale.getSelectedLanguage();

        $scope.languageChanged = function(language) {
            svLocale.setSelectedLanguage(language);
        };

        
        $scope.bindClick = function(event) {
            var $trigger = angular.element(document.querySelector('#sv-main-menu-container'));
            if (!$trigger[0].contains(event.target)) {
                var myEl = angular.element(document.querySelector('#sv-navbar'));
                myEl.removeClass('in');
            }
        };

        $document.bind('click', $scope.bindClick);

    }
]);

angular.module('Letshare').directive('resize', ["$window", function($window) {
    return function(scope) {
        var w = angular.element($window);
        scope.getWindowDimensions = function() {
            return {
                'w': angular.element($window)[0].innerWidth,
                'h': angular.element($window)[0].innerHeight,
            };
        };
        scope.$watch(scope.getWindowDimensions, function(newValue) {
            scope.windowHeight = angular.element($window)[0].innerWidth;
            scope.windowWidth = newValue.w;
            var myEl = angular.element(document.querySelector('#sv-navbar'));
            if (scope.windowHeight > 768) {
                myEl.removeClass('in');
            }
        }, true);

        w.bind('resize', function() {
            scope.$apply();
        });
    };
}]);

angular.module('Letshare').directive('navbar', ["$rootScope", function($rootScope) {
    function link(scope, element) {
        var $element = $(element);
        $rootScope.$on('$stateChangeStart', function() {
            $element.collapse('hide');
        });
    }
    return {
        link: link
    };
}]);

var underscore = angular.module('underscore', []);

underscore.factory('_', ["$window", function($window) {
    return $window._;
}]);


angular.module('Letshare').controller('UserController', ['$rootScope', '$scope', '$http', 'svLocale', 'userAPIService', '$state',
    function($rootScope, $scope, $http, svLocale, userAPIService, $state) {
        $scope.formValid = true;
        
        function failureHandler(error) {
            console.error('Error in XHR. ' + error.data);
        }
        function validateForm(form) {
            if (form.$valid) {
                $scope.formValid = true;
                return true;
            } else {
                $scope.formValid = false;
                return false;
            }
        }
        $scope.registerUser = function() {
            var isFormValid = validateForm($scope.registerForm);
            if (isFormValid) {
                $scope.successMsg = '';
                $scope.errorMsg = '';
                userAPIService
                .addUser($scope.user)
                    .then(function(response) {
                        var result = response.data;
                        if (result.success) {
                            $scope.user = null;
                            $scope.registerForm.$setPristine();
                            $scope.successMsg = 'Thank you for registering. Please login to continue.';
                        } else {
                            $scope.errorMsg = result.message;
                        }
                        //$scope.postsList = response.posts;
                        console.log('success');
                    }, failureHandler);
            }
        };
        
                
        $scope.doLogout = function() {
            delete window.localStorage.currentUser;
            delete window.localStorage.loggedIn;
            delete window.localStorage.token;
            $rootScope.currentUser = {};
            $state.go('login');
        };
        
    }
    
        
]);

angular.module('Letshare').controller('SessionController', ['$scope', '$http', 'svLocale', '$state',
    function($scope, $http, svLocale, $state) {
        
        $scope.doLogout();
        $scope.doLogout = function() {
            
            delete window.sessionStorage;
            $state.go('login');
        };
        
    }
    
        
]);

angular.module('Letshare').controller('UserPostsController', ['$scope', '$http', 'svLocale', 'postsAPIService',
    function($scope, $http, svLocale, postsAPIService) {
 
        $scope.getPosts = function() {
            postsAPIService
                .getPosts({title: 'n'})
                    .success(function(response) {
                        $scope.postsList = response.posts;
                        console.log('success');
                    });
        };
        $scope.getPosts();
        
        $scope.submitPost = function() {
            postsAPIService
                .addPost($scope.post)
                    .success(function(response) {
                        //$scope.postsList = response.posts;
                        console.log(response);
                    });
        };

    }
    
        
]);

angular.module('Letshare').controller('UserSettingsController', ['$scope', '$http', 'svLocale', 'postsAPIService',
    function($scope, $http, svLocale, postsAPIService) {
 
        $scope.getPosts = function() {
            postsAPIService
                .getPosts({title: 'n'})
                    .success(function(response) {
                        $scope.postsList = response.posts;
                        console.log('success');
                    });
        };
        $scope.getPosts();
        
        $scope.submitPost = function() {
            postsAPIService
                .addPost($scope.post)
                    .success(function(response) {
                        //$scope.postsList = response.posts;
                        console.log(response);
                    });
        };
    }
    
        
]);

angular.module('Letshare').factory('settingsAPIService',
    ["$http", "ENV", function($http, ENV) {
        
        var postsService = {};
        
        postsService.getAllPosts = function() {
            return $http({
                method: 'GET',
                url: ENV.api + 'post',
                params: {title: ''},
            });
        };
        
        postsService.getPosts = function(filterParams) {
            return $http({
                method: 'GET',
                url: ENV.api + 'post',
                params: filterParams,
            });
        };
            
        postsService.addPost = function(post) {
            return $http({
                method: 'POST',
                url: ENV.api + 'post',
                data: post,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        
                    return str.join("&");
                },
            });
        };
        
        return postsService;
    }]
);

angular.module('Letshare').factory('userAPIService',
    ["$http", "ENV", function($http, ENV) {
        
        var userService = {};
        
        userService.getAllUsers = function() {
            return $http({
                method: 'GET',
                url: ENV.api + 'user'
            });
        };
        
        userService.getPosts = function(filterParams) {
            return $http({
                method: 'GET',
                url: ENV.api + 'post',
                params: filterParams,
            });
        };
            
        userService.addUser = function(user) {
            return $http({
                method: 'POST',
                url: ENV.api + 'user',
                data: user
            });
        };
        
        return userService;
    }]
);

angular.module('Letshare').factory('categoryAPIService',
    ["$http", "ENV", function($http, ENV) {
        
        var categoryService = {};
        
        categoryService.getAllCategories = function() {
            return $http({
                method: 'GET',
                url: ENV.api + 'category/all'
            });
        };
        
        categoryService.getCategories = function(filterParams) {
            return $http({
                method: 'GET',
                url: ENV.api + 'category',
                params: filterParams,
            });
        };

        categoryService.getCategoryFields = function(categoryId) {
            return $http({
                method: 'GET',
                url: ENV.api + 'category/fields/' + categoryId
            });
        };
        
        return categoryService;
    }]
);

angular.module('Letshare').factory('locationsAPIService',
    ["$http", "ENV", function($http, ENV) {
        
        var locationsService = {};
        
        locationsService.getAllCities = function() {
            return $http({
                method: 'GET',
                url: ENV.api + 'city'
            });
        };
        
        locationsService.getLocationsByCity = function(cityId) {
            return $http({
                method: 'GET',
                url: ENV.api + 'location/' + cityId
            });
        };
            
       
        return locationsService;
    }]
);

angular.module('Letshare').controller('PostsController', ['$scope', '$http', '$state', '$stateParams', 'svLocale', 'postsAPIService', 'categoryAPIService', 'Upload', 'locationsAPIService',
    function($scope, $http, $state, $stateParams, svLocale, postsAPIService, categoryAPIService, Upload, locationsAPIService) {
 
        
        document.cookie = 'auth_token=hello';
       $scope.selectedCity = {};                        
       locationsAPIService.getAllCities().then(function(response) {
           $scope.cities = response.data.cities;
           //$scope.post.city1 = $scope.cities[0];
           //$scope.post.city2 = $scope.cities[0];
       }, function() {
           console.error('ERROR: While loading cities');
       });
                           
        $scope.citySelectionChange = function(city, type) {
            locationsAPIService.getLocationsByCity(city.cityId).then(function(response) {
                switch(type) {
                    case 'from':
                       $scope.fromLocations = [];
                       $scope.fromLocations = response.data.locations;
                       break;
                    case 'to':
                       $scope.toLocations = [];
                       $scope.toLocations = response.data.locations;
                       break;
                    default:
                       $scope.fromLocations = response.data.locations;
                }
            }, function() {
                console.error('ERROR: while locations');
            });
            
        }
 
        /*
        $scope.getPostsByCategory = function(category) {
            var queryParams = {
                cityId: $scope.selectedCity.cityId || 0, 
                searchTitle: $scope.searchTitle || '', 
                categoryId: category.categoryId || 0
            };
            window.localStorage.setItem('queryParams', JSON.stringify(queryParams));
            $state.go('posts', queryParams);
        }
                               
        $scope.getCategories = function() {
            categoryAPIService.getAllCategories().then(function(response) {
                $scope.categoriesList = response.data.categories;
            })
        }
        
        */
        $scope.getPosts = function() {
            
            var postsData = {
                searchTitle: $stateParams.searchTitle || '',
                cityId: $stateParams.cityId || 0,
                categoryId: $stateParams.categoryId || 0
            };
            
            if (window.localStorage.getItem('queryParams') != null) {
                queryParams = JSON.parse(window.localStorage.getItem('queryParams'));
                postsData.searchTitle = queryParams.searchTitle;
                postsData.cityId = queryParams.city.cityId;
                postsData.categoryId = queryParams.category.categoryId;
            }
            
            
            postsAPIService
                .getPosts(postsData)
                    .success(function(response) {
                        $scope.postsList = response.posts;
                        console.log('success');
                    });
                    
            //$scope.getCategories();
        };
        $scope.getPosts();
 

    }
    
        
]);

angular.module('Letshare').controller('PostsNewController', ['$scope', '$http', 'svLocale', 'postsAPIService', 'categoryAPIService', 'Upload', 'locationsAPIService',
    function($scope, $http, svLocale, postsAPIService, categoryAPIService, Upload, locationsAPIService) {
 
        document.cookie = 'auth_token=hello';
        
        $scope.post = {}; 
        $scope.textAreaRows = 7;
        
        $scope.measurements = [{label: 'Members', value: 'members'},
                               {label: 'Sq. Feet', value: 'sqfeet'},
                               {label: 'Litres', value: 'litres'},
                               {label: 'Others', value: 'others'}];
        
        $scope.post.measurement = $scope.measurements[0];
                              
        $scope.agePeriods =   [{label: 'Years', value: 'years'},
                               {label: 'Months', value: 'months'},
                               {label: 'Days', value: 'days'}];
                               
        $scope.post.ageType = $scope.agePeriods[0];
                               
       locationsAPIService.getAllCities().then(function(response) {
           $scope.cities = response.data.cities;
           $scope.post.city1 = $scope.cities[0];
           $scope.post.city2 = $scope.cities[0];
       }, function() {
           console.error('ERROR: While loading cities');
       });
           
        
        $scope.citySelectionChange = function(city, type) {
            console.info('City selection change');
            locationsAPIService.getLocationsByCity(city.cityId).then(function(response) {
                switch(type) {
                    case 'from':
                       $scope.fromLocations = [];
                       $scope.fromLocations = response.data.locations;
                       $scope.post.location1 = $scope.fromLocations[0];
                       break;
                    case 'to':
                       $scope.toLocations = [];
                       $scope.toLocations = response.data.locations;
                       $scope.post.location2 = $scope.toLocations[0];
                       break;
                    default:
                       $scope.fromLocations = response.data.locations;
                }
            }, function(error) {
                console.error('ERROR: while locations ' + error.data);
            });
            
        }   

        $scope.isVisibleField = function(field) {
          return _.findLastIndex($scope.categoryFields, {field: field}) > -1;
        }

        $scope.getCategoryFields = function() {
            categoryAPIService.getCategoryFields($scope.post.category.categoryId).
              then(function(response) {
                  $scope.categoryFields = response.data.categoryFields;
                  _.findIndex($scope.categoryFields, 'toLocation');
              }, function() {
                console.error('ERROR: While fetching category fields');
              });
        }

    
       $scope.$watch('post.category', function(newVal, oldVal) {
          console.info('Category selection change');
            
          $scope.getCategoryFields();
       });

       $scope.$watchGroup(['post.city1', 'post.city2'], function(newVal, oldVal) {
           if (newVal[0]) {
               $scope.citySelectionChange(newVal[0], 'from');
           }
           
           if (newVal[1]) {
               $scope.citySelectionChange(newVal[1], 'to');
           }
       });         
        
    
        $scope.submit = function() {
          if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
          }
        };

        // upload on file select or drop
        $scope.upload = function (file) {
            Upload.upload({
                url: 'http://localhost:8099/LetshareCore/rest/post/upload',
                data: {uploadedFile: file, 'name': 'krantu'}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };
                               
        $scope.getCategories = function() {
            categoryAPIService.getAllCategories().then(function(response) {
                $scope.categoriesList = response.data.categories;
            })
        }
        
        $scope.getCategories();

        $scope.formValid = true;
        function validateForm(form) {
            if (form.$valid) {
                $scope.formValid = true;
                return true;
            } else {
                $scope.formValid = false;
                return false;
            }
        }
         
        $scope.submitPost = function() {
            var isFormValid = validateForm($scope.postForm);
            if (isFormValid) {
                var post = $scope.post;
                post.userId = $scope.currentUser.userId;
                post.categoryId = $scope.post.category.categoryId;
                post.city1Id = $scope.post.city1.cityId;
                post.location1Id = $scope.post.location1.locationId;
                
                //post.city2Id = $scope.post.city2.cityId;
                //post.location2Id = $scope.post.location2.locationId;
                
                post.measurement = $scope.post.measurement.value;
                post.age = $scope.post.age;
                postsAPIService
                    .addPost(post)
                    .success(function(response) {
                        //$scope.postsList = response.posts;
                        console.log(response);
                        $scope.successMsg = 'Your ad has been posted successfully.';
                        $scope.post = null;
                        scope.postForm.$setPristine();
                    });
            }
            
                    
        };
        
    }
    
        
]);


angular.module('Letshare').controller('PostsDetailsController', ['$scope', '$stateParams', 'svLocale', 'postsAPIService', 'categoryAPIService', 'Upload', 'locationsAPIService',
    function($scope, $stateParams, svLocale, postsAPIService, categoryAPIService, Upload, locationsAPIService) {

        postsAPIService.getPostById($stateParams.id).then(function(response) {
            var result = response.data;
            $scope.postDetails = result.post;
        }, function() {
            console.log('ERROR');
        })
       
    }
    
        
]);

angular.module('Letshare').factory('postsAPIService',
    ["$http", "ENV", "Upload", function($http, ENV, Upload) {
        
        var postsService = {};
        
        postsService.getAllPosts = function() {
            return $http({
                method: 'GET',
                url: ENV.api + 'post',
                params: {title: ''}
            });
        };
        
        postsService.getPosts = function(filterParams) {
            return $http({
                method: 'GET',
                url: ENV.api + 'post',
                params: filterParams,
            });
        };
        
        postsService.getPostById = function(postId) {
            return $http({
                method: 'GET',
                url: ENV.api + 'post/' + postId
            });
        };
            
        postsService.addPost = function(post) {
            return Upload.upload({
                url: ENV.api + 'post',
                data: post
            });
            /*
            return $http({
                method: 'POST',
                url: ENV.api + 'post',
                data: post,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        
                    return str.join("&");
                },
            });
            */
        };
        
        return postsService;
    }]
);
angular.module('Letshare').directive('imageCarousel', function() {
    return {
        restrict: 'AEC',
        templateUrl: 'partials/image-carousel.html',
        controller: ["$scope", function($scope) {

        }],
        link: function($scope, $element, attr) {
            $(".img-block").fadeOut(2).fadeIn(700);
            
            $scope.startSlider = function() {
	             var options = {
	                 $AutoPlay: true,
	                 $DragOrientation: 3,  
	                 $PauseOnHover: 0,
	                 $ArrowNavigatorOptions: {                       //[Optional] Options to specify and enable arrow navigator or not
	                     $Class: $JssorArrowNavigator$,              //[Requried] Class to create arrow navigator instance
	                     $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
	                     $AutoCenter: 2,                                 //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
	                     $Steps: 1                                       //[Optional] Steps to go for each navigation request, default value is 1
	                 },
                    $ThumbnailNavigatorOptions: {
                        $Class: $JssorThumbnailNavigator$,              //[Required] Class to create thumbnail navigator instance
                        $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always

                        $SpacingX: 23,                                   //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
                        $SpacingY: 23,                                   //[Optional] Vertical space between each thumbnail in pixel, default value is 0
                        $DisplayPieces: 7,                              //[Optional] Number of pieces to display, default value is 1
                        $ParkingPosition: 219                           //[Optional] The offset position to park thumbnail
                    },
                     /*
	                 $BulletNavigatorOptions: {                                //[Optional] Options to specify and enable navigator or not
	                     $Class: $JssorBulletNavigator$,                       //[Required] Class to create navigator instance
	                     $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
	                     $ActionMode: 1,                                 //[Optional] 0 None, 1 act by click, 2 act by mouse hover, 3 both, default value is 1
	                     $AutoCenter: 1,                                 //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
	                     $Steps: 1,                                      //[Optional] Steps to go for each navigation request, default value is 1
	                     $Lanes: 1,                                      //[Optional] Specify lanes to arrange items, default value is 1
	                     $SpacingX: 20,                                   //[Optional] Horizontal space between each item in pixel, default value is 0
	                     $SpacingY: 10,                                   //[Optional] Vertical space between each item in pixel, default value is 0
	                     $Orientation: 1                                 //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
	                 },*/
	                 $SlideshowOptions: {
	                     $Class: $JssorSlideshowRunner$,
	                     $TransitionsOrder: 1,
	                     $ShowLink: true
	                 }
	             };
	             $scope.imageSlider = new $JssorSlider$(attr.id, options);
	             //$scope.scaleSlider();
	             
	        };
            //$scope.startSlider();
            //$scope.imageSlider.$GoTo(2);
        },
        scope: {
            data: '=data' 
        },
        replace: true
    }
    
});

angular.module('Letshare').directive('elementready', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
        	element.ready(function() {
                if(attrs.elementready!=='') {
                    scope.$apply(attrs.elementready);
                }
            });
        }
    }
    
});

angular.module('Letshare').directive('filterBox', function() {
    return {
        restrict: 'AEC',
        templateUrl: 'partials/filter-box.html',
        controller: ["$scope", "$state", "locationsAPIService", "categoryAPIService", function($scope, $state, locationsAPIService, categoryAPIService) {
            $scope.searchTitle = '';
            $scope.selection = {};
            $scope.queryParams = JSON.parse(window.localStorage.getItem('queryParams'));
            $scope.onCitySelection = function() {
                $scope.selectedCity = $scope.selection.city.originalObject;
                //$('.area-selection-box').removeClass('in');
            }
            
            $scope.$watch('selectedCity', function(newVal, oldVal) {
                //if (newVal !== oldVal) {
                    $('.area-selection-box').removeClass('in');
                //}
            })
            
            
            $scope.getCategories = function() {
                categoryAPIService.getAllCategories().then(function(response) {
                    $scope.categoriesList = response.data.categories;
                }, function() {
                    console.error('ERROR: While loading categories');
                });
            }
            
            $scope.selectPopularCity = function(city) {
                $scope.selectedCity = city;
            }
            $scope.getPosts = function(city, category, searchTitle) {
                var queryParams = {
                    city: city, 
                    searchTitle: searchTitle, 
                    category: category
                };
                window.localStorage.setItem('queryParams', JSON.stringify(queryParams));
                $state.go('posts', queryParams);
            }
            locationsAPIService.getAllCities().then(function(response) {
               $scope.cities = response.data.cities;
               
               //$scope.selectedCity = $scope.cities[0];
            }, function() {
               console.error('ERROR: While loading cities');
            });
            $scope.getCategories();
            
            $scope.$watchGroup(['cities', 'categoriesList'], function(newVal) {
                if (newVal[0]) {
                   $scope.selectedCity = $scope.cities[0];
                    if ($scope.queryParams) {
                        $scope.selectedCity = $scope.queryParams.city;
                        $scope.searchTitle = $scope.queryParams.searchTitle;
                    } 
                }
                
            });
        }],
        link: function($scope, $element, attr) {
            $(".main-image").fadeOut(2).fadeIn(700);
        }
    }
    
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImV4cGFuZC5qcyIsImhlYWRlci5qcyIsImludGVyY2VwdG9yLmpzIiwibHNfaG9tZS5qcyIsImxzX2xvY2FsaXphdGlvbnMuanMiLCJsc19sb2dpbi5qcyIsImxzX3NlcnZpY2VzLmpzIiwibWVudS5qcyIsInVuZGVyc2NvcmUuanMiLCJ1c2VyL2xzX3VzZXIuY3RybC5qcyIsInVzZXIvbHNfdXNlci5wb3N0cy5jdHJsLmpzIiwidXNlci9sc191c2VyLnNldHRpbmdzLmN0cmwuanMiLCJ1c2VyL2xzX3VzZXIuc2V0dGluZ3Muc3J2LmpzIiwidXNlci9sc191c2VyLnNydi5qcyIsInBvc3RzL2xzX2NhdGVnb3J5LnNydi5qcyIsInBvc3RzL2xzX2xvY2F0aW9ucy5zcnYuanMiLCJwb3N0cy9sc19wb3N0cy5jdHJsLmpzIiwicG9zdHMvbHNfcG9zdHMuc3J2LmpzIiwiZGlyZWN0aXZlcy9pbWFnZS1jYXJvdXNlbC5qcyIsImRpcmVjdGl2ZXMvbHNfZWxlbWVudHJlYWR5LmpzIiwiZGlyZWN0aXZlcy9sc19maWx0ZXJib3guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBLFFBQUEsT0FBQSxPQUFBLENBQUEsY0FBQSxhQUFBLGNBQUEsWUFBQSxnQkFBQTs7QUFFQSxJQUFBLE9BQUEsQ0FBQSxrQkFBQSxzQkFBQSxpQkFBQTtRQUNBLFNBQUEsZ0JBQUEsb0JBQUEsZUFBQSxtQkFBQTs7UUFFQSxtQkFBQSxVQUFBO1FBQ0EsbUJBQUEsS0FBQSxVQUFBO1FBQ0E7YUFDQSxNQUFBLE9BQUE7Z0JBQ0EsVUFBQTtnQkFDQSxhQUFBOzthQUVBLE1BQUEsUUFBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTtnQkFDQSxRQUFBO2dCQUNBLGNBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFFBQUE7O2FBRUEsTUFBQSxRQUFBO2dCQUNBLEtBQUE7Z0JBQ0Es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UUFDQSxPQUFBLFFBQUEsU0FBQSxVQUFBO1FBQ0EsT0FBQSxXQUFBLFNBQUEsVUFBQTtRQUNBLE9BQUEsV0FBQSxTQUFBLFVBQUE7UUFDQSxPQUFBLGNBQUEsU0FBQSxzQkFBQSxNQUFBLFVBQUEsR0FBQTs7UUFFQSxPQUFBLGVBQUE7UUFDQSxPQUFBLGVBQUEsV0FBQSxnQkFBQSxPQUFBO1FBQ0EsT0FBQSxPQUFBLFdBQUEsT0FBQSxPQUFBOztRQUVBLE9BQUEsWUFBQSxTQUFBO1FBQ0EsT0FBQSxXQUFBLFNBQUE7O1FBRUEsT0FBQSxrQkFBQSxTQUFBLFVBQUE7WUFDQSxTQUFBLG9CQUFBOzs7O1FBSUEsT0FBQSxZQUFBLFNBQUEsT0FBQTtZQUNBLElBQUEsV0FBQSxRQUFBLFFBQUEsU0FBQSxjQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLE1BQUEsU0FBQTtnQkFDQSxJQUFBLE9BQUEsUUFBQSxRQUFBLFNBQUEsY0FBQTtnQkFDQSxLQUFBLFlBQUE7Ozs7UUFJQSxVQUFBLEtBQUEsU0FBQSxPQUFBOzs7OztBQUtBLFFBQUEsT0FBQSxZQUFBLFVBQUEsc0JBQUEsU0FBQSxTQUFBO0lBQ0EsT0FBQSxTQUFBLE9BQUE7UUFDQSxJQUFBLElBQUEsUUFBQSxRQUFBO1FBQ0EsTUFBQSxzQkFBQSxXQUFBO1lBQ0EsT0FBQTtnQkFDQSxLQUFBLFFBQUEsUUFBQSxTQUFBLEdBQUE7Z0JBQ0EsS0FBQSxRQUFBLFFBQUEsU0FBQSxHQUFBOzs7UUFHQSxNQUFBLE9BQUEsTUFBQSxxQkFBQSxTQUFBLFVBQUE7WUFDQSxNQUFBLGVBQUEsUUFBQSxRQUFBLFNBQUEsR0FBQTtZQUNBLE1BQUEsY0FBQSxTQUFBO1lBQ0EsSUFBQSxPQUFBLFFBQUEsUUFBQSxTQUFBLGNBQUE7WUFDQSxJQUFBLE1BQUEsZUFBQSxLQUFBO2dCQUNBLEtBQUEsWUFBQTs7V0FFQTs7UUFFQSxFQUFBLEtBQUEsVUFBQSxXQUFBO1lBQ0EsTUFBQTs7Ozs7QUFLQSxRQUFBLE9BQUEsWUFBQSxVQUFBLHlCQUFBLFNBQUEsWUFBQTtJ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LFNBQUE7O1lBRUEsb0JBQUEsZUFBQSxLQUFBLFNBQUEsVUFBQTtlQUNBLE9BQUEsU0FBQSxTQUFBLEtBQUE7OztlQUdBLFdBQUE7ZUFDQSxRQUFBLE1BQUE7O1lBRUEsT0FBQTs7WUFFQSxPQUFBLFlBQUEsQ0FBQSxVQUFBLG1CQUFBLFNBQUEsUUFBQTtnQkFDQSxJQUFBLE9BQUEsSUFBQTttQkFDQSxPQUFBLGVBQUEsT0FBQSxPQUFBO29CQUNBLElBQUEsT0FBQSxhQUFBO3dCQUNBLE9BQUEsZUFBQSxPQUFBLFlBQUE7d0JBQ0EsT0FBQSxjQUFBLE9BQUEsWUFBQTs7Ozs7O1FBTUEsTUFBQSxTQUFBLFFBQUEsVUFBQSxNQUFBO1lBQ0EsRUFBQSxlQUFBLFFBQUEsR0FBQSxPQUFBOzs7OztBQUtBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWydhcHAuY29uZmlnJywgJ3VpLnJvdXRlcicsICduZ1Jlc291cmNlJywgJ0xldHNoYXJlJywgJ3VpLmJvb3RzdHJhcCcsICd1bmRlcnNjb3JlJ10pO1xyXG5cclxuYXBwLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsICckaHR0cFByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJywgXHJcbiAgICAgICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHBQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcclxuICAgICAgICAvL3VubWFjdGNoZWQgVVJMcyByZXR1cm4gdG8gbW9uaXRvciBwYWdlXHJcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2hvbWUnKTtcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL3Bvc3RzJywgJy9wb3N0cy9saXN0Jyk7XHJcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgLnN0YXRlKCdhcHAnLCB7XHJcbiAgICAgICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvYXBwLmh0bWwnXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9ob21lJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvaG9tZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6ICdhcHAnLFxyXG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlOiBmYWxzZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2xvZ2luJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvbG9naW4uaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5Db250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ2FwcCdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd1c2VyJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL3VzZXInLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy91c2VyLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ2FwcCdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAuc3RhdGUoJ3VzZXIucmVnaXN0ZXInLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvcmVnaXN0ZXInLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy91c2VyL3VzZXItcmVnaXN0ZXIuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckNvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiAndXNlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd1c2VyLmxvZ291dCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9sb2dvdXQnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Nlc3Npb25Db250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ3VzZXInXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgncG9zdHMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvcG9zdHMnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9wb3N0cy5odG1sJyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNpdHlJZDogMCxcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hUaXRsZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ2FwcCcsXHJcbiAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgncG9zdHMubGlzdCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0JyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNpdHlJZDogMCxcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hUaXRsZTogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcG9zdHMvcG9zdHMtbGlzdC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQb3N0c0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiAncG9zdHMnLFxyXG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlOiBmYWxzZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3Bvc3RzLm5ldycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9uZXcnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9wb3N0cy9wb3N0cy1uZXcuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUG9zdHNOZXdDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ3Bvc3RzJyxcclxuICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3Bvc3RzLmRldGFpbHMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvOmlkJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcG9zdHMvcG9zdHMtZGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQb3N0c0RldGFpbHNDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogJ3Bvc3RzJyxcclxuICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoSW50ZXJjZXB0b3InKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuXHJcbiAgICB9XSk7XHJcblxyXG4gICAgYXBwLnJ1bihbJyRyb290U2NvcGUnLCAgJyRzdGF0ZScsICckbG9jYXRpb24nLCAnTG9naW5TZXJ2aWNlJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgICRzdGF0ZSwgJGxvY2F0aW9uLCBMb2dpblNlcnZpY2UpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldnQsIHRvLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50VXNlcicpKTtcclxuICAgICAgICAgICAgaWYgKHRvLmF1dGhlbnRpY2F0ZSkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IExvZ2luU2VydmljZS5sb2dpbkNoZWNrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kd2F0Y2goJ2N1cnJlbnRVc2VyJyxmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLmN1cnJlbnRVc2VyICE9IG51bGwgJiYgdG8ubmFtZSA9PT0gJ2xvZ2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUucmVkaXJlY3RUbyA9IHRvO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJywgcGFyYW1zKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScsIFsnYXBwLmNvbmZpZycsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJyxcclxuICAgICdpc3RldmVuLW11bHRpLXNlbGVjdCcsICduZ0ZpbGVVcGxvYWQnLCAnbmdJZGxlJywgJ2FuZ3Vjb21wbGV0ZS1hbHQnXSk7XHJcbiIsIlxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGV4cGFuZE1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdleHBhbmQnLCBbXSk7XHJcblxyXG4gICAgZXhwYW5kTW9kdWxlLmRpcmVjdGl2ZSgnZXhwYW5kTW9kYWwnLCBmdW5jdGlvbigkY29tcGlsZSwgRXhwYW5kU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZXhwYW5kQnV0dG9uQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vcGFydGlhbHMvZXhwYW5kLW1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjaGFydFByb3BlcnRpZXMgPSBFeHBhbmRTZXJ2aWNlLmdldENoYXJ0U2NvcGUoKTtcclxuICAgICAgICAgICAgICAgIC8vbWFraW5nIGEgY2xvbmUgb2YgdGhlIFwiTW9uaXRvclwiIGFuZC9vciBcIlJlcG9ydFwiIGFuY2hvciBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgdmFyIGFuY2hvckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxMaW5rc0lkKSkuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuY2hvckVsZW1lbnQuY2hpbGRyZW4oKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQWRkaW5nIHRoZSBuZy1jbGljayBhdHRyaWJ1dGUgdG8gY2xvc2UgdGhlIG1vZGFsIGFzIHRoZSBhbmNob3IgbGVhZHMgdG8gYW5vdGhlciBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGFuY2hvckVsZW1lbnQuY2hpbGRyZW4oKVtpXSkuYXR0cignbmctY2xpY2snLCAnY2xvc2UoKScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChhbmNob3JFbGVtZW50LmNoaWxkcmVuKClbaV0pLnJlbW92ZUF0dHIoJ3VpLXNyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYW5jaG9yRWxlbWVudC5jaGlsZHJlbigpW2ldKS5yZW1vdmVBdHRyKCduZy1pZicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9hZGQgYW5jaG9yRWxlbWVudCB0byBkaXYgY2xhc3M9XCJhbmNob3Itc3BhY2VcIlxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQuY2hpbGRyZW4oKVswXS5jaGlsZHJlblszXSkuYXBwZW5kKGFuY2hvckVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgJGNvbXBpbGUoYW5jaG9yRWxlbWVudCkoc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb250cm9sbGVyIHNldHMgdGhlIHNjb3BlIHByb3BlcnRpZXMgdGhhdCBhcmUgdXNlZCBieSB0aGUgY2xvbmVkIGNoYXJ0IGZvciBleHBhbnNpb24sIHBsdXMgc29tZSBmZXcgZnVuY3Rpb25zXHJcbiAgICAgKiBmb3IgbW9kYWwgcmVsYXRlZCBvcGVyYXRpb25zXHJcbiAgICAgKi9cclxuICAgIGV4cGFuZE1vZHVsZS5jb250cm9sbGVyKCdleHBhbmRCdXR0b25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnc3ZMb2NhbGUnLCAnRXhwYW5kU2VydmljZScsICdDaGFydFNlcmllc1NlcnZpY2UnLFxyXG4gICAgICAgICckc2NlJywgZnVuY3Rpb24oJHNjb3BlLCBzdkxvY2FsZSwgRXhwYW5kU2VydmljZSwgQ2hhcnRTZXJpZXNTZXJ2aWNlLCAkc2NlKSB7XHJcbiAgICAgICAgICAgIHZhciBzY29wZUVsZW1lbnRzID0gRXhwYW5kU2VydmljZS5nZXRDaGFydFNjb3BlKCk7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3QgPSBFeHBhbmRTZXJ2aWNlLm1vZGFsKCk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuc3ZMb2NhbGUgPSBzdkxvY2FsZTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS50aXRsZSA9ICRzY2UudHJ1c3RBc0h0bWwoc2NvcGVFbGVtZW50cy50aXRsZSk7XHJcbiAgICAgICAgICAgICRzY29wZS5leHBvcnRUaXRsZSA9IHNjb3BlRWxlbWVudHMuZXhwb3J0VGl0bGU7XHJcbiAgICAgICAgICAgICRzY29wZS5oaWRlQ2hhcnRUaXRsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICRzY29wZS5jaGFydFN0eWxlID0gc2NvcGVFbGVtZW50cy5jaGFydFN0eWxlO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2hhcnRTdHlsZUxvY2tlZCA9IHNjb3BlRWxlbWVudHMuY2hhcnRTdHlsZUxvY2tlZDtcclxuICAgICAgICAgICAgJHNjb3BlLnR5cGUgPSAnY2xvbmUnO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2xvbmVkVHlwZSA9IHNjb3BlRWxlbWVudHMudHlwZTtcclxuICAgICAgICAgICAgJHNjb3BlLnVybCA9IHNjb3BlRWxlbWVudHMudXJsO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnBlcmlvZCA9IHNjb3BlRWxlbWVudHMucGVyaW9kO1xyXG4gICAgICAgICAgICAkc2NvcGUudXBkYXRlSW50ZXJ2YWwgPSAtMTtcclxuICAgICAgICAgICAgJHNjb3BlLnlBeGlzVGl0bGUgPSBzY29wZUVsZW1lbnRzLnlBeGlzVGl0bGU7XHJcbiAgICAgICAgICAgICRzY29wZS5zZXJpZXNDb2xvcnMgPSBzY29wZUVsZW1lbnRzLnNlcmllc0NvbG9ycztcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5hdXRvVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLmNhcGFjaXR5TGluZSA9IHNjb3BlRWxlbWVudHMuY2FwYWNpdHlMaW5lO1xyXG4gICAgICAgICAgICAkc2NvcGUubm9MZWdlbmQgPSBzY29wZUVsZW1lbnRzLm5vTGVnZW5kO1xyXG4gICAgICAgICAgICAkc2NvcGUubGVnZW5kQWxpZ25tZW50ID0gJ3JpZ2h0JztcclxuICAgICAgICAgICAgJHNjb3BlLmxpbmVXaWR0aCA9IHNjb3BlRWxlbWVudHMubGluZVdpZHRoO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnBsb3RBcmVhQm9yZGVyV2lkdGggPSBzY29wZUVsZW1lbnRzLnBsb3RBcmVhQm9yZGVyV2lkdGg7XHJcbiAgICAgICAgICAgICRzY29wZS5wbG90QXJlYUJvcmRlckNvbG9yID0gc2NvcGVFbGVtZW50cy5wbG90QXJlYUJvcmRlckNvbG9yO1xyXG4gICAgICAgICAgICAkc2NvcGUucmVzdWx0U3Vic2V0ID0gc2NvcGVFbGVtZW50cy5yZXN1bHRTdWJzZXQ7XHJcbiAgICAgICAgICAgICRzY29wZS5oZWxwQ29udGVudEtleSA9IHNjb3BlRWxlbWVudHMuaGVscENvbnRlbnRLZXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2NvcGVFbGVtZW50cy5jaGFydFN0eWxlID09PSAncGllJykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlcmllc0RhdGEgPSAkc2NvcGUuZGF0YSA9IHNjb3BlRWxlbWVudHMuZGF0YTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhID0gc2NvcGVFbGVtZW50cy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlcmllc0RhdGEgPSBzY29wZUVsZW1lbnRzLmNoYXJ0LnNlcmllcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBFeHBhbmRTZXJ2aWNlLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBDaGFydFNlcmllc1NlcnZpY2UuZGlzYWJsZUNsb25pbmdCcm9hZGNhc3QoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vc3RvcCB0aGUgZGF0YSBicm9hZGNhc3Qgc2VydmljZSBvZiB0aGUgY2hhcnQgYmVpbmcgZXhwYW5kZWQgKG5vdCB0aGUgY2xvbmVkIGNoYXJ0KSB3aGVuIGNsaWNraW5nIG91dHNpZGVcclxuICAgICAgICAgICAgLy90aGUgbW9kYWwgd2hpY2ggaW5pdGlhdGVzIHRoZSBtb2RhbCBjbG9zdXJlLlxyXG4gICAgICAgICAgICBtb2RhbEluc3QucmVzdWx0LmZpbmFsbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBDaGFydFNlcmllc1NlcnZpY2UuZGlzYWJsZUNsb25pbmdCcm9hZGNhc3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubGVnZW5kVGl0bGUgPSAnJztcclxuICAgICAgICAgICAgJHNjb3BlLmxlZ2VuZFR5cGUgPSAnYmFuZHdpZHRoJztcclxuICAgICAgICAgICAgJHNjb3BlLmxlZ2VuZE1vZGVsID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5yZW1vdmVMZWdlbmRMaW5rcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUudG9EaXNhYmxlID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS50b0Rpc2FibGVMZWdlbmQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzY29wZUVsZW1lbnRzLmxlZ2VuZEJhcklkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kQmFyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY29wZUVsZW1lbnRzLmxlZ2VuZEJhcklkKSkuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5sZWdlbmRCYXJTY29wZSA9IGxlZ2VuZEJhckVsZW1lbnRbMF0uYXR0cmlidXRlcztcclxuICAgICAgICAgICAgICAgICRzY29wZS5sZWdlbmRUaXRsZU5vZGUgPSAkc2NvcGUubGVnZW5kQmFyU2NvcGUuZ2V0TmFtZWRJdGVtKCd0aXRsZScpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxlZ2VuZFR5cGVOb2RlID0gJHNjb3BlLmxlZ2VuZEJhclNjb3BlLmdldE5hbWVkSXRlbSgndHlwZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubGVnZW5kVGl0bGVOb2RlICYmICRzY29wZS5sZWdlbmRUaXRsZU5vZGUudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGVnZW5kVGl0bGUgPSAkc2NvcGUubGVnZW5kVGl0bGVOb2RlLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubGVnZW5kVHlwZU5vZGUgJiYgJHNjb3BlLmxlZ2VuZFR5cGVOb2RlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxlZ2VuZFR5cGUgPSAkc2NvcGUubGVnZW5kVHlwZU5vZGUudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxlZ2VuZE1vZGVsID0gc2NvcGVFbGVtZW50cy5jaGFydERhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNoYXJ0VXBkYXRlID0gZnVuY3Rpb24obGVnZW5kRW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUudG9EaXNhYmxlLmluZGV4T2YobGVnZW5kRW50cnkudmFsdWUucmVwbGFjZSgvIC9nLCAnLScpKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0RWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChsZWdlbmRFbnRyeS5lbGVtZW50LnNyY0VsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRvRGlzYWJsZS5wdXNoKGxlZ2VuZEVudHJ5LnZhbHVlLnJlcGxhY2UoLyAvZywgJy0nKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEVsZW1lbnQudG9nZ2xlQ2xhc3MoJ3N2LXRvZ2dsZS10ZXh0LWNvbG9yJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRvRGlzYWJsZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RFbGVtZW50LnRvZ2dsZUNsYXNzKCdzdi10b2dnbGUtdGV4dC1jb2xvcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlRWxlbWVudHMuZGlzYWJsZWRTZXJpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50b0Rpc2FibGVMZWdlbmQgPSBzY29wZUVsZW1lbnRzLmRpc2FibGVkU2VyaWVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm92aWRlcyBzZXJ2aWNlIGZvciBtb2RhbCBpbml0aWF0aW5nIGFuZCBjbG9zdXJlLCBwbHVzIGdpdmVzIGFjY2VzcyB0byBzY29wZSBvZiB0aGUgY2hhcnQgdG8gYmUgZXhwYW5kZWQvY2xvbmVkXHJcbiAgICAgKi9cclxuICAgIGV4cGFuZE1vZHVsZS5zZXJ2aWNlKCdFeHBhbmRTZXJ2aWNlJywgWyckbW9kYWwnLCBmdW5jdGlvbigkbW9kYWwpIHtcclxuXHJcbiAgICAgICAgdmFyIGluc3RhbmNlQ2hhcnRTY29wZSA9ICcnO1xyXG4gICAgICAgIHRoaXMuZ2V0Q2hhcnRTY29wZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2VDaGFydFNjb3BlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0ge307XHJcblxyXG4gICAgICAgIHRoaXMub3BlbiA9IGZ1bmN0aW9uKGFuaW1hdGlvbkVuYWJsZWQsIGNoYXJ0U2NvcGUpIHtcclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogYW5pbWF0aW9uRW5hYmxlZCxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGV4cGFuZC1tb2RhbD48L2V4cGFuZC1tb2RhbD4nLFxyXG4gICAgICAgICAgICAgICAgd2luZG93Q2xhc3M6ICdzdi1leHBhbmQtbW9kYWwnLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0U2NvcGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUNoYXJ0U2NvcGUgPSBjaGFydFNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG5cclxufSgpKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuY29udHJvbGxlcignSGVhZGVyJywgWyckc2NvcGUnLCAnc3ZMb2NhbGUnLFxyXG4gICAgZnVuY3Rpb24oJHNjb3BlLCBzdkxvY2FsZSkge1xyXG5cclxuICAgICAgICAkc2NvcGUubGFuZ3VhZ2VzID0gc3ZMb2NhbGUuZ2V0TG9jYWxlcygpO1xyXG4gICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHN2TG9jYWxlLmdldFNlbGVjdGVkTGFuZ3VhZ2UoKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxhbmd1YWdlQ2hhbmdlZCA9IGZ1bmN0aW9uKGxhbmd1YWdlKSB7XHJcbiAgICAgICAgICAgIHN2TG9jYWxlLnNldFNlbGVjdGVkTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbl0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5mYWN0b3J5KCdhdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWVzdDogZnVuY3Rpb24oY29uZmlnKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XHJcbiAgICAgICAgICAgIHZhciB0b2tlbiA9ICdCZWFyZXIgYWNjZXNzJztcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UudG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHRva2VuID0gJ0JlYXJlciAnICsgd2luZG93LmxvY2FsU3RvcmFnZS50b2tlbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gfHwgdG9rZW47XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgIC8vIGRvIHNvbWV0aGluZyBvbiBzdWNjZXNzXHJcbiAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSkge1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UudG9rZW4gPSByZXNwb25zZS5kYXRhLnRva2VuIHx8IHdpbmRvdy5sb2NhbFN0b3JhZ2UudG9rZW47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsXHJcbiAgICBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkc3RhdGUsICRtb2RhbCwgc3ZMb2NhbGUsIGNhdGVnb3J5QVBJU2VydmljZSwgbG9jYXRpb25zQVBJU2VydmljZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdIb21lJyk7XHJcbiAgICAgICAgJHNjb3BlLml0ZW1zID0gWydpdGVtMScsICdpdGVtMicsICdpdGVtMyddO1xyXG4gICAgICAgICRzY29wZS5jYXRlZ29yaWVzID0gW3tcclxuICAgICAgICAgICAgdmFsdWU6IDBcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgdmFsdWU6IDFcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgdmFsdWU6IDJcclxuICAgICAgICB9XTtcclxuICAgICAgICBcclxuICAgICAgICAvKlxyXG4gICAgICAgICRzY29wZS5zZWFyY2hUaXRsZSA9ICcnO1xyXG4gICAgICAgICRzY29wZS5zZWxlY3Rpb24gPSB7fTtcclxuICAgICAgICAkc2NvcGUub25DaXR5U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZENpdHkgPSAkc2NvcGUuc2VsZWN0aW9uLmNpdHkub3JpZ2luYWxPYmplY3Q7XHJcbiAgICAgICAgICAgIC8vJCgnLmFyZWEtc2VsZWN0aW9uLWJveCcpLnJlbW92ZUNsYXNzKCdpbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKCdzZWxlY3RlZENpdHknLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICAgICAvL2lmIChuZXdWYWwgIT09IG9sZFZhbCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmFyZWEtc2VsZWN0aW9uLWJveCcpLnJlbW92ZUNsYXNzKCdpbicpO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5QVBJU2VydmljZS5nZXRBbGxDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXNMaXN0ID0gcmVzcG9uc2UuZGF0YS5jYXRlZ29yaWVzO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBXaGlsZSBsb2FkaW5nIGNhdGVnb3JpZXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5zZWxlY3RQb3B1bGFyQ2l0eSA9IGZ1bmN0aW9uKGNpdHkpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkQ2l0eSA9IGNpdHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5nZXRQb3N0cyA9IGZ1bmN0aW9uKGNpdHlJZCwgY2F0ZWdvcnksIHNlYXJjaFRpdGxlKSB7XHJcbiAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIGNpdHlJZDogY2l0eUlkLCBcclxuICAgICAgICAgICAgICAgIHNlYXJjaFRpdGxlOiBzZWFyY2hUaXRsZSwgXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRlZ29yeS5jYXRlZ29yeUlkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncXVlcnlQYXJhbXMnLCBKU09OLnN0cmluZ2lmeShxdWVyeVBhcmFtcykpO1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3Bvc3RzJywgcXVlcnlQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2NhdGlvbnNBUElTZXJ2aWNlLmdldEFsbENpdGllcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAkc2NvcGUuY2l0aWVzID0gcmVzcG9uc2UuZGF0YS5jaXRpZXM7XHJcbiAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkQ2l0eSA9ICRzY29wZS5jaXRpZXNbMF07XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IFdoaWxlIGxvYWRpbmcgY2l0aWVzJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgICAqL1xyXG4gICAgfVxyXG4pOyIsImFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmZhY3RvcnkoJ3N2TG9jYWxlJywgWyckc3RhdGVQYXJhbXMnLCAnJHN0YXRlJywgJ18nLFxyXG4gICAgZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkc3RhdGUsIF8pIHtcclxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xyXG4gICAgICAgIHZhciBsb2NhbGVzID0gW1xyXG4gICAgICAgICAgICB7dmFsdWU6ICdlbi11cycsIHRpdGxlOiAnRW5nbGlzaCd9LFxyXG4gICAgICAgICAgICB7dmFsdWU6ICdrby1rcicsIHRpdGxlOiAn7ZWc6rWt7Ja0J31cclxuICAgICAgICBdO1xyXG4gICAgICAgIHZhciBjb250ZW50TGlzdCA9IHtcclxuICAgICAgICAgICAgLy9NZW51XHJcbiAgICAgICAgICAgICdob21lJzoge1xyXG4gICAgICAgICAgICAgICAgJ2VuLXVzJzogJ0hvbWUnLFxyXG4gICAgICAgICAgICAgICAgJ2tvLWtyJzogJ+yngOuPhCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2hlYWx0aCcgOiB7XHJcbiAgICAgICAgICAgICAgICAnZW4tdXMnOiAnSGVhbHRoJyxcclxuICAgICAgICAgICAgICAgICdrby1rcic6ICfsp4Drj4QnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdjbG9zZUJ0bicgOiB7XHJcbiAgICAgICAgICAgICAgICAnZW4tdXMnOiAnQ2xvc2UnLFxyXG4gICAgICAgICAgICAgICAgJ2tvLWtyJzogJ+yngOuPhCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3N1Ym1pdEJ0bicgOiB7XHJcbiAgICAgICAgICAgICAgICAnZW4tdXMnOiAnU3VibWl0JyxcclxuICAgICAgICAgICAgICAgICdrby1rcic6ICfsp4Drj4QnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdsb2dpbicgOiB7XHJcbiAgICAgICAgICAgICAgICAnZW4tdXMnOiAnTG9naW4nLFxyXG4gICAgICAgICAgICAgICAgJ2tvLWtyJzogJ+yngOuPhCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3JlZ2lzdGVyJyA6IHtcclxuICAgICAgICAgICAgICAgICdlbi11cyc6ICdSZWdpc3RlcicsXHJcbiAgICAgICAgICAgICAgICAna28ta3InOiAn7KeA64+EJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZmFjdG9yeS5zZWxlY3RlZExhbmd1YWdlID0gbG9jYWxlc1swXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2FsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGxvY2FsZXNbaV0udmFsdWUuc3Vic3RyaW5nKDAsIDIpID09PSAkc3RhdGVQYXJhbXMubGFuZykge1xyXG4gICAgICAgICAgICAgICAgZmFjdG9yeS5zZWxlY3RlZExhbmd1YWdlID0gbG9jYWxlc1tpXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmYWN0b3J5LnNldFNlbGVjdGVkTGFuZ3VhZ2UgPSBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgJiYgZmFjdG9yeS5zZWxlY3RlZExhbmd1YWdlICE9PSBzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgZmFjdG9yeS5zZWxlY3RlZExhbmd1YWdlID0gc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGVQYXJhbXMubGFuZyA9IGZhY3Rvcnkuc2VsZWN0ZWRMYW5ndWFnZS52YWx1ZS5zdWJzdHJpbmcoMCwgMik7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJHN0YXRlLiRjdXJyZW50LCBudWxsLCB7cmVsb2FkOiB0cnVlfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmYWN0b3J5LmdldFNlbGVjdGVkTGFuZ3VhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhY3Rvcnkuc2VsZWN0ZWRMYW5ndWFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmYWN0b3J5LmdldExvY2FsZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZXM7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZmFjdG9yeS50cmFuc2xhdGUgPSBmdW5jdGlvbihjb250ZW50LCBsYW5nKSB7XHJcbiAgICAgICAgICAgIGlmICghbGFuZykge1xyXG4gICAgICAgICAgICAgICAgbGFuZyA9IGZhY3Rvcnkuc2VsZWN0ZWRMYW5ndWFnZS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbnRlbnRMaXN0Lmhhc093blByb3BlcnR5KGNvbnRlbnQpICYmXHJcbiAgICAgICAgICAgICAgICBjb250ZW50TGlzdFtjb250ZW50XS5oYXNPd25Qcm9wZXJ0eShsYW5nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRMaXN0W2NvbnRlbnRdW2xhbmddO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBrZXkgZm9yIHNwZWNpZmllZCB2YWx1ZSwgaWUuIHZhbHVlIG9mIFwiVG9wIDEwXCIgd291bGQgcmV0dXJuIFwidG9wMTBcIlxyXG4gICAgICAgIGZhY3RvcnkuZ2V0S2V5Rm9yVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgbGFuZykge1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFsYW5nKSB7XHJcbiAgICAgICAgICAgICAgICBsYW5nID0gJ2VuLXVzJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHBhaXIgPSBfLmZpbmQoY29udGVudExpc3QsIGZ1bmN0aW9uKGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50W2ZhY3Rvcnkuc2VsZWN0ZWRMYW5ndWFnZS52YWx1ZV0gPT09IHZhbHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYWlyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFpcltsYW5nXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XHJcbiAgICB9XHJcbl0pO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgXHJcbiAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsIExvZ2luU2VydmljZSwgYXV0aEFQSVNlcnZpY2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvZ2luJyk7XHJcbiAgICAgICAgICAgIHZhciBERUZBVUxUX1JFRElSRUNUID0gJ3Bvc3RzJztcclxuICAgICAgICAgICAgJHNjb3BlLmZvcm1WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vdmFyIGN1cnJlbnRVc2VyID0gTG9naW5TZXJ2aWNlLmxvZ2luQ2hlY2soKTtcclxuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5jdXJyZW50VXNlcikge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlRm9ybShmb3JtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm9ybS4kdmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZm9ybVZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmZvcm1WYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgJHNjb3BlLmRvTG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpc0Zvcm1WYWxpZCA9IHZhbGlkYXRlRm9ybSgkc2NvcGUubG9naW5Gb3JtKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc0Zvcm1WYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvck1zZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhBUElTZXJ2aWNlXHJcbiAgICAgICAgICAgICAgICAgICAgLmF1dGhlbnRpY2F0ZVVzZXIoJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjdXJyZW50VXNlcicsIEpTT04uc3RyaW5naWZ5KHJlc3VsdC51c2VyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvZ2dlZEluJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Rva2VuJywgcmVzdWx0LnRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSByZXN1bHQudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUucmVkaXJlY3RUbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygkcm9vdFNjb3BlLnJlZGlyZWN0VG8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oREVGQVVMVF9SRURJUkVDVCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JNc2cgPSAnSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZCc7Ly9yZXN1bHQubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJST1InKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgfSk7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuc2VydmljZSgnTG9naW5TZXJ2aWNlJywgZnVuY3Rpb24oJHN0YXRlLCAkcm9vdFNjb3BlLCBhdXRoQVBJU2VydmljZSkge1xyXG4gICAgICAgIHZhciB2bSA9IHRoaXM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdm0ubG9naW5DaGVjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSAmJiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvZ2dlZEluJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjdXJyZW50VXNlcicpKTtcclxuICAgICAgICAgICAgICAgIGF1dGhBUElTZXJ2aWNlLnZhbGlkYXRlVXNlclNlc3Npb24oY3VycmVudFVzZXIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC52YWxpZFNlc3Npb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnY3VycmVudFVzZXInLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBjdXJyZW50VXNlcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50VXNlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuZmFjdG9yeSgnYXV0aEFQSVNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgRU5WKSB7XHJcbiAgICAgICAgdmFyIGF1dGhTZXJ2aWNlID0ge307XHJcbiAgICAgICAgYXV0aFNlcnZpY2UuYXV0aGVudGljYXRlVXNlciA9IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd29yZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICd1c2VyL2F1dGgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtlbWFpbDogZW1haWwsIHBhc3N3b3JkOiBwYXNzd29yZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogJ3ByZWxvZ2luJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBwIGluIG9iailcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChwKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtwXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHIuam9pbihcIiZcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBhdXRoU2VydmljZS52YWxpZGF0ZVVzZXJTZXNzaW9uID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICd1c2VyL3ZhbGlkYXRlc2Vzc2lvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdXNlclxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYXV0aFNlcnZpY2U7IFxyXG4gICAgfSk7XHJcbiAgICBcclxufSkoKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuc2VydmljZSgnc3ZUYWJzRGF0YScsIFtmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdGFicyA9IHtcclxuICAgICAgICAgICAgJ2hvbWUnOiBbXHJcbiAgICAgICAgICAgICAgICAnZGV2aWNlcydcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2NyZWVuID0gZnVuY3Rpb24oc2NyZWVuSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRhYnNbc2NyZWVuSWRdO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0RGVmYXVsdFRhYklkID0gZnVuY3Rpb24oc2NyZWVuSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhYnNbc2NyZWVuSWRdKVswXTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuY29udHJvbGxlcignTWVudScsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJHN0YXRlUGFyYW1zJywgJyRodHRwJywgJyRsb2NhdGlvbicsXHJcbiAgICAnJHN0YXRlJywgJ3N2VGFic0RhdGEnLCAnJGRvY3VtZW50JywgJ3N2TG9jYWxlJywgJ18nLFxyXG4gICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGVQYXJhbXMsICRodHRwLCAkbG9jYXRpb24sICRzdGF0ZSwgc3ZUYWJzRGF0YSxcclxuICAgICAgICAkZG9jdW1lbnQsIHN2TG9jYWxlLCBfKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5tZW51VHlwZSA9ICd0YXNrJztcclxuXHJcbiAgICAgICAgJHNjb3BlLnNldEN1cnJlbnRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFN0YXRlID0gJHN0YXRlLmN1cnJlbnQubmFtZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuc2V0Q3VycmVudFN0YXRlKCk7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCAkc2NvcGUuc2V0Q3VycmVudFN0YXRlKTtcclxuICAgICAgICAkc2NvcGUuaW5TdGF0ZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gJ3ZpZXcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmN1cnJlbnRTdGF0ZS5pbmRleE9mKCdtb25pdG9yJykgPT09IDAgfHxcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFN0YXRlLmluZGV4T2YoJ3JlcG9ydCcpID09PSAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRTdGF0ZS5pbmRleE9mKCd0b29scycpID09PSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY3VycmVudFN0YXRlLmluZGV4T2Yoc3RhdGUpID09PSAwO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5zdkxvY2FsZSA9IHN2TG9jYWxlO1xyXG5cclxuICAgICAgICAkc2NvcGUuaG9tZSA9IHN2TG9jYWxlLnRyYW5zbGF0ZSgnaG9tZScpO1xyXG4gICAgICAgICRzY29wZS5sb2dpbiA9IHN2TG9jYWxlLnRyYW5zbGF0ZSgnbG9naW4nKTtcclxuICAgICAgICAkc2NvcGUucmVnaXN0ZXIgPSBzdkxvY2FsZS50cmFuc2xhdGUoJ3JlZ2lzdGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLnNldHRpbmdzID0gc3ZMb2NhbGUudHJhbnNsYXRlKCdzZXR0aW5ncycpO1xyXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbiA9IHN2TG9jYWxlLmdldFNlbGVjdGVkTGFuZ3VhZ2UoKS52YWx1ZS5zdWJzdHJpbmcoMCwgMik7XHJcblxyXG4gICAgICAgICRzY29wZS5ob21lU2NyZWVuSWQgPSAnaG9tZSc7XHJcbiAgICAgICAgJHNjb3BlLmRlZmF1bHRUYWJJZCA9IHN2VGFic0RhdGEuZ2V0RGVmYXVsdFRhYklkKCRzY29wZS5ob21lU2NyZWVuSWQpO1xyXG4gICAgICAgICRzY29wZS50YWJzID0gc3ZUYWJzRGF0YS5zY3JlZW4oJHNjb3BlLmhvbWVTY3JlZW5JZCk7XHJcblxyXG4gICAgICAgICRzY29wZS5sYW5ndWFnZXMgPSBzdkxvY2FsZS5nZXRMb2NhbGVzKCk7XHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkID0gc3ZMb2NhbGUuZ2V0U2VsZWN0ZWRMYW5ndWFnZSgpO1xyXG5cclxuICAgICAgICAkc2NvcGUubGFuZ3VhZ2VDaGFuZ2VkID0gZnVuY3Rpb24obGFuZ3VhZ2UpIHtcclxuICAgICAgICAgICAgc3ZMb2NhbGUuc2V0U2VsZWN0ZWRMYW5ndWFnZShsYW5ndWFnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLmJpbmRDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkdHJpZ2dlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3YtbWFpbi1tZW51LWNvbnRhaW5lcicpKTtcclxuICAgICAgICAgICAgaWYgKCEkdHJpZ2dlclswXS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbXlFbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3YtbmF2YmFyJykpO1xyXG4gICAgICAgICAgICAgICAgbXlFbC5yZW1vdmVDbGFzcygnaW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRkb2N1bWVudC5iaW5kKCdjbGljaycsICRzY29wZS5iaW5kQ2xpY2spO1xyXG5cclxuICAgIH1cclxuXSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5kaXJlY3RpdmUoJ3Jlc2l6ZScsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihzY29wZSkge1xyXG4gICAgICAgIHZhciB3ID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xyXG4gICAgICAgIHNjb3BlLmdldFdpbmRvd0RpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICd3JzogYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpWzBdLmlubmVyV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAnaCc6IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KVswXS5pbm5lckhlaWdodCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaChzY29wZS5nZXRXaW5kb3dEaW1lbnNpb25zLCBmdW5jdGlvbihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICBzY29wZS53aW5kb3dIZWlnaHQgPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdylbMF0uaW5uZXJXaWR0aDtcclxuICAgICAgICAgICAgc2NvcGUud2luZG93V2lkdGggPSBuZXdWYWx1ZS53O1xyXG4gICAgICAgICAgICB2YXIgbXlFbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3YtbmF2YmFyJykpO1xyXG4gICAgICAgICAgICBpZiAoc2NvcGUud2luZG93SGVpZ2h0ID4gNzY4KSB7XHJcbiAgICAgICAgICAgICAgICBteUVsLnJlbW92ZUNsYXNzKCdpbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHcuYmluZCgncmVzaXplJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcclxuICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jb2xsYXBzZSgnaGlkZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICB9O1xyXG59KTtcclxuIiwidmFyIHVuZGVyc2NvcmUgPSBhbmd1bGFyLm1vZHVsZSgndW5kZXJzY29yZScsIFtdKTtcclxuXHJcbnVuZGVyc2NvcmUuZmFjdG9yeSgnXycsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcclxuICAgIHJldHVybiAkd2luZG93Ll87XHJcbn0pO1xyXG4iLCJcclxuYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuY29udHJvbGxlcignVXNlckNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJyRodHRwJywgJ3N2TG9jYWxlJywgJ3VzZXJBUElTZXJ2aWNlJywgJyRzdGF0ZScsXHJcbiAgICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc2NvcGUsICRodHRwLCBzdkxvY2FsZSwgdXNlckFQSVNlcnZpY2UsICRzdGF0ZSkge1xyXG4gICAgICAgICRzY29wZS5mb3JtVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIGZhaWx1cmVIYW5kbGVyKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIFhIUi4gJyArIGVycm9yLmRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiB2YWxpZGF0ZUZvcm0oZm9ybSkge1xyXG4gICAgICAgICAgICBpZiAoZm9ybS4kdmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5mb3JtVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZm9ybVZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaXNGb3JtVmFsaWQgPSB2YWxpZGF0ZUZvcm0oJHNjb3BlLnJlZ2lzdGVyRm9ybSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Zvcm1WYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnN1Y2Nlc3NNc2cgPSAnJztcclxuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvck1zZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgdXNlckFQSVNlcnZpY2VcclxuICAgICAgICAgICAgICAgIC5hZGRVc2VyKCRzY29wZS51c2VyKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5yZWdpc3RlckZvcm0uJHNldFByaXN0aW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc01zZyA9ICdUaGFuayB5b3UgZm9yIHJlZ2lzdGVyaW5nLiBQbGVhc2UgbG9naW4gdG8gY29udGludWUuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvck1zZyA9IHJlc3VsdC5tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLnBvc3RzTGlzdCA9IHJlc3BvbnNlLnBvc3RzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZhaWx1cmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAkc2NvcGUuZG9Mb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5sb2NhbFN0b3JhZ2UuY3VycmVudFVzZXI7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cubG9jYWxTdG9yYWdlLmxvZ2dlZEluO1xyXG4gICAgICAgICAgICBkZWxldGUgd2luZG93LmxvY2FsU3RvcmFnZS50b2tlbjtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IHt9O1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgICAgIFxyXG5dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmNvbnRyb2xsZXIoJ1Nlc3Npb25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnc3ZMb2NhbGUnLCAnJHN0YXRlJyxcclxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHN2TG9jYWxlLCAkc3RhdGUpIHtcclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuZG9Mb2dvdXQoKTtcclxuICAgICAgICAkc2NvcGUuZG9Mb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgICAgXHJcbl0pOyIsIlxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5jb250cm9sbGVyKCdVc2VyUG9zdHNDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnc3ZMb2NhbGUnLCAncG9zdHNBUElTZXJ2aWNlJyxcclxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHN2TG9jYWxlLCBwb3N0c0FQSVNlcnZpY2UpIHtcclxuIFxyXG4gICAgICAgICRzY29wZS5nZXRQb3N0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwb3N0c0FQSVNlcnZpY2VcclxuICAgICAgICAgICAgICAgIC5nZXRQb3N0cyh7dGl0bGU6ICduJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBvc3RzTGlzdCA9IHJlc3BvbnNlLnBvc3RzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmdldFBvc3RzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFBvc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcG9zdHNBUElTZXJ2aWNlXHJcbiAgICAgICAgICAgICAgICAuYWRkUG9zdCgkc2NvcGUucG9zdClcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5wb3N0c0xpc3QgPSByZXNwb25zZS5wb3N0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgICAgXHJcbl0pOyIsIlxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5jb250cm9sbGVyKCdVc2VyU2V0dGluZ3NDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnc3ZMb2NhbGUnLCAncG9zdHNBUElTZXJ2aWNlJyxcclxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHN2TG9jYWxlLCBwb3N0c0FQSVNlcnZpY2UpIHtcclxuIFxyXG4gICAgICAgICRzY29wZS5nZXRQb3N0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwb3N0c0FQSVNlcnZpY2VcclxuICAgICAgICAgICAgICAgIC5nZXRQb3N0cyh7dGl0bGU6ICduJ30pXHJcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBvc3RzTGlzdCA9IHJlc3BvbnNlLnBvc3RzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmdldFBvc3RzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFBvc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcG9zdHNBUElTZXJ2aWNlXHJcbiAgICAgICAgICAgICAgICAuYWRkUG9zdCgkc2NvcGUucG9zdClcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5wb3N0c0xpc3QgPSByZXNwb25zZS5wb3N0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgICAgICBcclxuXSk7IiwiXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmZhY3RvcnkoJ3NldHRpbmdzQVBJU2VydmljZScsXHJcbiAgICBmdW5jdGlvbigkaHR0cCwgRU5WKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBvc3RzU2VydmljZSA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBvc3RzU2VydmljZS5nZXRBbGxQb3N0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICdwb3N0JyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge3RpdGxlOiAnJ30sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcG9zdHNTZXJ2aWNlLmdldFBvc3RzID0gZnVuY3Rpb24oZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHBvc3RzU2VydmljZS5hZGRQb3N0ID0gZnVuY3Rpb24ocG9zdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IEVOVi5hcGkgKyAncG9zdCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBwb3N0LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBwIGluIG9iailcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHApICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW3BdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHIuam9pbihcIiZcIik7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBwb3N0c1NlcnZpY2U7XHJcbiAgICB9XHJcbik7IiwiXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmZhY3RvcnkoJ3VzZXJBUElTZXJ2aWNlJyxcclxuICAgIGZ1bmN0aW9uKCRodHRwLCBFTlYpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdXNlclNlcnZpY2UgPSB7fTtcclxuICAgICAgICBcclxuICAgICAgICB1c2VyU2VydmljZS5nZXRBbGxVc2VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICd1c2VyJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHVzZXJTZXJ2aWNlLmdldFBvc3RzID0gZnVuY3Rpb24oZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHVzZXJTZXJ2aWNlLmFkZFVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICd1c2VyJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IHVzZXJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdXNlclNlcnZpY2U7XHJcbiAgICB9XHJcbik7IiwiXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmZhY3RvcnkoJ2NhdGVnb3J5QVBJU2VydmljZScsXHJcbiAgICBmdW5jdGlvbigkaHR0cCwgRU5WKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGNhdGVnb3J5U2VydmljZSA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhdGVnb3J5U2VydmljZS5nZXRBbGxDYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ2NhdGVnb3J5L2FsbCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBjYXRlZ29yeVNlcnZpY2UuZ2V0Q2F0ZWdvcmllcyA9IGZ1bmN0aW9uKGZpbHRlclBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICdjYXRlZ29yeScsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IGZpbHRlclBhcmFtcyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY2F0ZWdvcnlTZXJ2aWNlLmdldENhdGVnb3J5RmllbGRzID0gZnVuY3Rpb24oY2F0ZWdvcnlJZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHVybDogRU5WLmFwaSArICdjYXRlZ29yeS9maWVsZHMvJyArIGNhdGVnb3J5SWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gY2F0ZWdvcnlTZXJ2aWNlO1xyXG4gICAgfVxyXG4pOyIsIlxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5mYWN0b3J5KCdsb2NhdGlvbnNBUElTZXJ2aWNlJyxcclxuICAgIGZ1bmN0aW9uKCRodHRwLCBFTlYpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgbG9jYXRpb25zU2VydmljZSA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxvY2F0aW9uc1NlcnZpY2UuZ2V0QWxsQ2l0aWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ2NpdHknXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbG9jYXRpb25zU2VydmljZS5nZXRMb2NhdGlvbnNCeUNpdHkgPSBmdW5jdGlvbihjaXR5SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IEVOVi5hcGkgKyAnbG9jYXRpb24vJyArIGNpdHlJZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgIFxyXG4gICAgICAgIHJldHVybiBsb2NhdGlvbnNTZXJ2aWNlO1xyXG4gICAgfVxyXG4pOyIsIlxyXG5hbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5jb250cm9sbGVyKCdQb3N0c0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckaHR0cCcsICckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJ3N2TG9jYWxlJywgJ3Bvc3RzQVBJU2VydmljZScsICdjYXRlZ29yeUFQSVNlcnZpY2UnLCAnVXBsb2FkJywgJ2xvY2F0aW9uc0FQSVNlcnZpY2UnLFxyXG4gICAgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIHN2TG9jYWxlLCBwb3N0c0FQSVNlcnZpY2UsIGNhdGVnb3J5QVBJU2VydmljZSwgVXBsb2FkLCBsb2NhdGlvbnNBUElTZXJ2aWNlKSB7XHJcbiBcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSAnYXV0aF90b2tlbj1oZWxsbyc7XHJcbiAgICAgICAkc2NvcGUuc2VsZWN0ZWRDaXR5ID0ge307ICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICBsb2NhdGlvbnNBUElTZXJ2aWNlLmdldEFsbENpdGllcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAkc2NvcGUuY2l0aWVzID0gcmVzcG9uc2UuZGF0YS5jaXRpZXM7XHJcbiAgICAgICAgICAgLy8kc2NvcGUucG9zdC5jaXR5MSA9ICRzY29wZS5jaXRpZXNbMF07XHJcbiAgICAgICAgICAgLy8kc2NvcGUucG9zdC5jaXR5MiA9ICRzY29wZS5jaXRpZXNbMF07XHJcbiAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFUlJPUjogV2hpbGUgbG9hZGluZyBjaXRpZXMnKTtcclxuICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAkc2NvcGUuY2l0eVNlbGVjdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKGNpdHksIHR5cGUpIHtcclxuICAgICAgICAgICAgbG9jYXRpb25zQVBJU2VydmljZS5nZXRMb2NhdGlvbnNCeUNpdHkoY2l0eS5jaXR5SWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZnJvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmZyb21Mb2NhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZnJvbUxvY2F0aW9ucyA9IHJlc3BvbnNlLmRhdGEubG9jYXRpb25zO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudG9Mb2NhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudG9Mb2NhdGlvbnMgPSByZXNwb25zZS5kYXRhLmxvY2F0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5mcm9tTG9jYXRpb25zID0gcmVzcG9uc2UuZGF0YS5sb2NhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IHdoaWxlIGxvY2F0aW9ucycpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gXHJcbiAgICAgICAgLypcclxuICAgICAgICAkc2NvcGUuZ2V0UG9zdHNCeUNhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcclxuICAgICAgICAgICAgdmFyIHF1ZXJ5UGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgY2l0eUlkOiAkc2NvcGUuc2VsZWN0ZWRDaXR5LmNpdHlJZCB8fCAwLCBcclxuICAgICAgICAgICAgICAgIHNlYXJjaFRpdGxlOiAkc2NvcGUuc2VhcmNoVGl0bGUgfHwgJycsIFxyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogY2F0ZWdvcnkuY2F0ZWdvcnlJZCB8fCAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncXVlcnlQYXJhbXMnLCBKU09OLnN0cmluZ2lmeShxdWVyeVBhcmFtcykpO1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3Bvc3RzJywgcXVlcnlQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICRzY29wZS5nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5QVBJU2VydmljZS5nZXRBbGxDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXNMaXN0ID0gcmVzcG9uc2UuZGF0YS5jYXRlZ29yaWVzO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAqL1xyXG4gICAgICAgICRzY29wZS5nZXRQb3N0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdmFyIHBvc3RzRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaFRpdGxlOiAkc3RhdGVQYXJhbXMuc2VhcmNoVGl0bGUgfHwgJycsXHJcbiAgICAgICAgICAgICAgICBjaXR5SWQ6ICRzdGF0ZVBhcmFtcy5jaXR5SWQgfHwgMCxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQ6ICRzdGF0ZVBhcmFtcy5jYXRlZ29yeUlkIHx8IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3F1ZXJ5UGFyYW1zJykgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbXMgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncXVlcnlQYXJhbXMnKSk7XHJcbiAgICAgICAgICAgICAgICBwb3N0c0RhdGEuc2VhcmNoVGl0bGUgPSBxdWVyeVBhcmFtcy5zZWFyY2hUaXRsZTtcclxuICAgICAgICAgICAgICAgIHBvc3RzRGF0YS5jaXR5SWQgPSBxdWVyeVBhcmFtcy5jaXR5LmNpdHlJZDtcclxuICAgICAgICAgICAgICAgIHBvc3RzRGF0YS5jYXRlZ29yeUlkID0gcXVlcnlQYXJhbXMuY2F0ZWdvcnkuY2F0ZWdvcnlJZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBvc3RzQVBJU2VydmljZVxyXG4gICAgICAgICAgICAgICAgLmdldFBvc3RzKHBvc3RzRGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucG9zdHNMaXN0ID0gcmVzcG9uc2UucG9zdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vJHNjb3BlLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5nZXRQb3N0cygpO1xyXG4gXHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgICAgXHJcbl0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuY29udHJvbGxlcignUG9zdHNOZXdDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnc3ZMb2NhbGUnLCAncG9zdHNBUElTZXJ2aWNlJywgJ2NhdGVnb3J5QVBJU2VydmljZScsICdVcGxvYWQnLCAnbG9jYXRpb25zQVBJU2VydmljZScsXHJcbiAgICBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBzdkxvY2FsZSwgcG9zdHNBUElTZXJ2aWNlLCBjYXRlZ29yeUFQSVNlcnZpY2UsIFVwbG9hZCwgbG9jYXRpb25zQVBJU2VydmljZSkge1xyXG4gXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ2F1dGhfdG9rZW49aGVsbG8nO1xyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5wb3N0ID0ge307IFxyXG4gICAgICAgICRzY29wZS50ZXh0QXJlYVJvd3MgPSA3O1xyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5tZWFzdXJlbWVudHMgPSBbe2xhYmVsOiAnTWVtYmVycycsIHZhbHVlOiAnbWVtYmVycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xhYmVsOiAnU3EuIEZlZXQnLCB2YWx1ZTogJ3NxZmVldCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xhYmVsOiAnTGl0cmVzJywgdmFsdWU6ICdsaXRyZXMnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsYWJlbDogJ090aGVycycsIHZhbHVlOiAnb3RoZXJzJ31dO1xyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5wb3N0Lm1lYXN1cmVtZW50ID0gJHNjb3BlLm1lYXN1cmVtZW50c1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLmFnZVBlcmlvZHMgPSAgIFt7bGFiZWw6ICdZZWFycycsIHZhbHVlOiAneWVhcnMnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsYWJlbDogJ01vbnRocycsIHZhbHVlOiAnbW9udGhzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGFiZWw6ICdEYXlzJywgdmFsdWU6ICdkYXlzJ31dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLnBvc3QuYWdlVHlwZSA9ICRzY29wZS5hZ2VQZXJpb2RzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICBsb2NhdGlvbnNBUElTZXJ2aWNlLmdldEFsbENpdGllcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAkc2NvcGUuY2l0aWVzID0gcmVzcG9uc2UuZGF0YS5jaXRpZXM7XHJcbiAgICAgICAgICAgJHNjb3BlLnBvc3QuY2l0eTEgPSAkc2NvcGUuY2l0aWVzWzBdO1xyXG4gICAgICAgICAgICRzY29wZS5wb3N0LmNpdHkyID0gJHNjb3BlLmNpdGllc1swXTtcclxuICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBXaGlsZSBsb2FkaW5nIGNpdGllcycpO1xyXG4gICAgICAgfSk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLmNpdHlTZWxlY3Rpb25DaGFuZ2UgPSBmdW5jdGlvbihjaXR5LCB0eXBlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ2l0eSBzZWxlY3Rpb24gY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uc0FQSVNlcnZpY2UuZ2V0TG9jYXRpb25zQnlDaXR5KGNpdHkuY2l0eUlkKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Zyb20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5mcm9tTG9jYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmZyb21Mb2NhdGlvbnMgPSByZXNwb25zZS5kYXRhLmxvY2F0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucG9zdC5sb2NhdGlvbjEgPSAkc2NvcGUuZnJvbUxvY2F0aW9uc1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0byc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRvTG9jYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRvTG9jYXRpb25zID0gcmVzcG9uc2UuZGF0YS5sb2NhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBvc3QubG9jYXRpb24yID0gJHNjb3BlLnRvTG9jYXRpb25zWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmZyb21Mb2NhdGlvbnMgPSByZXNwb25zZS5kYXRhLmxvY2F0aW9ucztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiB3aGlsZSBsb2NhdGlvbnMgJyArIGVycm9yLmRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSAgIFxyXG5cclxuICAgICAgICAkc2NvcGUuaXNWaXNpYmxlRmllbGQgPSBmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgICAgICAgcmV0dXJuIF8uZmluZExhc3RJbmRleCgkc2NvcGUuY2F0ZWdvcnlGaWVsZHMsIHtmaWVsZDogZmllbGR9KSA+IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3J5RmllbGRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5QVBJU2VydmljZS5nZXRDYXRlZ29yeUZpZWxkcygkc2NvcGUucG9zdC5jYXRlZ29yeS5jYXRlZ29yeUlkKS5cclxuICAgICAgICAgICAgICB0aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5jYXRlZ29yeUZpZWxkcyA9IHJlc3BvbnNlLmRhdGEuY2F0ZWdvcnlGaWVsZHM7XHJcbiAgICAgICAgICAgICAgICAgIF8uZmluZEluZGV4KCRzY29wZS5jYXRlZ29yeUZpZWxkcywgJ3RvTG9jYXRpb24nKTtcclxuICAgICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VSUk9SOiBXaGlsZSBmZXRjaGluZyBjYXRlZ29yeSBmaWVsZHMnKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgXHJcbiAgICAgICAkc2NvcGUuJHdhdGNoKCdwb3N0LmNhdGVnb3J5JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcclxuICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ2F0ZWdvcnkgc2VsZWN0aW9uIGNoYW5nZScpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICRzY29wZS5nZXRDYXRlZ29yeUZpZWxkcygpO1xyXG4gICAgICAgfSk7XHJcblxyXG4gICAgICAgJHNjb3BlLiR3YXRjaEdyb3VwKFsncG9zdC5jaXR5MScsICdwb3N0LmNpdHkyJ10sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgICAgaWYgKG5ld1ZhbFswXSkge1xyXG4gICAgICAgICAgICAgICAkc2NvcGUuY2l0eVNlbGVjdGlvbkNoYW5nZShuZXdWYWxbMF0sICdmcm9tJyk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgIGlmIChuZXdWYWxbMV0pIHtcclxuICAgICAgICAgICAgICAgJHNjb3BlLmNpdHlTZWxlY3Rpb25DaGFuZ2UobmV3VmFsWzFdLCAndG8nKTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICB9KTsgICAgICAgICBcclxuICAgICAgICBcclxuICAgIFxyXG4gICAgICAgICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUuZm9ybS5maWxlLiR2YWxpZCAmJiAkc2NvcGUuZmlsZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkKCRzY29wZS5maWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyB1cGxvYWQgb24gZmlsZSBzZWxlY3Qgb3IgZHJvcFxyXG4gICAgICAgICRzY29wZS51cGxvYWQgPSBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICBVcGxvYWQudXBsb2FkKHtcclxuICAgICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA5OS9MZXRzaGFyZUNvcmUvcmVzdC9wb3N0L3VwbG9hZCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7dXBsb2FkZWRGaWxlOiBmaWxlLCAnbmFtZSc6ICdrcmFudHUnfVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU3VjY2VzcyAnICsgcmVzcC5jb25maWcuZGF0YS5maWxlLm5hbWUgKyAndXBsb2FkZWQuIFJlc3BvbnNlOiAnICsgcmVzcC5kYXRhKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3ApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBzdGF0dXM6ICcgKyByZXNwLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9ncmVzc1BlcmNlbnRhZ2UgPSBwYXJzZUludCgxMDAuMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWwpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Byb2dyZXNzOiAnICsgcHJvZ3Jlc3NQZXJjZW50YWdlICsgJyUgJyArIGV2dC5jb25maWcuZGF0YS5maWxlLm5hbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY2F0ZWdvcnlBUElTZXJ2aWNlLmdldEFsbENhdGVnb3JpZXMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2F0ZWdvcmllc0xpc3QgPSByZXNwb25zZS5kYXRhLmNhdGVnb3JpZXM7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5nZXRDYXRlZ29yaWVzKCk7XHJcblxyXG4gICAgICAgICRzY29wZS5mb3JtVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlRm9ybShmb3JtKSB7XHJcbiAgICAgICAgICAgIGlmIChmb3JtLiR2YWxpZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmZvcm1WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5mb3JtVmFsaWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFBvc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGlzRm9ybVZhbGlkID0gdmFsaWRhdGVGb3JtKCRzY29wZS5wb3N0Rm9ybSk7XHJcbiAgICAgICAgICAgIGlmIChpc0Zvcm1WYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBvc3QgPSAkc2NvcGUucG9zdDtcclxuICAgICAgICAgICAgICAgIHBvc3QudXNlcklkID0gJHNjb3BlLmN1cnJlbnRVc2VyLnVzZXJJZDtcclxuICAgICAgICAgICAgICAgIHBvc3QuY2F0ZWdvcnlJZCA9ICRzY29wZS5wb3N0LmNhdGVnb3J5LmNhdGVnb3J5SWQ7XHJcbiAgICAgICAgICAgICAgICBwb3N0LmNpdHkxSWQgPSAkc2NvcGUucG9zdC5jaXR5MS5jaXR5SWQ7XHJcbiAgICAgICAgICAgICAgICBwb3N0LmxvY2F0aW9uMUlkID0gJHNjb3BlLnBvc3QubG9jYXRpb24xLmxvY2F0aW9uSWQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vcG9zdC5jaXR5MklkID0gJHNjb3BlLnBvc3QuY2l0eTIuY2l0eUlkO1xyXG4gICAgICAgICAgICAgICAgLy9wb3N0LmxvY2F0aW9uMklkID0gJHNjb3BlLnBvc3QubG9jYXRpb24yLmxvY2F0aW9uSWQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHBvc3QubWVhc3VyZW1lbnQgPSAkc2NvcGUucG9zdC5tZWFzdXJlbWVudC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHBvc3QuYWdlID0gJHNjb3BlLnBvc3QuYWdlO1xyXG4gICAgICAgICAgICAgICAgcG9zdHNBUElTZXJ2aWNlXHJcbiAgICAgICAgICAgICAgICAgICAgLmFkZFBvc3QocG9zdClcclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5wb3N0c0xpc3QgPSByZXNwb25zZS5wb3N0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc01zZyA9ICdZb3VyIGFkIGhhcyBiZWVuIHBvc3RlZCBzdWNjZXNzZnVsbHkuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBvc3QgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5wb3N0Rm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgICAgXHJcbl0pO1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmNvbnRyb2xsZXIoJ1Bvc3RzRGV0YWlsc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGVQYXJhbXMnLCAnc3ZMb2NhbGUnLCAncG9zdHNBUElTZXJ2aWNlJywgJ2NhdGVnb3J5QVBJU2VydmljZScsICdVcGxvYWQnLCAnbG9jYXRpb25zQVBJU2VydmljZScsXHJcbiAgICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgc3ZMb2NhbGUsIHBvc3RzQVBJU2VydmljZSwgY2F0ZWdvcnlBUElTZXJ2aWNlLCBVcGxvYWQsIGxvY2F0aW9uc0FQSVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgcG9zdHNBUElTZXJ2aWNlLmdldFBvc3RCeUlkKCRzdGF0ZVBhcmFtcy5pZCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgJHNjb3BlLnBvc3REZXRhaWxzID0gcmVzdWx0LnBvc3Q7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlJPUicpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgICAgIFxyXG5dKTsiLCJcclxuYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuZmFjdG9yeSgncG9zdHNBUElTZXJ2aWNlJyxcclxuICAgIGZ1bmN0aW9uKCRodHRwLCBFTlYsIFVwbG9hZCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwb3N0c1NlcnZpY2UgPSB7fTtcclxuICAgICAgICBcclxuICAgICAgICBwb3N0c1NlcnZpY2UuZ2V0QWxsUG9zdHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IEVOVi5hcGkgKyAncG9zdCcsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt0aXRsZTogJyd9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcG9zdHNTZXJ2aWNlLmdldFBvc3RzID0gZnVuY3Rpb24oZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcG9zdHNTZXJ2aWNlLmdldFBvc3RCeUlkID0gZnVuY3Rpb24ocG9zdElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QvJyArIHBvc3RJZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICBwb3N0c1NlcnZpY2UuYWRkUG9zdCA9IGZ1bmN0aW9uKHBvc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVwbG9hZC51cGxvYWQoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcG9zdFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBFTlYuYXBpICsgJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogcG9zdCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCd9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ciA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgcCBpbiBvYmopXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChwKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtwXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyLmpvaW4oXCImXCIpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICovXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gcG9zdHNTZXJ2aWNlO1xyXG4gICAgfVxyXG4pOyIsImFuZ3VsYXIubW9kdWxlKCdMZXRzaGFyZScpLmRpcmVjdGl2ZSgnaW1hZ2VDYXJvdXNlbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0FFQycsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9pbWFnZS1jYXJvdXNlbC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpIHtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCBhdHRyKSB7XHJcbiAgICAgICAgICAgICQoXCIuaW1nLWJsb2NrXCIpLmZhZGVPdXQoMikuZmFkZUluKDcwMCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkc2NvcGUuc3RhcnRTbGlkZXIgPSBmdW5jdGlvbigpIHtcclxuXHQgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcblx0ICAgICAgICAgICAgICAgICAkQXV0b1BsYXk6IHRydWUsXHJcblx0ICAgICAgICAgICAgICAgICAkRHJhZ09yaWVudGF0aW9uOiAzLCAgXHJcblx0ICAgICAgICAgICAgICAgICAkUGF1c2VPbkhvdmVyOiAwLFxyXG5cdCAgICAgICAgICAgICAgICAgJEFycm93TmF2aWdhdG9yT3B0aW9uczogeyAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIE9wdGlvbnMgdG8gc3BlY2lmeSBhbmQgZW5hYmxlIGFycm93IG5hdmlnYXRvciBvciBub3RcclxuXHQgICAgICAgICAgICAgICAgICAgICAkQ2xhc3M6ICRKc3NvckFycm93TmF2aWdhdG9yJCwgICAgICAgICAgICAgIC8vW1JlcXVyaWVkXSBDbGFzcyB0byBjcmVhdGUgYXJyb3cgbmF2aWdhdG9yIGluc3RhbmNlXHJcblx0ICAgICAgICAgICAgICAgICAgICAgJENoYW5jZVRvU2hvdzogMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bUmVxdWlyZWRdIDAgTmV2ZXIsIDEgTW91c2UgT3ZlciwgMiBBbHdheXNcclxuXHQgICAgICAgICAgICAgICAgICAgICAkQXV0b0NlbnRlcjogMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tPcHRpb25hbF0gQXV0byBjZW50ZXIgYXJyb3dzIGluIHBhcmVudCBjb250YWluZXIsIDAgTm8sIDEgSG9yaXpvbnRhbCwgMiBWZXJ0aWNhbCwgMyBCb3RoLCBkZWZhdWx0IHZhbHVlIGlzIDBcclxuXHQgICAgICAgICAgICAgICAgICAgICAkU3RlcHM6IDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tPcHRpb25hbF0gU3RlcHMgdG8gZ28gZm9yIGVhY2ggbmF2aWdhdGlvbiByZXF1ZXN0LCBkZWZhdWx0IHZhbHVlIGlzIDFcclxuXHQgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJFRodW1ibmFpbE5hdmlnYXRvck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJENsYXNzOiAkSnNzb3JUaHVtYm5haWxOYXZpZ2F0b3IkLCAgICAgICAgICAgICAgLy9bUmVxdWlyZWRdIENsYXNzIHRvIGNyZWF0ZSB0aHVtYm5haWwgbmF2aWdhdG9yIGluc3RhbmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRDaGFuY2VUb1Nob3c6IDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vW1JlcXVpcmVkXSAwIE5ldmVyLCAxIE1vdXNlIE92ZXIsIDIgQWx3YXlzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkU3BhY2luZ1g6IDIzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIEhvcml6b250YWwgc3BhY2UgYmV0d2VlbiBlYWNoIHRodW1ibmFpbCBpbiBwaXhlbCwgZGVmYXVsdCB2YWx1ZSBpcyAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRTcGFjaW5nWTogMjMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tPcHRpb25hbF0gVmVydGljYWwgc3BhY2UgYmV0d2VlbiBlYWNoIHRodW1ibmFpbCBpbiBwaXhlbCwgZGVmYXVsdCB2YWx1ZSBpcyAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICREaXNwbGF5UGllY2VzOiA3LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vW09wdGlvbmFsXSBOdW1iZXIgb2YgcGllY2VzIHRvIGRpc3BsYXksIGRlZmF1bHQgdmFsdWUgaXMgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkUGFya2luZ1Bvc2l0aW9uOiAyMTkgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tPcHRpb25hbF0gVGhlIG9mZnNldCBwb3NpdGlvbiB0byBwYXJrIHRodW1ibmFpbFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgIC8qXHJcblx0ICAgICAgICAgICAgICAgICAkQnVsbGV0TmF2aWdhdG9yT3B0aW9uczogeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIE9wdGlvbnMgdG8gc3BlY2lmeSBhbmQgZW5hYmxlIG5hdmlnYXRvciBvciBub3RcclxuXHQgICAgICAgICAgICAgICAgICAgICAkQ2xhc3M6ICRKc3NvckJ1bGxldE5hdmlnYXRvciQsICAgICAgICAgICAgICAgICAgICAgICAvL1tSZXF1aXJlZF0gQ2xhc3MgdG8gY3JlYXRlIG5hdmlnYXRvciBpbnN0YW5jZVxyXG5cdCAgICAgICAgICAgICAgICAgICAgICRDaGFuY2VUb1Nob3c6IDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vW1JlcXVpcmVkXSAwIE5ldmVyLCAxIE1vdXNlIE92ZXIsIDIgQWx3YXlzXHJcblx0ICAgICAgICAgICAgICAgICAgICAgJEFjdGlvbk1vZGU6IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIDAgTm9uZSwgMSBhY3QgYnkgY2xpY2ssIDIgYWN0IGJ5IG1vdXNlIGhvdmVyLCAzIGJvdGgsIGRlZmF1bHQgdmFsdWUgaXMgMVxyXG5cdCAgICAgICAgICAgICAgICAgICAgICRBdXRvQ2VudGVyOiAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vW09wdGlvbmFsXSBBdXRvIGNlbnRlciBuYXZpZ2F0b3IgaW4gcGFyZW50IGNvbnRhaW5lciwgMCBOb25lLCAxIEhvcml6b250YWwsIDIgVmVydGljYWwsIDMgQm90aCwgZGVmYXVsdCB2YWx1ZSBpcyAwXHJcblx0ICAgICAgICAgICAgICAgICAgICAgJFN0ZXBzOiAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIFN0ZXBzIHRvIGdvIGZvciBlYWNoIG5hdmlnYXRpb24gcmVxdWVzdCwgZGVmYXVsdCB2YWx1ZSBpcyAxXHJcblx0ICAgICAgICAgICAgICAgICAgICAgJExhbmVzOiAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIFNwZWNpZnkgbGFuZXMgdG8gYXJyYW5nZSBpdGVtcywgZGVmYXVsdCB2YWx1ZSBpcyAxXHJcblx0ICAgICAgICAgICAgICAgICAgICAgJFNwYWNpbmdYOiAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vW09wdGlvbmFsXSBIb3Jpem9udGFsIHNwYWNlIGJldHdlZW4gZWFjaCBpdGVtIGluIHBpeGVsLCBkZWZhdWx0IHZhbHVlIGlzIDBcclxuXHQgICAgICAgICAgICAgICAgICAgICAkU3BhY2luZ1k6IDEwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9bT3B0aW9uYWxdIFZlcnRpY2FsIHNwYWNlIGJldHdlZW4gZWFjaCBpdGVtIGluIHBpeGVsLCBkZWZhdWx0IHZhbHVlIGlzIDBcclxuXHQgICAgICAgICAgICAgICAgICAgICAkT3JpZW50YXRpb246IDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tPcHRpb25hbF0gVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBuYXZpZ2F0b3IsIDEgaG9yaXpvbnRhbCwgMiB2ZXJ0aWNhbCwgZGVmYXVsdCB2YWx1ZSBpcyAxXHJcblx0ICAgICAgICAgICAgICAgICB9LCovXHJcblx0ICAgICAgICAgICAgICAgICAkU2xpZGVzaG93T3B0aW9uczoge1xyXG5cdCAgICAgICAgICAgICAgICAgICAgICRDbGFzczogJEpzc29yU2xpZGVzaG93UnVubmVyJCxcclxuXHQgICAgICAgICAgICAgICAgICAgICAkVHJhbnNpdGlvbnNPcmRlcjogMSxcclxuXHQgICAgICAgICAgICAgICAgICAgICAkU2hvd0xpbms6IHRydWVcclxuXHQgICAgICAgICAgICAgICAgIH1cclxuXHQgICAgICAgICAgICAgfTtcclxuXHQgICAgICAgICAgICAgJHNjb3BlLmltYWdlU2xpZGVyID0gbmV3ICRKc3NvclNsaWRlciQoYXR0ci5pZCwgb3B0aW9ucyk7XHJcblx0ICAgICAgICAgICAgIC8vJHNjb3BlLnNjYWxlU2xpZGVyKCk7XHJcblx0ICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8kc2NvcGUuc3RhcnRTbGlkZXIoKTtcclxuICAgICAgICAgICAgLy8kc2NvcGUuaW1hZ2VTbGlkZXIuJEdvVG8oMik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBkYXRhOiAnPWRhdGEnIFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbn0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnTGV0c2hhcmUnKS5kaXJlY3RpdmUoJ2VsZW1lbnRyZWFkeScsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIFx0ZWxlbWVudC5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmKGF0dHJzLmVsZW1lbnRyZWFkeSE9PScnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGF0dHJzLmVsZW1lbnRyZWFkeSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG59KTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ0xldHNoYXJlJykuZGlyZWN0aXZlKCdmaWx0ZXJCb3gnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBRUMnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvZmlsdGVyLWJveC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgbG9jYXRpb25zQVBJU2VydmljZSwgY2F0ZWdvcnlBUElTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWFyY2hUaXRsZSA9ICcnO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0aW9uID0ge307XHJcbiAgICAgICAgICAgICRzY29wZS5xdWVyeVBhcmFtcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdxdWVyeVBhcmFtcycpKTtcclxuICAgICAgICAgICAgJHNjb3BlLm9uQ2l0eVNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkQ2l0eSA9ICRzY29wZS5zZWxlY3Rpb24uY2l0eS5vcmlnaW5hbE9iamVjdDtcclxuICAgICAgICAgICAgICAgIC8vJCgnLmFyZWEtc2VsZWN0aW9uLWJveCcpLnJlbW92ZUNsYXNzKCdpbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdzZWxlY3RlZENpdHknLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICAgICAgICAgLy9pZiAobmV3VmFsICE9PSBvbGRWYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYXJlYS1zZWxlY3Rpb24tYm94JykucmVtb3ZlQ2xhc3MoJ2luJyk7XHJcbiAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0Q2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlBUElTZXJ2aWNlLmdldEFsbENhdGVnb3JpZXMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXNMaXN0ID0gcmVzcG9uc2UuZGF0YS5jYXRlZ29yaWVzO1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IFdoaWxlIGxvYWRpbmcgY2F0ZWdvcmllcycpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RQb3B1bGFyQ2l0eSA9IGZ1bmN0aW9uKGNpdHkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZENpdHkgPSBjaXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5nZXRQb3N0cyA9IGZ1bmN0aW9uKGNpdHksIGNhdGVnb3J5LCBzZWFyY2hUaXRsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5UGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNpdHk6IGNpdHksIFxyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFRpdGxlOiBzZWFyY2hUaXRsZSwgXHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdxdWVyeVBhcmFtcycsIEpTT04uc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKSk7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3Bvc3RzJywgcXVlcnlQYXJhbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvY2F0aW9uc0FQSVNlcnZpY2UuZ2V0QWxsQ2l0aWVzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAkc2NvcGUuY2l0aWVzID0gcmVzcG9uc2UuZGF0YS5jaXRpZXM7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAvLyRzY29wZS5zZWxlY3RlZENpdHkgPSAkc2NvcGUuY2l0aWVzWzBdO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IFdoaWxlIGxvYWRpbmcgY2l0aWVzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaEdyb3VwKFsnY2l0aWVzJywgJ2NhdGVnb3JpZXNMaXN0J10sIGZ1bmN0aW9uKG5ld1ZhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbFswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkQ2l0eSA9ICRzY29wZS5jaXRpZXNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5xdWVyeVBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRDaXR5ID0gJHNjb3BlLnF1ZXJ5UGFyYW1zLmNpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hUaXRsZSA9ICRzY29wZS5xdWVyeVBhcmFtcy5zZWFyY2hUaXRsZTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgYXR0cikge1xyXG4gICAgICAgICAgICAkKFwiLm1haW4taW1hZ2VcIikuZmFkZU91dCgyKS5mYWRlSW4oNzAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxufSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
