
angular.module('SimpleRESTIonic', ['ionic','ionic.service.core', 'backand' ,'SimpleRESTIonic.controllers', 'starter.payPalService', 'SimpleRESTIonic.services' , 'angular-cache','ngCordova','ionic.service.core','ionic.service.analytics','ngCordova.plugins.file', 'jrCrop'])


.run(function ($ionicPlatform,CacheFactory,$ionicAnalytics,Backand,$state,localNotificationService, profileInfoService,$rootScope, $ionicHistory, $interval, cacheService) {

    $ionicPlatform.ready(function () {

      cordova.plugins.backgroundMode.setDefaults({ title: 'EASE Technology Solutions',text:'Running in background'});
      cordova.plugins.backgroundMode.configure({
          silent: true
      });
      cordova.plugins.backgroundMode.enable();
      Backand.on('chat_updated', function (data) {
        //Get the 'items' object that have changed
          if(data !== undefined){
            if(data[4].Value===cacheService.getChatCache() && parseInt(data[1].Value) === 1){
              localNotificationService.scheduleSingleNotification(data[0].Value);
            }
          }

      });
     profileInfoService.updateStatus($rootScope.cachedprofile.ease_userid,$rootScope.cachedprofile.status)
     .then(function(){
       console.log('status updated');
     },function(){
       console.log('status update failed');
     });


      $interval(function () {
        profileInfoService.updateStatus($rootScope.cachedprofile.ease_userid,$rootScope.cachedprofile.status)
        .then(function(){
          console.log('status updated');
        },function(){
          console.log('status update failed');
        });
      }, 10000);
      $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
        console.log('notification clicked!');
        $ionicHistory.nextViewOptions({
          disableBack: false
        });

        $state.go('dashboard.chat');
      });
      // Called when background mode has been activated

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
    $ionicAnalytics.register();
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(false);

    }
    if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();

                if (cordova.platformId == 'android') {
                    StatusBar.backgroundColorByHexString("#EF473A");
                }
            }

        });
})
.config( [
'$compileProvider',
function( $compileProvider )
{
$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);
}
])
.config(['$ionicConfigProvider', function($ionicConfigProvider) {

    $ionicConfigProvider.tabs.position('bottom'); // other values: top

}])

.config(function (BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

  BackandProvider.setAppName('easetechnologysolutionsapp');
  BackandProvider.setSignUpToken('bffe4f31-4066-4c49-9008-f967d436e3ce');
  BackandProvider.setAnonymousToken('ec74fd01-4e6c-4444-bec6-9627ea4b17db');
  BackandProvider.runSocket(true); //enable the web sockets that makes the database realtime


  $stateProvider
            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tabs',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tab.signup', {
                url: '/signup',
                views: {
                    'tab-signup': {
                        templateUrl: 'templates/tab-signup.html',
                        controller: 'SignupCtrl as signupc'
                    }
                }
            })
            .state('tab.login', {
                url: '/login',
                views: {
                    'tab-login': {
                        templateUrl: 'templates/tab-login.html',
                        controller: 'LoginCtrl as login'
                    }
                }
            })
            .state('tab.forgot-password', {
                url: '/forgot-password',
                views: {
                    'tab-login': {
                        templateUrl: 'templates/tab-forgotpassword.html',
                        controller : 'changePasswordCtrl'
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                abstract: true,
                templateUrl: 'templates/dashboard.html'
            })

            .state('dashboardtask', {
                url: '/dashboardtask',
                templateUrl: 'templates/dashboardtask.html'
            })


            .state('dashboardtask.tasks', {
                url: '/tasks',
                views: {
                    'task-tab': {
                        templateUrl: 'templates/tasks.html',
                        controller: 'getTaskCtrl as gtask'
                    }
                }
            })

            .state('dashboardtask.addnewtask', {
                url: '/addnewtask/:taskinfo',
                views: {
                    'task-tab':{

                        templateUrl: 'templates/task-add.html',
                        controller: 'addTaskCtrl as ntask'
                    }}
                })
                .state('dashboardtask.updatetask', {
                    url: '/updatetask/',
                    views: {
                        'task-tab':{

                            templateUrl: 'templates/task-edit.html',
                            controller: 'addTaskCtrl as ntask'
                        }}
                    })
            .state('dashboardtask.viewtaskinfo', {
                url: '/viewtaskinfo/:taskindex',
                views: {
                    'task-tab':{
                        templateUrl: 'templates/task-info.html',
                        controller: 'viewTaskCtrl as vtask'
                    }}
                })
             .state('dashboardtask.search', {
                url: '/search',
                views: {
                    'task-tab':{
                        templateUrl: 'templates/dashboardtask.html.html'

                    }}
                })
            .state('dashboard.billing', {
                url: '/billing',
                views: {
                    'dash-billing': {
                        templateUrl: 'templates/billing.html',
                        controller: 'billingCtrl as billingCtrl'
                    }
                }
            })
            .state('dashboard.invoiceinfo', {
                url: '/billing',
                views: {
                    'dash-billing': {
                        templateUrl: 'templates/billing-info.html',
                        controller: 'billingCtrl as billingCtrl'
                    }
                }
            })
            .state('dashboard.others', {
                url: '/others',
                views: {
                    'dash-others': {
                        templateUrl: 'templates/others.html',
                        controller: 'billingCtrl as billingCtrl'
                    }
                }
            })
            .state('dashboard.chat', {
                url: '/chat',
                views: {
                    'dash-others': {
                        templateUrl: 'templates/chat.html',
                        controller: 'chatCtrl as chatCtrl'
                    }
                }
            })
            .state('dashboard.settings', {
                url: '/settings',
                views: {
                    'dash-settings': {
                        templateUrl: 'templates/settings.html',
                        controller: 'SettingsCtrl as settingsc'
                    }
                }
            });
            $urlRouterProvider.otherwise('/tabs/login');
        })
        // .config(function($cordovaInAppBrowserProvider) {
        //
        //   var defaultOptions = {
        //     location: 'no',
        //     clearcache: 'no',
        //     toolbar: 'no'
        //   };
        //
        //   document.addEventListener(function () {
        //
        //     $cordovaInAppBrowserProvider.setDefaultOptions(options);
        //
        //   }, false);
        // })


        .constant("shopSettings",{

payPalSandboxId :"AZ1z-WdfBnUDFPoGUq6x72KeaPoCoNxNYwQa_gwyw6QlTrucAg8hxTI2xPIE9ckhmDQC5PV79yyQfBKa",

payPalProductionId : "AZ1z-WdfBnUDFPoGUq6x72KeaPoCoNxNYwQa_gwyw6QlTrucAg8hxTI2xPIE9ckhmDQC5PV79yyQfBKa",

payPalEnv: "PayPalEnvironmentSandbox", // for testing production for production

payPalShopName : "EASE Technology Solutions",

payPalMerchantPrivacyPolicyURL : "",

payPalMerchantUserAgreementURL : ""

});
