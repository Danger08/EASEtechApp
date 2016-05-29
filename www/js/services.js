angular.module('SimpleRESTIonic.services', [])
  .service('chatService', function ($http , Backand ,$rootScope,cacheService){
    var chatService = this;
    chatService.addReply = function ( reply,userid,ip,time,conv_id){
            return $http ({
        method: 'POST',
        url: Backand.getApiUrl() + '/1/objects/wp_conv_reply?returnObject=true',
        data: {
          reply: reply,
          userid: userid,
          ip: ip,
          time: time,
          conv_id: conv_id
        }
      });
    };
    chatService.deleteMessage = function(message_data){
      return $http ({
  method: 'DELETE',
  url: Backand.getApiUrl() + '/1/objects/wp_conv_reply/' + message_data.cr_id
});
    };
    chatService.loadMessages = function(conv_id){
      return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/wp_conv_reply',
      params: {
      pageSize: 500,
      pageNumber: 1,
      filter: [
      {
      fieldName: 'conv_id',
      operator: 'equals',
      value: conv_id
      }
      ],
      sort: ''
      }
      });
    };

    chatService.updateClients = function(){
      var a =  $http ({
        method: 'GET',
        url: Backand.getApiUrl() + '/1/objects/action/backandUsers/1',
        params: {
          name: 'updateChatInfo',
          parameters: {
            item: 'test'
          }
        }
      });
      return a;

    };
    //end of updateClients
    chatService.getConversations = function (id,user_one,user_two,ip,time){
      var conv_id ;
      checkConversation(id)
      .then(function(response){
        if(response.data.data.length === 0){
          console.log("0");
          createConversation(1,id,"192.168.254.254",0)
          .then(function(){
            console.log("Success!");
          });
        }else if (response.data.data.length ===1) {

          conv_id = response.data.data[0].conv_id;
          var chatCache = cacheService.setProfileCache();
          cacheService.updateChatCache(conv_id);
          $rootScope.conv_id = conv_id;
        }
      });
      function checkConversation(id){
        return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/objects/wp_conv',
              params: {
                pageSize: 20,
                pageNumber: 1,
                filter: [
                  {
                    fieldName: 'user_two',
                    operator: 'equals',
                    value: id
                  }
                ],
                sort: ''
              }
            });
      }

      function createConversation(user_one,user_two,ip,time){
                  var a =  $http ({
            method: 'POST',
            url: Backand.getApiUrl() + '/1/objects/wp_conv?returnObject=true',
            data: {
              user_one: user_one,
              user_two: user_two,
              ip: ip,
              time: time
            }
          });
          return a;
      }

    };
  })

  .service('localNotificationService',function($cordovaLocalNotification,$ionicPlatform){
    var localNotificationService = this;
    $ionicPlatform.ready(function () {
      localNotificationService.scheduleSingleNotification = function (message) {
        console.log('notification clicked!');
        $cordovaLocalNotification.schedule({
           title: 'EASE Technology Solutions',
           text: message,
           icon :'/img/icon.png',
           data: {
             customProperty: 'custom value'
           }
         }).then(function (result) {
           // ...
         });
        };
      localNotificationService.getLastID = function(){
        return $cordovaLocalNotification.getAllIds();
      };
    });
  })
   .service('LoginService', function ($http, Backand) {
        var service = this;

        service.signin = function (username, password) {
            //call Backand for sign in
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/LoginUser',
              params: {
                parameters: {
                  username: username,
                  password: password
                }}});
    };
    service.signout = function (username, password) {
        //call Backand for sign in
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/LoginUser',
          params: {
            parameters: {
              username: username,
              password: password
            }}});
  };})
    .service('tabsService', function() {
      var tabsService = this;

      tabsService.hideTabs = function (statename){
        var hide = false;
        switch (statename) {
          case 'dashboard.chat':
            hide = true;
            break;

          default:
            hide = false;
        }
        return hide;
      };

    })

   .service('addTaskService', function ($http, Backand) {
        var addTaskService = this;
        addTaskService.removeTask = function(task_id){
          return $http ({
          method: 'DELETE',
          url: Backand.getApiUrl() + '/1/objects/wp_easetasks/' + task_id
        });
        };
        addTaskService.addTask = function (taskname, taskdescription,startdate,duedate,projectname,category,priority,taskownerid) {
                    return $http ({
          method: 'POST',
          url: Backand.getApiUrl() + '/1/objects/wp_easetasks?returnObject=true',
          data: {
          task_projname: projectname,
          task_name: taskname,
          task_description: taskdescription,
          task_start: startdate,
          task_due: duedate,
          task_tags: category,
          task_priority: priority,
          task_ownerid: taskownerid,
          task_deleted: '0'
          }
          });


    };})

   .service('getTaskService', function ($http, Backand) {
        var getTaskService = this;
        getTaskService.changeDeletedValue = function (taskid,task_deleted){
          return $http ({
                  method: 'PUT',
                  url: Backand.getApiUrl() + '/1/objects/wp_easetasks/'+ taskid +'?returnObject=true',
                  data: {
                    task_deleted: task_deleted
                  }
                });
        };
        getTaskService.updatetask = function(a,b,c,d,e,f,g,h){
                  return $http ({
          method: 'PUT',
          url: Backand.getApiUrl() + '/1/objects/wp_easetasks/' + a + '?returnObject=true',
          data: {

            task_name: b,
            task_description: c,
            task_start: d,
            task_due: e,
            task_projname: f,
            task_tags: g,
            task_priority: h,
          }
        });
      };
        getTaskService.getTask = function (ownerid) {


            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/getTaskList',
              params: {
                parameters: {
                  taskownerid: ownerid
                }
              }
            });
    };})

