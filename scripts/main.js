const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const modeButtons = {
  editor: document.getElementById("editor-only"),
  split: document.getElementById("split-view"),
  preview: document.getElementById("preview-only"),
};
const fileTreeEl = document.getElementById("file-tree");
const currentRootEl = document.getElementById("current-root");
const openFolderBtn = document.getElementById("open-folder");
const openFileBtn = document.getElementById("open-file");
const saveFileBtn = document.getElementById("save-file");
const saveAsBtn = document.getElementById("save-as");
const newFileBtn = document.getElementById("new-file");
const deleteFileBtn = document.getElementById("delete-file");
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebarPane = document.querySelector(".sidebar-pane");

const TAB = "  ";

function extractDocumentTitle(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let fallback = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (!fallback) {
      fallback = trimmed;
    }

    const headingMatch = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      if (heading) {
        return heading;
      }
    }
  }

  return fallback || "document";
}

function sanitizeFilename(value) {
  const cleaned = value
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "document";
  }

  const limited = cleaned.length > 60 ? cleaned.slice(0, 60).trim() : cleaned;
  return limited.replace(/\s+/g, "-");
}

const defaultMarkdown = `# 欢迎来到 Markdown Studio

在左侧以 Markdown 语法创作内容，右侧会即时呈现排版后的效果。

## 快速示例

- **粗体** 与 *斜体*
- 行内代码示例：
  \`npm install\`
- 多行代码：

\`\`\`js
function greet(name) {
  console.log(\`Hi, ${name}!\`);
}
\`\`\`

> Tip: 使用工具栏切换视图或导出文件。

[了解 Markdown](https://markdown-guide.readthedocs.io/en/latest/)
`;

