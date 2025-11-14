const content = document.getElementById("content");
const frontpage = document.getElementById("frontpage");
const header = document.getElementById("header");

function loadContent(item) {
    content.innerHTML = `
        <div class="content-card">
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <img src="${item.image}" alt="${item.title}">
        </div>
    `;
}

// FRONT PAGE → MAIN GUIDE
document.getElementById("enter-btn").onclick = () => {
    frontpage.style.animation = "fadeOut 0.8s forwards";
    setTimeout(() => {
        frontpage.style.display = "none";
        header.style.display = "flex";
    }, 800);
};
