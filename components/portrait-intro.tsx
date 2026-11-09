"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import type { Profile } from "@/lib/profile";
import AvatarViewer from "@/components/avatar-viewer";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
function smooth(start: number, end: number, value: number) {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
}

export default function PortraitIntro({ profile }: { profile: Profile }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function update() {
      frame = 0;
      if (!section.current || !stage.current) return;
      const height = Math.max(section.current.offsetHeight - window.innerHeight, 1);
      const progress = !profile.avatarModel || motion.matches ? 0 : clamp((window.scrollY - section.current.offsetTop) / height);
      const depth = smooth(0.08, 0.3, progress);
      const turn = Math.sin(progress * Math.PI * 2);
      const float = Math.sin(progress * Math.PI);
      const style = stage.current.style;
      const scrollOffset = motion.matches ? 0 : clamp(window.scrollY / section.current.offsetHeight);
      style.setProperty("--hero-drift", `${scrollOffset * 54}px`);
      style.setProperty("--scroll-turn", `${scrollOffset * 18}deg`);
      style.setProperty("--intro-progress", String(progress));
      style.setProperty("--depth", String(depth));
      style.setProperty("--opening-opacity", String(1 - smooth(0.06, 0.27, progress)));
      style.setProperty("--rig-rx", `${turn * -5}deg`);
      style.setProperty("--rig-ry", `${turn * 23}deg`);
      style.setProperty("--rig-rz", `${float * -2.5}deg`);
      style.setProperty("--rig-y", `${float * -22}px`);
      style.setProperty("--rig-shift", `${window.innerWidth > 650 ? depth * window.innerWidth * 0.1 : 0}px`);
      style.setProperty("--rig-scale", String(1 - depth * (window.innerWidth <= 650 ? 0.24 : 0.12) - smooth(0.82, 1, progress) * 0.04));
      style.setProperty("--portrait-z", `${depth * 125}px`);
      style.setProperty("--halo-turn", `${progress * 100 - 25}deg`);
      stage.current.dataset.phase = progress < 0.12 ? "portrait" : progress < 0.84 ? "perspective" : "release";
      stage.current.dataset.progress = progress.toFixed(3);
      stage.current.dispatchEvent(new CustomEvent("portrait-progress", { detail: { progress } }));
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); motion.removeEventListener("change", schedule); };
  }, [profile.avatarModel]);

  function point(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glass = (event.target as HTMLElement).closest<HTMLElement>(".glass");
    if (glass) {
      const bounds = glass.getBoundingClientRect();
      glass.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
      glass.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
    }
    event.currentTarget.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - 0.5) * 5}deg`);
    event.currentTarget.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - 0.5) * -4}deg`);
  }
  function leave() { stage.current?.style.setProperty("--pointer-x", "0deg"); stage.current?.style.setProperty("--pointer-y", "0deg"); }

  return <section className={`portrait-intro ${profile.avatarModel ? "has-avatar-model" : "portrait-poster-only"}`} id="home" ref={section} aria-labelledby="hero-heading">
    <div className="portrait-stage hero" ref={stage} onPointerMove={point} onPointerLeave={leave}>
      <div className="hero-wallpaper" aria-hidden="true"><div className="wallpaper-ribbon" /><div className="wallpaper-orbit" /></div>
      <div className="hero-copy">
        <h1 id="hero-heading"><span>Full-stack</span><span>Software Engineer.</span></h1>
        <div className="hero-actions"><a className="glass glass-button glass-primary" href="#work">Selected work</a><a className="glass glass-button" href="#contact">Contact</a></div>
      </div>
      <div className="depth-backdrop" aria-hidden="true"><span className="scene-word">RANO</span><div className="scene-grid" /><div className="scene-glow" /></div>
      <div className="avatar-stage" aria-label="Hassan’s portrait">
        <AvatarViewer modelUrl={profile.avatarModel} posterUrl={profile.portrait!} posterMaskUrl={profile.portraitMask} rotationOffset={profile.avatarRotationOffset} />
      </div>
      <div className="hero-bottom-blend" aria-hidden="true" />
      <div className="perspective-copy" aria-hidden="true"><span className="perspective-label">A little perspective.</span><p>Web.<br />Mobile.<br /><span>Systems.</span></p></div>
      {profile.avatarModel && <div className="hero-bottom"><div className="intro-scroll"><span>Scroll to explore</span><span className="scroll-progress" aria-hidden="true"><span /></span></div></div>}
    </div>
  </section>;
}
