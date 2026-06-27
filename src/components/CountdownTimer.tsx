"use client";

import { useEffect, useState } from "react";
import { SALE_END_DATE } from "@/lib/constants";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft | null {
  const diff = new Date(SALE_END_DATE).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calcTimeLeft());
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="countdown" aria-hidden="true">
        <p className="countdown__label">Cette offre est limitée et se termine dans</p>
        <div className="countdown__grid">
          {[0, 0, 0, 0].map((_, i) => (
            <div key={i} className="countdown__unit">
              <span className="countdown__number">--</span>
              <span className="countdown__unit-label">--</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="countdown countdown--ended">
        <p className="countdown__label">La billeterie en ligne est fermée — rendez-vous sur place !</p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Jours" },
    { value: timeLeft.hours, label: "Heures" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div className="countdown">
      <p className="countdown__label">Cette offre est limitée et se termine dans</p>
      <div className="countdown__grid" role="timer" aria-live="polite">
        {units.map((u) => (
          <div key={u.label} className="countdown__unit">
            <span className="countdown__number">{pad(u.value)}</span>
            <span className="countdown__unit-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