.service('cacheService', function (CacheFactory,$rootScope) {
  var cacheService = this;
  var profileCache;
  cacheService.removeCache = function (){
    profileCache = cacheService.setProfileCache();
    $rootScope.cachedprofile = undefined;
    profileCache.destroy();
    profileCache.remove('/profile');
  };
  cacheService.setProfileCache = function (){

    if (!CacheFactory.get('profileCache')) {
        console.log('creating profileCache');
        profileCache = CacheFactory('profileCache' , {storageMode: 'localStorage'});
    }

    return profileCache;
  };
  cacheService.updateProfileCache = function(userinfo){
    profileCache.put('/profile', userinfo);
  };
  cacheService.updateChatCache = function(chatinfo){
    profileCache.put('/chat', chatinfo);
  };
  cacheService.getProfileCache = function(){
    if (!CacheFactory.get('profileCache')) {
        console.log('creating profileCache');
        profileCache = CacheFactory('profileCache' , {storageMode: 'localStorage'});
    }
    var a = profileCache.get('/profile');
    return a;
  };
  cacheService.getChatCache = function(){
    if (!CacheFactory.get('profileCache')) {
        console.log('creating profileCache');
        profileCache = CacheFactory('profileCache' , {storageMode: 'localStorage'});
    }
    var a = profileCache.get('/chat');
    return a;
  };
})
.service('invoiceService' , function($http,Backand){
var invoiceService = this;
invoiceService.updatePaypalinfo = function(invoice_id,paypalresponse,deviceinfo){
  return $http ({
  method: 'PUT',
  url: Backand.getApiUrl() + '/1/objects/wp_easeinvoice/' + invoice_id + '?returnObject=true',
  data: {
    status: '2',
    receiptData: angular.toJson(paypalresponse),
    deviceinfo: deviceinfo
  }
});
};
invoiceService.getMyInvoiceList = function(userid){
  return $http ({
  method: 'GET',
  url: Backand.getApiUrl() + '/1/objects/wp_easeinvoice',
  params: {
    pageSize: 20,
    pageNumber: 1,
    filter: [
      {
        fieldName: 'user_id',
        operator: 'equals',
        value: userid
      }
    ],
    sort: ''
  }
});
};
})
.service('profileInfoService', function ($http, Backand) {
  var profileInfoService = this;
  profileInfoService.resetPassword = function(username){
    return $http ({
  method: 'GET',
  url: 'http://dgabriel.azurewebsites.net/app/templates/forgot-password.php?username=' + username,
  data: {
    username : username
  }
  });
  };

  profileInfoService.getIDforSend = function(username){


      return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/wp_easeappuser',
      params: {
        pageSize: 1,
        pageNumber: 1,
        filter: [
          {
            fieldName: 'username',
            operator: 'equals',
            value: username
          }
        ],
        sort: ''
      }
    });


  };
  profileInfoService.sendCode = function (id){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/action/wp_easeappuser/' + id,
      params: {
        name: 'sendCode',
        parameters: {}
      }
    });
  };
  profileInfoService.checkVerificationCode = function(username,code){
      return $http ({
        method: 'GET',
        url: Backand.getApiUrl() + '/1/objects/wp_easeappuser',
        params: {
          pageSize: 1,
          pageNumber: 1,
          filter: [
            {
              fieldName: 'username',
              operator: 'equals',
              value: username
            },
            {
              fieldName: 'activation_code',
              operator: 'equals',
              value: code
            }
          ],
          sort: ''
        }
      });
  };
  profileInfoService.changeAvatar = function (id,filename){
    return $http ({
  method: 'PUT',
  url: Backand.getApiUrl() + '/1/objects/wp_easeappuser/'+ id +'?returnObject=true',
  data: {
    avatar: filename
  }
  });
  };
  profileInfoService.getProfile = function (id){
    return $http ({
  method: 'GET',
  url: Backand.getApiUrl() + '/1/objects/wp_easeappuser',
  params: {
    pageSize: 1,
    pageNumber: 1,
    filter: [
      {
        fieldName: 'ease_userid',
        operator: 'equals',
        value: id
      }
    ],
    sort: ''
  }
});
  };

profileInfoService.updateProfile = function (id,firstname,lastname,address,email,website,mobile,birthdate){
  return $http ({
  method: 'PUT',
  url: Backand.getApiUrl() + '/1/objects/wp_easeappuser/'+ id +'?returnObject=true',
  data: {
    firstname: firstname,
    lastname: lastname,
    address: address,
    email: email,
    website: website,
    mobile: mobile,
    birthdate: birthdate
  }
});
};
  profileInfoService.updateStatus = function(id,status){
    return $http.get('http://dgabriel.azurewebsites.net/app/userstatus.php?id=' + id + '&status=' + parseInt(status));
  };
  profileInfoService.checkPassword = function (userid,username,password){
    return $http ({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/query/data/LoginUser',
      params: {
        parameters: {
          username: username,
          password: password
        }}});
  };
  profileInfoService.changePassword = function(userid,password,newpassword){
    return $http ({
  method: 'GET',
  url: Backand.getApiUrl() + '/1/query/data/changePassword',
  params: {
    parameters: {
      userid: userid,
      oldpassword: password,
      newpassword: newpassword
    }
  }
});
  };
})

   .service('SignupService', function($http, Backand){


    var signupService = this;

    signupService.signup = function(firstname,lastname,username,password,email){

      return $http ({
        method: 'GET',
        url: Backand.getApiUrl() + '/1/query/data/SignupUser',
        params: {
        parameters: {
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
        email: email
    }}});

    };
    signupService.signupInfoCheck = function (checkUsernameEmail) {
            //call Backand for sign in


            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/checkUsernameEmail',
              params: {
                parameters: {
                  usernameoremail:checkUsernameEmail
                }
              }
            });
    };
});
