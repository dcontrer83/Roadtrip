
//Google maps javascript
// also added a geolocation functionality to find the user's current location
// note: The user must enable the geolocation by clicking 'Allow' when it prompts
let map, infoWindow, directionService, directionsDisplay, placesService;

//Reference to the button element
let planBtn = document.querySelector('#btn');

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
planBtn.addEventListener('click', generateRoute);

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
    var destination = response.destinationAddresses[0];
    if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
      document.getElementById("distanceTravel").textContent = "Better get on a plane since there is no road between your two locations!";
    }
    else {
      var distance = response.rows[0].elements[0].distance;
      var duration = response.rows[0].elements[0].duration;
      var distance_in_mile = distance.value / 1609.34;
      var duration_text = duration.text;
      document.getElementById("distanceTravel").textContent = "Distance in Miles: " + distance_in_mile.toFixed(2);
      document.getElementById("durationTravel").textContent = "Duration: " + duration_text;
    }
  }
}

planBtn.addEventListener('click', calculateDistance);

//the circle object
let areaCircle;

//function to draw a circle around the end destination and initialize the page
function createCircle(event) {
  event.preventDefault();

  //clear the areaCircle prior to creating a new one
  if (areaCircle) {
    areaCircle.setMap(null);
  }

  //clear the previous markers
  if (markersArray.length) {
    clearMarkers(map);
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

planBtn.addEventListener('click', createCircle);

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

      placesService.nearbySearch(request, function (results, status) {
        if (status == 'OK') {
          for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
          }
        }
      });
    }
  });
}

// Create a marker array to store markers
let markersArray = [] || null;

//function which hides the markers and clears the marksers array
function clearMarkers(map) {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}

function createMarker(result) {
  //retrieve the lat/long values from the result.
  let resultLocation = result.geometry.location;

  //retrieve the placeID
  let placeID = result.place_id;

  //create a marker
  let marker = new google.maps.Marker({
    map: map,
    position: resultLocation,
    animation: google.maps.Animation.BOUNCE,
    icon: {
      url: "https://img.icons8.com/stickers/100/000000/where.png",
      scaledSize: new google.maps.Size(40, 40)
    }
  });

  //add the created marker to the markers array.
  markersArray.push(marker);

  //get the URL of the photo within the result
  let photo = result.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });

  //generate the content string
  let contentString =
    `<h1 class="marker-header"> ${result.name}</h1> \
    <div class="info-box"> \
        <img class="infoImg" src="${photo}"> \
    </div>`;

  //create an info window for each marker
  let resultInfoWindow = new google.maps.InfoWindow({
    content: contentString
  })

  //When a user clicks on a marker, open the info window
  marker.addListener('click', () => {
    resultInfoWindow.open(map, marker);
  })

  //Stop the bouncing animation after 2.5 seconds
  setTimeout(function () {
    marker.setAnimation(null);
  }, 2500);

}

document.querySelector('#btn').addEventListener('click', getPlaces);


//Refernce to the top 5 list contianer div
const topFiveListContianer = document.querySelector('#topFiveContainer');

//Reference to the top 5 list ul
const topFiveList = document.querySelector('#topFiveList');

//TODO: Function to create list items
function createListItems(result) {
  //use service.getDetails() to recieve the details.
  //retrieving the placeID of the current place
  let placeID = result.place_id;

  let request = {
    placeId: placeID,
    fields: ['name', 'rating', 'formatted_address', 'photos', "user_ratings_total"]
  }

  //create a service object
  service = new google.maps.places.PlacesService(map);

  //use service.getDetails() to recieve the details.
  service.getDetails(request, function (result, status) {
    if (status == 'OK') {
      console.log(result);
      let placeAddress = result.formatted_address;
      let placeName = result.name;
      let rating = result.rating;
      let totalRatings = result.user_ratings_total;
      console.log(totalRatings);
      let photo = result.photos[0].getUrl({ maxWidth: 500, maxHeight: 500 });

      //create a list element
      let li = document.createElement('li');
      li.classList.add('topFiveListItem');

      //create the container div
      let liContainer = document.createElement('div');
      liContainer.classList.add('t5ListItemContainer');

      //create the header
      let h3 = document.createElement('h3');
      h3.textContent = placeName;
      h3.classList.add("t5LocationHeader");
      liContainer.appendChild(h3);

      //create the rating paragraph if data exists
      if (rating) {
        let ratingPara = document.createElement('p');
        ratingPara.textContent = `Rating: ${rating}`;
        ratingPara.classList.add('ratingPara');
        liContainer.appendChild(ratingPara);
      }

      //create the total ratings paragraph if data exists.
      if (totalRatings) {
        let totalRatingsPara = document.createElement('p');
        totalRatingsPara.textContent = `Total Reviews: ${totalRatings}`;
        totalRatingsPara.classList.add('totalRatingPara');
        liContainer.appendChild(totalRatingsPara);
      }

      //create the address paragraph
      let addressPara = document.createElement('p');
      addressPara.textContent = placeAddress;
      addressPara.classList.add('addressPara');
      liContainer.appendChild(addressPara);

      //create a photo container div
      let placePhotoContainer = document.createElement('div');
      placePhotoContainer.classList.add('placePhotoContainer');
      let img = document.createElement('img');
      img.setAttribute('src', photo);
      img.classList.add('placePhoto');
      placePhotoContainer.appendChild(img);
      liContainer.appendChild(placePhotoContainer);

      topFiveList.appendChild(liContainer);
    }
  })

}

//Function to display the top 5 list container
function displayList(event) {
  event.preventDefault();

  // Remove any previously listed locations
  if (topFiveList.hasChildNodes()) {
    while (topFiveList.firstChild) {
      topFiveList.removeChild(topFiveList.firstChild);
    }
  }

  //Display the List Div
  topFiveListContianer.classList.remove('hidden');

  //Get the ending location
  let location = document.getElementById('endingDestination').value;

  //create a geocoder object
  let geocoder = new google.maps.Geocoder();

  //use geocoder to get the latitude and longitude values
  geocoder.geocode({ 'address': location }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      // Get the lat and long data values from the end destination.
      let latitude = results[0].geometry.location.lat();
      let longitude = results[0].geometry.location.lng();

      //Create a LatLng object for our request.
      let latlng = new google.maps.LatLng(latitude, longitude);

      let request = {
        location: latlng,
        radius: 8047,
        type: ['tourist_attraction']
      }

      //Use the nearby search function to create a list of top places
      placesService.nearbySearch(request, function (results, status) {
        console.log('test');
        if (status == 'OK') {
          //sort results by rating
          results.sort((resultA, resultB) => {
            return resultA.rating - resultB.rating;
          });

          //Results array is in ascending order, so change to descending order.
          //Do this to ensure the top 5 results are at the front of the array.
          results.reverse();

          //sort the ratings again in descending order;
          //Prior to sorting again, the results array would no longer be sorted in descending order after reversing. 
          //To fix this, we sort again in descending order.
          results.sort((resultA, resultB) => {
            return resultB.rating - resultA.rating;
          });

          for (let i = 0; i < 5; i++) {
            // createListItem(results[i])
            createListItems(results[i]);
          }
        }
      });
    }
  });
}

//add event listener
planBtn.addEventListener('click', displayList);