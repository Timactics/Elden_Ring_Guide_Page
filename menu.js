// ELEMENTE
const toggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");

// BURGER → BODY-KLASSE UMSCHALTEN
toggle.onclick = () => {
    document.body.classList.toggle("menu-open");
};

// SUBMENÜS & EXTERNE LINKS
document.querySelectorAll(".menu-header").forEach(header => {
    const submenu = header.nextElementSibling;
    const url = header.dataset.url;

    // FALL 1: Externer Link (Mapgenie)
    if (url) {
        header.addEventListener("click", () => {
            window.open(url, "_blank", "noopener,noreferrer");
            document.body.classList.remove("menu-open"); // Menü wieder schließen
        });
        return;
    }

    // FALL 2: Normales Submenü mit JSON-Daten
    if (!submenu || !submenu.classList.contains("submenu")) return;

    header.addEventListener("click", async () => {
        const src = submenu.dataset.source;

        // auf / zu
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
                document.body.classList.remove("menu-open");
            };
            submenu.appendChild(li);
        });
    });
});