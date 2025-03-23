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

        // ✅ Send original topic prediction to content.js
        if (data.prediction) {
          console.log("📬 [background.js] Sending predictionResult to content.js");
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "predictionResult",
            data: data.prediction
          });
        } else {
          console.error("❌ [background.js] No prediction field in response:", data);
        }

        // ✅ Aggregate sentiment from results
        const videoResults = data.results || [];
        if (!videoResults.length) return;

        chrome.storage.local.get(["sentimentData"], (store) => {
          const sentimentData = store.sentimentData || {};

          videoResults.forEach((video) => {
            const topic = video.topic;
            const sentiment = video.sentiment;

            if (!sentimentData[topic]) {
              sentimentData[topic] = {
                count: 0,
                positive_total: 0,
                negative_total: 0,
                neutral_total: 0
              };
            }

            sentimentData[topic].count += 1;
            sentimentData[topic].positive_total += sentiment.positive;
            sentimentData[topic].negative_total += sentiment.negative;
            sentimentData[topic].neutral_total += sentiment.neutral;

            console.log(`📊 [background.js] Aggregated for '${topic}':`, sentimentData[topic]);
          });

          chrome.storage.local.set({ sentimentData }, () => {
            console.log("✅ [background.js] Stored updated sentiment data");
            chrome.storage.local.get("sentimentData", console.log);
            chrome.runtime.sendMessage({ type: "sentimentUpdated" });
          });
        });
      })
      .catch(error => {
        console.error("❌ [background.js] Error fetching prediction:", error);
      });
  }
});