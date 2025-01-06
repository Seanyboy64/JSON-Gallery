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

  function swapPhoto() {
    // Ensure there are images available to swap
    if (mImages.length > 0) {
      // Access the <img> element inside #slideShow
      var imageElement = document.querySelector('#slideShow img');
      // Get the current GalleryImage based on mCurrentIndex
      var nextImage = mImages[mCurrentIndex];

      // Update the image source with the new image from the GalleryImage object
      imageElement.src = nextImage.imgPath;

      // Update the details section with information from the GalleryImage
      var detailsElement = document.querySelector('#slideShow .details');
      detailsElement.querySelector('.location').textContent = "Location: " + nextImage.imgLocation;
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

  // Array holding GalleryImage objects
  var mImages = [];

  // Holds the retrieved JSON information
  var mJson;

  // URL for the JSON to load by default
  var mUrl = 'images.json'; // Replace this with the actual path to your JSON file

  // Function to fetch JSON data
  function fetchJSON(url, callback) {
    // Open a GET request for the provided URL
    mRequest.open('GET', url, true);

    // Set the function to handle the response
    mRequest.onreadystatechange = function() {
      // Check if the request has completed (readyState 4)
      if (mRequest.readyState === 4) {
        // Check if the request was successful (status 200)
        if (mRequest.status === 200) {
          try {
            // Parse the JSON response text
            mJson = JSON.parse(mRequest.responseText);

            // Call the provided callback function with the parsed JSON data
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

    // Send the request
    mRequest.send();
  }

  // jQuery document ready function
  $(document).ready(function() {
    // Initially hide the photos' metadata information
    $('.details').eq(0).hide();

    // Set up next and previous navigation functionality
    $('#nextPhoto').click(function() {
      mCurrentIndex = (mCurrentIndex + 1) % mImages.length;
      swapPhoto();
    });

    $('#prevPhoto').click(function() {
      mCurrentIndex = (mCurrentIndex - 1 + mImages.length) % mImages.length;
      swapPhoto();
    });
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
        var galleryImage = {
          imgPath: imageData.imgPath,
          imgLocation: imageData.imgLocation,
          description: imageData.description,
          date: imageData.date
        };

        // Add the GalleryImage object to the array
        mImages.push(galleryImage);
      });

      // Start the slideshow by displaying the first image
      swapPhoto();
    });
  }, false);
