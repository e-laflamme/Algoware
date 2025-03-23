function isYouTubeHomepage() {
    return location.hostname === "www.youtube.com" && location.pathname === "/";
  }
  
  function extractVideoUrls() {
    let videoLinks = document.querySelectorAll("#video-title");
    let urls = [...videoLinks]
      .map(el => el.closest("a")?.href)
      .filter(url => url);
  
    console.log("YouTube Homepage Video URLs:", urls);
  
    chrome.runtime.sendMessage({ action: "classifyVideos", urls: urls });
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "predictionResult") {
      const result = message.data;
      console.log("📊 Topic Predictions:", result);
      updateLocalCounts(result);
    }
  });
  
  function updateLocalCounts(newCounts) {
    chrome.storage.sync.get({ topicCounts: {} }, (data) => {
      let updated = data.topicCounts || {};
  
      for (const topic in newCounts) {
        updated[topic] = (updated[topic] || 0) + newCounts[topic];
      }
  
      chrome.storage.sync.set({ topicCounts: updated }, () => {
        console.log("🧠 Updated topic counts:", updated);
      });
    });
  }
  
  window.addEventListener("load", () => {
    if (isYouTubeHomepage()) {
      console.log("🏠 YouTube homepage detected, scanning...");
      setTimeout(extractVideoUrls, 2000);
    }
  });

// DATABASE STUFF
// Local storage functions (unchanged)
function saveComputation(data) {
    chrome.storage.sync.get({ computations: [] }, function (result) {
        let computations = result.computations || [];

        computations.push({
            date: new Date().toISOString(),
            result: data
        });

        chrome.storage.sync.set({ computations: computations }, function () {
            console.log("Computation saved!");
        });
    });
}

function getComputations(callback) {
    chrome.storage.sync.get({ computations: [] }, function (result) {
        callback(result.computations || []);
    });
}

// To access use:  getComputations(console.log);
getComputations(console.log);