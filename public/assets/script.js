
//Google maps javascript
// also added a geolocation functionality to find the user's current location
// note: The user must enable the geolocation by clicking 'Allow' when it prompts
let map, infoWindow, directionService, directionsDisplay, placesService;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 33.97556871982497, lng: -117.32802747164423 }, // UCR's location
    zoom: 6, // initial zoom is state wide
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button"); // creates a button on center-top

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Tries HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // if Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  //Adding the directions API
  //Creating a directions service object to use the route method and to obtain a request of our result
  directionService = new google.maps.DirectionsService();

  //Create an object ot render the display
  directionsDisplay = new google.maps.DirectionsRenderer();

  //Adding the directions display onto the map
  directionsDisplay.setMap(map);

  //initialize the autocomplete
  initAutocomplete();

  //Adding the Places API
  placesService = new google.maps.places.PlacesService(map);

}

//Function to generate route of trave
function generateRoute(event) {
  event.preventDefault();
  //Generate a request
  let request = {
    origin: document.querySelector('#startingDestination').value,
    destination: document.querySelector('#endingDestination').value,
    travelMode: google.maps.TravelMode.DRIVING
  }


  //Send the request to the route method
  directionService.route(request, (result, status) => {
    //check if the status is good
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    } else {
      console.log(status);
    }
  });
}

// Call the generateRoute function when the user clicks the button
document.querySelector('#btn').addEventListener('click', generateRoute);

//variables to hold the autocomplete objects
let startAutocomplete;
let endAutocomplete;

//function to intialize autocomplete for start/ending destination input fields.
function initAutocomplete() {
  //initializing the Place autocomplete services
  startAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('startingDestination'),
    {
      types: ['address'],
      componentRestrictions: { 'country': ['us', 'ca', 'mx'] },
      fields: ['place_id', 'geomery', 'name']
    }
  )
  endAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('endingDestination'),
    {
      types: ['address'],
      componentRestrictions: { 'country': ['us', 'ca', 'mx'] },
      fields: ['place_id', 'geomery', 'name']
    }
  )
}



//function to display error when user does not allow location
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;

//for slideshow
let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  for (i = 0; i < slides.length; i++) {
    slides[i].className = slides[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  slides[slideIndex - 1].className += " active";
  setTimeout(showSlides, 10000); // Change image every 10 seconds
}

//calculate distance and duration using starting and ending destinations
function calculateDistance(event) {
  event.preventDefault();
  var origin = document.querySelector('#startingDestination').value;
  var destination = document.querySelector('#endingDestination').value;
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING
    },
    displayDistance
  )
}

//callback of the calculations done above
function displayDistance(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    document.getElementById("distanceTravel").innerHTML(error);
  }
  else {
    var origin = response.originAddresses[0];
    console.log(origin);
    var destination = response.destinationAddresses[0];
    console.log(destination);
    if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
      document.getElementById("distanceTravel").textContent = "Better get on a plane since there is no road between your two locations!";
    }
    else {
      var distance = response.rows[0].elements[0].distance;
      console.log(distance);
      var duration = response.rows[0].elements[0].duration;
      console.log(duration);
      console.log(response.rows[0].elements[0].distance);
      var distance_in_mile = distance.value / 1609.34;
      console.log(distance_in_mile);
      var duration_text = duration.text;
      document.getElementById("distanceTravel").textContent = "Distance in Miles: " + distance_in_mile.toFixed(2);
      document.getElementById("durationTravel").textContent = "Duration in Minutes: " + duration_text;
    }
  }
}

document.querySelector('#btn').addEventListener('click', calculateDistance);


//the circle object
let areaCircle;

//function to draw a circle around the end destination
function createCircle(event) {
  event.preventDefault();

  //clear the areaCircle prior to creating a new one
  if (areaCircle) {
    areaCircle.setMap(null);
  }

  //create a geocoder object
  let geocoder = new google.maps.Geocoder();

  //retrieve the end destination from the input
  let location = document.querySelector('#endingDestination').value;

  let latitude;
  let longitude;

  //use geocoder to get the latitude and longitude values
  geocoder.geocode({ 'address': location }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();

      areaCircle = new google.maps.Circle({
        strokeColor: '#457b9d',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#a8dadc',
        fillOpacity: 0.35,
        map: map,
        center: { lat: latitude, lng: longitude },
        radius: 8047,  //8047 meters --> 5 miles
      });

      areaCircle.setMap(map);
    }
  });
}

document.querySelector('#btn').addEventListener('click', createCircle);

function getPlaces(event) {
  event.preventDefault();

  let location = document.getElementById('endingDestination').value;

  //create a geocoder object
  let geocoder = new google.maps.Geocoder();

  //use geocoder to get the latitude and longitude values
  geocoder.geocode({ 'address': location }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      let latitude = results[0].geometry.location.lat();
      let longitude = results[0].geometry.location.lng();

      let latlng = new google.maps.LatLng(latitude, longitude);

      let request = {
        location: latlng,
        radius: 8047,
        type: ['tourist_attraction']
      }

      console.log(request);

      placesService.nearbySearch(request, function (results, status) {
        console.log('test');
        if (status == 'OK') {
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
          }
        }
      });
    }
  });
}

function createMarker(result) {
  let resultLocation = result.geometry.location;
  let marker = new google.maps.Marker({
    map: map,
    position: resultLocation,
    icon: {
      url: "https://img.icons8.com/stickers/100/000000/where.png",
      scaledSize: new google.maps.Size(40, 40)
    }
  });

  let resultInfoWindow = new google.maps.InfoWindow({
    content: result.name
  })

  marker.addListener('click', () => {
    resultInfoWindow.open(map, marker);
  })
}


document.querySelector('#btn').addEventListener('click', getPlaces);
