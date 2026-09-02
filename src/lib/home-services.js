/**
 * Homepage "stacked services" — CSS position:sticky does the stacking; this
 * adds the scale-down / dim of the outgoing card and a little art parallax.
 * No-JS and reduced-motion still get a clean sticky stack.
 */
export async function initHomeServices() {
  const section = document.querySelector('[data-stack]');
  if (!section) return;
  const cards = [...section.querySelectorAll('.stack-card')];
  if (cards.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 760px)').matches) return;

  try {
    const { default: gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.9,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 30%', scrub: true },
      });
    });

    section.querySelectorAll('.stack-card__art img, .stack-card__art video').forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('.stack-card'), start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  } catch {
    /* sticky stack still works */
  }
}
