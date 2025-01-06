// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

animate();

var mLastFrameTime = 0;
var mWaitTime = 5000; // Time in ms
function animate() {
  requestAnimFrame(animate);
  var currentTime = new Date().getTime();
  if (mLastFrameTime === 0) {
    mLastFrameTime = currentTime;
  }

  if ((currentTime - mLastFrameTime) > mWaitTime) {
    swapPhoto();
    mLastFrameTime = currentTime;
  }
}

/************* DO NOT TOUCH CODE ABOVE THIS LINE ***************/

// Swap the photo to the next one in the gallery
function swapPhoto() {
  if (mImages.length > 0) {
    var imageElement = document.querySelector('#slideShow img');
    var nextImage = mImages[mCurrentIndex];

    // Update the image source with the new image from the GalleryImage object
    imageElement.src = nextImage.img.src;

    // Update the details section with information from the GalleryImage
    var detailsElement = document.querySelector('#slideShow .details');
    detailsElement.querySelector('.location').textContent = "Location: " + nextImage.location;
    detailsElement.querySelector('.description').textContent = "Description: " + nextImage.description;
    detailsElement.querySelector('.date').textContent = "Date: " + nextImage.date;

    // Increment the index and loop back to the first image when reaching the end
    mCurrentIndex = (mCurrentIndex + 1) % mImages.length;
  }
}

// Counter for the mImages array
var mCurrentIndex = 0;

// XMLHttpRequest variable
var mRequest = new XMLHttpRequest();

// Array holding GalleryImage objects (see below)
var mImages = [];

// Holds the retrieved JSON information
var mJson;

// URL for the JSON to load by default
var mUrl = 'images.json'; // Replace this with the actual path to your JSON file

// Function to fetch JSON data
function fetchJSON(url, callback) {
  mRequest.open('GET', url, true);

  mRequest.onreadystatechange = function() {
    if (mRequest.readyState === 4) {
      if (mRequest.status === 200) {
        try {
          mJson = JSON.parse(mRequest.responseText);
          callback(null, mJson);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          callback(error, null);
        }
      } else {
        console.error('Request failed. Status:', mRequest.status);
        callback(new Error('Request failed with status ' + mRequest.status), null);
      }
    }
  };

  mRequest.send();
}

// Function to handle image loading
function makeGalleryImageOnloadCallback(galleryImage) {
  return function(e) {
    galleryImage.img = e.target;
    mImages.push(galleryImage); // Add the GalleryImage object to the array
  };
}

// jQuery document ready function
$(document).ready(function() {
  // Initially hides the photos' metadata information
  $('.details').eq(0).hide();
});

// Load JSON data and initialize the image gallery
window.addEventListener('load', function() {
  console.log('window loaded');

  // Fetch the JSON data using fetchJSON
  fetchJSON(mUrl, function(error, data) {
    if (error) {
      console.error('Error loading JSON:', error);
      return;
    }

    mJson = data;

    // Loop through the JSON data to create GalleryImage objects
    mJson.images.forEach(function(imageData) {
      var galleryImage = new GalleryImage(
        imageData.imgLocation,    // Location
        imageData.description,    // Description
        imageData.date,           // Date
        imageData.imgPath         // Image path (src)
      );

      // Create an image object and trigger the onload callback
      var img = new Image();
      img.onload = makeGalleryImageOnloadCallback(galleryImage);
      img.src = galleryImage.img; // Set the image source
    });
  });
}, false);

// Constructor for GalleryImage
function GalleryImage(location, description, date, imgSrc) {
  this.location = location || '';
  this.description = description || '';
  this.date = date || '';
  this.img = imgSrc || '';

  if (this.img) {
    this.img = new Image();
    this.img.src = imgSrc; // Set the image source
  }
}