editor.value = defaultMarkdown;

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function renderInline(text) {
  let result = escapeHtml(text);

  result = result.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (_, alt, src, title) => {
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(
        alt
      )}"${titleAttr} class="inline-image" />`;
    }
  );

  result = result.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (_, label, href, title) => {
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
      return `<a href="${escapeAttribute(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
  );

  result = result.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, (_, content) => `<strong><em>${content}</em></strong>`);
  result = result.replace(/___([^_]+)___/g, (_, content) => `<strong><em>${content}</em></strong>`);
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => `<strong>${content}</strong>`);
  result = result.replace(/__([^_]+)__/g, (_, content) => `<strong>${content}</strong>`);
  result = result.replace(/\*([^*]+)\*/g, (_, content) => `<em>${content}</em>`);
  result = result.replace(/_([^_]+)_/g, (_, content) => `<em>${content}</em>`);
  result = result.replace(/~~([^~]+)~~/g, (_, content) => `<del>${content}</del>`);

  return result;
}

function markdownToHtml(markdown, nested = false) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines = [];
  let listType = null;
  let inTable = false;
  let tableRows = [];
  let paragraph = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```") || trimmed === "~~~") {
        html.push(
          `<pre><code${codeLang ? ` class="language-${escapeAttribute(codeLang)}"` : ""}>${escapeHtml(
            codeLines.join("\n")
          )}\n</code></pre>`
        );
        inCodeBlock = false;
        codeLang = "";
        codeLines = [];
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (!trimmed) {
      // flush table if open
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        if (tableHtml) html.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      flushParagraph();
      closeList();
      continue;
    }

    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      flushParagraph();
      closeList();
      inCodeBlock = true;
      codeLang = trimmed.slice(3).trim();
      continue;
    }

    const hrMatch = trimmed.match(/^([-*_])(\s*\1){2,}$/);
    if (hrMatch) {
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        if (tableHtml) html.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      flushParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        if (tableHtml) html.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      html.push(`<h${level}>${renderInline(content)}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      closeList();
      const quoteLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        quoteLines.push(lines[j].trim().replace(/^>\s?/, ""));
        j += 1;
      }
      html.push(`<blockquote>${markdownToHtml(quoteLines.join("\n"), true)}</blockquote>`);
      i = j - 1;
      continue;
    }

    const unorderedMatch = rawLine.match(/^\s*[-+*]\s+(.*)$/);
    if (unorderedMatch) {
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        if (tableHtml) html.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = rawLine.match(/^\s*\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (inTable) {
        const tableHtml = renderTable(tableRows);
        if (tableHtml) html.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${renderInline(orderedMatch[1])}</li>`);
      continue;
    }

    // Table detection: pipes with at least one '|' and aligned row separator
    if (/^\|.*\|$/.test(trimmed)) {
      // Possible header or data row
      const next = lines[i + 1] ? lines[i + 1].trim() : "";
      const isSep = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(next);
      if (!inTable) {
        // start table
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
      // consume separator line if present on next iteration
      if (isSep) {
        tableRows.push(next);
        i += 1;
      }
      continue;
    } else if (inTable) {
      // close table when encountering non-table content
      const tableHtml = renderTable(tableRows);
      if (tableHtml) html.push(tableHtml);
      inTable = false;
      tableRows = [];
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();

  // Flush any open table
  if (inTable) {
    const tableHtml = renderTable(tableRows);
    if (tableHtml) html.push(tableHtml);
  }

  const filteredHtml = html.filter(Boolean);
  if (!filteredHtml.length) {
    if (nested) {
      return "";
    }
    return '<div class="empty-state">开始输入 Markdown 查看实时预览</div>';
  }

  return filteredHtml.join("\n");
}

function renderTable(rows) {
  if (!rows || rows.length < 2) return "";
  const [headerLine, sepOrData] = rows;
  const isSeparator = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(sepOrData);
  const header = (isSeparator ? headerLine : rows[0])
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
  const startIndex = isSeparator ? 2 : 1;
  const dataRows = rows.slice(startIndex).map((line) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim())
  );

  const thead = `<thead><tr>${header.map((h) => `<th>${renderInline(h)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${dataRows
    .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function updatePreview() {
  const content = editor.value.trim();
  const html = markdownToHtml(content);
  preview.innerHTML = html;
  if (window.hljs) {
    preview.querySelectorAll("pre code").forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }
}

function removeLeadingIndent(line) {
  if (!line.length) {
    return { line, removed: 0 };
  }

  if (line.startsWith("\t")) {
    return { line: line.slice(1), removed: 1 };
  }

  if (line.startsWith(TAB)) {
    return { line: line.slice(TAB.length), removed: TAB.length };
  }

  const spaces = line.match(/^ +/);
  if (spaces) {
    const removeCount = Math.min(TAB.length, spaces[0].length);
    return { line: line.slice(removeCount), removed: removeCount };
  }

  return { line, removed: 0 };
}

function handleTabKey(event) {
  if (event.key !== "Tab") {
    return;
  }

  event.preventDefault();

  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const value = editor.value;
  const hasSelection = start !== end;
  const selectedText = value.slice(start, end);
  const isMultiLineSelection = hasSelection && selectedText.includes("\n");

  if (!event.shiftKey && (!hasSelection || !isMultiLineSelection)) {
    const insertion = TAB;
    editor.value = value.slice(0, start) + insertion + value.slice(end);
    const caret = start + insertion.length;
    editor.setSelectionRange(caret, caret);
    editor.dispatchEvent(new Event("input"));
    return;
  }

  if (isMultiLineSelection) {
    const blockStart = value.lastIndexOf("\n", start - 1) + 1;
    const blockEndCandidate = value.indexOf("\n", end);
    const blockEnd = blockEndCandidate === -1 ? value.length : blockEndCandidate;
    const block = value.slice(blockStart, blockEnd);
    const lines = block.split("\n");

    if (!event.shiftKey) {
      let offset = blockStart;
      let addedBeforeEnd = 0;
      const indentedLines = lines.map((line) => {
        if (offset < end) {
          addedBeforeEnd += TAB.length;
        }
        const indentedLine = line.length ? TAB + line : TAB;
        offset += line.length + 1;
        return indentedLine;
      });
      const indentedBlock = indentedLines.join("\n");
      editor.value = value.slice(0, blockStart) + indentedBlock + value.slice(blockEnd);
      const newStart = start + TAB.length;
      const newEnd = end + addedBeforeEnd;
      editor.setSelectionRange(newStart, newEnd);
      editor.dispatchEvent(new Event("input"));
      return;
    }

    let offset = blockStart;
    let removedBeforeStart = 0;
    let removedBeforeEnd = 0;
    let totalRemoved = 0;
    const dedentedLines = lines.map((line, index) => {
      const { line: trimmed, removed } = removeLeadingIndent(line);
      totalRemoved += removed;
      if (index === 0) {
        const startOffset = Math.max(0, start - blockStart);
        removedBeforeStart = Math.min(removed, startOffset);
      }
      if (offset < end) {
        const endOffset = Math.max(0, end - offset);
        removedBeforeEnd += Math.min(removed, endOffset);
      }
      offset += line.length + 1;
      return trimmed;
    });

    const dedentedBlock = dedentedLines.join("\n");
    editor.value = value.slice(0, blockStart) + dedentedBlock + value.slice(blockEnd);
    const newStart = start - removedBeforeStart;
    const newEnd = end - removedBeforeEnd;
    editor.setSelectionRange(newStart, newEnd);
    if (totalRemoved) {
      editor.dispatchEvent(new Event("input"));
    }
    return;
  }

  if (event.shiftKey && !hasSelection) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndCandidate = value.indexOf("\n", start);
    const lineEnd = lineEndCandidate === -1 ? value.length : lineEndCandidate;
    const line = value.slice(lineStart, lineEnd);
    const { line: trimmed, removed } = removeLeadingIndent(line);
    if (!removed) {
      return;
    }
    editor.value = value.slice(0, lineStart) + trimmed + value.slice(lineEnd);
    const caret = start - Math.min(removed, start - lineStart);
    editor.setSelectionRange(caret, caret);
    editor.dispatchEvent(new Event("input"));
  }
}

function setActiveMode(mode) {
  document.body.classList.remove(
    "mode-editor-only",
    "mode-preview-only",
    "mode-split"
  );
  Object.values(modeButtons).forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });

  if (mode === "editor") {
    document.body.classList.add("mode-editor-only");
    modeButtons.editor.setAttribute("aria-pressed", "true");
  } else if (mode === "preview") {
    document.body.classList.add("mode-preview-only");
    modeButtons.preview.setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.add("mode-split");
    modeButtons.split.setAttribute("aria-pressed", "true");
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportMarkdown() {
  const content = editor.value;
  const documentTitle = extractDocumentTitle(content);
  const filename = `${sanitizeFilename(documentTitle)}.md`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(filename, blob);
}

function exportHtml() {
  const documentTitle = extractDocumentTitle(editor.value);
  const filename = `${sanitizeFilename(documentTitle)}.html`;
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(documentTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<style>
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 760px; margin: 64px auto; line-height: 1.7; color: #1d1d1f; padding: 0 24px; }
  pre { background: #f5f5f7; padding: 16px; border-radius: 12px; overflow-x: auto; }
  code { font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; }
  blockquote { border-left: 4px solid rgba(60,60,67,0.3); padding: 0.6em 1.2em; margin: 1.4em 0; background: rgba(142,142,147,0.12); border-radius: 0 12px 12px 0; color: rgba(60,60,67,0.8); }
  table { border-collapse: collapse; width: 100%; margin: 1.6em 0; }
  th, td { border: 1px solid rgba(0,0,0,0.07); padding: 10px 12px; text-align: left; }
  th { background: rgba(142,142,147,0.12); }
  .inline-image { max-width: 100%; height: auto; display: block; margin: 0.8em auto; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 6px 20px rgba(0,0,0,0.08); background: #fff; }
  a { color: #0a84ff; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
${markdownToHtml(editor.value)}
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    if (window.hljs) {
      window.hljs.highlightAll();
    }
  });
</script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  downloadBlob(filename, blob);
}

editor.addEventListener("input", () => {
  updatePreview();
  localStorage.setItem("markdown-studio-content", editor.value);
});

editor.addEventListener("keydown", handleTabKey);

modeButtons.editor.addEventListener("click", () => setActiveMode("editor"));
modeButtons.split.addEventListener("click", () => setActiveMode("split"));
modeButtons.preview.addEventListener("click", () => setActiveMode("preview"));

document.getElementById("export-markdown").addEventListener("click", exportMarkdown);
document.getElementById("export-html").addEventListener("click", exportHtml);

(function restoreContent() {
  const saved = localStorage.getItem("markdown-studio-content");
  if (saved) {
    editor.value = saved;
  }
})();

setActiveMode("split");
updatePreview();

// --- File System Access API integration ---
let currentFileHandle = null;
let currentDirectoryHandle = null;

function fsSupported() {
  return (
    typeof window.showOpenFilePicker === "function" ||
    typeof window.showDirectoryPicker === "function" ||
    typeof window.showSaveFilePicker === "function"
  );
}

async function readFileHandle(fileHandle) {
  const file = await fileHandle.getFile();
  const text = await file.text();
  return text;
}

function fileIcon(name) {
  return name.toLowerCase().endsWith(".md") ? "📄" : "📎";
}

function renderFileItem(name, handle, isActive = false) {
  const item = document.createElement("div");
  item.className = `file-item${isActive ? " active" : ""}`;
  item.dataset.name = name;
  item.innerHTML = `<span class="file-icon">${fileIcon(name)}</span><span class="file-name" title="${name}">${name}</span>`;
  item.addEventListener("click", async () => {
    try {
      if (handle.kind === "file") {
        const content = await readFileHandle(handle);
        editor.value = content;
        currentFileHandle = handle;
        updatePreview();
        fileTreeEl.querySelectorAll(".file-item").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
      }
    } catch (err) {
      console.error(err);
      alert("读取文件失败: " + (err && err.message ? err.message : err));
    }
  });
  return item;
}

async function buildFileTree(dirHandle) {
  currentDirectoryHandle = dirHandle;
  fileTreeEl.innerHTML = "";
  const rootLabel = dirHandle.name || "已选择目录";
  currentRootEl.textContent = rootLabel;
  for await (const entry of dirHandle.values()) {
    try {
      if (entry.kind === "file") {
        const name = entry.name;
        if (/\.md$/i.test(name)) {
          const item = renderFileItem(name, entry, false);
          fileTreeEl.appendChild(item);
        }
      }
      // For simplicity, omit nested directories for now; can be expanded later.
    } catch (e) {
      console.warn("跳过条目:", e);
    }
  }
}

async function openDirectory() {
  if (!fsSupported() || typeof window.showDirectoryPicker !== "function") {
    alert("当前浏览器不支持目录访问 API，请使用最新的 Chrome/Edge 或启用安全上下文(HTTPS)。");
    return;
  }
  try {
    const dirHandle = await window.showDirectoryPicker();
    await buildFileTree(dirHandle);
  } catch (err) {
    if (err && err.name === "AbortError") return;
    console.error(err);
    alert("打开目录失败: " + (err && err.message ? err.message : err));
  }
}

async function openFile() {
  if (!fsSupported() || typeof window.showOpenFilePicker !== "function") {
    alert("当前浏览器不支持文件选择 API。");
    return;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "Markdown 文件",
          accept: { "text/markdown": [".md", ".markdown"] },
        },
      ],
    });
    if (handle) {
      const content = await readFileHandle(handle);
      editor.value = content;
      currentFileHandle = handle;
      updatePreview();
    }
  } catch (err) {
    if (err && err.name === "AbortError") return;
    console.error(err);
    alert("打开文件失败: " + (err && err.message ? err.message : err));
  }
}

