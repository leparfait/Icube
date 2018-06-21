angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false;  // For hiding the side bar and nav icon

    // When the user logs out and reaches login page,
    // we clear all the history and cache to prevent back link
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });




    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('menu2', {}, {location: "replace"});

      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  // Check if the form data is valid or not

          sharedUtils.showLoading();

          //Email
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

                // You dont need to save the users session as firebase handles it
                // You only need to :
                // 1. clear the login page history from the history stack so that you cant come back
                // 2. Set rootScope.extra;
                // 3. Turn off the loading
                // 4. Got to menu page

              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('menu2', {}, {location: "replace"});

            },
            function(error) {
              sharedUtils.hideLoading();
              sharedUtils.showAlert("Information","Erreur d'authentification");
            }
        );

      }else{
        sharedUtils.showAlert("Information","Données invalides");
      }



    };


    $scope.loginFb = function(){
      //Facebook Login
    };

    $scope.loginGmail = function(){
      //Gmail Login
    };


})

.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,
                                   $state,fireBaseData,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Main Firebase Authentication part
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

            //Add name and default dp to the Autherisation table
            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

            //Add phone number to the user table
            fireBaseData.refUser().child(result.uid).set({
              telephone: cred.phone
            });

            //Registered OK
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});

        }, function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Information","Erreur d'enregistrement");
        });

      }else{
        sharedUtils.showAlert("Information","Données invalides");
      }

    }

  })

.controller('menu2Ctrl', function($scope,$rootScope,$ionicSideMenuDelegate,fireBaseData,$state,
                                  $ionicHistory,$firebaseArray,sharedCartService,sharedUtils) {

  //Check if user already logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user; //Saves data to user_info
    }else {

      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
      $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});

    }
  });

  // On Loggin in to menu page, the sideMenu drag state is set to true
  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;

  // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });



  $scope.loadMenu = function() {
    sharedUtils.showLoading();
    $scope.menu=$firebaseArray(fireBaseData.refMenu());
    sharedUtils.hideLoading();
  }

  $scope.showProductInfo=function (item) {/***** Détail of product */
    $state.go('detailItem', {item:item}, {location: "replace"});
  };

  $scope.addToCart=function(item){
    sharedCartService.add(item);
  };

})

.controller('detailItemCtrl', function($scope,$stateParams,$firebaseArray,$ionicHistory,fireBaseData,$rootScope,$ionicSideMenuDelegate,
            $state,$firebaseArray,sharedUtils) {
    
    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user; //Saves data to user_info
    }else {

      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
      $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});

    }
  });

    // On Loggin in to menu page, the sideMenu drag state is set to true
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.extras=true;

    // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });

   // we get product who are selected and show the detail
   $scope.item = $stateParams.item;

   $scope.addToCart=function(item){  // add to cart
    sharedCartService.add(item);
  };

  $scope.viewComment=function(item_id){

     /******** recuperer tous les commentaires du produits */
     sharedUtils.showLoading();
     $scope.comments=$firebaseArray(fireBaseData.refComment().child(item_id));
     sharedUtils.hideLoading();
  };

  $scope.addComment=function(item){
    var commentPopup = $ionicPopup.show({
      template:'<input type="number" placeholder="votre commentaire..." ng-model="comment">',
      title: "Commantaire",
      subTitle: "Entrer Votre Commentaire",
      scope: $scope,
      buttons: [
        { text: 'Fermer' },
        {
          text: 'Valider',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.comment) {
              e.preventDefault(); //don't allow the user to close unless he enters full details
            } else {
              return $scope.comment;
            }
          }
        }
      ]
    });

    commentPopup.then(function(res) {
      
      fireBaseData.refComment().child(item.uid).push({
    
        //Comments data
        user_id: $scope.user_info.uid,
        user_name:$scope.user_info.displayName,
        item_id: item.uid,
        item_name: item.name,
        commentaire: res
        
      });
    });  
  }

})

.controller('offersCtrl', function($scope,$rootScope) {

    //We initialise it on all the Main Controllers because, $rootScope.extra has default value false
    // So if you happen to refresh the Offer page, you will get $rootScope.extra = false
    //We need $ionicSideMenuDelegate.canDragContent(true) only on the menu, ie after login page
    $rootScope.extras=true;
})

.controller('indexCtrl', function($scope,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService) {

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user; //Saves data to user_info

        //Only when the user is logged in, the cart qty is shown
        //Else it will show unwanted console error till we get the user object
        $scope.get_total= function() {
          var total_qty=0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            total_qty += sharedCartService.cart_items[i].item_qty;
          }
          return total_qty;
        };

      }else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    $scope.logout=function(){

      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function() {


        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });


        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }, function(error) {
         sharedUtils.showAlert("Erreur","Deconnexion échoué")
      });

    }

  })

