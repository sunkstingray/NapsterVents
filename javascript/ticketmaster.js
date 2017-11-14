// Begin Ticketmaster

// Author: James Scott

var artistNameIn;
var zipCodeIn;
var tmRootQueryURL = "https://app.ticketmaster.com/discovery/v2/events.json";
var tmQueryURL = "";
var tmApiKey = "Q60tg8AuoiJG7UpD8Lk2jUH1vutlxRd0";
var savedEvent = false;
var tmEventDate = "";
var tmEventHTML = "";

// Add an on-click event listener for the Search button	
$("#nav-submit").on("click", function(event) {

	artistNameIn = $("#artist-name").val().trim();
	zipCodeIn = $("#zip-code").val().trim();

	tmEvents = getTicketmasterInfo();
	console.log("tmEvents: ", tmEvents);
})

$("#event-fav").on("click", ".fav-event-button", function(event) {
	displaySavedEvent(event);
})

// Get the music events from Ticketmaster
function getTicketmasterInfo() {

 	savedEvent = false;

	// The query URL for the AJAX call to Ticketmaster.
	// The results are sorted by event date
	tmQueryURL = tmRootQueryURL	+ "?keyword=" + artistNameIn
															+ "&postalCode=" + zipCodeIn
															+ "&radius=100"
												   		+ "&sort=date,asc"
											 	   		+ "&classificationName=music"
															+ "&apikey=" + tmApiKey;

	console.log("getTicketmasterInfo() tmQueryURL: ", tmQueryURL);
	
	$.ajax(
	{
	  type:"GET",
	  url: tmQueryURL,
	  async:true,
	  dataType: "json",
	  success: function(json) {

	  	console.log("getTicketmasterInfo() Tickmaster JSON: ", json);

	  	// Check if music events were returned
	  	if (json.page.totalElements === 0) {
	  		displayNoEvents();
	  	}
		  else {
	  		displayEvents(json);
	  		favoriteEventButton();
	  	}
	           },
	  error: function(xhr, status, err) {
	              console.log("Ticketmaster AJAX Error!");
	           }
	});	
}

// Display the Ticketmaster music event information
function displayEvents(tmEvents) {

	var i = 0;
	var tmEventState = "";
	var currentDate = moment();
	var tmEventDate;

	$("#event-info").empty();

	tmEventHTML  = "<h2 class='panel-heading'>Ticketmaster Music Events</h2>";
	tmEventHTML += "<table class='table'>";
	tmEventHTML += "<thead>";
	tmEventHTML += "<tr>"
	tmEventHTML += "<th>Artist Name</th>";
	tmEventHTML += "<th>Venue</th>";
	tmEventHTML += "<th>Location</th>";
	tmEventHTML += "<th>Date</th>";
	tmEventHTML += "<th>More Information</th>";
	tmEventHTML += "<th></th>";
	tmEventHTML += "</tr>";
	tmEventHTML += "</thead>";
	tmEventHTML += "<tbody id='event-schedule'>";

	for (i = 0; i < tmEvents._embedded.events.length; i++) {

		tmEventDate = moment(tmEvents._embedded.events[i].dates.start.localDate);

		// Don't display music events in the past
		if ((tmEventDate).isBefore(currentDate, 'day')) {
			continue;
		}

		// Music events outside the US don't have a state code property.
		// In those cases use the country code in place of the state code.
		if (tmEvents._embedded.events[i]._embedded.venues[0].country.countryCode === "US") {
			tmEventState = tmEvents._embedded.events[i]._embedded.venues[0].state.stateCode;
		}
		else {
			tmEventState = tmEvents._embedded.events[i]._embedded.venues[0].country.countryCode;
		}

		// Build the HTML to display the Ticketmaster music event information
		tmEventHTML += "<tr>";
		tmEventHTML += "<td>" + tmEvents._embedded.events[i].name + "</td>";
		tmEventHTML += "<td>" + tmEvents._embedded.events[i]._embedded.venues[0].name + "</td>";
		tmEventHTML	+= "<td>" + tmEvents._embedded.events[i]._embedded.venues[0].city.name + ", " + tmEventState + "</td>";
		tmEventHTML += "<td>" + moment(tmEvents._embedded.events[i].dates.start.localDate).format("MMMM Do YYYY") + "</td>";
		tmEventHTML	+= "<td><a href=" + tmEvents._embedded.events[i].url + " target=_blank>Ticketmaster</a></td>";
		
		if (!savedEvent) {
			tmEventHTML += "<td><button type='button' class='btn btn-primary btn-block save-event-submit' data-toggle='tooltip' title='Save This Event' data-event-artist='" + tmEvents._embedded.events[i].name + "' data-event-id='" + tmEvents._embedded.events[i].id + "'><span class='glyphicon glyphicon-heart-empty'></span></button></td>";
		}

		tmEventHTML	+= "</tr>";
	}

	tmEventHTML += "</tbody>";
	tmEventHTML += "</table>";

	// Add the Ticketmaster music event information to the web page HTML
	$("#event-info").append(tmEventHTML);
}

