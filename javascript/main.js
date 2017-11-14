var config = {
    apiKey: "AIzaSyDLnLEGIIHzvCIS2TRAjJIFE3_JtKYypt0",
    authDomain: "project-7498a.firebaseapp.com",
    databaseURL: "https://project-7498a.firebaseio.com",
    projectId: "project-7498a",
    storageBucket: "project-7498a.appspot.com",
    messagingSenderId: "1007493758823"
  };
  firebase.initializeApp(config);

var database = firebase.database();

//declaring global variable for username
var username = "";
var usernameLowercase = "";


//when user clicks this button, it logs the customer in by searching through each key for the username to match
$("#user-submit").on("click", function() {
	event.preventDefault();

	//get username and password
	username = $("#username").val().trim();
	usernameLowercase = username.toLowerCase();

	//hides the modal that displays the log-in doesn't exist
	$("#userNotExistsModal").modal({ show: false});
	
	//checks whether or not the username exists or not and returns a boolean
	var usernameNotExists;

	database.ref().once("value", function(snapshot){
		var usernameNotExists = true;
		snapshot.forEach(function(childSnapshot){
			if (usernameLowercase == childSnapshot.val().username){
				usernameNotExists = false;
			} 
			
		})
		//passes the boolean of whether the username exists or not to the function
		checkUserNotExists(usernameNotExists);
	})
})


//function once you press log-in button
function checkUserNotExists(usernameNotExists) {
	//if the username DOES exist, it wil log the user in and display that user's specific information
	if (usernameNotExists == false){
		//hides the log-in buttons once logged-in	
		$("#username").hide();
		$("#user-submit").hide();
		$("#logged-in").show().append(username);
		$("#user-logout").show();
		$("#newuser-submit").hide();
		$("#sign-up-modal").hide();


		//goes into the databse
		database.ref().once("value", function(snapshot){
			snapshot.forEach(function(childSnapshot){
				//sets variables for all of the arrays
				var favoriteArtistArray=[];
				var favoriteEventNameArray=[];
				var favoriteEventIDArray=[];
				var favoriteEventArtistArray=[];
				
				//pulls from firebase array and sets it to local arrays
				if (usernameLowercase == childSnapshot.val().username){
					favoriteArtistArray = childSnapshot.val().favoriteArtist;
					favoriteEventNameArray = childSnapshot.val().favoriteEventName;
					favoriteEventIDArray = childSnapshot.val().favoriteEventID;
					favoriteEventArtistArray = childSnapshot.val().favoriteEventArtist;
					
					//displays the array into the sidebar
					$("#artist-fav").html("");
					for (var i = 1; i < favoriteArtistArray.length; i++) {
						$("#artist-fav").append("<div class='fav'><span class='fav-link fav-artist-button' value='"+ favoriteArtistArray[i] + "'>" + favoriteArtistArray[i] + "</span><span class='del-artist-button close' fav-value='" + i + "'>&times;</span></div>");
						deleteArtistButton();
					}

					$("#event-fav").html("");
					for (var k=1; k < favoriteEventNameArray.length; k++){
						$("#event-fav").append("<div class='fav'><span class='fav-link fav-event-button' name-value='" + favoriteEventNameArray[k] + "' id-value='" + favoriteEventIDArray[k] + "' artist-value='" + favoriteEventArtistArray[k] + "''>" + favoriteEventNameArray[k] + "</span><span class='del-event-button close' fav-value='" + k + "'>&times;</span></div>");
						deleteEventButton();
					}
				}
			})
		})
	} else {
		//if the username does not exist, modal displays showing that the username does not exist and to try again
		$("#userNotExistsModal").modal('show');
	
	}
}