async function saveToHandle(handle) {
  const writable = await handle.createWritable();
  await writable.write(editor.value);
  await writable.close();
}

async function saveFile() {
  try {
    if (currentFileHandle) {
      await saveToHandle(currentFileHandle);
      return alert("已保存到当前文件。");
    }
    return await saveAs();
  } catch (err) {
    console.error(err);
    alert("保存失败: " + (err && err.message ? err.message : err));
  }
}

async function saveAs() {
  if (!fsSupported() || typeof window.showSaveFilePicker !== "function") {
    // Fallback: download
    exportMarkdown();
    return;
  }
  try {
    const documentTitle = extractDocumentTitle(editor.value);
    const suggestedName = `${sanitizeFilename(documentTitle)}.md`;
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "Markdown 文件",
          accept: { "text/markdown": [".md", ".markdown"] },
        },
      ],
    });
    await saveToHandle(handle);
    currentFileHandle = handle;
    alert("保存成功。");
  } catch (err) {
    if (err && err.name === "AbortError") return;
    console.error(err);
    alert("保存失败: " + (err && err.message ? err.message : err));
  }
}

openFolderBtn.addEventListener("click", openDirectory);
openFileBtn.addEventListener("click", openFile);
saveFileBtn.addEventListener("click", saveFile);
saveAsBtn.addEventListener("click", saveAs);
newFileBtn.addEventListener("click", async () => {
  try {
    if (!currentDirectoryHandle) {
      alert("请先打开一个目录再新建文件。");
      return;
    }
    const suggestedName = `${sanitizeFilename(extractDocumentTitle(editor.value))}.md`;
    const name = prompt("输入新文件名:", suggestedName) || suggestedName;
    const handle = await currentDirectoryHandle.getFileHandle(name, { create: true });
    await saveToHandle(handle);
    currentFileHandle = handle;
    await buildFileTree(currentDirectoryHandle);
    alert("新建并保存成功。");
  } catch (err) {
    console.error(err);
    alert("新建文件失败: " + (err && err.message ? err.message : err));
  }
});

