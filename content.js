function extractTitles() {
    let videoElements = document.querySelectorAll("#video-title");
    if (videoElements.length === 0) {
        console.log("No videos found yet, retrying...");
        setTimeout(extractTitles, 2000);  // Try again in 2 seconds
        return;
    }

    let titles = [...videoElements].map(el => el.innerText.trim());
    console.log("YouTube Homepage Titles:", titles);
}

window.addEventListener("load", () => {
    console.log("YouTube page loaded, extracting titles...");
    setTimeout(extractTitles, 2000); // Delay to allow dynamic loading
});