// No music event information was returned from Ticketmaster.
function displayNoEvents() {
	
	$("#event-info").empty();

	tmEventHTML  = "<h2 class='panel-heading'>Ticketmaster Music Events</h2>";
	tmEventHTML += "<table class='table'>";
	tmEventHTML += "<thead>";
	tmEventHTML += "<tr>"
	tmEventHTML += "<th>Artist Name</th>";
	tmEventHTML += "<th>Venue</th>";
	tmEventHTML += "<th>Date</th>";
	tmEventHTML += "<th>More Information</th>";
	tmEventHTML += "</tr>";
	tmEventHTML += "</thead>";
	tmEventHTML += "<tbody id='event-schedule'>";
	tmEventHTML += "<tr>";

	if (artistNameIn === "") {
		tmEventHTML += "<td>There are no music events in Zip Code " + zipCodeIn + "</td>";
	}
	else {
		if (zipCodeIn === "") {
			tmEventHTML += "<td>There are no music events for " + artistNameIn + "</td>";
		}
		else {
			tmEventHTML += "<td>There are no music events for " + artistNameIn + " in Zip Code " + zipCodeIn;
		}
	}

	tmEventHTML += "</tr>";
	tmEventHTML += "</tbody>";
	tmEventHTML += "</table>";

	// Add the HTML to the web page
	$("#event-info").append(tmEventHTML);
}

function displaySavedEvent(event) {

	console.log("displaySavedEvent() event: ", event);

	var tmEventId;

	tmEventId = event.currentTarget.attributes[2].nodeValue;

 	savedEvent = true;

	tmQueryURL = tmRootQueryURL + "?id=" + tmEventId
															+ "&apikey=" + tmApiKey;

	console.log("displaySavedEvent() tmQueryURL: ", tmQueryURL);

	$.ajax(
	{
	  type:"GET",
	  url: tmQueryURL,
	  async:true,
	  dataType: "json",
	  success: function(json) {

	  	console.log("displaySavedEvent() Tickmaster JSON: ", json);

	  	// Check if music events were returned
	  	if (json.page.totalElements === 0) {
	  		savedEventUnavailable(event);
	  	}
		  else {
	  		displayEvents(json);
	  	}
	           },
	  error: function(xhr, status, err) {
	              console.log("Ticketmaster AJAX Error!");
	           }
	});	
}

function savedEventUnavailable(event) {

	var tmArtistName;

	tmArtistName = event.currentTarget.attributes[1].nodeValue;

	$("#event-info").empty();

	tmEventHTML =  "<div class='panel-heading'>";
  tmEventHTML += "<h2 class='panel-title'>Ticketmaster Music Events</h2>";
  tmEventHTML += "</div>";
	tmEventHTML += "<table class='table'>";
	tmEventHTML += "<tbody id='event-schedule'>";
	tmEventHTML += "<tr>";

	tmEventHTML += "<td>The " + tmArtistName + " music event has started or has already happened so ticket sales have stopped";

	tmEventHTML += "</tr>";
	tmEventHTML += "</tbody>";
	tmEventHTML += "</table>";

	// Add the HTML to the web page
	$("#event-info").append(tmEventHTML);
}

// End Ticketmaster
