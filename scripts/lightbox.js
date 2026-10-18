// Fullscreen image viewer for project and research galleries.
(function () {
    const images = Array.from(document.querySelectorAll(".gallery img"));
    if (!images.length) return;

    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", "Image viewer");
    dialog.innerHTML = `
        <figure class="lightbox-figure">
            <img class="lightbox-img" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <span class="lightbox-count" aria-live="polite"></span>
        <button class="lightbox-btn lightbox-close" type="button" aria-label="Close">&times;</button>
        <button class="lightbox-btn lightbox-full" type="button" aria-label="Full screen">&#x26F6;</button>
        <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image">&#8249;</button>
        <button class="lightbox-btn lightbox-next" type="button" aria-label="Next image">&#8250;</button>`;
    document.body.appendChild(dialog);

    const view = dialog.querySelector(".lightbox-img");
    const caption = dialog.querySelector(".lightbox-caption");
    const count = dialog.querySelector(".lightbox-count");
    const multi = images.length > 1;
    dialog.querySelector(".lightbox-prev").hidden = !multi;
    dialog.querySelector(".lightbox-next").hidden = !multi;
    let index = 0;

    function show(i) {
        index = (i + images.length) % images.length;
        const img = images[index];
        // currentSrc follows the dark-mode <picture> source when it is active
        view.src = img.currentSrc || img.src;
        view.alt = img.alt;
        const cap = img.closest("figure")?.querySelector("figcaption");
        caption.textContent = cap ? cap.textContent : "";
        count.textContent = multi ? `${index + 1} / ${images.length}` : "";
    }

    function open(i) {
        show(i);
        if (!dialog.open) dialog.showModal();
        document.documentElement.classList.add("lightbox-open");
    }

    function close() {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        if (dialog.open) dialog.close();
    }

    dialog.addEventListener("close", () => document.documentElement.classList.remove("lightbox-open"));

    images.forEach((img, i) => {
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", `View full screen: ${img.alt || "image"}`);
        img.addEventListener("click", () => open(i));
        img.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
        });
    });

    dialog.querySelector(".lightbox-close").addEventListener("click", close);
    dialog.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
    dialog.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
    dialog.querySelector(".lightbox-full").addEventListener("click", () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else if (dialog.requestFullscreen) dialog.requestFullscreen().catch(() => {});
    });

    // Clicking the dark backdrop (not the image or a button) closes the viewer
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog || e.target.classList.contains("lightbox-figure")) close();
    });

    dialog.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && multi) show(index - 1);
        else if (e.key === "ArrowRight" && multi) show(index + 1);
    });

    // Swipe left/right on touch screens
    let startX = null;
    dialog.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", (e) => {
        if (startX === null || !multi) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        startX = null;
    });
})();
