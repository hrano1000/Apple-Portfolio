"use client";

import { useEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, CSSProperties, PointerEvent, ReactNode } from "react";
import type { Profile, Project } from "@/lib/profile";
import PortraitIntro from "@/components/portrait-intro";
import ThemeSwitch from "@/components/theme-switch";

function MagneticLink({ children, className = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--magnetic-x", `${(event.clientX - bounds.left - bounds.width / 2) * 0.045}px`);
    event.currentTarget.style.setProperty("--magnetic-y", `${(event.clientY - bounds.top - bounds.height / 2) * 0.08}px`);
    event.currentTarget.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
  }
  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--magnetic-x", "0px");
    event.currentTarget.style.setProperty("--magnetic-y", "0px");
  }
  return <a {...props} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</a>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const destination = new URL(project.url).hostname === "play.google.com" ? "Google Play" : new URL(project.url).hostname.replace(/^www\./, "");
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--card-x", `${((event.clientY - bounds.top) / bounds.height - .5) * -2}deg`);
    event.currentTarget.style.setProperty("--card-y", `${((event.clientX - bounds.left) / bounds.width - .5) * 1}deg`);
  }
  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--card-x", "0deg");
    event.currentTarget.style.setProperty("--card-y", "0deg");
  }
  return <a className="project-card" href={project.url} target="_blank" rel="noreferrer" aria-label={`View ${project.name}`} onPointerMove={move} onPointerLeave={reset} data-reveal style={{ "--project-tint": project.color, "--reveal-delay": `${index % 3 * 70}ms` } as CSSProperties}>
    <div className="project-art"><img src={project.logo || project.image} alt="" width="80" height="80" loading="lazy" /></div>
    <div className="project-caption"><h3>{project.name}</h3><span>{project.category}</span></div>
    <span className="project-destination" aria-hidden="true">{destination}</span>
  </a>;
}