//sign-up button brings up a modal to allow user to enter a new username and sign-up
$("#newuser-submit").on("click", function(){
	event.preventDefault();
	

	$("#userExistsModal").modal({ show: false});

	//pulls the new username
	username = $("#newUsername").val().trim();
	usernameLowercase = username.toLowerCase();
	var usernameExists;

	//checking whether or not the username already exists or not
	database.ref().once("value", function(snapshot){
		usernameExists = false;
		snapshot.forEach(function(childSnapshot){
			if (usernameLowercase == childSnapshot.val().username){
				usernameExists = true;
			}
		})

		//passes the boolean of whether or not username exists and calls the function to either create the new user name or throw an error that ther username already exists
		checkUserExists(usernameExists);
	})
})

$("#user-logout").on("click",function(){
	$("#username").show();
	$("#user-submit").show();
	$("#logged-in").hide();
	

})


//function to set-up new user
function checkUserExists(usernameExists) {
	if (usernameExists === false){
		$("#new-user-submit").hide();
		$("#username").hide();
		$("#user-submit").hide();
		$("#logged-in").show().append(username);
		$("#user-logout").show();
		$("#sign-up-modal").hide();

		 $("#signupModal").modal("hide");

		database.ref().push({
			username: usernameLowercase,
			favoriteArtist: [""],
			favoriteEventName: [""],
			favoriteEventID: [""],
			favoriteEventArtist: [""],
			
		})
		$("#userExistsModal").modal({ show: false});
	} else {
		$("#userExistsModal").modal('show');
		$("#newUsername").val("");

	}
}

//button to add artists to the favorites bar and firebase
var favoriteArtistButton = function() {
	$("#artist-submit").on("click", function(){
		if (username == ""){
			$("#loginFirst").modal('show');
		} else {
			usernameLowercase = username.toLowerCase();
			var artistName = $(this).attr("data-artist");
			var artistNameExists;

			database.ref().once("value", function(snapshot){
				snapshot.forEach(function(childSnapshot){
					var favoriteArtistArray = [];
					if (usernameLowercase == childSnapshot.val().username){

						favoriteArtistArray = childSnapshot.val().favoriteArtist;

						//finds the index of the artist if it already exists
						artistNameExists = favoriteArtistArray.indexOf(artistName);

						//checks to see if the favorite artist already exists or not
						if (artistNameExists === -1){
							favoriteArtistArray.push(artistName);
							$("#artist-fav").html("");
							for (var i = 1; i < favoriteArtistArray.length; i++) {						
								$("#artist-fav").append("<div class='fav'><span class='fav-link fav-artist-button' value='"+ favoriteArtistArray[i] + "'>" + favoriteArtistArray[i] + "</span><span class='del-artist-button close' fav-value='" + i + "'>&times;</span></div>");
								deleteArtistButton();
							}

							//updates firebase with the new add
							database.ref(childSnapshot.key).update({
								favoriteArtist: favoriteArtistArray,
							})
				
						} else {
							$("#artistExists").modal('show');
						} 
					}		
				})
			})
		}
	})
}
            

//button to add a new favorite Event to the sidebar
var favoriteEventButton = function(){
	$(".save-event-submit").on("click", function(){
		if (username == ""){
			$("#loginFirst").modal('show');
		} else{
			var eventName = $(this).attr("data-event-artist");
			var eventArtist = $(this).attr("data-artist-name")
			var eventID = $(this).attr("data-event-id");
			var eventIDExists;

			database.ref().once("value", function(snapshot){
				snapshot.forEach(function(childSnapshot){
					usernameLowercase = username.toLowerCase();
					

					var favoriteEventNameArray = [];
					var favoriteEventIDArray = [];
					var favoriteEventArtistArray = [];
					if (usernameLowercase == childSnapshot.val().username){
						favoriteEventNameArray = childSnapshot.val().favoriteEventName;
						favoriteEventIDArray = childSnapshot.val().favoriteEventID;
						favoriteEventArtistArray = childSnapshot.val().favoriteEventArtist;

						eventIDExists = favoriteEventIDArray.indexOf(eventID);
						
						//checks to see if the event already exists
						if (eventIDExists === -1){
							favoriteEventNameArray.push(eventName);
							favoriteEventIDArray.push(eventID);
							favoriteEventArtistArray.push(eventArtist);

							//pushes the list to the favorite event sidebar
							$("#event-fav").html("");
							for (var k=1; k < favoriteEventNameArray.length; k++){
								$("#event-fav").append("<div class='fav'><span class='fav-link fav-event-button' name-value='" + favoriteEventNameArray[k] + "' id-value='" + favoriteEventIDArray[k] + "' artist-value='" + favoriteEventArtistArray[k] + "''>" + favoriteEventNameArray[k] + "</span><span class='del-event-button close' fav-value='" + k + "'>&times;</span></div>");
								deleteEventButton();
							}
							
							//updates firebase with the new adds
							database.ref(childSnapshot.key).update({
								favoriteEventName: favoriteEventNameArray,
								favoriteEventID: favoriteEventIDArray,
								favoriteEventArtist: favoriteEventArtistArray,
							})
						} else {
							$("#eventExists").modal('show');
						}
					}
				})
			})
		}
	})
}

