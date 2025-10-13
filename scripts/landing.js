// GSAP animations for landing page
// Requires gsap and ScrollTrigger (loaded via CDN in index.html)

;(function () {
  if (!window.gsap) return
  const gsap = window.gsap
  if (gsap && gsap.registerPlugin && window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger)
  }

  // Helper: split stagger animation for a container
  function fadeUpStagger(targets, opts) {
    gsap.set(targets, { y: 20, opacity: 0 })
    gsap.to(targets, {
      y: 0,
      opacity: 1,
      ease: 'power2.out',
      duration: 0.8,
      stagger: 0.08,
      ...opts,
    })
  }

  // Initial hero animations
  window.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero')
    if (!hero) return

    const title = hero.querySelector('.hero-title')
    const subtitle = hero.querySelector('.hero-subtitle')
    const actions = hero.querySelectorAll('.hero-actions .btn')
    const preview = document.querySelector('.preview-window')

    if (title) {
      gsap.set(title, { y: 24, opacity: 0 })
      gsap.to(title, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.9, delay: 0.05 })
    }
    if (subtitle) {
      gsap.set(subtitle, { y: 24, opacity: 0 })
      gsap.to(subtitle, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.9, delay: 0.15 })
    }
    if (actions && actions.length) {
      fadeUpStagger(actions, { delay: 0.25 })
    }
    if (preview) {
      gsap.set(preview, { y: 30, opacity: 0, scale: 0.98 })
      gsap.to(preview, {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        duration: 1,
        delay: 0.35,
      })

      // Subtle 3D tilt on mouse move with spring-back
      const bounds = preview.getBoundingClientRect()
      let hovering = false

      function handleMove(e) {
        const rect = preview.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const rx = ((y / rect.height) - 0.5) * -6 // rotateX
        const ry = ((x / rect.width) - 0.5) * 8 // rotateY
        gsap.to(preview, { rotateX: rx, rotateY: ry, transformPerspective: 800, transformOrigin: 'center', duration: 0.3, ease: 'power2.out' })
      }

      function handleEnter() {
        hovering = true
        gsap.to(preview, { scale: 1.01, duration: 0.25, ease: 'power2.out' })
      }
      function handleLeave() {
        hovering = false
        gsap.to(preview, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
      }

      preview.addEventListener('mousemove', handleMove)
      preview.addEventListener('mouseenter', handleEnter)
      preview.addEventListener('mouseleave', handleLeave)
    }
  })

  // Scroll-triggered animations for sections
  window.addEventListener('load', () => {
    const featureCards = document.querySelectorAll('.features .feature-card')
    const useCases = document.querySelectorAll('.use-cases .use-case')
    const cta = document.querySelector('.cta .cta-content')

    if (featureCards.length) {
      gsap.set(featureCards, { y: 24, opacity: 0 })
      featureCards.forEach((card, i) => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: (i % 3) * 0.08,
        })
      })
    }

    if (useCases.length) {
      gsap.set(useCases, { y: 24, opacity: 0 })
      useCases.forEach((card, i) => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: (i % 2) * 0.1,
        })
      })
    }

    if (cta) {
      gsap.set(cta, { opacity: 0, y: 20, scale: 0.99 })
      gsap.to(cta, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'power2.out',
        duration: 0.9,
        scrollTrigger: {
          trigger: cta,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }
  })
})()

