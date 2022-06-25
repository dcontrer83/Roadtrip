
//Google maps javascript
// also added a geolocation functionality to find the user's current location
// note: The user must enable the geolocation by clicking 'Allow' when it prompts
let map, infoWindow, directionService, directionsDisplay;

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

  console.log(request);

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

document.querySelector('#btn').addEventListener('click', generateRoute);

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