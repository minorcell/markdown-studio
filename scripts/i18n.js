// Minimal i18n helper for Markdown Studio
// Manages language selection and applies translations to DOM elements
(function () {
  const LANG_KEY = 'mdstudio-lang'

  const dict = {
    zh: {
      // Common
      'settings.open': '设置',
      'settings.title': '设置',
      'settings.close': '关闭',
      'settings.lang': '界面语言',
      'settings.theme': '主题',
      'lang.zh': '中文',
      'lang.en': 'English',
      // Index
      'nav.title': 'Markdown Studio',
      'nav.useOnline': '在线使用',
      'hero.title': '优雅的 Markdown 编辑体验',
      'hero.subtitle': '实时预览、语法高亮、一键导出。让写作变得更简单、更高效。',
      'hero.start': '立即开始',
      'hero.learnMore': '了解更多',
      'features.title': '为什么选择 Markdown Studio',
      'features.preview.title': '实时预览',
      'features.preview.desc': '边写边看，所见即所得。支持分屏模式和独立预览模式，满足不同使用场景。',
      'features.highlight.title': '语法高亮',
      'features.highlight.desc': '代码块自动识别语言并高亮显示，让技术文档更加清晰易读。',
      'features.export.title': '一键导出',
      'features.export.desc': '支持导出 Markdown 和 HTML 格式，轻松分享你的创作内容。',
      'features.persist.title': '目录持久化',
      'features.persist.desc': '记住你打开的目录，下次进入自动恢复文件列表（需授权）。',
      'features.fast.title': '轻量快速',
      'features.fast.desc': '纯前端实现，无需安装，打开即用。响应迅速，流畅编辑。',
      'features.free.title': '完全免费',
      'features.free.desc': '开源免费，无需注册，无广告打扰，纯粹的写作体验。',
      'usecases.title': '适用场景',
      'usecases.tech.title': '📝 技术文档',
      'usecases.tech.desc': '编写技术文档、API 文档、项目 README',
      'usecases.study.title': '📚 学习笔记',
      'usecases.study.desc': '记录学习笔记、整理知识点、制作学习资料',
      'usecases.blog.title': '✍️ 博客文章',
      'usecases.blog.desc': '撰写博客文章、导出 HTML 发布到各平台',
      'usecases.meeting.title': '📋 会议记录',
      'usecases.meeting.desc': '快速记录会议内容、整理会议纪要',
      'cta.title': '准备好开始了吗？',
      'cta.subtitle': '立即体验 Markdown Studio，享受流畅的写作体验',
      'cta.button': '免费使用',
      'footer.rights': '© 2025 Markdown Studio. All rights reserved.',
      'footer.subtitle': '一个简洁优雅的 Markdown 编辑器',
      // Editor
      'toolbar.title': 'Markdown Studio',
      'view.editorOnly': '仅编辑',
      'view.split': '分屏',
      'view.previewOnly': '仅预览',
      'toggle.sidebar': '隐藏侧栏',
      'menu.file': '文件',
      'menu.openFolder': '打开目录',
      'menu.openFile': '打开文件',
      'menu.save': '保存',
      'menu.saveAs': '另存为',
      'menu.newFile': '新建文件',
      'menu.deleteFile': '删除文件',
      'menu.export': '导出',
      'menu.export.md': '导出 Markdown',
      'menu.export.html': '导出 HTML',
      'pane.sidebar.files': '文件',
      'pane.sidebar.emptyRoot': '未选择目录',
      'pane.editor.title': 'Markdown',
      'pane.preview.title': '预览',
      'pane.preview.subtitle': '实时渲染效果',
      'sr.editor.label': 'Markdown 输入',
      'theme.aria': '切换深浅主题',
      'defaultMarkdown': `# 欢迎来到 Markdown Studio\n\n在左侧以 Markdown 语法创作内容，右侧会即时呈现排版后的效果。\n\n## 快速示例\n\n- **粗体** 与 *斜体*\n- 行内代码示例：\n  \`npm install\`\n- 多行代码：\n\n\`\`\`js\nfunction greet(name) {\n  console.log(\`Hi, ${name}!\`);\n}\n\`\`\`\n\n> Tip: 使用工具栏切换视图或导出文件。\n\n[了解 Markdown](https://markdown-guide.readthedocs.io/en/latest/)\n`,
    },
    en: {
      // Common
      'settings.open': 'Settings',
      'settings.title': 'Settings',
      'settings.close': 'Close',
      'settings.lang': 'Interface Language',
      'settings.theme': 'Theme',
      'lang.zh': '中文',
      'lang.en': 'English',
      // Index
      'nav.title': 'Markdown Studio',
      'nav.useOnline': 'Use Online',
      'hero.title': 'Elegant Markdown Editing Experience',
      'hero.subtitle': 'Live preview, syntax highlighting, and one-click export for simpler, faster writing.',
      'hero.start': 'Get Started',
      'hero.learnMore': 'Learn More',
      'features.title': 'Why Choose Markdown Studio',
      'features.preview.title': 'Live Preview',
      'features.preview.desc': 'See as you type. Split view and standalone preview suit different workflows.',
      'features.highlight.title': 'Syntax Highlighting',
      'features.highlight.desc': 'Code blocks are auto-detected and highlighted for clearer technical docs.',
      'features.export.title': 'One-Click Export',
      'features.export.desc': 'Export to Markdown or HTML and share your work easily.',
      'features.persist.title': 'Directory Persistence',
      'features.persist.desc': 'Remembers opened directories and restores the file list on next visit (with permission).',
      'features.fast.title': 'Lightweight & Fast',
      'features.fast.desc': 'Pure frontend, no install required. Opens instantly with smooth editing.',
      'features.free.title': 'Completely Free',
      'features.free.desc': 'Open source, no sign-up, no ads — a pure writing experience.',
      'usecases.title': 'Use Cases',
      'usecases.tech.title': '📝 Technical Docs',
      'usecases.tech.desc': 'Write API docs, technical documentation, and project READMEs.',
      'usecases.study.title': '📚 Study Notes',
      'usecases.study.desc': 'Track learning notes, organize knowledge points, and craft materials.',
      'usecases.blog.title': '✍️ Blog Posts',
      'usecases.blog.desc': 'Write posts and export HTML to publish anywhere.',
      'usecases.meeting.title': '📋 Meeting Notes',
      'usecases.meeting.desc': 'Quickly capture meeting content and prepare minutes.',
      'cta.title': 'Ready to start?',
      'cta.subtitle': 'Try Markdown Studio now and enjoy a smooth writing experience.',
      'cta.button': 'Use for Free',
      'footer.rights': '© 2025 Markdown Studio. All rights reserved.',
      'footer.subtitle': 'A simple, elegant Markdown editor',
      // Editor
      'toolbar.title': 'Markdown Studio',
      'view.editorOnly': 'Edit Only',
      'view.split': 'Split View',
      'view.previewOnly': 'Preview Only',
      'toggle.sidebar': 'Hide Sidebar',
      'menu.file': 'File',
      'menu.openFolder': 'Open Folder',
      'menu.openFile': 'Open File',
      'menu.save': 'Save',
      'menu.saveAs': 'Save As',
      'menu.newFile': 'New File',
      'menu.deleteFile': 'Delete File',
      'menu.export': 'Export',
      'menu.export.md': 'Export Markdown',
      'menu.export.html': 'Export HTML',
      'pane.sidebar.files': 'Files',
      'pane.sidebar.emptyRoot': 'No directory selected',
      'pane.editor.title': 'Markdown',
      'pane.preview.title': 'Preview',
      'pane.preview.subtitle': 'Live rendered result',
      'sr.editor.label': 'Markdown input',
      'theme.aria': 'Toggle light/dark theme',
      'defaultMarkdown': `# Welcome to Markdown Studio\n\nWrite Markdown on the left; the right side shows formatted output in real-time.\n\n## Quick Examples\n\n- **Bold** and *Italic*\n- Inline code:\n  \`npm install\`\n- Multiline code:\n\n\`\`\`js\nfunction greet(name) {\n  console.log(\`Hi, ${name}!\`);\n}\n\`\`\`\n\n> Tip: Use the toolbar to change views or export files.\n\n[Learn Markdown](https://markdown-guide.readthedocs.io/en/latest/)\n`,
    },
  }

  function getPreferredLang() {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'zh' || saved === 'en') return saved
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase()
    return nav.startsWith('zh') ? 'zh' : 'en'
  }

  function applyI18n(lang) {
    const html = document.documentElement
    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en')
    const entries = document.querySelectorAll('[data-i18n]')
    entries.forEach((el) => {
      const key = el.getAttribute('data-i18n')
      const text = (dict[lang] && dict[lang][key]) || key
      const attr = el.getAttribute('data-i18n-attr')
      if (attr) {
        el.setAttribute(attr, text)
        return
      }

      if (el.childElementCount === 0) {
        el.textContent = text
        return
      }

      const textNode = Array.from(el.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE
      )

      if (textNode) {
        textNode.textContent = text
      } else {
        el.insertBefore(document.createTextNode(text), el.firstChild)
      }
    })
    // Reflect current language selection in segmented control
    document.querySelectorAll('[data-action="toggle-lang"][data-lang]').forEach((btn) => {
      const isActive = btn.getAttribute('data-lang') === lang
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })
    // Update any theme switch aria-labels
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
      btn.setAttribute('aria-label', dict[lang]['theme.aria'])
    })
    // Set default sample markdown if editor exists and is empty
    const editor = document.getElementById('editor')
    if (editor && editor.value.trim() === '') {
      editor.value = dict[lang]['defaultMarkdown'] || editor.value
    }
  }

  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') return
    localStorage.setItem(LANG_KEY, lang)
    applyI18n(lang)
  }

  function initI18n() {
    if (window.__MDS_I18N_INITED) return
    window.__MDS_I18N_INITED = true
    const lang = getPreferredLang()
    applyI18n(lang)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle-lang"][data-lang]')
      if (btn) {
        const next = btn.getAttribute('data-lang')
        setLang(next)
        // update pressed states immediately for visual feedback
        document.querySelectorAll('[data-action="toggle-lang"][data-lang]').forEach((b) => {
          const active = b.getAttribute('data-lang') === next
          b.setAttribute('aria-pressed', active ? 'true' : 'false')
        })
      }
    })
    // Settings drawer basic wiring
    const openBtn = document.getElementById('open-settings')
    const drawer = document.getElementById('settings-drawer')
    if (openBtn && drawer) {
      openBtn.addEventListener('click', () => {
        drawer.setAttribute('aria-hidden', 'false')
        drawer.classList.add('open')
      })
      // Close when clicking overlay or close button
      drawer.addEventListener('click', (e) => {
        // Close when clicking on the backdrop (drawer itself) or the explicit close button
        if (e.target === drawer || e.target.closest('[data-action="close-settings"]')) {
          drawer.setAttribute('aria-hidden', 'true')
          drawer.classList.remove('open')
        }
      })
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          drawer.setAttribute('aria-hidden', 'true')
          drawer.classList.remove('open')
        }
      })
    }
  }

  // expose init globally
  window.MDS_I18N = { init: initI18n, setLang }
  // auto-initialize on DOM ready to ensure settings works on homepage
  document.addEventListener('DOMContentLoaded', initI18n)
})()
