import { useEffect, useRef } from "react";
import "../styles/customCursor.css";

const CustomCursor = () => {
  const containerRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rippleContainerRef = useRef(null);

  // Position references (avoid React state to eliminate re-renders on mouse movement)
  const mousePos = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const targetPos = useRef({ x: -100, y: -100 });
  const isClicking = useRef(false);
  const isVisible = useRef(false);
  const currentState = useRef("default");
  const magneticElement = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    // Only enable custom cursor if fine pointer is detected (mouse / trackpad)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) {
      return;
    }

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMotionQuery.matches;

    const handleReducedMotionChange = (e) => {
      isReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // Apply root class to hide native cursor on desktop
    document.documentElement.classList.add("cyber-cursor-enabled");

    const updateState = (newState) => {
      if (currentState.current !== newState && containerRef.current) {
        currentState.current = newState;
        containerRef.current.setAttribute("data-state", newState);
      }
    };

    const updateVisibility = (visible) => {
      if (isVisible.current !== visible && containerRef.current) {
        isVisible.current = visible;
        containerRef.current.setAttribute("data-visible", visible ? "true" : "false");
      }
    };

    const updateClicking = (clicking) => {
      if (isClicking.current !== clicking && containerRef.current) {
        isClicking.current = clicking;
        containerRef.current.setAttribute("data-clicking", clicking ? "true" : "false");
      }
    };

    // Smooth linear interpolation animation loop
    const LERP_FACTOR = 0.18; // smooth trailing without noticeable lag

    const renderLoop = () => {
      if (!isVisible.current) {
        rafId.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Calculate magnetic target offset if hovering over a primary CTA
      if (magneticElement.current && currentState.current === "hover-magnetic") {
        try {
          const rect = magneticElement.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const pullX = (centerX - mousePos.current.x) * 0.25;
          const pullY = (centerY - mousePos.current.y) * 0.25;
          targetPos.current.x = mousePos.current.x + pullX;
          targetPos.current.y = mousePos.current.y + pullY;
        } catch {
          targetPos.current.x = mousePos.current.x;
          targetPos.current.y = mousePos.current.y;
        }
      } else {
        targetPos.current.x = mousePos.current.x;
        targetPos.current.y = mousePos.current.y;
      }

      if (isReducedMotion) {
        outerPos.current.x = targetPos.current.x;
        outerPos.current.y = targetPos.current.y;
      } else {
        outerPos.current.x += (targetPos.current.x - outerPos.current.x) * LERP_FACTOR;
        outerPos.current.y += (targetPos.current.y - outerPos.current.y) * LERP_FACTOR;
      }

      // Direct transform update (GPU hardware accelerated via translate3d)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${outerPos.current.x}px, ${outerPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    rafId.current = requestAnimationFrame(renderLoop);

    // Event Handler: Pointer movement
    const onPointerMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible.current) {
        updateVisibility(true);
        // snap initial position so it doesn't animate from (-100, -100)
        outerPos.current.x = e.clientX;
        outerPos.current.y = e.clientY;
      }

      // Detect interaction target
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // 1. Text input / selectable editable elements
      if (
        target.matches("input, textarea, select, [contenteditable='true']") ||
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        magneticElement.current = null;
        updateState("hover-text");
        return;
      }

      // 2. Disabled elements
      if (
        target.matches("button:disabled, [disabled], .disabled, [aria-disabled='true']") ||
        target.closest("button:disabled, [disabled], .disabled, [aria-disabled='true']")
      ) {
        magneticElement.current = null;
        updateState("hover-disabled");
        return;
      }

      // 3. Magnetic primary buttons (Hero CTAs, .btn-primary, .btn-signup-special)
      const magneticTarget = target.closest(".btn-primary, .hero-cta-btn, .btn-signup-special, [data-magnetic]");
      if (magneticTarget) {
        magneticElement.current = magneticTarget;
        updateState("hover-magnetic");
        return;
      }

      magneticElement.current = null;

      // 4. Interactive buttons, links, tabs, pills
      if (
        target.matches("a, button, [role='button'], .btn, .nav-link, .tourney-select-btn, .filter-btn, .tab-btn, .action-btn") ||
        target.closest("a, button, [role='button'], .btn, .nav-link, .tourney-select-btn, .filter-btn, .tab-btn, .action-btn")
      ) {
        updateState("hover-btn");
        return;
      }

      // 5. Interactive Cards (Tournaments, Teams, Players, Matches, Stats)
      if (
        target.matches("[class*='tcard-'], [class*='team-card-'], [class*='player-card-'], [class*='match-card-'], .stat-card-pro, .standings-card-pro, .tournament-card") ||
        target.closest("[class*='tcard-'], [class*='team-card-'], [class*='player-card-'], [class*='match-card-'], .stat-card-pro, .standings-card-pro, .tournament-card")
      ) {
        updateState("hover-card");
        return;
      }

      // 6. Default pointer state
      updateState("default");
    };

    // Event Handler: Pointer down (Click start)
    const onPointerDown = (e) => {
      updateClicking(true);

      // Spawn expanding click ripple
      if (rippleContainerRef.current && !isReducedMotion) {
        const ripple = document.createElement("div");
        ripple.className = "cyber-cursor-ripple";
        ripple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        rippleContainerRef.current.appendChild(ripple);

        const removeRipple = () => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        };

        ripple.addEventListener("animationend", removeRipple, { once: true });
        setTimeout(removeRipple, 450);
      }
    };

    // Event Handler: Pointer up (Click end)
    const onPointerUp = () => {
      updateClicking(false);
    };

    // Event Handler: Window leave / enter
    const onMouseLeave = () => {
      updateVisibility(false);
      magneticElement.current = null;
    };

    const onMouseEnter = () => {
      updateVisibility(true);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      document.documentElement.classList.remove("cyber-cursor-enabled");
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="cyber-cursor-container"
      data-state="default"
      data-visible="false"
      data-clicking="false"
      aria-hidden="true"
    >
      {/* Outer tracking violet HUD ring */}
      <div ref={ringRef} className="cyber-cursor-ring" />

      {/* Inner instant electric cyan dot */}
      <div ref={dotRef} className="cyber-cursor-dot" />

      {/* Dynamic container for click ripples */}
      <div ref={rippleContainerRef} className="cyber-cursor-ripples" />
    </div>
  );
};

export default CustomCursor;
