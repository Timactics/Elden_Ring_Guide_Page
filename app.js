const content = document.getElementById("content");
const frontpage = document.getElementById("frontpage");

// globale Navigation
let currentCategory = null;
let currentIndex = null;
let currentList = null;

// CONTENT LADEN + NAVIGATION
function loadContent(item, categoryName = null, index = null, list = null) {

    if (categoryName !== null) currentCategory = categoryName;
    if (index !== null) currentIndex = index;
    if (list !== null) currentList = list;

    content.innerHTML = `
        <div class="content-card">
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <img src="${item.image}" alt="${item.title}">
        </div>

        <div class="nav-buttons">
            <button id="prevBtn">◀ Vorherige</button>
            <button id="nextBtn">Nächste ▶</button>
        </div>
    `;

    document.getElementById("prevBtn").onclick = () => navigate(-1);
    document.getElementById("nextBtn").onclick = () => navigate(1);
}

// NAVIGATION HANDLER
function navigate(direction) {
    if (!currentList || currentIndex === null) return;

    let newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= currentList.length) return;

    let nextItem = currentList[newIndex];

    loadContent(nextItem, currentCategory, newIndex, currentList);
}

// FRONT PAGE entfernen
document.getElementById("enter-btn").onclick = () => {
    frontpage.style.animation = "fadeOut 0.8s forwards";
    setTimeout(() => {
        frontpage.style.display = "none";
    }, 800);
};