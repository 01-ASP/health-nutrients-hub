import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export function Counter({ value, duration = 1.4, decimals = 0, suffix = "" }: { value: number; duration?: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);
  return <span ref={ref} className="tabular">{n.toFixed(decimals)}{suffix}</span>;
}
