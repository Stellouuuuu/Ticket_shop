"use client";

import { useEffect, useState } from "react";

const SPLASH_TOTAL_MS = 4000;
const SPLASH_EXIT_START_MS = 3400;

export default function IntroSplash() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const exitTimer = setTimeout(() => setExiting(true), SPLASH_EXIT_START_MS);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, SPLASH_TOTAL_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash ${exiting ? "splash--exit" : ""}`} aria-hidden="true">
      <div className="splash__bg">
        <div className="splash__sunburst" />
        <div className="splash__palms splash__palms--left" />
        <div className="splash__palms splash__palms--right" />
      </div>

      <div className="splash__content">
        <div className="splash__badge">18 – 19 Juillet</div>

        <div className="splash__logo-block">
          <span className="splash__festi">FESTI</span>
          <span className="splash__chill">CHILL</span>
          <span className="splash__six">6</span>
        </div>

        <p className="splash__theme">Las Favelas</p>

        <div className="splash__cta">
          <span className="splash__spark splash__spark--1" />
          <span className="splash__spark splash__spark--2" />
          <span className="splash__billeterie">BILLETERIE</span>
          <span className="splash__ouverte">OUVERTE</span>
          <span className="splash__spark splash__spark--3" />
          <span className="splash__spark splash__spark--4" />
        </div>

        <div className="splash__tickets">
          <div className="splash__ticket splash__ticket--std">8.000F</div>
          <div className="splash__ticket splash__ticket--vip">30.000F</div>
        </div>
      </div>
    </div>
  );
}
