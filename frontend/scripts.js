const affect = Object.freeze({
    POSITIVE: { name: "positive", color: "#B8E6D0" },
    NEGATIVE: { name: "negative", color: "#F9C6C6" },
    NEUTRAL: { name: "neutral", color: "#D8E6F3" }
});

const MainTab = "cur_rec_data";

// ------------------------ REAL DATA ------------------------
function getTopicCountsPromise() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ topicCounts: {} }, function (result) {
            resolve(result.topicCounts || {});
        });
    });
}

// ------------------------- SESSION CONTENT ------------------------
let currSessionResults = {};

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateSessionResults") {
        currSessionResults = message.data;
        console.log("Current Session Results updated:", currSessionResults);

        const container = document.querySelector("#cur_top");
        container.innerHTML = "";

        if (!currSessionResults || Object.keys(currSessionResults).length === 0) return;

        let count = 1;

        Object.entries(currSessionResults).forEach(([topic, num_hits]) => {
            const div = document.createElement("div");
            div.classList.add("card-gen", "top-card");
            div.classList.add(count % 2 !== 0 ? "odd" : "even");

            const header = document.createElement("div");
            header.classList.add("card-header");

            const topic_pill = document.createElement("div");
            topic_pill.classList.add("topic-pill");
            topic_pill.innerHTML = `${topic}`;

            const num_hits_elem = document.createElement("div");
            num_hits_elem.classList.add("timeframe");
            num_hits_elem.innerHTML = `${num_hits} videos`;

            header.appendChild(topic_pill);
            header.appendChild(num_hits_elem);
            div.appendChild(header);
            container.appendChild(div);

            count++;
        });
    }
});

// -------------------------- HISTORICAL DATA ------------------------
document.addEventListener("DOMContentLoaded", async function () {
    const container = document.querySelector("#his_top");
    let topicCounts = await getTopicCountsPromise();

    if (!topicCounts || Object.keys(topicCounts).length === 0) {
        console.log("No topic count data available.");
        return;
    }

    let count = 0;

    Object.entries(topicCounts).forEach(([topic, num_hits]) => {
        // ✅ Skip if num_hits is not a number (malformed entry)
        if (typeof num_hits !== "number") return;

        const div = document.createElement("div");
        div.classList.add("card-gen", "top-card");
        div.classList.add(count % 2 !== 0 ? "odd" : "even");

        const header = document.createElement("div");
        header.classList.add("card-header");

        const topic_pill = document.createElement("div");
        topic_pill.classList.add("topic-pill");
        topic_pill.innerHTML = `${topic}`;

        const num_hits_elem = document.createElement("div");
        num_hits_elem.classList.add("timeframe");
        num_hits_elem.innerHTML = `${num_hits} videos`;

        header.appendChild(topic_pill);
        header.appendChild(num_hits_elem);
        div.appendChild(header);
        container.appendChild(div);

        count++;
    });
});

// --------------------------- SENTIMENT BREAKDOWN ---------------------------
document.addEventListener("DOMContentLoaded", () => {
    reloadSentimentBreakdown();
});

function reloadSentimentBreakdown() {
    const container = document.querySelector("#cur_breakdown");
    container.innerHTML = "";

    chrome.storage.local.get("sentimentData", (data) => {
        const sentimentData = data.sentimentData || {};

        Object.entries(sentimentData).forEach(([topic, stats]) => {
            const count = stats.count || 1;

            const avgPositive = parseFloat((stats.positive_total / count).toFixed(2));
            const avgNegative = parseFloat((stats.negative_total / count).toFixed(2));
            const avgNeutral = parseFloat((stats.neutral_total / count).toFixed(2));

            const item = {
                topic: topic,
                timeframe: "*Last 2 days",
                sentiments: [
                    { sentiment: "Positive", percentage: avgPositive, color: affect.POSITIVE.color },
                    { sentiment: "Negative", percentage: avgNegative, color: affect.NEGATIVE.color },
                    { sentiment: "Neutral", percentage: avgNeutral, color: affect.NEUTRAL.color }
                ]
            };

            const div = document.createElement("div");
            div.classList.add("card-gen", "sentiment-card");

            const header = document.createElement("div");
            header.classList.add("card-header");

            const topic_pill = document.createElement("div");
            topic_pill.classList.add("topic-pill");
            topic_pill.innerHTML = `${item.topic}`;

            const timeframe = document.createElement("div");
            timeframe.classList.add("timeframe");
            timeframe.innerHTML = `${item.timeframe}`;

            header.appendChild(topic_pill);
            header.appendChild(timeframe);

            const content = document.createElement("div");
            content.classList.add("card-content");

            const chart_cont = document.createElement("div");
            chart_cont.classList.add("chart-container");
            chart_cont.id = "donutChart";

            const legend = document.createElement("div");
            legend.classList.add("legend");

            content.appendChild(chart_cont);
            content.appendChild(legend);
            div.appendChild(header);
            div.appendChild(content);
            container.appendChild(div);

            createDonutChart(item, chart_cont);
            createLegend(item, legend);
        });
    });
}