export default function Portfolio({ profile }: { profile: Profile }) {
  const menu = useRef<HTMLDialogElement>(null);
  const help = useRef<HTMLDialogElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const emailLink = `mailto:${profile.email}`;
  const whatsappLink = `https://wa.me/${profile.phone.replace(/\D/g, "")}`;
  const links = [{ label: "Work", href: "#work" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    document.documentElement.classList.add("motion-ready");
    let frame = 0;
    const sections = ["work", "about", "contact"].map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        let active = "home";
        for (const section of sections) if (section.getBoundingClientRect().top <= window.innerHeight * .38) active = section.id;
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) active = "contact";
        setActiveSection(active);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect(); window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  function openMenu() { menu.current?.showModal(); setMenuOpen(true); document.documentElement.classList.add("dialog-open"); }
  function closeMenu() { menu.current?.close(); }
  function afterMenuClose() { setMenuOpen(false); document.documentElement.classList.remove("dialog-open"); menuTrigger.current?.focus({ preventScroll: true }); }
  function openHelp() { help.current?.showModal(); document.documentElement.classList.add("dialog-open"); }
  function closeHelp() { help.current?.close(); }
  function afterHelpClose() { document.documentElement.classList.remove("dialog-open"); helpTrigger.current?.focus({ preventScroll: true }); }

  return <>
    <a className="skip-link" href="#work">Skip to projects</a>
    <header className="site-header glass" data-tone={activeSection === "contact" ? "dark" : "light"} data-scrolled={activeSection !== "home"} onPointerMove={(event) => {
      if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
      event.currentTarget.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
    }}>
      <a className="wordmark" href="#home" aria-label={`${profile.name} — home`}><span className="brand-mark" aria-hidden="true">r.</span><span>{profile.name}</span></a>
      <nav className="desktop-nav" aria-label="Main navigation" style={{ "--active-index": links.findIndex((link) => link.href === `#${activeSection}`), "--nav-count": links.length } as CSSProperties} data-selected={activeSection !== "home"}>
        <span className="nav-selection" aria-hidden="true" />{links.map((link) => <a className="nav-link" key={link.href} href={link.href} aria-current={link.href === `#${activeSection}` ? "location" : undefined}>{link.label}</a>)}
      </nav>
      <div className="header-controls"><ThemeSwitch /><button ref={menuTrigger} className={`menu-toggle ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-controls="navigation-panel" aria-expanded={menuOpen} onClick={menuOpen ? closeMenu : openMenu}><span /><span /></button></div>
    </header>
    <main id="main">
      <PortraitIntro profile={profile} />
      <section className="selected-work section-wrap" id="work" aria-labelledby="work-heading">
        <div className="work-heading" data-reveal><h2 id="work-heading">Selected work<span>({String(profile.projects.length).padStart(2, "0")})</span></h2></div>
        <div className="project-grid">{profile.projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} />)}</div>
      </section>
      <section id="about" className="background-section section-wrap" aria-labelledby="about-heading">
        <div className="background-heading" data-reveal>
          <div><h2 id="about-heading">About</h2><p>Software engineer in {profile.location}.</p></div>
          <div className="about-actions">{profile.resume && <a className="text-link" href={profile.resume} target="_blank" rel="noreferrer">View résumé</a>}<MagneticLink className="glass glass-button" href={whatsappLink} target="_blank" rel="noopener noreferrer">Let’s talk</MagneticLink></div>
        </div>
        <div className="background-panel" data-reveal>
          <div className="background-label">Experience</div>
          <div className="background-experience">{profile.experience.map((item) => <article className="career-row" key={item.company}><div><h3>{item.company}</h3><p>{item.role}</p></div><span>{item.period}</span></article>)}</div>
          <details className="toolkit"><summary>Toolkit<span className="disclosure-mark" aria-hidden="true" /></summary><div className="toolkit-groups">{profile.skills.map((group) => <div key={group.label}><h3>{group.label}</h3><p>{group.items}</p></div>)}</div></details>
          <div className="qualification"><span className="background-label">Education</span><div><h3>HND, Computer Science</h3><p>Isa Mustapha Agwai I Polytechnic · 2025</p></div></div>
        </div>
      </section>
      <footer id="contact" className="contact-section" aria-labelledby="contact-heading">
        <div className="contact-inner section-wrap">
          <div className="contact-heading-row" data-reveal><h2 id="contact-heading">Have a project?</h2><MagneticLink className="glass glass-button glass-primary" href={whatsappLink} target="_blank" rel="noopener noreferrer">Let’s talk</MagneticLink></div>
          <div className="contact-links" data-reveal><a href={emailLink}>Email me</a><a href={`tel:${profile.phone}`}>Call me</a></div>
          <nav className="social-links" aria-label="Social media" data-reveal>{profile.socials.map(social => <a key={social.platform} className="social-link" href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.label}: ${social.handle}`} title={`${social.label} ${social.handle}`}><img src={`/social/${social.icon}.svg`} width="20" height="20" alt="" loading="lazy" /></a>)}</nav>
          <div className="footer-bottom"><span>© 2026 {profile.shortName}</span><div className="footer-actions"><a className="back-top" href="#home">Back to top</a><button className="glass help-button" type="button" ref={helpTrigger} aria-label="Help with this portfolio" aria-controls="help-panel" onClick={openHelp}>?</button></div></div>
        </div>
      </footer>
    </main>
    <dialog className="glass navigation-panel" id="navigation-panel" aria-label="Navigation" ref={menu} onClose={afterMenuClose} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="navigation-content"><div className="panel-top"><span>Navigation</span><button className="panel-close" type="button" aria-label="Close navigation" onClick={closeMenu}>×</button></div><nav aria-label="Expanded navigation">{[{ label: "Home", href: "#home" }, ...links].map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}</nav><a className="panel-email" href={whatsappLink} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></div>
    </dialog>
    <dialog className="glass help-panel" id="help-panel" aria-labelledby="help-heading" ref={help} onClose={afterHelpClose} onClick={(event) => { if (event.target === event.currentTarget) closeHelp(); }}>
      <div className="help-content"><div className="panel-top"><h2 id="help-heading">About this portfolio</h2><button className="panel-close" type="button" aria-label="Close help" onClick={closeHelp}>×</button></div>
        <h3>Contact Hassan</h3><p>Let’s talk opens WhatsApp. Email me and Call me open your device’s mail or calling app.</p><a className="help-email" href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp {profile.phone}</a>
        <h3>Background</h3><p>{profile.bio}</p><p>The résumé includes full experience and project details.</p>
        <h3>Project notes</h3>{profile.projects.filter(project => project.description).map(project => <p key={project.name}><strong>{project.name}.</strong> {project.description}</p>)}<p>Additional work: DworQ and Spreant Ecosystem — MarketPlace, Ride & Shop.</p>
        <h3>Display preferences</h3><p>Tap the appearance control in the header to cycle through System, Light, and Dark. Your choice is saved. System follows your device’s appearance. Motion, transparency, and contrast follow your device’s supported accessibility preferences.</p>
      </div>
    </dialog>
  </>;
}
