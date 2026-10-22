import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { respectReducedMotion } from "../lib/motion.js";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined" && gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    // Already registered or unavailable
  }
}

const TONES_CYCLE = ["green-blue", "blue-purple", "yellow-green", "purple-pink"];

/**
 * KxFaq: Borderless, high-end FAQ accordion list with accessible keyboard controls,
 * deep linking hash management, fluid animated grid expansions, and GSAP scroll reveals.
 */
export default function KxFaq({
  items = [],
  defaultOpen = null,
  allowMultiple = true,
  showControls = true
}) {
  const [openIds, setOpenIds] = useState(() => {
    const initial = new Set();
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (items.some((it) => it.id === hashId)) {
        initial.add(hashId);
        return initial;
      }
    }
    if (defaultOpen) {
      initial.add(defaultOpen);
    } else if (items.length > 0) {
      initial.add(items[0].id);
    }
    return initial;
  });

  const listRef = useRef(null);
  const questionRefs = useRef({});

  // Keyboard navigation tracking: set data-input="keyboard" on keyboard events, remove on pointerdown
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e) => {
      if (["Tab", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) {
        document.documentElement.setAttribute("data-input", "keyboard");
      }
    };

    const onPointerDown = () => {
      document.documentElement.removeAttribute("data-input");
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  // Deep linking: Hash listener & initial hash scroll (no focus() unless keyboard)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const targetItem = items.find((it) => it.id === hash);
      if (targetItem) {
        setOpenIds((prev) => {
          const next = new Set(allowMultiple ? prev : []);
          next.add(hash);
          return next;
        });

        // Smooth scroll with navbar 88px offset, do NOT focus unless keyboard
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 88;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
          const isKeyboard = document.documentElement.getAttribute("data-input") === "keyboard";
          if (isKeyboard) {
            const btn = questionRefs.current[hash];
            if (btn) btn.focus();
          }
        }, 120);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [items, allowMultiple]);

  // GSAP Scroll Movement (Alternating from left/right, finishes <= 700ms, with 1s safety fallback)
  useEffect(() => {
    if (!listRef.current) return;

    // Safety fallback: after 1s ensure all rows are 100% visible with transform cleared
    const safetyTimer = setTimeout(() => {
      if (listRef.current) {
        const rows = listRef.current.querySelectorAll(".kx-faq-row");
        rows.forEach((r) => {
          r.style.opacity = "1";
          r.style.transform = "none";
        });
      }
    }, 1000);

    if (respectReducedMotion()) {
      const rows = listRef.current.querySelectorAll(".kx-faq-row");
      rows.forEach((r) => {
        r.style.opacity = "1";
        r.style.transform = "none";
      });
      return () => clearTimeout(safetyTimer);
    }

    const isMobile = window.innerWidth < 768;
    const rows = listRef.current.querySelectorAll(".kx-faq-row");
    if (!rows.length) return () => clearTimeout(safetyTimer);

    const ctx = gsap.context(() => {
      rows.forEach((row, idx) => {
        const fromLeft = idx % 2 === 0;
        const startX = isMobile ? 0 : fromLeft ? -48 : 48;
        const startY = isMobile ? 32 : 16;
        const angle = isMobile ? 0 : fromLeft ? -1 : 1;

        gsap.fromTo(
          row,
          {
            opacity: 0,
            x: startX,
            y: startY,
            scale: 0.98,
            rotation: angle
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.65, // Finishes within 700ms
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              once: true
            },
            onComplete: () => {
              gsap.set(row, { clearProps: "all" });
              row.style.opacity = "1";
              row.style.transform = "none";
            }
          }
        );
      });
    }, listRef);

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, [items]);

  const toggleRow = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyOpen = next.has(id);
      if (isCurrentlyOpen) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
        // Update URL hash smoothly without jump
        if (typeof window !== "undefined" && window.history?.replaceState) {
          window.history.replaceState(null, "", `#${id}`);
        }
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenIds(new Set(items.map((it) => it.id)));
  };

  const handleCollapseAll = () => {
    setOpenIds(new Set());
  };

  // Accessible Keyboard Navigation across Question Buttons
  const handleKeyDown = (e, index, id) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "];
    if (!keys.includes(e.key)) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleRow(id);
      return;
    }

    e.preventDefault();
    let targetIndex = index;
    if (e.key === "ArrowDown") {
      targetIndex = (index + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      targetIndex = (index - 1 + items.length) % items.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = items.length - 1;
    }

    const targetItem = items[targetIndex];
    if (targetItem && questionRefs.current[targetItem.id]) {
      questionRefs.current[targetItem.id].focus();
    }
  };

  const allOpen = items.length > 0 && openIds.size === items.length;

  return (
    <div className="w-full">
      {/* Optional Expand all / Collapse all Controls */}
      {showControls && items.length > 1 && (
        <div className="flex justify-end mb-4 px-2">
          <button
            type="button"
            onClick={allOpen ? handleCollapseAll : handleExpandAll}
            className="text-xs font-bold text-[var(--kx-text-muted)] hover:text-[var(--kx-accent)] transition-colors kx-animated-link"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Accordion List */}
      <div ref={listRef} className="kx-faq-list" role="presentation">
        {items.map((item, idx) => {
          const tone = item.tone || TONES_CYCLE[idx % TONES_CYCLE.length];
          const isOpen = openIds.has(item.id);
          const qId = `faq-q-${item.id}`;
          const aId = `faq-a-${item.id}`;

          const prefixMatch = typeof item.question === "string" ? item.question.match(/^(\d{1,2}\s*[-—]\s*)(.*)$/) : null;

          return (
            <div
              key={item.id}
              id={item.id}
              className={`kx-faq-row ${isOpen ? "is-open" : ""}`}
              data-tone={tone}
            >
              {/* Moving Gradient Wash Layer (Drifts on hover or open, max 0.10 opacity) */}
              <div className="kx-faq-row-wash" aria-hidden="true" />

              {/* Aurora Layer (Drifts inside open row, subtle) */}
              <div className="kx-faq-row-aurora" aria-hidden="true">
                <div
                  className="kx-aurora-blob kx-aurora-blob-1"
                  style={{ width: "320px", height: "320px", top: "-20%", left: "-10%" }}
                />
                <div
                  className="kx-aurora-blob kx-aurora-blob-2"
                  style={{ width: "280px", height: "280px", bottom: "-20%", right: "-5%" }}
                />
              </div>

              {/* Solid 70% Scrim Layer so text background never gets lighter than #1A2328 */}
              <div className="kx-faq-row-scrim" aria-hidden="true" />

              {/* Accessible Question Heading + Button */}
              <h2 className="m-0 p-0 text-left">
                <button
                  type="button"
                  ref={(el) => (questionRefs.current[item.id] = el)}
                  id={qId}
                  aria-expanded={isOpen}
                  aria-controls={aId}
                  onClick={() => toggleRow(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx, item.id)}
                  className="kx-faq-question-btn"
                >
                  <span className="kx-faq-question-text">
                    {prefixMatch ? (
                      <>
                        <span className="kx-faq-question-prefix" data-tone={tone}>{prefixMatch[1]}</span>
                        <span className="kx-faq-question-title">{prefixMatch[2]}</span>
                      </>
                    ) : (
                      <span className="kx-faq-question-title">{item.question}</span>
                    )}
                  </span>
                  <span className="kx-faq-icon-tile" aria-hidden="true">
                    <Plus size={22} className="kx-faq-plus-icon" strokeWidth={2.4} />
                  </span>
                </button>
              </h2>

              {/* Fluid Animated Answer Grid (0fr to 1fr) */}
              <div
                id={aId}
                role="region"
                aria-labelledby={qId}
                className="kx-faq-answer-grid"
              >
                <div className="kx-faq-answer-inner">
                  <div className="kx-faq-answer-content">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