function createDonutChart(item, container) {
    const size = 160;
    const thickness = 30;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness / 2;
    const gapAngle = 0.03;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${size}`);
    svg.setAttribute("height", `${size}`);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    let startAngle = -Math.PI / 2;

    item.sentiments.forEach((item, index) => {
        const segmentAngle = (item.percentage / 100) * 2 * Math.PI - gapAngle;
        const endAngle = startAngle + segmentAngle;

        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        const largeArcFlag = item.percentage > 50 ? 1 : 0;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const d = [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L ${centerX + (radius - thickness) * Math.cos(endAngle)} ${centerY + (radius - thickness) * Math.sin(endAngle)}`,
            `A ${radius - thickness} ${radius - thickness} 0 ${largeArcFlag} 0 ${centerX + (radius - thickness) * Math.cos(startAngle)} ${centerY + (radius - thickness) * Math.sin(startAngle)}`,
            "Z"
        ].join(" ");

        path.setAttribute("d", d);
        path.setAttribute("fill", item.color);
        path.style.opacity = "0";
        path.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        path.style.transformOrigin = "center";
        path.style.transform = "scale(0.9)";

        svg.appendChild(path);

        setTimeout(() => {
            path.style.opacity = "1";
            path.style.transform = "scale(1)";
        }, 100 * index);

        startAngle = endAngle + gapAngle;
    });

    container.appendChild(svg);
}

function createLegend(item, legend) {
    item.sentiments.forEach((item, index) => {
        const legendItem = document.createElement("div");
        legendItem.className = "legend-item";
        legendItem.style.animationDelay = `${0.5 + index * 0.1}s`;

        const colorIndicator = document.createElement("div");
        colorIndicator.className = "legend-color";
        colorIndicator.style.backgroundColor = item.color;

        const label = document.createElement("span");
        label.className = "legend-label";
        label.textContent = `${item.sentiment}: `;

        const value = document.createElement("span");
        value.className = "legend-value";
        value.textContent = `${item.percentage}%`;

        legendItem.appendChild(colorIndicator);
        legendItem.appendChild(label);
        legendItem.appendChild(value);
        legend.appendChild(legendItem);
    });
}

// ------------------------ TABS ------------------------

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".tablinks").forEach(button => {
        button.addEventListener("click", function (event) {
            const tabName = this.getAttribute("data-tab");
            openTab(event, tabName);
        });

        if (button.getAttribute("data-tab") === MainTab) {
            document.querySelector("#cur_rec_data").style.display = "flex";
            button.classList.add("active");
        }
    });
});

function openTab(evt, tabName) {
    const tabElement = document.getElementById(tabName);

    if (!tabElement) {
        console.error(`Element with id "${tabName}" not found.`);
        return;
    }

    document.querySelectorAll(".tabcontent").forEach(tab => {
        tab.style.display = "none";
    });

    document.querySelectorAll(".tablinks").forEach(tab => {
        tab.classList.remove("active");
    });

    tabElement.style.display = "flex";
    evt.currentTarget.classList.add("active");
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "sentimentUpdated") {
        console.log("🔁 [scripts.js] Detected sentimentUpdated, reloading breakdown...");
        reloadSentimentBreakdown();
    }
});