/**
 * Enum for common colors.
 * @readonly
 * @enum {{name: string, hex: string}}
 */
const affect = Object.freeze({
    POSITIVE:   { name: "positive", color: "#B8E6D0" },
    NEGATIVE:  { name: "negative", color: "#F9C6C6" },
    NEUTRAL: { name: "neutral", color: "#D8E6F3" }
});

const MainTab = "cur_rec_data";

//------------------------------ PLACEHOLDER DATA ----------------------------

const topData = [
    {topic: "Climate Change", num_hits: 234},
    {topic: "Sports", num_hits: 189},
    {topic: "TV and Movies", num_hits: 136},
    {topic: "Finance", num_hits: 89},
    {topic: "Politics", num_hits: 37},
]



const sentimentData = [
    {   topic: "Climate Change",
        timeframe: "**Last 2 days",
        sentiments: [
            {sentiment: "Positive", percentage: 10, color: "#B8E6D0"},
            {sentiment: "Negative", percentage: 80, color: "#F9C6C6"},
            {sentiment: "Neutral", percentage: 10, color: "#D8E6F3"}
        ]},
        {  topic: "Sports",
            timeframe: "**Last 2 days",
            sentiments: [
                {sentiment: "Positive", percentage: 60, color: "#B8E6D0"},
                {sentiment: "Negative", percentage: 30, color: "#F9C6C6"},
                {sentiment: "Neutral", percentage: 10, color: "#D8E6F3"}
            ]
        },
        {  topic: "TV and Movies",
            timeframe: "**Last 2 days",
            sentiments: [
                {sentiment: "Positive", percentage: 70, color: "#B8E6D0"},
                {sentiment: "Negative", percentage: 10, color: "#F9C6C6"},
                {sentiment: "Neutral", percentage: 20, color: "#D8E6F3"}
            ]
        }


];

// ------------------------ REAL DATA -----------------

//-------------------------- TOP CONTENT --------------------------------
// Function to retrieve stored computations from chrome.storage
// Function to retrieve topicCounts from chrome.storage
function getTopicCountsPromise() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ topicCounts: {} }, function (result) {
            resolve(result.topicCounts || {}); // Ensuring we always return an object
        });
    });
}

// Wait until the DOM is fully loaded before executing
document.addEventListener('DOMContentLoaded', async function () {
    const container = document.querySelector('#cur_top');

    // Retrieve topic counts asynchronously
    let topicCounts = await getTopicCountsPromise();

    // Handle case where no data is found
    if (!topicCounts || Object.keys(topicCounts).length === 0) {
        console.log("No topic count data available.");
        return; // Stop execution if no data
    }

    console.log("Retrieved topic counts:", topicCounts); // Debugging

    let count = 1;

    Object.entries(topicCounts).forEach(([topic, num_hits]) => {
        // Create the main card container
        const div = document.createElement('div');
        div.classList.add('card-gen', 'top-card');
        div.classList.add(count % 2 !== 0 ? 'odd' : 'even');

        // Create the header section
        const header = document.createElement('div');
        header.classList.add('card-header');

        // Create topic pill element
        const topic_pill = document.createElement('div');
        topic_pill.classList.add('topic-pill');
        topic_pill.innerHTML = `${topic}`; // Use topic as the title

        // Create number of hits element
        const num_hits_elem = document.createElement('div');
        num_hits_elem.classList.add('timeframe');
        num_hits_elem.innerHTML = `${num_hits} videos`; // Use num_hits as count

        // Append elements together
        header.appendChild(topic_pill);
        header.appendChild(num_hits_elem);
        div.appendChild(header);
        container.appendChild(div);

        count++;
    });
});


