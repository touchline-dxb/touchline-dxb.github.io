document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================================
       TOUCHLINE SPORT ACADEMY
       Premium Website — Global JavaScript
       ========================================================= */

    const body = document.body;
    const header = document.getElementById("siteHeader");
    const progress = document.getElementById("scrollProgress");
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    /* =========================================================
       HEADER / SCROLL STATE
       ========================================================= */

    function updateHeader() {
        const scrollY = window.scrollY || window.pageYOffset;

        if (header) {
            header.classList.toggle("scrolled", scrollY > 40);
        }

        if (progress) {
            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            const scrollPercentage =
                documentHeight > 0 ? scrollY / documentHeight : 0;

            progress.style.transform = `scaleX(${scrollPercentage})`;
        }
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });


    /* =========================================================
       MOBILE MENU
       ========================================================= */

    function closeMobileMenu() {
        if (!mobileMenu || !menuToggle) return;

        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        body.classList.remove("menu-open");
    }

    function openMobileMenu() {
        if (!mobileMenu || !menuToggle) return;

        mobileMenu.classList.add("open");
        menuToggle.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");

        body.classList.add("menu-open");
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.contains("open");

            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                closeMobileMenu();
            });
        });
    }


    /* =========================================================
       ESCAPE KEY
       ========================================================= */

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });


    /* =========================================================
       SMOOTH SCROLL
       ========================================================= */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        });
    });


    /* =========================================================
       REVEAL ANIMATIONS
       ========================================================= */

    const revealElements =
        document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("is-visible");

                        observer.unobserve(entry.target);
                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -40px 0px"
                }
            );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

    }


    /* =========================================================
       BUTTON CLICK TRACKING
       ========================================================= */

    function trackEvent(name, data = {}) {

        if (typeof window.gtag === "function") {

            window.gtag(
                "event",
                name,
                data
            );

        }

        if (typeof window.fbq === "function") {

            window.fbq(
                "trackCustom",
                name,
                data
            );

        }
    }


    /* =========================================================
       REGISTRATION / TRIAL CTA TRACKING
       ========================================================= */

    document.querySelectorAll(
        'a[href*="/register"]'
    ).forEach((button) => {

        button.addEventListener("click", () => {

            trackEvent(
                "registration_cta_click",
                {
                    location:
                        button.textContent.trim()
                }
            );

        });

    });


    /* =========================================================
       WHATSAPP TRACKING
       ========================================================= */

    document.querySelectorAll(
        'a[href*="whatsapp"]'
    ).forEach((button) => {

        button.addEventListener("click", () => {

            trackEvent(
                "whatsapp_click",
                {
                    location:
                        button.textContent.trim()
                }
            );

        });

    });


    /* =========================================================
       PHONE CALL TRACKING
       ========================================================= */

    document.querySelectorAll(
        'a[href^="tel:"]'
    ).forEach((button) => {

        button.addEventListener("click", () => {

            trackEvent(
                "phone_call_click",
                {
                    location:
                        button.textContent.trim()
                }
            );

        });

    });


    /* =========================================================
       FORM UX
       Works with registration/enquiry forms
       ========================================================= */

    const forms =
        document.querySelectorAll("form");

    forms.forEach((form) => {

        const inputs =
            form.querySelectorAll(
                "input, select, textarea"
            );

        inputs.forEach((input) => {

            input.addEventListener("focus", () => {
                input.closest(".form-field, .field, .input-group")
                    ?.classList.add("is-focused");
            });

            input.addEventListener("blur", () => {
                input.closest(".form-field, .field, .input-group")
                    ?.classList.remove("is-focused");
            });

        });

    });


    /* =========================================================
       SELECT FIELD UX
       ========================================================= */

    document.querySelectorAll("select").forEach((select) => {

        function updateSelectState() {

            if (select.value) {
                select.classList.add("has-value");
            } else {
                select.classList.remove("has-value");
            }

        }

        updateSelectState();

        select.addEventListener(
            "change",
            updateSelectState
        );

    });


    /* =========================================================
       PHONE INPUT
       Keep UAE number clean
       ========================================================= */

    document.querySelectorAll(
        'input[type="tel"]'
    ).forEach((input) => {

        input.addEventListener("input", () => {

            input.value =
                input.value.replace(/[^\d+\-\s()]/g, "");

        });

    });


    /* =========================================================
       FORM SUBMIT TRACKING
       ========================================================= */

    forms.forEach((form) => {

        form.addEventListener("submit", () => {

            trackEvent(
                "registration_form_submit",
                {
                    form_id:
                        form.id ||
                        form.getAttribute("name") ||
                        "registration_form"
                }
            );

        });

    });


    /* =========================================================
       IMAGE LOAD ENHANCEMENT
       ========================================================= */

    document.querySelectorAll("img").forEach((image) => {

        if (image.complete) {
            image.classList.add("loaded");
            return;
        }

        image.addEventListener(
            "load",
            () => {
                image.classList.add("loaded");
            },
            {
                once: true
            }
        );

    });


    /* =========================================================
       EXTERNAL LINKS
       ========================================================= */

    document.querySelectorAll(
        'a[target="_blank"]'
    ).forEach((link) => {

        link.setAttribute(
            "rel",
            "noopener noreferrer"
        );

    });


    /* =========================================================
       MOBILE CTA SAFE AREA
       ========================================================= */

    function updateMobileCTA() {

        const mobileCTA =
            document.querySelector(".mobile-cta");

        if (!mobileCTA) return;

        const isMobile =
            window.innerWidth <= 800;

        mobileCTA.style.display =
            isMobile ? "grid" : "";

    }

    updateMobileCTA();

    window.addEventListener(
        "resize",
        updateMobileCTA
    );


    /* =========================================================
       PARALLAX — DESKTOP ONLY
       Very subtle premium movement
       ========================================================= */

    const heroImage =
        document.querySelector(".hero-media img");

    function updateParallax() {

        if (!heroImage) return;

        if (window.innerWidth <= 800) {

            heroImage.style.transform = "";

            return;
        }

        const scrollY =
            window.scrollY || 0;

        if (scrollY > window.innerHeight) return;

        heroImage.style.transform =
            `translate3d(0, ${scrollY * 0.08}px, 0) scale(1.03)`;
    }

    window.addEventListener(
        "scroll",
        updateParallax,
        {
            passive: true
        }
    );


    /* =========================================================
       ACTIVE NAVIGATION
       ========================================================= */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            '.desktop-nav a[href^="#"]'
        );

    if (
        sections.length &&
        navLinks.length &&
        "IntersectionObserver" in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) return;

                        const id =
                            entry.target.getAttribute("id");

                        navLinks.forEach((link) => {

                            const isActive =
                                link.getAttribute("href") ===
                                `#${id}`;

                            link.classList.toggle(
                                "active",
                                isActive
                            );

                        });

                    });

                },
                {
                    rootMargin:
                        "-30% 0px -60% 0px"
                }
            );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });

    }


    /* =========================================================
       CONSOLE
       ========================================================= */

    console.log(
        "%cTouchline Sport Academy",
        "font-size:20px;font-weight:800;color:#beb071;"
    );

    console.log(
        "%cPremium football development in Dubai.",
        "font-size:12px;color:#071a33;"
    );

});