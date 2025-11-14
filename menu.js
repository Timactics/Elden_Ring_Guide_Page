// BURGER
const toggle = document.getElementById("menuToggle");
const menu = document.getElementById("sideMenu");

toggle.onclick = () => menu.classList.toggle("open");

// Unterpunkte öffnen & JSON laden
document.querySelectorAll(".menu-header").forEach(header => {

    header.addEventListener("click", async () => {

        const submenu = header.nextElementSibling;
        submenu.style.display =
            submenu.style.display === "block" ? "none" : "block";

        const src = submenu.dataset.source;

        if (submenu.dataset.loaded === "1") return;

        const data = await fetch(src).then(r => r.json());
        submenu.dataset.loaded = "1";

        data.items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.title;
            li.onclick = () => loadContent(item);
            submenu.appendChild(li);
        });
    });

});