//--------------------------- BREAKDOWN --------------------------------
// TO CREATE THE CONTENT BREAKDOWN CARDS
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('#cur_breakdown');
    sentimentData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('card-gen', 'sentiment-card');

        const header = document.createElement('div');
        header.classList.add('card-header');

        const topic_pill = document.createElement('div');
        topic_pill.classList.add('topic-pill');
        topic_pill.innerHTML = `${item.topic}`;

        const timeframe = document.createElement('div');
        timeframe.classList.add('timeframe');
        timeframe.innerHTML = `${item.timeframe}`;

        header.appendChild(topic_pill)
        header.appendChild(timeframe)

        const content = document.createElement('div');
        content.classList.add('card-content');

        const chart_cont = document.createElement('div');
        chart_cont.classList.add('chart-container');
        chart_cont.id = "donutChart"

        const legend = document.createElement('div');
        legend.classList.add('legend');

        content.appendChild(chart_cont)
        content.appendChild(legend)

        div.appendChild(header);
        div.appendChild(content);
        container.appendChild(div);

        createDonutChart(item, chart_cont);
        createLegend(item, legend);
    });
});
// HELPER FUNCTIONS
function createDonutChart(item, container) {
    const chartContainer = container;

    // Chart dimensions
    const size = 160;
    const thickness = 30;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness / 2;
    const gapAngle = 0.03; // Small gap between segments (in radians)

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${size}`);
    svg.setAttribute("height", `${size}`);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    let startAngle = -Math.PI / 2; // Start from the top (12 o'clock position)

    // Create donut segments
    item.sentiments.forEach((item, index) => {
        // Calculate the angle for this segment (minus the gap)
        const segmentAngle = (item.percentage / 100) * 2 * Math.PI - gapAngle;
        const endAngle = startAngle + segmentAngle;

        // Calculate path coordinates
        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);

        // Determine if the arc should be drawn as a large arc
        const largeArcFlag = item.percentage > 50 ? 1 : 0;

        // Create path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Define the path
        const d = [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L ${centerX + (radius - thickness) * Math.cos(endAngle)} ${centerY + (radius - thickness) * Math.sin(endAngle)}`,
            `A ${radius - thickness} ${radius - thickness} 0 ${largeArcFlag} 0 ${centerX + (radius - thickness) * Math.cos(startAngle)} ${centerY + (radius - thickness) * Math.sin(startAngle)}`,
            'Z'
        ].join(' ');

        path.setAttribute("d", d);
        path.setAttribute("fill", item.color);

        // Add animation
        path.style.opacity = "0";
        path.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        path.style.transformOrigin = "center";
        path.style.transform = "scale(0.9)";

        svg.appendChild(path);

        // Trigger animation after a small delay
        setTimeout(() => {
            path.style.opacity = "1";
            path.style.transform = "scale(1)";
        }, 100 * index);

        // Update start angle for next segment (adding the gap)
        startAngle = endAngle + gapAngle;
    });

    chartContainer.appendChild(svg);
}
function createLegend(item, legend) {
    const legendContainer = legend;

    item.sentiments.forEach((item, index) => {
        // Create legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.style.animationDelay = `${0.5 + (index * 0.1)}s`;

        // Create color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'legend-color';
        colorIndicator.style.backgroundColor = item.color;

        // Create label with sentiment
        const label = document.createElement('span');
        label.className = 'legend-label';
        label.textContent = `${item.sentiment}: `;

        // Create percentage value
        const value = document.createElement('span');
        value.className = 'legend-value';
        value.textContent = `${item.percentage}%`;

        // Append all elements
        legendItem.appendChild(colorIndicator);
        legendItem.appendChild(label);
        legendItem.appendChild(value);
        legendContainer.appendChild(legendItem);
    });
}

//------------ TABS --------------
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".tablinks").forEach(button => {
        button.addEventListener("click", function (event) {
            var tabName = this.getAttribute("data-tab"); // Get tab id from data attribute
            openTab(event, tabName);
        });
        if (button.getAttribute("data-tab") === MainTab) {
            document.querySelector("#cur_rec_data").style.display = "flex";
            button.classList.add("active");
        }
    });
});
function openTab(evt, tabName) {
    var tabElement = document.getElementById(tabName);

    if (!tabElement) {
        console.error(`Element with id "${tabName}" not found.`);
        return; // Prevents errors if the ID is wrong or missing
    }

    // Hide all tab content
    document.querySelectorAll(".tabcontent").forEach(tab => {
        tab.style.display = "none";
    });

    // Remove "active" class from all tab buttons
    document.querySelectorAll(".tablinks").forEach(tab => {
        tab.classList.remove("active");
    });

    // Show selected tab and mark button as active
    tabElement.style.display = "flex";
    evt.currentTarget.classList.add("active");
}








/*
// JS TEST SCRIPT FOR FLASK MODEL PREDICTION
document.addEventListener("DOMContentLoaded", function () {
    const predictButton = document.querySelector("#predictButton");
    const resultDiv = document.querySelector("#result");

    if (predictButton && resultDiv) {
        predictButton.addEventListener("click", async function () {
            const inputValue = document.querySelector("#inputValue").value;

            try {
                const response = await fetch("http://127.0.0.1:5000/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: inputValue })
                });

                const data = await response.json();

                // Display the prediction result
                if (data.prediction) {
                    resultDiv.innerText = `Prediction: ${data.prediction}`;
                } else {
                    resultDiv.innerText = "Error getting prediction.";
                }
            } catch (error) {
                console.error("Error fetching prediction:", error);
                resultDiv.innerText = "Error getting prediction.";
            }
        });
    }
}); */