//button to delete the event you no longer want in favorites
var deleteEventButton = function(){
	$(".del-event-button").on("click", function(){
		usernameLowercase = username.toLowerCase();
		var delVal = $(this).attr("fav-value");
		var favoriteEventNameArray = [];
		var favoriteEventIDArray = [];
		var favoriteEventArtistArray = []; 

		database.ref().once("value", function(snapshot){
			snapshot.forEach(function(childSnapshot){
				if (usernameLowercase == childSnapshot.val().username){
					favoriteEventNameArray = childSnapshot.val().favoriteEventName;
					favoriteEventIDArray = childSnapshot.val().favoriteEventID;
					favoriteEventArtistArray = childSnapshot.val().favoriteEventArtist;
				}
				favoriteEventNameArray.splice(delVal, 1);
				favoriteEventIDArray.splice(delVal,1);
				favoriteEventArtistArray.splice(delVal, 1);

				
				database.ref(childSnapshot.key).update({
					favoriteEventName: favoriteEventNameArray,
					favoriteEventID: favoriteEventIDArray,
					favoriteEventArtist: favoriteEventArtistArray,
				})

				if (usernameLowercase == childSnapshot.val().username){
					
					$("#event-fav").html("");
					for (var k=1; k < favoriteEventNameArray.length; k++){
						$("#event-fav").append("<div class='fav'><span class='fav-link fav-event-button' name-value='" + favoriteEventNameArray[k] + "' id-value='" + favoriteEventIDArray[k] + "' artist-value='" + favoriteEventArtistArray[k] + "''>" + favoriteEventNameArray[k] + "</span><span class='del-event-button close' fav-value='" + k + "'>&times;</span></div>");
						deleteEventButton();
					}
				}
			})
		})	
	})
}

//button to delete the artist you no longer want in favorites
var deleteArtistButton = function(){
	$(".del-artist-button").on("click", function(){
		usernameLowercase = username.toLowerCase();
		var delVal = $(this).attr("fav-value");
		var favoriteArtistArray = [];

		database.ref().once("value", function(snapshot){
			snapshot.forEach(function(childSnapshot){
				if (usernameLowercase == childSnapshot.val().username){
					favoriteArtistArray = childSnapshot.val().favoriteArtist;

				}
				favoriteArtistArray.splice(delVal,1);

				database.ref(childSnapshot.key).update({
					favoriteArtist: favoriteArtistArray,

				})

				if (usernameLowercase == childSnapshot.val().username){
					
					$("#artist-fav").html("");
					for (var i = 1; i < favoriteArtistArray.length; i++) {
						$("#artist-fav").append("<div class='fav'><span class='fav-link fav-artist-button' value='"+ favoriteArtistArray[i] + "'>" + favoriteArtistArray[i] + "</span><span class='del-artist-button close' fav-value='" + i + "'>&times;</span></div>");
						deleteArtistButton();
					}
				}
			})
		})
	})
}