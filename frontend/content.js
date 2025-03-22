function extractVideoUrls() {
    let videoLinks = document.querySelectorAll("#video-title");
    if (videoLinks.length === 0) {
        console.log("No video links found yet, retrying...");
        setTimeout(extractVideoUrls, 2000);  // Try again in 2 seconds
        return;
    }

    let urls = [...videoLinks].map(el => {
        let anchor = el.closest('a');
        return anchor ? anchor.href : null;
    }).filter(url => url !== null); // Remove nulls

    console.log("YouTube Homepage Video URLs:", urls);

}

window.addEventListener("load", () => {
    console.log("YouTube page loaded, extracting URLs...");
    setTimeout(extractVideoUrls, 2000);

});


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