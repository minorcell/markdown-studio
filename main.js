const STORAGE_KEY = "macos-finder-state-v1";
const IMAGE_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAEK0lEQVR4nO3dQY7kQBBF0RrD/33TElgJ6E6HGZWrM9f9cU7Iv0d4hdEAAAAAAAAAAD8ZK4Cv+u9bg0DAAAAZk6YLHXw621n8AVQAIDTzcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTDcAWAACTPc9Y+++41f1n8eav3qAAAwfplz3xD/uUv+abzgPwAA2OI5V6wDAKBxx1MDAADmHkzuAABg7gVgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw3AFgAAAw/0n7n09G9r9VX+ZJf86AAA49pdecQ4AAIwdTz0AAJhbM7kAAIA5FwAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMNwBYAAAMN/0l73k7G9r9UX+aJP8+gAAOPaXnnEOAACMHU89AACYWzO5AACAOYMAAACGcwEAAIbzAQAAYbwAAACG8wEAAIbzAQAAYbwAAACG8wEAAIbzAQAAYbwAAACG8wEAAIbzAQAAYbwAAACG8wEAAIbzAQAAYbyf93zXV/f+ar/MEv+fQAAHHtLzzgHAAAjh6ceAABw17XnqFF17777PPLII1/2wjt/8YtjXOv06fPPPvssIyMjjzvuuEMfffTRRx999NHHH388lB0AAACc/Xr/Dnm2Cw/9dyTEMAAAAAAAAAAAoOsBjwi+1JNsPmMAAAAASUVORK5CYII=";

function generateId() {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return Date.now();
}