.controller('myCartCtrl', function($scope,$rootScope,$state,sharedCartService) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $scope.cart=sharedCartService.cart_items;  // Loads users cart

        $scope.get_qty = function() {
          $scope.total_qty=0;
          $scope.total_amount=0;

          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
          }
          return $scope.total_qty;
        };
      }
      //We dont need the else part because indexCtrl takes care of it
    });

    $scope.removeFromCart=function(c_id){
      sharedCartService.drop(c_id);
    };

    $scope.inc=function(c_id){
      sharedCartService.increment(c_id);
    };

    $scope.dec=function(c_id){
      sharedCartService.decrement(c_id);
    };

    $scope.checkout=function(){
      $state.go('checkout', {}, {location: "replace"});
    };



})

.controller('lastOrdersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils) {

    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;

        fireBaseData.refOrder()
          .orderByChild('user_id')
          .startAt($scope.user_info.uid).endAt($scope.user_info.uid)
          .once('value', function (snapshot) {
            $scope.orders = snapshot.val();
            $scope.$apply();
          });
          sharedUtils.hideLoading();
      }
    });





})

.controller('favouriteCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;
})

.controller('settingsCtrl', function($scope,$rootScope,fireBaseData,$firebaseObject,
                                     $ionicPopup,$state,$window,$firebaseArray,
                                     sharedUtils) {
    //Bugs are most prevailing here
    $rootScope.extras=true;

    //Shows loading bar
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        //Accessing an array of objects using firebaseObject, does not give you the $id , so use firebase array to get $id
        $scope.addresses= $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));

        // firebaseObject is good for accessing single objects for eg:- telephone. Don't use it for array of objects
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));

        $scope.user_info=user; //Saves data to user_info
        //NOTE: $scope.user_info is not writable ie you can't use it inside ng-model of <input>

        //You have to create a local variable for storing emails
        $scope.data_editable={};
        $scope.data_editable.email=$scope.user_info.email;  // For editing store it in local variable
        $scope.data_editable.password="";

        $scope.$apply();

        sharedUtils.hideLoading();

      }

    });

    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Address";
        var sub_title="Edit your address";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Ajout d'addresse";
        var sub_title="Ajouter votre nouvelle addresse";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nom"  ng-model="data.nickname"> <br/> ' +
                  '<input type="text"   placeholder="Addresse" ng-model="data.address"> <br/> ' +
                  '<input type="number" placeholder="P.O BOX" ng-model="data.pin"> <br/> ' +
                  '<input type="number" placeholder="Téléphone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Fermer' },
          {
            text: '<b>Enregister</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          if(res!=null){ // res ==null  => close 
            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({// set
              nickname: res.nickname,
              address: res.address,
              pin: res.pin,
              phone: res.phone
            });
          }
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function(del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Supprimer',
        template: 'Etes vous sure de vouloir supprimer cette adresse',
        buttons: [
          { text: 'Non' , type: 'button-stable' },
          { text: 'Oui', type: 'button-assertive' , onTap: function(){return del_id;} }
        ]
      });

      confirmPopup.then(function(res) {
        if(res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save= function (extras,editable) {
      //1. Edit Telephone doesnt show popup 2. Using extras and editable  // Bugs
      if(extras.telephone!="" && extras.telephone!=null ){
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({    // set
          telephone: extras.telephone
        });
      }

      //Edit Password
      if(editable.password!="" && editable.password!=null  ){
        //Update Password in UserAuthentication Table
        firebase.auth().currentUser.updatePassword(editable.password).then(function(ok) {}, function(error) {});
        sharedUtils.showAlert("Compte","Editer votre mot de passe");
      }

      //Edit Email
      if(editable.email!="" && editable.email!=null  && editable.email!=$scope.user_info.email){

        //Update Email/Username in UserAuthentication Table
        firebase.auth().currentUser.updateEmail(editable.email).then(function(ok) {
          $window.location.reload(true);
          //sharedUtils.showAlert("Account","Email Updated");
        }, function(error) {
          sharedUtils.showAlert("ERREUR",error);
        });
      }

    };

    $scope.cancel=function(){
      // Simple Reload
      $window.location.reload(true);
      console.log("FERMER");
    }

})

.controller('supportCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;

})

.controller('forgotPasswordCtrl', function($scope,$rootScope,sharedUtils) {
    $rootScope.extras=false;

    $scope.reset = function(email){
      firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
          firebase.auth().sendPasswordResetEmail(email).success(function(response){
            sharedUtils.showAlert("INFORMATION", "Votre mot de passe a été envoyé par mail");
          }).error(function(){
            sharedUtils.showAlert("ERREUR","une erreur est survenue");
          })
        }
    });
  }

})

