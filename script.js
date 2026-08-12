(() => {
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loader = document.querySelector(".page-loader");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const siteHeader = document.querySelector(".site-header");
  let lenis = null;

  document.querySelectorAll("video").forEach((video) => {
    video.play().catch(() => {});
  });

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
    lenis?.start();

    if (hasGSAP) {
      gsap.to(mobileMenu, {
        clipPath: "inset(0 0 100% 0)",
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true,
      });
    }
  };

  const openMenu = () => {
    document.body.classList.add("menu-open");
    menuButton?.setAttribute("aria-expanded", "true");
    mobileMenu?.setAttribute("aria-hidden", "false");
    lenis?.stop();

    if (hasGSAP) {
      gsap.to(mobileMenu, {
        clipPath: "inset(0 0 0% 0)",
        autoAlpha: 1,
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: true,
      });
      gsap.fromTo(
        ".mobile-menu nav a",
        { yPercent: 70, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, stagger: 0.055, delay: 0.15, duration: 0.5, ease: "power3.out" }
      );
    }
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  if (!hasGSAP) {
    loader?.remove();
    document.querySelector(".hero-color")?.style.setProperty("opacity", "0");
    document.querySelector(".hero-opening")?.style.setProperty("display", "none");
    document.querySelector(".hero-story")?.style.setProperty("visibility", "visible");
    document.querySelector(".hero-story")?.style.setProperty("opacity", "1");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (hasLenis) {
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: false,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    window.milanoLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      let destination = target.getBoundingClientRect().top + window.scrollY - 68;

      if (hash === "#inicio") {
        destination = 0;
      } else if (hash === "#produtos") {
        const trigger = ScrollTrigger.getAll().find((item) => item.trigger === target && item.pin);
        if (trigger) destination = trigger.start;
      } else if (hash === "#novidades") {
        const stage = target.querySelector(".news-stage");
        const trigger = ScrollTrigger.getAll().find((item) => item.trigger === stage && item.pin);
        const marquee = target.querySelector(".marquee");
        if (trigger) destination = trigger.start - (marquee?.offsetHeight || 0);
      }

      if (lenis) {
        lenis.scrollTo(Math.max(0, destination), { duration: 1.15, force: true });
      } else {
        window.scrollTo({ top: Math.max(0, destination), behavior: "smooth" });
      }

      history.replaceState(null, "", hash);
    });
  });

  gsap.set(".hero-word", { autoAlpha: 1 });
  gsap.set([".hero-kicker", ".scroll-cue"], { y: 0, autoAlpha: 1 });
  gsap.set(".hero-story", { y: 55, autoAlpha: 0 });
  gsap.set(".hero-index", { autoAlpha: 0 });

  const loaderTimeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });
  loaderTimeline
    .from(".page-loader span", { yPercent: 115, duration: 0.65 })
    .to(".page-loader span", { yPercent: -115, duration: 0.5, delay: 0.08 })
    .to(".page-loader", { yPercent: -100, duration: 0.7 }, "-=0.18")
    .set(".page-loader", { display: "none" });

  if (!reducedMotion) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const heroBaseFontSize = () => {
      if (window.innerWidth <= 900) {
        return Math.min(Math.max(4.2 * rootFontSize, window.innerWidth * 0.21), 10 * rootFontSize);
      }

      return Math.min(Math.max(5.2 * rootFontSize, window.innerWidth * 0.18), 18 * rootFontSize);
    };

    const heroTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".hero-scene",
        start: "top top",
        end: "+=260%",
        scrub: 0.65,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    heroTimeline
      .to([".hero-kicker", ".scroll-cue"], { y: -24, autoAlpha: 0, duration: 0.1 }, 0)
      .fromTo(
        ".hero-word",
        { fontSize: () => heroBaseFontSize() },
        {
          fontSize: () => heroBaseFontSize() * 8.2,
          duration: 0.58,
          ease: "power2.in",
          immediateRender: false,
        },
        0.02
      )
      .to(".hero-color", { autoAlpha: 0, duration: 0.24, ease: "power2.inOut" }, 0.26)
      .to(".hero-word", { autoAlpha: 0, duration: 0.16 }, 0.46)
      .to(".hero-video", { scale: 1, duration: 0.4 }, 0.3)
      .to(".hero-story", { y: 0, autoAlpha: 1, duration: 0.28, ease: "power3.out" }, 0.58)
      .to(".hero-index", { autoAlpha: 1, duration: 0.18 }, 0.68);
  } else {
    gsap.set([".hero-color", ".hero-opening"], { display: "none" });
    gsap.set([".hero-story", ".hero-index"], { y: 0, autoAlpha: 1 });
  }

  const productTrack = document.querySelector(".product-track");
  const collection = document.querySelector(".collection");
  const productCounter = document.querySelector(".collection-counter span");
  const progressBar = document.querySelector(".collection-progress span");

  const getProductDistance = () =>
    Math.max(0, productTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.05);

  if (!reducedMotion && getProductDistance() > 0) {
    gsap.to(productTrack, {
      x: () => -getProductDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: collection,
        start: "top top",
        end: () => `+=${getProductDistance() + window.innerHeight * 0.55}`,
        scrub: 0.55,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const index = Math.min(4, Math.floor(progress * 5));
          productCounter.textContent = String(index + 1).padStart(2, "0");
          gsap.set(progressBar, { scaleX: progress });
        },
      },
    });
  }

  if (!reducedMotion) {
    const newsMedia = gsap.matchMedia();

    const newsTrigger = (end) => ({
      trigger: ".news-stage",
      start: "top top",
      end,
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => siteHeader.classList.toggle("header-dark", progress < 0.36),
    });

    newsMedia.add("(min-width: 901px)", () => {
      const centerCard = document.querySelector(".news-card-center");
      const fillViewport = () => {
        const rect = centerCard.getBoundingClientRect();
        return Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.18;
      };

      return gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: newsTrigger("+=180%") })
        .to(".news-intro", { y: -25, autoAlpha: 0, duration: 0.18 }, 0)
        .to(".news-card-left", { xPercent: -125, rotate: -5, autoAlpha: 0, duration: 0.42 }, 0.08)
        .to(".news-card-right", { xPercent: 125, rotate: 5, autoAlpha: 0, duration: 0.42 }, 0.08)
        .to(
          centerCard,
          { scale: fillViewport, borderRadius: 0, duration: 0.62, ease: "power2.inOut" },
          0.2
        )
        .to(".news-card-center img", { scale: 1.035, duration: 0.62 }, 0.2);
    });

    newsMedia.add("(max-width: 900px)", () => {
      return gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: newsTrigger("+=190%") })
        .to(".news-intro", { y: -20, autoAlpha: 0, duration: 0.16 }, 0)
        .to(".news-card-left", { xPercent: -120, rotate: -9, autoAlpha: 0, duration: 0.4 }, 0.08)
        .to(".news-card-right", { xPercent: 120, rotate: 9, autoAlpha: 0, duration: 0.4 }, 0.08)
        .to(
          ".news-card-center",
          {
            top: 0,
            left: 0,
            width: "100vw",
            height: "100svh",
            borderRadius: 0,
            duration: 0.64,
            ease: "power2.inOut",
          },
          0.22
        )
        .to(".news-card-center img", { scale: 1.04, duration: 0.64 }, 0.22);
    });
  }

  gsap.from(".about-content > *", {
    y: 52,
    autoAlpha: 0,
    stagger: 0.07,
    duration: 0.75,
    ease: "power3.out",
    scrollTrigger: { trigger: ".about", start: "top 68%" },
  });

  gsap.to(".about-orbit", {
    rotate: 14,
    scale: 1.08,
    ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true },
  });

  gsap.from(".footer-bottom h2", {
    yPercent: 105,
    duration: 0.95,
    ease: "power3.out",
    scrollTrigger: { trigger: ".footer-bottom", start: "top 88%" },
  });

  [".collection", ".footer"].forEach((selector) => {
    ScrollTrigger.create({
      trigger: selector,
      start: "top 40px",
      end: "bottom 40px",
      onToggle: ({ isActive }) => siteHeader.classList.toggle("header-dark", isActive),
    });
  });

  ScrollTrigger.create({
    trigger: ".about",
    start: "top 40px",
    end: "bottom 40px",
    onToggle: ({ isActive }) => {
      if (isActive) siteHeader.classList.remove("header-dark");
    },
  });

  window.addEventListener("load", () => {
    lenis?.resize();
    ScrollTrigger.refresh();
  });
})();
