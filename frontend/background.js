chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "classifyVideos" && Array.isArray(message.urls)) {
    console.log("🌐 [background.js] Received URLs to classify:", message.urls);

    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: message.urls })
    })
    .then(res => {
      console.log("📡 [background.js] Response status:", res.status);
      if (!res.ok) throw new Error("Prediction request failed");
      return res.json();
    })
    .then(data => {
      console.log("🧠 [background.js] Prediction response from Flask:", data);

      if (data.prediction) {
        console.log("📬 [background.js] Sending predictionResult to content.js");
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "predictionResult",
          data: data.prediction
        });
      } else {
        console.error("❌ [background.js] No prediction field in response:", data);
      }
    })
    .catch(error => {
      console.error("❌ [background.js] Error fetching prediction:", error);
    });
  }
});