function createFolder(name, children = []) {
  const timestamp = now();
  return {
    id: generateId(),
    type: "folder",
    name,
    children,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createFile(name, { content = "", mime = "text/plain" } = {}) {
  const timestamp = now();
  return {
    id: generateId(),
    type: "file",
    name,
    content,
    mime,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function getDefaultState() {
  const documents = createFolder("文稿", [
    createFile("欢迎来到 Finder.md", {
      mime: "text/markdown",
      content: `# 欢迎使用 Finder 风格的文件管理器\n\n- 左侧边栏浏览文件夹\n- 中间列表中双击文件夹即可进入\n- 选中文件后在右侧查看预览并编辑\n- 顶部工具栏支持新建、重命名和删除操作\n\n祝你探索愉快！`,
    }),
    createFile("会议纪要.txt", {
      mime: "text/plain",
      content: `项目：网页文件管理器\n日期：2024-05-20\n负责人：Alice\n\n进度：\n- ✅ 初版界面设计\n- ✅ 数据模型搭建\n- ⏳ 交互完善中`,
    }),
  ]);

  const pictures = createFolder("图片", [
    createFile("海边日落.png", {
      mime: "image/png",
      content: IMAGE_PLACEHOLDER,
    }),
  ]);

  const projects = createFolder("Projects", [
    createFile("roadmap.json", {
      mime: "application/json",
      content: JSON.stringify(
        {
          goals: ["Refine preview", "Add drag & drop", "Share links"],
          owner: "Codex",
          updated: new Date().toISOString(),
        },
        null,
        2
      ),
    }),
  ]);

  const downloads = createFolder("下载");
  const desktop = createFolder("桌面");

  const root = createFolder("Macintosh HD", [
    documents,
    pictures,
    projects,
    desktop,
    downloads,
  ]);

  return {
    root,
    currentFolderId: root.id,
    selectedId: null,
  };
}

function findNode(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  if (root.type === "folder") {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function findParent(root, id, parent = null) {
  if (!root) return null;
  if (root.id === id) {
    return parent;
  }
  if (root.type === "folder") {
    for (const child of root.children) {
      const result = findParent(child, id, root);
      if (result) return result;
    }
  }
  return null;
}

function getPathToNode(node, targetId, path = []) {
  if (!node) return null;
  const nextPath = [...path, node];
  if (node.id === targetId) {
    return nextPath;
  }
  if (node.type === "folder") {
    for (const child of node.children) {
      const found = getPathToNode(child, targetId, nextPath);
      if (found) return found;
    }
  }
  return null;
}

function sortItems(children = []) {
  return [...children].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name, "zh-CN", { sensitivity: "base" });
    }
    return a.type === "folder" ? -1 : 1;
  });
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch (error) {
    return new Date(timestamp).toLocaleString();
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let size = bytes;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size % 1 ? size.toFixed(1) : size.toFixed(0)} ${units[index]}`;
}

function estimateSizeFromContent(content = "") {
  try {
    return new TextEncoder().encode(content).length;
  } catch (error) {
    return content.length;
  }
}

function detectMimeFromName(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return "text/markdown";
    case "txt":
      return "text/plain";
    case "json":
      return "application/json";
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "css":
    case "html":
      return "text/plain";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "text/plain";
  }
}

function defaultContentForMime(mime) {
  if (mime === "application/json") {
    return JSON.stringify({ new: true }, null, 2);
  }
  if (mime === "text/markdown") {
    return `# 新建文档\n\n在此开始书写…`;
  }
  if (mime === "text/plain") {
    return "";
  }
  return "";
}

function isTextFile(file) {
  if (!file || file.type !== "file") return false;
  return (
    file.mime.startsWith("text/") ||
    ["application/json", "application/xml"].includes(file.mime)
  );
}

function isImageFile(file) {
  return file?.type === "file" && file.mime.startsWith("image/");
}

function deriveIconName(item) {
  if (item.type === "folder") return "folder";
  if (isImageFile(item)) return "image";
  if (isTextFile(item)) {
    const lower = item.name.toLowerCase();
    if (/(json|js|ts|jsx|tsx|css|html)$/.test(lower)) {
      return "code";
    }
    return "text";
  }
  return "file";
}

function ensureUniqueName(folder, name) {
  const siblings = folder.children?.map((item) => item.name) ?? [];
  if (!siblings.includes(name)) return name;

  const extIndex = name.lastIndexOf(".");
  const base = extIndex > 0 ? name.slice(0, extIndex) : name;
  const ext = extIndex > 0 ? name.slice(extIndex) : "";
  let counter = 2;
  let candidate = `${base} ${counter}${ext}`;
  while (siblings.includes(candidate)) {
    counter += 1;
    candidate = `${base} ${counter}${ext}`;
  }
  return candidate;
}

class FileManagerApp {
  constructor(rootElement) {
    this.root = rootElement;
    if (!this.root) {
      throw new Error("未找到应用容器");
    }
    this.statusTimer = null;
    this.loadState();
    this.renderShell();
    this.bindEvents();
    this.renderAll();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
        return;
      }
    } catch (error) {
      console.warn("读取本地数据失败，使用默认数据", error);
    }
    this.state = getDefaultState();
  }

  persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn("保存到本地失败", error);
    }
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="finder-window">
        <div class="titlebar">
          <div class="traffic-lights">
            <button class="close" aria-label="关闭窗口"></button>
            <button class="minimize" aria-label="最小化窗口"></button>
            <button class="fullscreen" aria-label="全屏窗口"></button>
          </div>
          <div class="title">Finder</div>
        </div>
        <div class="toolbar">
          <div class="breadcrumb" data-role="breadcrumb"></div>
          <div class="actions" data-role="actions">
            <button data-action="new-folder">新建文件夹</button>
            <button data-action="new-file">新建文件</button>
            <button data-action="rename">重命名</button>
            <button data-action="delete">删除</button>
          </div>
          <div class="status" data-role="status"></div>
        </div>
        <div class="main">
          <aside class="sidebar" data-role="sidebar"></aside>
          <section class="content-area" data-role="content"></section>
          <section class="preview" data-role="preview"></section>
        </div>
      </div>
    `;

    this.elements = {
      breadcrumb: this.root.querySelector('[data-role="breadcrumb"]'),
      actions: this.root.querySelector('[data-role="actions"]'),
      sidebar: this.root.querySelector('[data-role="sidebar"]'),
      content: this.root.querySelector('[data-role="content"]'),
      preview: this.root.querySelector('[data-role="preview"]'),
      status: this.root.querySelector('[data-role="status"]'),
    };
  }

  bindEvents() {
    this.elements.actions.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (!action) return;
      switch (action) {
        case "new-folder":
          this.createFolder();
          break;
        case "new-file":
          this.createFile();
          break;
        case "rename":
          this.renameSelection();
          break;
        case "delete":
          this.removeSelection();
          break;
        default:
          break;
      }
    });

    this.elements.sidebar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-folder]");
      if (!button) return;
      this.openFolder(button.dataset.folder);
    });

    this.elements.breadcrumb.addEventListener("click", (event) => {
      const crumb = event.target.closest("[data-breadcrumb]");
      if (!crumb) return;
      this.openFolder(crumb.dataset.breadcrumb);
    });

    this.elements.content.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-item-id]");
      if (!tile) return;
      const itemId = tile.dataset.itemId;
      this.selectItem(itemId);
    });

    this.elements.content.addEventListener("dblclick", (event) => {
      const tile = event.target.closest("[data-item-id]");
      if (!tile) return;
      const itemId = tile.dataset.itemId;
      const target = this.getItem(itemId);
      if (!target) return;
      if (target.type === "folder") {
        this.openFolder(itemId);
      } else {
        this.selectItem(itemId);
      }
    });

    this.elements.preview.addEventListener("input", (event) => {
      if (event.target.matches("textarea[data-file-id]")) {
        const form = event.target.closest("form[data-role='editor']");
        const saveButton = form?.querySelector("button[type='submit']");
        if (form) form.dataset.dirty = "true";
        if (saveButton) saveButton.disabled = false;
      }
    });

    this.elements.preview.addEventListener("submit", (event) => {
      if (!event.target.matches("form[data-role='editor']")) return;
      event.preventDefault();
      const textarea = event.target.querySelector("textarea[data-file-id]");
      if (!textarea) return;
      this.updateFileContent(textarea.dataset.fileId, textarea.value);
      const saveButton = event.target.querySelector("button[type='submit']");
      if (event.target) event.target.dataset.dirty = "false";
      if (saveButton) saveButton.disabled = true;
    });
  }

  renderAll() {
    this.renderBreadcrumb();
    this.renderSidebar();
    this.renderContent();
    this.renderPreview();
    this.persistState();
  }

  get currentFolder() {
    return findNode(this.state.root, this.state.currentFolderId);
  }

  get selection() {
    if (!this.state.selectedId) return null;
    return findNode(this.state.root, this.state.selectedId);
  }

  getItem(id) {
    return findNode(this.state.root, id);
  }

  openFolder(folderId) {
    const folder = this.getItem(folderId);
    if (!folder || folder.type !== "folder") return;
    this.state.currentFolderId = folderId;
    this.state.selectedId = null;
    this.renderAll();
  }

  selectItem(itemId) {
    const target = this.getItem(itemId);
    if (!target) return;
    this.state.selectedId = itemId;
    this.renderContent();
    this.renderPreview();
    this.persistState();
  }

  createFolder() {
    const parent = this.currentFolder;
    if (!parent || parent.type !== "folder") return;
    let name = prompt("请输入文件夹名称", "新建文件夹");
    if (name === null) return;
    name = name.trim();
    if (!name) {
      this.flashMessage("名称不能为空");
      return;
    }
    name = ensureUniqueName(parent, name);
    const folder = createFolder(name);
    parent.children.push(folder);
    this.touchPath(folder.id);
    this.state.selectedId = folder.id;
    this.renderAll();
    this.flashMessage(`已创建文件夹“${name}”`);
  }

  createFile() {
    const parent = this.currentFolder;
    if (!parent || parent.type !== "folder") return;
    let name = prompt("请输入文件名（包含扩展名）", "新建文稿.txt");
    if (name === null) return;
    name = name.trim();
    if (!name) {
      this.flashMessage("文件名不能为空");
      return;
    }
    name = ensureUniqueName(parent, name);
    const mime = detectMimeFromName(name);
    const content = defaultContentForMime(mime);
    const file = createFile(name, { mime, content });
    parent.children.push(file);
    this.touchPath(file.id);
    this.state.selectedId = file.id;
    this.renderAll();
    this.flashMessage(`已创建文件“${name}”`);
  }

  renameSelection() {
    const selected = this.selection;
    if (!selected) {
      this.flashMessage("请先选择一个项目");
      return;
    }
    if (selected.id === this.state.root.id) {
      this.flashMessage("无法重命名根目录");
      return;
    }
    const currentName = selected.name;
    let name = prompt("请输入新的名称", currentName);
    if (name === null) return;
    name = name.trim();
    if (!name) {
      this.flashMessage("名称不能为空");
      return;
    }
    const parent = findParent(this.state.root, selected.id);
    if (!parent) return;
    if (parent.children.some((item) => item.name === name && item.id !== selected.id)) {
      this.flashMessage("同名项目已存在");
      return;
    }
    selected.name = name;
    selected.updatedAt = now();
    parent.updatedAt = now();
    this.touchPath(selected.id);
    this.renderAll();
    this.flashMessage("名称已更新");
  }

  removeSelection() {
    const selected = this.selection;
    if (!selected) {
      this.flashMessage("请先选择一个项目");
      return;
    }
    if (selected.id === this.state.root.id) {
      this.flashMessage("无法删除根目录");
      return;
    }
    const parent = findParent(this.state.root, selected.id);
    if (!parent) return;
    const confirmed = confirm(`确定要删除“${selected.name}”吗？`);
    if (!confirmed) return;
    parent.children = parent.children.filter((item) => item.id !== selected.id);
    parent.updatedAt = now();
    if (this.state.selectedId === selected.id) {
      this.state.selectedId = null;
    }
    this.touchPath(parent.id);
    this.renderAll();
    this.flashMessage("项目已删除");
  }

  updateFileContent(fileId, content) {
    const file = this.getItem(fileId);
    if (!file || file.type !== "file") return;
    file.content = content;
    file.updatedAt = now();
    this.touchPath(file.id);
    this.renderPreview();
    this.persistState();
    this.flashMessage("已保存修改");
  }

  touchPath(targetId) {
    const path = getPathToNode(this.state.root, targetId);
    if (!path) return;
    const timestamp = now();
    path.forEach((node) => {
      node.updatedAt = timestamp;
    });
  }

  renderSidebar() {
    const root = this.state.root;
    const buildButtons = (folder, depth = 0) => {
      const isActive = folder.id === this.state.currentFolderId;
      const icon = depth === 0 ? "💻" : "📁";
      let markup = `
        <button class="sidebar-item ${isActive ? "active" : ""}" data-folder="${folder.id}" style="--depth:${depth}">
          <span class="dot"></span>
          <span aria-hidden="true">${icon}</span>
          <span class="name">${folder.name}</span>
        </button>
      `;
      if (folder.children?.length) {
        folder.children
          .filter((item) => item.type === "folder")
          .forEach((child) => {
            markup += buildButtons(child, depth + 1);
          });
      }
      return markup;
    };

    this.elements.sidebar.innerHTML = `
      <div class="sidebar-section">
        <h2>位置</h2>
        ${buildButtons(root)}
      </div>
    `;
  }

  renderBreadcrumb() {
    const path = getPathToNode(this.state.root, this.state.currentFolderId) ?? [
      this.state.root,
    ];
    const markup = path
      .map((node, index) => {
        const active = index === path.length - 1;
        return `
          <button class="${active ? "active" : ""}" data-breadcrumb="${node.id}">
            ${node.name}
          </button>
        `;
      })
      .join('<span class="separator">›</span>');
    this.elements.breadcrumb.innerHTML = markup;
  }

  renderContent() {
    const folder = this.currentFolder;
    if (!folder || folder.type !== "folder") return;
    const items = sortItems(folder.children);
    const tiles = items
      .map((item) => {
        const selected = item.id === this.state.selectedId;
        const icon = deriveIconName(item);
        return `
          <article class="file-item ${selected ? "selected" : ""}" data-item-id="${item.id}" data-type="${item.type}">
            <div class="file-icon ${icon} ${item.type}">
              ${item.type === "folder" ? "📁" : "📄"}
            </div>
            <div class="file-name" title="${escapeHtml(item.name)}">${escapeHtml(
          item.name
        )}</div>
          </article>
        `;
      })
      .join("");

    this.elements.content.innerHTML = `
      <div class="content-header">
        <div class="title">${folder.name}</div>
        <div class="meta">${items.length} 个项目</div>
      </div>
      <div class="file-grid">
        ${tiles || '<div class="empty-state">这个文件夹目前是空的，点击上方按钮新建文件或文件夹。</div>'}
      </div>
    `;
  }

  renderPreview() {
    const selection = this.selection;
    if (!selection) {
      this.elements.preview.innerHTML = `
        <div class="preview-empty">
          选择一个项目后即可在此查看详细信息与预览。
        </div>
      `;
      return;
    }

    const icon = deriveIconName(selection);
    const metadataEntries = [
      { label: "类型", value: selection.type === "folder" ? "文件夹" : selection.mime },
      { label: "创建时间", value: formatDate(selection.createdAt) },
      { label: "修改时间", value: formatDate(selection.updatedAt) },
    ];

    if (selection.type === "file") {
      const size = estimateSizeFromContent(selection.content);
      metadataEntries.push({ label: "大小", value: formatBytes(size) });
    } else {
      const count = selection.children?.length ?? 0;
      metadataEntries.push({ label: "包含项目", value: `${count} 个` });
    }

    const metadata = metadataEntries
      .map(
        ({ label, value }) => `
          <div>
            <div class="label">${label}</div>
            <div>${escapeHtml(String(value))}</div>
          </div>
        `
      )
      .join("");

    let body = "";
    if (selection.type === "folder") {
      body = `
        <div class="preview-blob">双击中间文件夹可继续浏览，或在此文件夹中新建项目。</div>
      `;
    } else if (isImageFile(selection)) {
      body = `
        <div class="preview-image">
          <img src="${selection.content}" alt="${escapeHtml(selection.name)}" />
        </div>
      `;
    } else if (isTextFile(selection)) {
      body = `
        <form data-role="editor">
          <textarea data-file-id="${selection.id}" spellcheck="false">${escapeHtml(
        selection.content
      )}</textarea>
          <div class="preview-actions">
            <button type="submit" disabled>保存</button>
          </div>
        </form>
      `;
    } else {
      body = `
        <div class="preview-blob">当前文件类型暂不支持预览，请下载后在本地打开。</div>
      `;
    }

    this.elements.preview.innerHTML = `
      <div class="preview-header">
        <div class="file-icon ${icon} ${selection.type}">
          ${selection.type === "folder" ? "📁" : "📄"}
        </div>
        <div class="info">
          <div class="name">${escapeHtml(selection.name)}</div>
          <div class="meta">${selection.type === "folder" ? "文件夹" : selection.mime}</div>
        </div>
      </div>
      <div class="preview-body">
        ${body}
        <div class="preview-metadata">${metadata}</div>
      </div>
    `;
  }

  flashMessage(text) {
    const el = this.elements.status;
    if (!el) return;
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      el.classList.remove("visible");
      el.textContent = "";
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FileManagerApp(document.getElementById("app"));
});