deleteFileBtn.addEventListener("click", async () => {
  try {
    if (!currentFileHandle || !currentDirectoryHandle) {
      alert("请先选择要删除的文件。");
      return;
    }
    const name = currentFileHandle.name;
    if (!confirm(`确定删除文件: ${name} ?`)) return;
    await currentDirectoryHandle.removeEntry(name);
    currentFileHandle = null;
    editor.value = "";
    updatePreview();
    await buildFileTree(currentDirectoryHandle);
    alert("已删除文件。");
  } catch (err) {
    console.error(err);
    alert("删除文件失败: " + (err && err.message ? err.message : err));
  }
});

toggleSidebarBtn.addEventListener("click", () => {
  const hidden = document.body.classList.toggle("sidebar-hidden");
  toggleSidebarBtn.textContent = hidden ? "显示侧栏" : "隐藏侧栏";
});

// --- Synced scrolling in split mode ---
let isSyncingScroll = false;
let lastScrollSource = null; // 'editor' | 'preview'

function inSplitMode() {
  return document.body.classList.contains("mode-split");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getScrollRatio(el) {
  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return 0;
  return clamp(el.scrollTop / max, 0, 1);
}

function setScrollRatio(el, ratio) {
  const max = el.scrollHeight - el.clientHeight;
  el.scrollTop = Math.round(max * clamp(ratio, 0, 1));
}

function syncScroll(source) {
  if (!inSplitMode()) return;
  if (isSyncingScroll && lastScrollSource === source) return;
  isSyncingScroll = true;
  lastScrollSource = source;
  try {
    const ratio = source === "editor" ? getScrollRatio(editor) : getScrollRatio(preview);
    if (source === "editor") {
      setScrollRatio(preview, ratio);
    } else {
      setScrollRatio(editor, ratio);
    }
  } finally {
    // Use microtask to allow scrollTop to settle
    Promise.resolve().then(() => {
      isSyncingScroll = false;
    });
  }
}

editor.addEventListener("scroll", () => syncScroll("editor"));
preview.addEventListener("scroll", () => syncScroll("preview"));

// Ensure mode change keeps scroll listeners effective
// Recompute when switching modes
const originalSetActiveMode = setActiveMode;
setActiveMode = function patchedSetActiveMode(mode) {
  originalSetActiveMode(mode);
  // After mode change, do a one-shot sync to align positions
  if (mode === "split") {
    syncScroll("editor");
  }
};
