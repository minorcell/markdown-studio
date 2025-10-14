;(function () {
  const STORAGE_KEY = 'mdstudio-theme'

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  function applyTheme(theme) {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
    // update toggle label
    const toggles = document.querySelectorAll('[data-action="toggle-theme"]')
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false')
      btn.textContent = theme === 'dark' ? '切换为浅色' : '切换为深色'
    })

    // swap highlight.js theme if present
    const hlLink = document.querySelector('link[data-hl-theme]')
    if (hlLink) {
      const base = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/'
      hlLink.href = theme === 'dark' ? base + 'github-dark.min.css' : base + 'github.min.css'
    }
  }

  function initTheme() {
    const theme = getPreferredTheme()
    applyTheme(theme)

    // listen to system changes when no explicit save
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', (e) => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
          applyTheme(e.matches ? 'dark' : 'light')
        }
      })
    } catch (_) {}

    // wire buttons
    document.addEventListener('click', (e) => {
      const target = e.target
      if (!(target instanceof Element)) return
      if (target.matches('[data-action="toggle-theme"]')) {
        const current = document.documentElement.getAttribute('data-theme') || 'light'
        const next = current === 'dark' ? 'light' : 'dark'
        localStorage.setItem(STORAGE_KEY, next)
        applyTheme(next)
      }
    })
  }

  document.addEventListener('DOMContentLoaded', initTheme)
})()

