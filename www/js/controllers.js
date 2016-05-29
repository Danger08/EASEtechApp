angular.module('SimpleRESTIonic.controllers', ['ionic'])
  .controller('LoginCtrl', function (Backand, $state, $scope, $rootScope, tabsService, LoginService, $ionicLoading, $ionicPopup, $timeout, CacheFactory, $interval, cacheService) {
        var login = this;
    var profileCache = cacheService.setProfileCache();
    function ErrorLogin(text) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: '',
        template: text,
        okType: 'button-assertive'
      });
    }
    if (tabsService.hideTabs($state.current.name) === true) {
      $rootScope.hideTabs = 'tabs-item-hide';
    }

    function signin() {
      $ionicLoading.show({template : '<ion-spinner icon="ios"></ion-spinner><div><h4 >Signing you in..<h4></div>'});

      if (login.username === "" || login.password === "" || login.username === undefined || login.password === undefined) {
        setTimeout(function () {$ionicLoading.hide();
          ErrorLogin("Username and Password is Required");
          }, 1500);
    }
    else{
      LoginService.signin(login.username, login.password)
      .then(function (result) {

        login.userinfo = angular.fromJson(result.data[0]);

        if(login.userinfo === undefined){
          setTimeout(function() {$ionicLoading.hide();
            ErrorLogin("Incorrect username or password.");}, 1500);

          }else{
            onLogin(login.userinfo);
          }

        }, function (error) {

          setTimeout(function() {$ionicLoading.hide();
            ErrorLogin("Error logging in please check your internet connection.");}, 1);

          });
        }

      }

      function onLogin(userinfo){
        if (!CacheFactory.get('profileCache')) {
          profileCache = cacheService.setProfileCache();
        }
        cacheService.updateProfileCache(userinfo);

        $rootScope.cachedprofile = cacheService.getProfileCache();

        $ionicLoading.hide();
        $state.go('dashboardtask.tasks');
      }



      function checkCache() {
        console.log('profile :');
        console.log(profileCache.get('/profile'));
        if(profileCache.get('/profile') !== undefined) {
          $rootScope.cachedprofile = profileCache.get('/profile');
          $state.go('dashboardtask.tasks');
          }
    }


    $rootScope.logOut = function() {
        console.log('logging out.');
        $rootScope.cachedprofile = undefined;
        profileCache.destroy();
        login.username = "";
        login.password = "";
      };

      login.signin = signin;

      checkCache();
    })

    .controller('SignupCtrl', function (Backand,$scope,$state, $rootScope, SignupService,$ionicLoading,$ionicPopup,tabsService) {
      if(tabsService.hideTabs($state.current.name) === true){
        $rootScope.hideTabs = 'tabs-item-hide';
      }
      var signupc = this;
      var globalusernamestatus;
      var globalemailstatus;
      var globalStatusError = ["","",""];

      function requiredCheck(signupForm){
        console.log("Checking..");
        if( signupForm.fname.$error.required===true || signupForm.lname.$error.required===true || signupForm.uname.$error.required===true || signupForm.pword.$error.required===true || signupForm.pword.$error.required===true || signupForm.email.$error.required===true
        ){
          showSuccess("<center>All fields are required</center>","button-assertive","Warning");
        }else{
          usernameCheck();
        }
      }

      function usernameCheck(){
        $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please Wait..</h4></div>' });
        console.log('checking username');
        SignupService.signupInfoCheck(signupc.username)
        .then(function(response){

          signupc.usernamestatus = angular.fromJson(response.data[0]);

          globalusernamestatus = signupc.usernamestatus.numberfound;

          console.log(globalusernamestatus);
          if(globalusernamestatus == 1){
            globalStatusError[0]="Username Already Exist<br>";
            emailCheck();
          }else {
            emailCheck();
            globalStatusError[0]="";
          }
        });}

        function emailCheck(){
          console.log('checking email');
          SignupService.signupInfoCheck(signupc.email)
          .then(function(response){

            signupc.usernamestatus = angular.fromJson(response.data[0]);

            globalemailstatus = signupc.usernamestatus.numberfound;

            console.log(signupc.email.indexOf('@'));
            if(signupc.email.indexOf('@') == -1){
              globalStatusError[3] = "Invalid Email<br>";
              passwordCheck();
              console.log("invalid email");
            }
            else{

              globalStatusError[3] = "";
              if(globalemailstatus == 1){
                globalStatusError[1]="Email Already Exist<br>";
                passwordCheck();
              }
              else {
                globalStatusError[1]="";
                passwordCheck();
              }
            }
          });}

          function passwordCheck(){
            console.log('checking password');
            if(signupc.password != signupc.cpassword){
              globalStatusError[2] = "Passwords does not match.";
            }else {
              globalStatusError[2]="";
            }

            if(globalStatusError[0]==="" && globalStatusError[1]==="" && globalStatusError[2]==="" && globalStatusError[3]===""){
              console.log('signing you up.');
              signup();
            }else {
              $ionicLoading.hide();
              showSuccess(globalStatusError[0] + globalStatusError[1] + globalStatusError[2] + globalStatusError[3],'button-assertive','Registration Failed');
            }
          }

          function signup(){

            SignupService.signup(signupc.firstname,signupc.lastname,signupc.username,signupc.password,signupc.email)
            .then(function () {

              onSignupSuccess();
            }, function (error) {
              showSuccess("Error occureed" + error,"button-assertive","Warning");
            });
          }

          function onSignupSuccess(){

            setTimeout(function() {$ionicLoading.hide();
              showSuccess("Registration Complete","button-positive",'');}, 3000);

              $state.go('tab.login');
            }

            function showSuccess(text,type,title){
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: title,
                template: text,
                okType: type
              });
            }


            $scope.requiredCheck = requiredCheck;
            signupc.usernameCheck = usernameCheck;
            signupc.signup = signup;
            signupc.onSignupSuccess = onSignupSuccess;
          })



          .controller('addTaskCtrl', function (Backand, $state, $scope, $ionicHistory,$rootScope, addTaskService, getTaskService,$ionicLoading,$ionicPopup,tabsService) {
            if(tabsService.hideTabs($state.current.name) === true){
              $rootScope.hideTabs = 'tabs-item-hide';
            }
            if($rootScope.cachedprofile ===undefined){
              $rootScope.cachedprofile = cacheService.getProfileCache();
            }
            var ntask = this;
            var getUserInfo = $rootScope.cachedprofile;

            $scope.makeDate = function(date){
              return new Date(date);
            };
            function addTask(){
              // $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please Wait..</h4></div>' });
              console.log("addTask Clicked");
              var ntaskErr = 0;
              if(ntask.taskname === undefined || ntask.taskname ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(ntask.desc === undefined || ntask.desc ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(ntask.startdate === undefined || ntask.startdate ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(ntask.duedate === undefined || ntask.duedate ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(ntask.projectname === undefined || ntask.projectname ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(ntask.category === undefined || ntask.category ===''){

              }
              else if(ntask.priority === undefined || ntask.priority ===''){
                ntaskErr = ntaskErr + 1;
              }
              else if(getUserInfo.ease_userid === undefined || getUserInfo.ease_userid ===''){
                ntaskErr = ntaskErr + 1;
              }

              $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please Wait..</h4></div>' });

              if(ntaskErr > 0){
                console.log('Error in task');
                setTimeout(function() {$ionicLoading.hide();
                  showSuccess("<center>All fields are required</center>","button-assertive","Warning");}, 3000);

                }
                else if(ntaskErr<1){
                  console.log('Adding task..');
                  addTaskService.addTask(ntask.taskname,ntask.desc,ntask.startdate,ntask.duedate,ntask.projectname,ntask.category,ntask.priority,getUserInfo.ease_userid)
                  .then(function(response){
                    ntask.addtaskstatus = response;
                    setTimeout(function() {$ionicLoading.hide();
                      showSuccess("Task Registration Complete","button-positive",'');}, 3000);
                      console.log(ntask.addtaskstatus);

                      $state.go('dashboardtask.tasks');
                      $rootScope.getTask();
                    },function(error){
                      console.log(angular.toJson(error));
                    });
                  }


                }

                function showSuccess(text,type,title){
                  $ionicLoading.hide();
                  $ionicPopup.alert({
                    title: title,
                    template: text,
                    okType: type
                  });
                }
                $scope.edittask = {};
                $scope.edittask.addTask = function(a,b){
                  console.log(angular.toJson(a));
                  $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div>Updating data please wait..</div>'});
                  getTaskService.updatetask(
                    b,
                    a.taskname,
                    a.desc,
                    a.startdate,
                    a.duedate,
                    a.projectname,
                    a.category,
                    a.priority
                  ).then(function(sucess){
                    console.log('update complete');
                    $ionicLoading.hide();
                    showSuccess('Update Complete!' , 'button-positive' , '');
                    $ionicHistory.goBack();
                  },function(error){
                    console.log(error);
                  });

                };
                ntask.addTask = addTask;

              })

              .controller('getTaskCtrl', function (Backand, cacheService, $state,$scope,$rootScope,tabsService ,getTaskService,$ionicLoading,$ionicPopup,$timeout, $ionicModal,$interval) {
                $rootScope.getTask = getTask;
                if(tabsService.hideTabs($state.current.name) === true){
                  $rootScope.hideTabs = 'tabs-item-hide';
                }
                if($rootScope.cachedprofile ===undefined){
                  $rootScope.cachedprofile = cacheService.getProfileCache();
                }

                $scope.getSingleData = function (item){
                  $rootScope.singletaskinfo = item;
                  $state.go('dashboardtask.viewtaskinfo');
                };
                $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Loading your data please wait..</h4></div>'});
                $rootScope.trashStatus = 0;
                $rootScope.filterStatus = undefined;
                function setFilter(status){
                  $rootScope.trashStatus = 0;
                  console.log(status);
                  $rootScope.filterStatus =status;
                }
                function trashFilter(){
                  $rootScope.trashStatus = 1;
                  $rootScope.filterStatus =undefined;
                  console.log("1");
                }
                $scope.trashFilter = trashFilter;
                $scope.setFilter = setFilter;

                function getTask(){

                  var cachedProfile = $rootScope.cachedprofile;

                  if(cachedProfile === undefined){

                  }
                  else
                  {

                    getTaskService.getTask(cachedProfile.ease_userid)
                    .then(function(response){
                      $ionicLoading.hide();
                      $rootScope.tasksdata = response.data;
                      if(angular.isFunction($rootScope.updateSingleData)){
                        $rootScope.updateSingleData();
                      }



                      //  console.log($rootScope.tasksdata);

                    },function(){
                      //console.log('Error in getting task');
                    });
                  }
                }
                getTask();
                Backand.on('task_update', function (data) {
                  //Get the 'items' object that have changed

                  getTask();

                });

                //  if($rootScope.getTaskInterval === undefined){
                //   $rootScope.getTaskInterval = $interval(function(){
                //       getTask();
                //   }, 5000,0);
                //  }

                function search(){
                  //  console.log('clicked search');
                }

                $ionicModal.fromTemplateUrl('my-modal.html', {
                  scope: $scope,
                  animation: 'slide-in-up'
                }).then(function(modal) {
                  $scope.modal = modal;
                });
                $scope.openModal = function() {
                  $scope.modal.show();
                };
                $scope.closeModal = function() {
                  $scope.modal.hide();
                };
                //Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                  $scope.modal.remove();
                });
                // Execute action on hide modal
                $scope.$on('modal.hidden', function() {
                  // Execute action
                });
                // Execute action on remove modal
                $scope.$on('modal.removed', function() {
                  // Execute action
                });

                $scope.search = search;

              })


              .controller('viewTaskCtrl', function (Backand, $state, $rootScope, $ionicHistory,tabsService,getTaskService,$ionicLoading,$ionicPopup,$timeout,$interval,CacheFactory,$stateParams,$ionicPopover,$scope,addTaskService) {
                if(tabsService.hideTabs($state.current.name) === true){
                  $rootScope.hideTabs = 'tabs-item-hide';
                }



                //Get the 'items' object that have changed
                $rootScope.updateSingleData = function(){

                  console.log('updateSingleData');
                  var newdata = $rootScope.tasksdata;
                  var currentdata = $rootScope.singletaskinfo;
                  angular.forEach(newdata,function(value,key){
                    if(currentdata.task_id === value.task_id){
                      console.log('match');
                      $rootScope.singletaskinfo = value;
                    }
                  });
                };


                function parseDate(string){

                  var parsedString = string.split("T");
                  return parsedString[0];
                }
                $scope.putToTrash = putToTrash;
                function putToTrash(taskid){

                  console.log(taskid);
                  $ionicLoading.show("");
                  getTaskService.changeDeletedValue(taskid,1)
                  .then(function(){
                    $timeout(function () {
                      $ionicLoading.hide();

                      if($rootScope.singletaskinfo.task_deleted===0){
                        $rootScope.singletaskinfo.task_deleted=1;
                      }
                      $scope.closePopover();
                    }, 1000);
                    $state.go('dashboardtask.tasks');
                    console.log("Success");
                  },function(){

                  });
                }
                $scope.restoreFromTrash = restoreFromTrash;
                function restoreFromTrash(taskid){
                  console.log(taskid);
                  $ionicLoading.show("");
                  getTaskService.changeDeletedValue(taskid,0)
                  .then(function(){
                    $timeout(function () {
                      $ionicLoading.hide();

                      if($rootScope.singletaskinfo.task_deleted===1){
                        $rootScope.singletaskinfo.task_deleted=0;
                      }
                      $scope.closePopover();
                    }, 1000);
                    $state.go('dashboardtask.tasks');
                    console.log("Success");
                  },function(){

                  });
                }
                function deleteTaskPermanent(taskid){
                  addTaskService.removeTask(taskid)
                  .then(function(){
                    console.log("Deleted Permanently");

                    $rootScope.getTask();
                    $ionicLoading.hide();
                  },function(error){
                    console.log(error);
                  });
                }
                $scope.deletePermanent = deletePermanent;
                function deletePermanent(taskid){
                  var showDeletePopup = function() {
                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Delete task permanently',
                      template: 'This action cant be restored?',
                      okType: 'button-assertive'
                    });


                    confirmPopup.then(function(res) {
                      if(res) {
                        $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div>Loading your data please wait..</div>'});
                        console.log('You are sure');
                        $state.go('dashboardtask.tasks');
                        deleteTaskPermanent(taskid);


                      } else {
                        console.log('You are not sure');
                      }
                    });
                  };
                  showDeletePopup();
                }
                $scope.restoreTask = restoreTask;
                function restoreTask(taskid){
                  var showDeletePopup = function() {
                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Restore',
                      template: 'This action will restore this task?',
                      okType: 'button-positive'
                    });


                    confirmPopup.then(function(res) {
                      if(res) {
                        $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div>Loading your data please wait..</div>'});
                        console.log('You are sure');
                        restoreFromTrash(taskid);
                      } else {
                        console.log('You are not sure');
                      }
                    });
                  };
                  showDeletePopup();
                }
                $scope.deleteTask = deleteTask;
                function deleteTask(taskid){
                  var showDeletePopup = function() {
                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Delete',
                      template: 'Are you sure you want to delete this task?',
                      okType: 'button-assertive'
                    });

                    confirmPopup.then(function(res) {
                      if(res) {
                        $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Loading your data please wait..</h4></div>'});
                        console.log('You are sure');
                        putToTrash(taskid);
                      } else {
                        console.log('You are not sure');
                      }
                    });
                  };
                  showDeletePopup();
                }

                // .fromTemplateUrl() method
                $ionicPopover.fromTemplateUrl('my-popover.html', {
                  scope: $scope
                }).then(function(popover) {
                  $scope.popover = popover;
                });


                $scope.openPopover = function($event) {
                  $scope.popover.show($event);
                };
                $scope.closePopover = function() {
                  $scope.popover.hide();
                };
                //Cleanup the popover when we're done with it!
                $scope.$on('$destroy', function() {
                  $scope.popover.remove();
                });




                $scope.deleteTask = deleteTask;
                $rootScope.parseDate = parseDate;
              })

              .controller('otherCtrl' , function($scope , $rootScope , tabsService ,$state){
                var otherCtrl = $scope;
                console.log($state.current.name);
                if(tabsService.hideTabs($state.current.name) === true){
                  $rootScope.hideTabs = 'tabs-item-hide';
                }else {
                  $rootScope.hideTabs = '';
                }
              })



              .controller('chatCtrl', function($scope, Backand, $ionicPopup, cacheService, $cordovaClipboard, $interval,$timeout, $ionicScrollDelegate,tabsService ,$state , $rootScope, chatService,$ionicLoading ,localNotificationService) {
                if(tabsService.hideTabs($state.current.name) === true){
                  $rootScope.hideTabs = 'tabs-item-hide';
                }
                if($rootScope.cachedprofile ===undefined){
                  $rootScope.cachedprofile = cacheService.getProfileCache();
                }
                $rootScope.$on("$stateChangeStart", function(args){
                  $rootScope.hideTabs = '';
                });
                $scope.copytoClipboard = function(){
                  console.log('Copy to clipboard');
                  $cordovaClipboard
                  .copy($scope.selectedBubbleData.reply)
                  .then(function () {
                    // success
                  }, function () {
                    // error
                  });
                  $scope.alertPopup.close();
                };
                $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Loading your data please wait..</h4></div>'});
                var alternate,
                isIOS, isAndroid = ionic.Platform.isWebView() && ionic.Platform.isIOS() && ionic.Platform.isAndroid();

                $scope.sendMessage = function() {

                  var d = new Date();
                  d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
                  $scope.messages.push({
                    userid: $scope.myId,
                    reply: $scope.data.message,
                    time: d
                  });

                  $ionicScrollDelegate.scrollBottom(true);
                  chatService.addReply($scope.data.message,$scope.myId,'192.168.254.254',d,$rootScope.conv_id);
                  delete $scope.data.message;
                };


                $scope.inputUp = function() {
                  $scope.data.keyboardHeight = 216;
                  $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(true);
                  }, 100);

                };

                $scope.inputDown = function() {
                  if (isIOS)$scope.data.keyboardHeight = 0;
                  $ionicScrollDelegate.resize();
                };

                $scope.closeKeyboard = function() {
                  // cordova.plugins.Keyboard.close();
                };


                $scope.data = {};
                $scope.myId = $rootScope.cachedprofile.ease_userid;
                $scope.messages = [];
                $scope.myData = "";
                $scope.userid ={};
                loadConversation();
                function loadConversation (){
                  chatService.getConversations( $rootScope.cachedprofile.ease_userid);

                  var a = $interval(function () {
                    checkConvID($rootScope.conv_id);
                  }, 100);
                  function checkConvID (conv_id){
                    if(angular.isDefined(conv_id)){
                      console.log(conv_id);
                      loadMessages(conv_id);
                      $interval.cancel(a);
                    }
                  }
                }
                function loadMessages (conv_id){
                  chatService.loadMessages(conv_id)
                  .then(function(response){
                    console.log('messages');
                    console.log(angular.toJson(response.data.data));
                    $scope.messages = response.data.data;

                    $ionicLoading.hide();
                    $timeout(function () {
                      $ionicScrollDelegate.scrollBottom(true);
                    }, 500);

                  },function(){

                  });
                }
                Backand.on('chat_updated', function (data) {
                  //Get the 'items' object that have changed
                  loadMessages($rootScope.conv_id);
                  console.log("Changes Detected" + data);
                });
                Backand.on('chat_deleted', function (data) {
                  //Get the 'items' object that have changed
                  loadMessages($rootScope.conv_id);
                  console.log("chat_deleted" + angular.toJson(data));
                });
                $scope.showConfirm = function() {
                  var confirmPopup = $ionicPopup.confirm({
                    title: 'Warning',
                    template: '<center><p style="padding:3%;">Are you sure you want to delete this message?</p></center>'
                  });

                  confirmPopup.then(function(res) {
                    if(res) {

                      $scope.alertPopup.close();
                      $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Deleting Message...</h4></div>'});
                      chatService.deleteMessage($scope.selectedBubbleData)
                      .then(function(){
                        console.log('deleted');
                        $ionicLoading.hide();
                      },function(error){
                        console.log(angular.toJson(error));
                      });
                    } else {

                      console.log('You are not sure');
                    }
                  });
                };

                $scope.showAlert = function() {
                  $scope.alertPopup = $ionicPopup.alert({
                    templateUrl: 'my-popup.html',
                    scope: $scope,
                    okText: 'Cancel'
                  });

                  $scope.alertPopup.then(function(res) {
                    console.log('');
                  });
                };
                $scope.setPopOverData = function(data){
                  console.log(angular.toJson(data));
                  $scope.selectedBubbleData = data;
                  if($scope.selectedBubbleData.id!=1){
                    $scope.showAlert();
                  }

                };
              })
              .controller('SettingsCtrl', function (Backand, $state, $jrCrop, $timeout,cacheService, $ionicPlatform , $cordovaFile,$scope,$rootScope, getTaskService,$ionicLoading,$ionicPopup,$ionicModal,profileInfoService,tabsService) {

                if(tabsService.hideTabs($state.current.name) === true){
                  $rootScope.hideTabs = 'tabs-item-hide';
                }
                if($rootScope.cachedprofile ===undefined){
                  $rootScope.cachedprofile = cacheService.getProfileCache();
                  console.log(angular.toJson(cacheService.getProfileCache()));
                }
                $scope.changeStatus = function(status){
                  $rootScope.cachedprofile.status = status.value;
                  cacheService.updateProfileCache($rootScope.cachedprofile);
                  $scope.me.status = parseInt(status.value);
                  profileInfoService.updateStatus($rootScope.cachedprofile.ease_userid,parseInt(status.value));
                };
                $scope.profile = {};
                $scope.settings ={};
                $scope.statusoption = [{
                  value: 1,
                  name: 'Online'

                }, {
                  value: 2,
                  name: 'Away'

                }, {
                  value: 3,
                  name: 'Do not disturb'

                }, {
                  value: 4,
                  name: 'Invisible'

                }];
                $scope.me = $rootScope.cachedprofile;
                $scope.settings.status = $scope.me.status;
                $scope.loadAvatarProfile = function(){
                  $cordovaFile.checkFile(cordova.file.externalDataDirectory, $rootScope.cachedprofile.username +'.jpg')
                  .then(function(a){
                    console.log('sucess loadAvatarProfile');
                    $scope.profile.userProfilePic = a.toInternalURL() + '?' + Math.random();
                  },function(){
                    console.log('failed loadAvatarProfile');
                    $scope.profile.userProfilePic = './img/loadingavatar.gif';
                    $scope.saveFile('http://dgabriel.azurewebsites.net/app/uploads/avatars/' + $rootScope.cachedprofile.username + '.jpg',false);
                  });
                };

                if($rootScope.cachedprofile.avatar === 'default.jpg'){
                  $scope.profile.userProfilePic = './img/default.jpg' + '?' + Math.random();
                }else {


                  $ionicPlatform.ready(function(){
                    $scope.loadAvatarProfile();
                  });
                }

                var settingsc = this;

                function signOut(){

                  var showConfirmlogOut = function() {
                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Log out',
                      template: 'Are you sure you want to sign out?',
                      okType: 'button-assertive'
                    });

                    confirmPopup.then(function(res) {
                      if(res) {
                        $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Signing out..</h4></div>' });
                        console.log('You are sure');
                        setTimeout(function(){
                          $ionicLoading.hide();
                          cacheService.removeCache();
                          $state.go('tab.login');
                        }, 3000);

                      } else {
                        console.log('You are not sure');
                      }
                    });
                  };
                  showConfirmlogOut();

                }

                $scope.loadProfile = loadProfile;
                loadProfile();
                function loadProfile (){
                  $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please Wait..</h4></div>' });
                  profileInfoService.getProfile($rootScope.cachedprofile.ease_userid).then(function(response){
                    var data = response.data;
                    $ionicLoading.hide();
                    console.log(data.data[0]);
                    $scope.profileData = data.data[0];
                    $scope.profileData.birthdate = new Date($scope.profileData.birthdate);
                  },function(response){

                  });
                }
                //edit profile modal
                $ionicModal.fromTemplateUrl('my-modal.html', {
                  scope: $scope,
                  animation: 'slide-in-up'
                }).then(function(modal) {
                  $scope.modal = modal;
                });
                $scope.openModal = function() {
                  $scope.loadProfile();
                  $scope.modal.show();
                };
                $scope.closeModal = function() {
                  $scope.modal.hide();
                };
                //Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                  $scope.modal.remove();
                });
                // Edit profile modal end
                //change password modal
                $ionicModal.fromTemplateUrl('my-modal1.html', {
                  scope: $scope,
                  animation: 'slide-in-up'
                }).then(function(modal) {
                  $scope.changepassmodal = modal;
                });
                $scope.openModal1 = function() {
                  $scope.changepassmodal.show();
                };
                $scope.closeModal1 = function() {
                  $scope.changepassmodal.hide();
                };
                //Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                  $scope.changepassmodal.remove();
                });
                //end of change password modal
                $scope.parseDate = function (date){
                  date = new Date(date);
                  var monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                return date.getDate() +'-' +  monthNames[(date.getMonth())] + '-'+date.getFullYear();
              };
              function updateProfile (){
                $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Updating Profile Please Wait..</h4></div>' });
                console.log($scope.profileData.firstname + " " + $scope.profileData.lastname + " " + $scope.profileData.address + " " + $scope.profileData.email + " " + $scope.profileData.website + " " + $scope.profileData.mobile + " " + $scope.profileData.birthdate);
                profileInfoService.updateProfile($rootScope.cachedprofile.ease_userid,$scope.profileData.firstname,$scope.profileData.lastname,$scope.profileData.address,$scope.profileData.email,$scope.profileData.website,$scope.profileData.mobile,$scope.profileData.birthdate)
                .then(function(){
                  $ionicLoading.hide();
                  $scope.closeModal();
                  console.log('success');
                  loadProfile();
                },function(){
                  console.log('failed');
                });

              }

              document.addEventListener('deviceready', function () {
                $scope.getFile = function(){
                  fileChooser.open(function (uri) {
                    $scope.targetPath = window.FilePath.resolveNativePath(uri, function(filepath){
                      $jrCrop.crop({
                        url: filepath,
                        width: 350,
                        height: 350
                      }).then(function(canvas) {
                        // success!
                        $scope.saveFile(canvas.toDataURL(),true);
                        //$scope.profile.img = canvas.toDataURL();
                      }, function() {
                        // User canceled or couldn't load image.
                      });

                      console.log($scope.profile.FilePath);
                    }, function(error){
                      console.log(error);
                    });
                  });
                };

                $scope.uploadAvatar = function (fileURI) {
                  $scope.status = 'Uploading image...';
                  function win(r) {
                    $timeout(function () {
                      $scope.status = r.response;
                      $scope.loadAvatarProfile();
                    }, 500);

                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                  }

                  function fail(error) {
                    $scope.status = error.response;
                    alert("An error has occurred: Code = " + error.code);
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                  }

                  var uri = encodeURI("http://dgabriel.azurewebsites.net/app/upload-avatar.php");

                  var options = {
                    fileKey: "file",
                    fileName: $rootScope.cachedprofile.username + '.jpg',
                    chunkedMode: false,
                    mimeType: "image/jpg",
                    params : {'directory':'uploads/avatars', 'fileName':$rootScope.cachedprofile.username + '.jpg'}//$scope.FilePath.substr($scope.FilePath.lastIndexOf('/')+1)
                  };

                  profileInfoService.changeAvatar($rootScope.cachedprofile.ease_userid,$rootScope.cachedprofile.username + '.jpg').then();
                  $rootScope.cachedprofile.avatar = $rootScope.cachedprofile.username;
                  var headers={'headerParam':'headerValue'};

                  options.headers = headers;

                  var ft = new FileTransfer();

                  ft.onprogress = function(progressEvent) {

                    $timeout(function () {
                      $scope.download.progress = progressEvent.loaded / progressEvent.total;
                    }, 100);


                  };
                  ft.upload(fileURI, uri, win, fail, options);
                };


                $scope.download = {};
                $scope.saveFile = function (imagefileURI,uploadornot) {

                  var fileTransfer = new FileTransfer();


                  console.log(cordova.file.externalDataDirectory);
                  var targetPath = cordova.file.externalDataDirectory + $rootScope.cachedprofile.username +'.jpg';
                  var trustHosts = true;
                  var options = {};
                  var ft = new FileTransfer();


                  ft.onprogress = function(progressEvent) {
                    $timeout(function () {
                      $scope.download.progress = progressEvent.loaded / progressEvent.total;
                    }, 100);
                  };
                  ft.download(
                    encodeURI(imagefileURI),
                    targetPath,

                    function(entry) {

                      console.log("download complete: " + entry.toURL());

                      $ionicPlatform.ready(function(){
                        $cordovaFile.checkFile(cordova.file.externalDataDirectory, $rootScope.cachedprofile.username +'.jpg')
                        .then(function(a){
                          console.log(angular.toJson(a));



                            if(uploadornot === true){
                              $scope.status = 'Cropping image..';

                              $timeout(function () {
                                $scope.profile.userProfilePic = './img/loadingavatar.gif';
                              }, 1000);
                              console.log('uploading');
                              $scope.uploadAvatar(a.nativeURL);
                            }
                            else if (uploadornot === false) {
                              $scope.loadAvatarProfile();
                            }

                        },function(){
                          $timeout(function(){
                            $scope.profile.userProfilePic = './img/default.jpg';
                          },1000);

                        });
                      });

                    },
                    function(error) {
                      console.log(angular.toJson(error));
                      console.log("download error source " + error.source);
                      console.log("download error target " + error.target);
                      console.log("download error code" + error.code);
                    },
                    true,
                    {

                    }
                  );

                };            // Destination URL
              }, false);
              function showAlert(text,type,title){
                $ionicLoading.hide();
                $ionicPopup.alert({
                  title: title,
                  template: text,
                  okType: type
                });
              }
              $scope.changePassword = function(old,newp,cnewp){
                $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Changing you password...</h4></div>'});
                var errors = [];
                if(old === undefined || newp === undefined  ||  cnewp === undefined){
                  errors.push('<center> <strong>All fields are required </strong></center><br>');
                }else {
                  if(old.length < 8 || newp.length <8 || cnewp.length <8 ){

                    errors.push('<center> <strong>Password requires atleast 8 characters </strong></center><br>');

                  }
                  if(newp !== cnewp){

                    errors.push('<center> <strong>New Password and Confirm new password must match </strong></center><br>');
                  }
                }

                if(errors.length>0){
                  var a ='';
                  for(i = 0;i < errors.length;i++){
                    a = a + errors[i];
                  }
                  showAlert(a,'button-assertive',' ');
                }else {
                  profileInfoService.checkPassword($rootScope.cachedprofile.ease_userid,$rootScope.cachedprofile.username,old)
                  .then(
                    function(response){
                      console.log(angular.toJson(response.data));


                      if(response.data.length>0){
                        profileInfoService.changePassword($rootScope.cachedprofile.ease_userid,old,newp)
                        .then(
                          function(response){
                            $timeout(function () {
                              $ionicLoading.hide();
                              showAlert('Password has been changed','button-positive',' ');
                            }, 1000);


                          },
                          function(error){
                            $ionicLoading.hide();
                            showAlert(error,'button-assertive',' ');
                          }
                        );
                      }else if(response.data.length===0){
                        $ionicLoading.hide();
                        showAlert('Old Password is incorrect!','button-assertive',' ');
                      }
                    },function(error){
                      $ionicLoading.hide();
                      showAlert(error,'button-assertive',' ');
                    });
                  }
                };
                $scope.edit = {};
                $scope.updateProfile = updateProfile;
                settingsc.signOut = signOut;
              })

              .controller('billingCtrl', function ($scope, $cordovaInAppBrowser,$cordovaDevice,Backand, PaypalService, $ionicLoading,cacheService,tabsService, $state,$interval, $timeout, $rootScope, $ionicPlatform, $cordovaFile, invoiceService, $ionicPopover) {
                if($rootScope.cachedprofile ===undefined){
                  $rootScope.cachedprofile = cacheService.getProfileCache();

                }

                $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please Wait..</h4></div>' });
                Backand.on('invoice_update', function (data) {
                  getMyInvoiceList();
                  console.log('invoice_update detected');
                });
                getMyInvoiceList();
                function getMyInvoiceList (){
                  invoiceService.getMyInvoiceList($rootScope.cachedprofile.ease_userid)
                  .then(function(response){
                    console.log('invoicelist');
                    $scope.invoicelist = response.data.data;
                    $timeout(function () {
                      $ionicLoading.hide();
                    }, 1000);
                  },function(error){

                  });
                }

                $scope.payWithPaypal = function(data,ammount,name,invoiceid){
                  if(data.gateway==='Paypal'){
                    PaypalService.initPaymentUI().then(function () {
                      $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4>Please wait..</h4></div>' });
                      PaypalService.makePayment(parseFloat(ammount),'ETS - ' + name)
                      .then(function(response){
                        console.log("Sucess : " + angular.toJson(response));
                        invoiceService.updatePaypalinfo(invoiceid,response,$cordovaDevice.getModel())
                        .then(function(){
                          $state.go('dashboard.billing');
                          $ionicLoading.hide();
                        },function(){

                        });
                      },function(error){
                        console.log(angular.toJson(error));
                      });


                    });
                  }else if (data.gateway === 'Payoneer') {
                    $scope.PayWithPayoneer(data);
                  }

                };
                $scope.loadInvoiceData = function(data){

                  $rootScope.singleInvoicedata = data;
                  $timeout(function () {
                    $state.go('dashboard.invoiceinfo');
                  }, 100);
                };
                $scope.parseSelectedStatus = function(status){
                  if(status==='undefined'){
                    return undefined;
                  }else {
                    return parseInt(status);
                  }

                };
                $scope.assignInvoiceData = function(){
                  $scope.userdata = angular.fromJson($rootScope.singleInvoicedata.userdata);
                  $scope.invoiceitem = angular.fromJson($rootScope.singleInvoicedata.invoice_item);
                  $scope.payment_methodlist = angular.fromJson($rootScope.singleInvoicedata.payment_methodlist);
                  $scope.receiptData = angular.fromJson($rootScope.singleInvoicedata.receiptData);
                  $scope.deviceinfo = $rootScope.singleInvoicedata.deviceinfo;

                  console.log(angular.toJson($rootScope.singleInvoicedata));
                };
                $scope.computeTotal = function(object){
                  $scope.invoiceitemtotal = 0;
                  for(i=0;i<object.length;i++){
                    $scope.invoiceitemtotal  += parseInt(object[i].price);
                  }
                  console.log($scope.invoiceitemtotal);
                  return $scope.invoiceitemtotal;
                };
                $scope.convertPaymentList = function(data){
                  return angular.fromJson(data);
                };
                $scope.fixInvoiceNumber = function (a){
                  var b ="";
                  if(a!== undefined){
                    switch (a.toString().length) {
                      case 1:
                      b = "00000" + a.toString();
                      break;
                      case 2:
                      b = "0000" + a.toString();
                      break;
                      case 3:
                      b = "000" + a.toString();
                      break;
                      case 4:
                      b = "00" + a.toString();
                      break;
                      case 5:
                      b = "0" + a.toString();
                      break;
                      case 6:
                      b = a.toString();
                      break;

                    }
                    return b;
                  }

                };
                var template = '<ion-popover-view><ion-header-bar> <h1 class="title">More</h1> </ion-header-bar> <ion-content> <div class="list"><a class="item item-icon-left" href="" target="_blank"><i class="icon ion-document-text"></i>Download PDF</a></div></ion-content></ion-popover-view>';

                $scope.popover = $ionicPopover.fromTemplate(template, {
                  scope: $scope
                });

                // .fromTemplateUrl() method
                $ionicPopover.fromTemplateUrl('my-popover.html', {
                  scope: $scope
                }).then(function(popover) {
                  $scope.popover = popover;
                });


                $scope.openPopover = function($event) {
                  $scope.popover.show($event);
                };
                $scope.closePopover = function() {
                  $scope.popover.hide();
                };
                //Cleanup the popover when we're done with it!
                $scope.$on('$destroy', function() {
                  $scope.popover.remove();
                });
                // Execute action on hide popover
                $scope.$on('popover.hidden', function() {
                  // Execute action
                });
                // Execute action on remove popover
                $scope.$on('popover.removed', function() {
                  // Execute action
                });
                $ionicPlatform.ready(function () {
                  var options = {
                    location: 'yes',
                    clearcache: 'yes',
                    toolbar: 'no'
                  };
                  $scope.PayWithPayoneer = function (paymentmethodata) {
                    $cordovaInAppBrowser.open(paymentmethodata.link, '_blank', options)
                    .then(function(event) {
                      // success
                    })
                    .catch(function(event) {
                      // error
                    });
                  };

                });

                $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){

                });

                $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                  // insert CSS via code / file
                  $cordovaInAppBrowser.insertCSS({
                    code: 'body {background-color:grey;}'
                  });

                  // insert Javascript via code / file
                  $cordovaInAppBrowser.executeScript({
                    file: 'script.js'
                  });
                });

                $rootScope.$on('$cordovaInAppBrowser:loaderror', function(e, event){

                });

                $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){

                });
              })


              .controller('changePasswordCtrl',function($scope,$rootScope,$state,profileInfoService, cacheService,$ionicLoading,$ionicPopup){

              $scope.resetPassword = function (username){
                console.log(username);
                  profileInfoService.resetPassword(username)
                  .then(function(response){
                    console.log(response);
                  },function(error){
                    $ionicLoading.show({template:'<ion-spinner icon="ios"></ion-spinner><div><h4 >Checking username..<h4></div>' });
                    console.log('Checking username..');
                  profileInfoService.getIDforSend(username)
                  .then(function(response){
                    $ionicLoading.hide();
                    $ionicLoading.show('<ion-spinner icon="ios"></ion-spinner><div><h4 >Checking email..<h4></div>');
                    console.log('Getting id');
                    var id = response.data.data[0].ease_userid;

                      $scope.fpassworduseremail = censorEmail(response.data.data[0].email);
                      function censorEmail(email){

                      email.replace(/(?!^).(?=[^@]+@)/, '*');
                      return email;
                      }
                      profileInfoService.sendCode(id)
                      .then(function(response){
                          $ionicLoading.hide();
                        showSuccess('You will receive a verification code at this email ' + $scope.fpassworduseremail ,'button-positive', '' );
                        console.log('Email Sent : ' + angular.toJson(response));
                      },function(){

                      });
                  },function(error){

                  });
                  });
              };
              $scope.checkVerificationCode = function (username,code){
                console.log(username);
                console.log(code);
                  profileInfoService.checkVerificationCode(username,code)
                  .then(function(response){console.log(angular.toJson(response.data));},function(){});
              };
              function showSuccess(text,type,title){

                $ionicPopup.alert({
                  title: title,
                  template: text,
                  okType: type
                });
              }
              });
              // .controller('billingCtrl', function ($scope,cacheService, profileInfoService,tabsService, $state,$interval,$timeout,$rootScope,$ionicPlatform,$cordovaFile) {
              //
              //   if(tabsService.hideTabs($state.current.name) === true){
              //   $rootScope.hideTabs = 'tabs-item-hide';
              //   }
              //   if($rootScope.cachedprofile ===undefined){
              //       $rootScope.cachedprofile = cacheService.getProfileCache();
              //   }
              //   $scope.upload = {};
              //   $scope.download = {};
              //
              //
              //   function getFile(){
              //   fileChooser.open(function (uri) {
              //     $scope.targetPath = window.FilePath.resolveNativePath(uri, function(filepath){
              //       console.log(filepath);
              //     $scope.FilePath = filepath;
              //
              //     }, function(error){
              //       console.log(error);
              //     });
              //   });
              //   }
              //   document.addEventListener('deviceready', function () {
              //     $scope.testFileUpload = function () {
              //
              //       function win(r) {
              //           console.log("Code = " + r.responseCode);
              //           console.log("Response = " + r.response);
              //           console.log("Sent = " + r.bytesSent);
              //       }
              //
              //       function fail(error) {
              //           alert("An error has occurred: Code = " + error.code);
              //           console.log("upload error source " + error.source);
              //           console.log("upload error target " + error.target);
              //       }
              //
              //       var uri = encodeURI("http://dgabriel.azurewebsites.net/app/upload-avatar.php");
              //
              //       var options = {
              //           fileKey: "file",
              //           fileName: $rootScope.cachedprofile.username + '.' + $scope.FilePath.substr($scope.FilePath.lastIndexOf('/')+1).split('.').pop(),
              //           chunkedMode: false,
              //           mimeType: "image/jpg",
              //           params : {'directory':'uploads/avatars', 'fileName':$rootScope.cachedprofile.username + '.' + $scope.FilePath.substr($scope.FilePath.lastIndexOf('/')+1).split('.').pop()}//$scope.FilePath.substr($scope.FilePath.lastIndexOf('/')+1)
              //       };
              //       profileInfoService.changeAvatar($rootScope.cachedprofile.ease_userid,$rootScope.cachedprofile.username + '.' + $scope.FilePath.substr($scope.FilePath.lastIndexOf('/')+1).split('.').pop());
              //       var headers={'headerParam':'headerValue'};
              //
              //       options.headers = headers;
              //
              //       var ft = new FileTransfer();
              //
              //       ft.onprogress = function(progressEvent) {
              //         //console.log(angular.toJson(progressEvent));
              //       //  $scope.upload.progress = progressEvent.total;
              //         //console.log(angular.toJson(progressEvent));
              //         $timeout(function () {
              //           $scope.upload.progress = progressEvent.loaded / progressEvent.total;
              //         }, 100);
              //
              //       //  console.log((progressEvent.loaded / progressEvent.total)*100);
              //           // if (progressEvent.lengthComputable) {
              //           //   loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
              //           // } else {
              //           //   loadingStatus.increment();
              //           // }
              //       };
              //       ft.upload($scope.FilePath, uri, win, fail, options);
              //     };            // Destination URL
              //      }, false);
              //
              // // document.addEventListener('deviceready', function () {
              // //         }, false);
              //         $scope.profile = {};
              //         $ionicPlatform.ready(function(){
              //           $cordovaFile.checkFile(cordova.file.externalDataDirectory, 'try.jpg')
              //           .then(function(a){
              //             console.log(angular.toJson(a));
              //             $scope.profile.userProfilePic = a.toInternalURL();
              //           },function(){
              //
              //           });
              //           $scope.testFileDownload = function () {
              //                     var fileTransfer = new FileTransfer();
              //                     var url = 'http://dgabriel.azurewebsites.net/app/img/avatar/dgabriel.jpg';
              //
              //                     console.log(cordova.file.externalDataDirectory);
              //
              //
              //                    var targetPath = cordova.file.externalDataDirectory + 'try.jpg';
              //                    var trustHosts = true;
              //                    var options = {};
              //                    var ft = new FileTransfer();
              //
              //
              //                    ft.onprogress = function(progressEvent) {
              //                      $timeout(function () {
              //                        $scope.download.progress = progressEvent.loaded / progressEvent.total;
              //                      }, 100);
              //                    };
              //                    ft.download(
              //                       encodeURI(url),
              //                       targetPath,
              //                       function(entry) {
              //
              //                           console.log("download complete: " + entry.toURL());
              //                           $timeout(function(){
              //                             $scope.profile.userProfilePic =entry.toURL(); //entry.toInternalURL();
              //                           },1000);
              //
              //                       },
              //                       function(error) {
              //                       console.log(angular.toJson(error));
              //                           console.log("download error source " + error.source);
              //                           console.log("download error target " + error.target);
              //                           console.log("download error code" + error.code);
              //                       },
              //                       true,
              //                       {
              //
              //                       }
              //                   );
              //
              //           };            // Destination URL
              //         });
              //
              //   $scope.getFile = getFile;
              //
              // });
