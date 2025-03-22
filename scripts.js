const container = document.querySelector('.data');

// PLACEHOLDER DATA
const data = [
    { title: "Topic 1", percent: 25 },
    { title: "Topic 2", percent: 50 },
    { title: "Topic 3", percent: 75 }
];

data.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('item');

    const title = document.createElement('h3');
    title.innerHTML = `<span class="title">${item.title}</span>`;
    title.classList.add('topics');

    const percentBox = document.createElement('p');
    percentBox.classList.add('percent-box');
    percentBox.textContent = `${item.percent}%`;

    div.appendChild(title);
    div.appendChild(percentBox);
    container.appendChild(div);
});