.controller('checkoutCtrl', function($scope,$rootScope,sharedUtils,$state,$firebaseArray,$http,PaymentService,
                                     $ionicHistory,fireBaseData, $ionicPopup,sharedCartService){

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.addresses= $firebaseArray( fireBaseData.refUser().child(user.uid).child("address") );
        $scope.user_info=user;

        $scope.cart=sharedCartService.cart_items;  // Loads users cart

          $scope.total_qty=0;
          $scope.total_amount=0;

          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
          }
          $scope.total = $scope.total_amount;
      }
    });

   
      //We dont need the else part because indexCtrl takes care of it


    //********ajouter les logo om et momo */
    $scope.payments = [
      {id: 'OM', name: 'Orange money',img:'orange.png'},// Orange money**CREDIT
      {id: 'MOMO', name: 'Mtn mobile money',img:'mtn.jpg'},// Mtn mobile money**NETBANK
      {id: 'COD', name: 'Paiement à la livraison',img:'cod.jpg'}
    ];

    //choice payment mode 
    $scope.checkboxChange = function(mode){
      if(mode == "COD") {
        
      }else{
        var payphonePopup = $ionicPopup.show({
          template:'<input type="number" placeholder="Numéro de Téléphone" ng-model="payphone">',
          title: "Numero de retrait",
          subTitle: "Entrez le numéro du compte sur lequel vous serez débité",
          scope: $scope,
          buttons: [
            { text: 'Fermer' },
            {
              text: 'Valider',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.payphone) {
                  e.preventDefault(); //don't allow the user to close unless he enters full details
                } else {
                  return $scope.payphone;
                }
              }
            }
          ]
        });      
     }
      payphonePopup.then(function(res) {
        return res;
    });
  }

    $scope.pay=function(address,payment){

      if(address==null || payment==null){
        //Check if the checkboxes are selected ?
        sharedUtils.showAlert("Erreur","SVP choisisser une adresse de livraison et votre mode de paiement.")
      }
      else {
        // Check if payment is correct
        amount = $scope.total;
        
          if(payment == "OM") {
              sharedUtils.showLoading();
               statuspaymentOM = PaymentService.OMpayment(res,amount);
               if(statuspayment == "ko"){
                 $state.go('checkout', {}, {location: "replace"});
                 sharedUtils.showAlert("ERREUR","Echec de paiement");
               }
              sharedUtils.hideLoading();

          }else if(payment == "MOMO"){
              sharedUtils.showLoading();
              statuspaymentMOMO =  PaymentService.MOMOpayment(res,amount);
               if(statuspayment == "ko"){
                $state.go('checkout', {}, {location: "replace"});
                sharedUtils.showAlert("ERREUR","Echec de paiement");
              }
              sharedUtils.hideLoading();
          }

        // Loop throw all the cart item
        for (var i = 0; i < sharedCartService.cart_items.length; i++) {
          //Add cart item to order table
          fireBaseData.refOrder().push({

            //Product data is hardcoded for simplicity
            product_name: sharedCartService.cart_items[i].item_name,
            product_price: sharedCartService.cart_items[i].item_price,
            product_image: sharedCartService.cart_items[i].item_image,
            product_id: sharedCartService.cart_items[i].$id,

            //item data
            item_qty: sharedCartService.cart_items[i].item_qty,

            //Order data
            user_id: $scope.user_info.uid,
            user_name:$scope.user_info.displayName,
            address_id: address,
            payment_id: payment,
            status: "Queued" //****** modifié ce status depuis l'admin interface */
            
          });
         //item total price
         //item_total_qty += sharedCartService.cart_items[i].item_price * sharedCartService.cart_items[i].item_qty;
        }

        //payment with OM or MOMO
      


        //Remove users cart
        fireBaseData.refCart().child($scope.user_info.uid).remove();

        sharedUtils.showAlert("Information", "Commande réussi");

        /*******send mail */

        // Go to past order page
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('lastOrders', {}, {location: "replace", reload: true});
      }
    }

      //show input of number when the button radio is checked
     
    
    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Editer l'addresse";
        var sub_title="Editer votre addresse";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Ajout d'address";
        var sub_title="Ajouter une nouvelle addresse";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nom"  ng-model="data.nickname"> <br/> ' +
        '<input type="text"   placeholder="Addresse" ng-model="data.address"> <br/> ' +
        '<input type="number" placeholder="P.O.BOX" ng-model="data.pin"> <br/> ' +
        '<input type="number" placeholder="Téléphone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Fermer' },
          {
            text: '<b>Enregistrer</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };

   });