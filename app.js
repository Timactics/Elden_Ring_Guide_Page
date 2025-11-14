const content = document.getElementById("content");

function loadContent(item) {
    content.innerHTML = `
        <div class="content-card">
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <img src="${item.image}" alt="${item.title}">
        </div>
    `;
}
