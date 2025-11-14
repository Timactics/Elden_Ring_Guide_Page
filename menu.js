// BURGER MENU
const toggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");

toggle.onclick = () => {
    sideMenu.classList.toggle("open");
};

// SUBMENÜ LADEN
document.querySelectorAll(".menu-header").forEach(header => {
    header.addEventListener("click", async () => {
        const submenu = header.nextElementSibling;
        const src = submenu.dataset.source;

        // auf/zu klappen
        submenu.style.display =
            submenu.style.display === "block" ? "none" : "block";

        // schon geladen?
        if (submenu.dataset.loaded === "1") return;

        const data = await fetch(src).then(r => r.json());
        submenu.dataset.loaded = "1";

        data.items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.title;
            li.onclick = () => {
                loadContent(item);
                sideMenu.classList.remove("open"); // Menü wieder zuklappen
            };
            submenu.appendChild(li);
        });
    });
});
