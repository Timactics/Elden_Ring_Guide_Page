const toggle = document.getElementById("menuToggle");

// Menü öffnen/schließen
toggle.onclick = () => {
    document.body.classList.toggle("menu-open");
};

// SUBMENÜS + JSON LADEN + EXTERNE LINKS
document.querySelectorAll(".menu-header").forEach(header => {

    const url = header.dataset.url;
    const submenu = header.nextElementSibling;

    // FALL 1: externer Link
    if (url) {
        header.addEventListener("click", () => {
            window.open(url, "_blank", "noopener,noreferrer");
            document.body.classList.remove("menu-open");
        });
        return;
    }

    // FALL 2: JSON-Datenladende Kategorien
    if (!submenu || !submenu.classList.contains("submenu")) return;

    header.addEventListener("click", async () => {
        const src = submenu.dataset.source;

        submenu.style.display =
            submenu.style.display === "block" ? "none" : "block";

        if (submenu.dataset.loaded === "1") return;

        const data = await fetch(src).then(r => r.json());
        submenu.dataset.loaded = "1";

        data.items.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item.title;
            li.onclick = () => {
                loadContent(item, src, index, data.items);
                document.body.classList.remove("menu-open");
            };
            submenu.appendChild(li);
        });
    });
});