function isYouTubeHomepage() {
    return location.hostname === "www.youtube.com" && location.pathname === "/";
}

async function extractVideoUrls() {
    if (!isYouTubeHomepage()) {
        console.log("Not on YouTube homepage, stopping execution.");
        return;
    }

    let videoLinks = document.querySelectorAll("#video-title");
    if (videoLinks.length === 0) {
        console.log("No video links found yet, retrying...");
        setTimeout(() => extractVideoUrls(), 2000);
        return;
    }

    let urls = [...videoLinks].map(el => {
        let anchor = el.closest('a');
        return anchor ? anchor.href : null;
    }).filter(url => url !== null);

    console.log("YouTube Homepage Video URLs:", urls);

    if (urls.length > 0) {
        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({input: urls})
            });

            const data = await response.json();

            if (data.prediction) {
                console.log(`Prediction: ${data.prediction}`);
            } else {
                console.log("Error getting prediction.");
            }
        } catch (error) {
            console.error("Error fetching prediction:", error);
        }
    }
}

window.addEventListener("load", () => {
    if (isYouTubeHomepage()) {
        console.log("YouTube homepage detected, extracting URLs...");
        setTimeout(() => extractVideoUrls(), 2000);
    } else {
        console.log("Not on YouTube homepage, script will not run.");
    }
});



// DATABASE STUFF
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