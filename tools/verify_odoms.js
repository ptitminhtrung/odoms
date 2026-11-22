#!/usr/bin/env node
"use strict";

/**
 * ============================================================================
 * SCRIPT GÁC CỔNG TỰ ĐỘNG DỰ ÁN ODOMS (0 THƯ VIỆN NGOÀI)
 * Vị trí: S:\HTTT\tools\verify_odoms.js
 * Chế độ mặc định (CHỈ ĐỌC CỤC BỘ — KHÔNG GHI ĐÈ GOOGLE SHEETS):
 *   node S:\HTTT\tools\verify_odoms.js
 *     1. Kiểm tra cú pháp JS bằng `node --check` (+ biên dịch cú pháp `.gs`).
 *     2. Kiểm tra trùng lặp thuộc tính `id` trên `01_ODOMS_WEB_APP/index.html`.
 *     3. Quét sạch thuật ngữ IT cấm trên giao diện (`index.html` & `js/app.js`).
 *     4. Quét đơn vị tiền tệ cũ (`đ`, `₫`, `VNĐ`) — đảm bảo chỉ dùng `VND`.
 *     5. Kiểm tra chốt chặn chống ghi đè Google Sheets & bất biến dữ liệu lõi.
 *
 * Chế độ kiểm thử chỉ đọc Google Sheets (GET ?action=PULL_ALL — KHÔNG POST):
 *   node S:\HTTT\tools\verify_odoms.js --pull-only
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const WEB_APP_DIR = path.join(ROOT_DIR, "01_ODOMS_WEB_APP");
const BACKEND_DIR = path.join(ROOT_DIR, "02_REALTIME_BACKEND_SYNC");

const PATHS = {
  indexHtml: path.join(WEB_APP_DIR, "index.html"),
  appJs: path.join(WEB_APP_DIR, "js", "app.js"),
  omsEngineJs: path.join(WEB_APP_DIR, "js", "oms_engine.js"),
  mockDataJs: path.join(WEB_APP_DIR, "js", "mock_data.js"),
  excelHandlerJs: path.join(WEB_APP_DIR, "js", "excel_handler.js"),
  styleCss: path.join(WEB_APP_DIR, "css", "style.css"),
  backendGs: path.join(BACKEND_DIR, "ODOMS_Backend_API.gs"),
  fifoGs: path.join(BACKEND_DIR, "FIFO_Engine.gs"),
  selfScript: __filename
};

const PULL_ONLY_MODE = process.argv.includes("--pull-only");

function relPath(absPath) {
  return path.relative(ROOT_DIR, absPath).replace(/\\/g, "/");
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function maskKeepNewlines(str) {
  return str.replace(/[^\r\n]/g, " ");
}

function normalizeInlineText(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/__ODOMS_EXPR__/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlKeepVisibleLines(raw, baseLine) {
  const clean = raw
    .replace(/<!--[\s\S]*?-->/g, maskKeepNewlines)
    .replace(/<style\b[\s\S]*?<\/style>/gi, maskKeepNewlines)
    .replace(/<script\b[\s\S]*?<\/script>/gi, maskKeepNewlines);

  const lineExtras = new Map();
  const addExtra = (offset, val) => {
    const ln = baseLine + clean.slice(0, offset).split("\n").length - 1;
    if (!lineExtras.has(ln)) lineExtras.set(ln, []);
    lineExtras.get(ln).push(val);
  };

  const textOnly = clean.replace(/<[^>]+>/g, (tag, offset) => {
    const attrRe = /\b(?:title|placeholder|aria-label|alt)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    let m;
    while ((m = attrRe.exec(tag)) !== null) {
      const val = m[1] !== undefined ? m[1] : m[2];
      if (val && val.trim()) {
        addExtra(offset + m.index, val);
      }
    }
    return maskKeepNewlines(tag);
  });

  const out = [];
  textOnly.split(/\r?\n/).forEach((line, idx) => {
    const ln = baseLine + idx;
    const extras = lineExtras.get(ln) || [];
    const combined = normalizeInlineText(line + " " + extras.join(" "));
    if (combined) {
      out.push({ lineNo: ln, text: combined });
    }
  });
  return out;
}

/**
 * Tách văn bản hiển thị giao diện người dùng trong tệp JS (`js/app.js`):
 * - Bỏ qua comment (`//`, `/* ... *\/`), `console.*(...)`, CSS inline (`styleEl.textContent = ...`),
 *   khóa thuộc tính đối tượng (`"SKU phân loại": sku`), và các thẻ/thuộc tính HTML kỹ thuật.
 * - Giữ nguyên số dòng gốc (1-based) để báo cáo chính xác từng vị trí.
 */
function extractJsVisibleUiLines(src) {
  const results = [];
  let i = 0;
  let lineNo = 1;
  const n = src.length;

  function isObjectPropertyKey(openQuotePos, afterCloseQuotePos) {
    let p = openQuotePos - 1;
    while (p >= 0 && /\s/.test(src[p])) p--;
    const prevChar = p >= 0 ? src[p] : "";
    if (prevChar !== "{" && prevChar !== ",") return false;

    let q = afterCloseQuotePos;
    while (q < n && /\s/.test(src[q])) q++;
    return src[q] === ":";
  }

  function scanRange(endIdx, stopAtBrace) {
    let depth = 0;
    while (i < endIdx) {
      const ch = src[i];
      const next = src[i + 1];

      if (ch === "\n") {
        lineNo++;
        i++;
        continue;
      }
      // Line comment
      if (ch === "/" && next === "/") {
        while (i < endIdx && src[i] !== "\n") i++;
        continue;
      }
      // Block comment
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < endIdx && !(src[i] === "*" && src[i + 1] === "/")) {
          if (src[i] === "\n") lineNo++;
          i++;
        }
        i += 2;
        continue;
      }

      if (stopAtBrace) {
        if (ch === "{") {
          depth++;
          i++;
          continue;
        }
        if (ch === "}") {
          if (depth === 0) return;
          depth--;
          i++;
          continue;
        }
      }

      // Single or double quoted string
      if (ch === "'" || ch === '"') {
        const quote = ch;
        const openPos = i;
        const startLine = lineNo;
        const prevSlice = src.slice(Math.max(0, openPos - 50), openPos);
        const isConsole = /console\.(?:log|warn|error|info|debug)\s*\([^)]*$/.test(prevSlice);

        i++;
        let buf = "";
        while (i < endIdx && src[i] !== quote) {
          if (src[i] === "\\") {
            buf += src[i] + (src[i + 1] || "");
            if (src[i + 1] === "\n") lineNo++;
            i += 2;
          } else {
            if (src[i] === "\n") lineNo++;
            buf += src[i++];
          }
        }
        i++; // past closing quote

        const isObjKey = isObjectPropertyKey(openPos, i);
        if (!isConsole && !isObjKey && (/[À-ỹ₫]/.test(buf) || /<[a-z][^>]*>[\s\S]*?<\/[a-z]/i.test(buf))) {
          results.push(...stripHtmlKeepVisibleLines(buf, startLine));
        }
        continue;
      }

      // Template literal
      if (ch === "`") {
        const openPos = i;
        const startLine = lineNo;
        const prevSlice = src.slice(Math.max(0, openPos - 65), openPos);
        const isConsole = /console\.(?:log|warn|error|info|debug)\s*\([^)]*$/.test(prevSlice);
        const isStyleBlock = /styleEl\.textContent\s*=\s*$/.test(prevSlice) || /textContent\s*=\s*$/.test(prevSlice);

        i++;
        let tplBuf = "";
        while (i < endIdx && src[i] !== "`") {
          if (src[i] === "\\") {
            tplBuf += src[i] + (src[i + 1] || "");
            if (src[i + 1] === "\n") lineNo++;
            i += 2;
          } else if (src[i] === "$" && src[i + 1] === "{") {
            const lineBefore = lineNo;
            i += 2;
            scanRange(endIdx, true);
            const nlDiff = Math.max(0, lineNo - lineBefore);
            tplBuf += "__ODOMS_EXPR__" + "\n".repeat(nlDiff);
            if (src[i] === "}") i++;
          } else {
            if (src[i] === "\n") lineNo++;
            tplBuf += src[i++];
          }
        }
        i++; // past closing backtick

        if (!isConsole && !isStyleBlock && (/[À-ỹ₫]/.test(tplBuf) || /<[a-z][^>]*>/i.test(tplBuf))) {
          results.push(...stripHtmlKeepVisibleLines(tplBuf, startLine));
        }
        continue;
      }

      i++;
    }
  }

  scanRange(n, false);
  return results;
}

// ============================================================================
// CHECK 1: KIỂM TRA CÚ PHÁP JAVASCRIPT (`node --check`) & APPS SCRIPT (`.gs`)
// ============================================================================
function checkSyntax() {
  const jsFiles = [
    PATHS.mockDataJs,
    PATHS.omsEngineJs,
    PATHS.excelHandlerJs,
    PATHS.appJs,
    PATHS.selfScript
  ].filter((p) => fs.existsSync(p));

  const gsFiles = [PATHS.backendGs, PATHS.fifoGs].filter((p) => fs.existsSync(p));
  const items = [];
  let failed = 0;

  for (const filePath of jsFiles) {
    const res = spawnSync(process.execPath, ["--check", filePath], { encoding: "utf8" });
    if (res.status === 0) {
      items.push({ ok: true, file: relPath(filePath), detail: "node --check OK" });
    } else {
      failed++;
      items.push({
        ok: false,
        file: relPath(filePath),
        detail: (res.stderr || res.stdout || "Lỗi cú pháp JS").trim()
      });
    }
  }

  for (const filePath of gsFiles) {
    try {
      const code = readUtf8(filePath);
      // Biên dịch cú pháp trong bộ nhớ, tuyệt đối không thực thi
      new vm.Script(code, { filename: filePath });
      items.push({ ok: true, file: relPath(filePath), detail: "vm.Script syntax OK" });
    } catch (err) {
      failed++;
      items.push({ ok: false, file: relPath(filePath), detail: err.message });
    }
  }

  return {
    title: "1. Kiểm tra cú pháp JavaScript (`node --check`) & Apps Script",
    passed: failed === 0,
    items,
    failedCount: failed
  };
}

// ============================================================================
// CHECK 2: KIỂM TRA TRÙNG LẶP `id` TRÊN `01_ODOMS_WEB_APP/index.html`
// ============================================================================
function checkDuplicateHtmlIds() {
  const raw = readUtf8(PATHS.indexHtml);
  const clean = raw
    .replace(/<!--[\s\S]*?-->/g, maskKeepNewlines)
    .replace(/<script\b[\s\S]*?<\/script>/gi, maskKeepNewlines)
    .replace(/<style\b[\s\S]*?<\/style>/gi, maskKeepNewlines);

  const idMap = new Map();
  const tagRe = /<[a-zA-Z][^>]*>/g;
  let tagMatch;
  while ((tagMatch = tagRe.exec(clean)) !== null) {
    const tagStr = tagMatch[0];
    const tagOffset = tagMatch.index;
    const idRe = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
    let idMatch;
    while ((idMatch = idRe.exec(tagStr)) !== null) {
      const idVal = (idMatch[1] !== undefined ? idMatch[1] : idMatch[2]).trim();
      if (!idVal) continue;
      const lineNo = clean.slice(0, tagOffset + idMatch.index).split("\n").length;
      if (!idMap.has(idVal)) idMap.set(idVal, []);
      idMap.get(idVal).push(lineNo);
    }
  }

  const duplicates = [...idMap.entries()]
    .filter(([, lines]) => lines.length > 1)
    .map(([id, lines]) => ({ id, lines }));

  return {
    title: "2. Kiểm tra trùng lặp `id` HTML (`01_ODOMS_WEB_APP/index.html`)",
    passed: duplicates.length === 0,
    totalUniqueIds: idMap.size,
    duplicates
  };
}

// ============================================================================
// CHECK 3: QUÉT SẠCH TỪ KỸ THUẬT IT CẤM TRÊN GIAO DIỆN (`index.html` & `app.js`)
// ============================================================================
const WB_LEFT = "(?<![A-Za-zÀ-ỹ0-9_])";
const WB_RIGHT = "(?![A-Za-zÀ-ỹ0-9_])";

function wordRe(pattern, flags = "gi") {
  return new RegExp(WB_LEFT + "(?:" + pattern + ")" + WB_RIGHT, flags);
}

// Danh mục từ IT cấm tuyệt đối trên văn bản hiển thị giao diện (FAIL)
const BANNED_IT_RULES = [
  { term: "Webhook", re: wordRe("webhooks?"), hint: "Tiếp nhận tự động từ sàn" },
  { term: "API / Endpoint", re: wordRe("API\\s*Endpoint|API|Endpoint"), hint: "Cổng kết nối / Liên kết dữ liệu" },
  { term: "JSON / Payload", re: wordRe("JSON|Payload"), hint: "Dữ liệu truyền / Gói dữ liệu" },
  { term: "HTTP / Timeout", re: wordRe("HTTP(?:\\s*\\d{3})?|Request\\s+timeout|Timeout"), hint: "Lỗi kết nối / Hết thời gian chờ" },
  { term: "LocalStorage / SessionStorage", re: wordRe("LocalStorage|SessionStorage"), hint: "Bộ nhớ trên máy này" },
  { term: "CloudSyncAdapter / Cloud", re: wordRe("CloudSyncAdapter|Cloud"), hint: "Sổ dữ liệu Google Sheets / Trực tuyến" },
  { term: "Live Analytics", re: wordRe("Live\\s+Analytics"), hint: "Thống kê trực tuyến" },
  { term: "Cache / Fallback", re: wordRe("Cache|Fallback"), hint: "Bộ nhớ tạm / Dự phòng trên máy" },
  { term: "Schema / Database / CSDL", re: wordRe("Schema|Database|CSDL"), hint: "Cấu trúc sổ dữ liệu / Sổ dữ liệu" },
  { term: "Null / Undefined / NaN", re: wordRe("Null|Undefined|NaN", "g"), hint: "Chưa có dữ liệu / Trống" },
  { term: "ATP", re: wordRe("ATP", "g"), hint: "Tồn khả dụng" },
  { term: "FIFO", re: wordRe("FIFO", "g"), hint: "Ưu tiên giữ hàng trước–sau" },
  { term: "FEFO", re: wordRe("FEFO", "g"), hint: "Ưu tiên xuất lô gần hạn" },
  { term: "Batch", re: wordRe("Batch"), hint: "Lô hàng" },
  { term: "RBAC", re: wordRe("RBAC", "g"), hint: "Phân quyền nhân sự" },
  { term: "Backorder", re: wordRe("Backorder"), hint: "Thiếu tồn kho" },
  { term: "Overselling", re: wordRe("Oversell(?:ing)?"), hint: "Bán vượt tồn" },
  { term: "Backend / Frontend", re: wordRe("Backend|Frontend"), hint: "Hệ thống xử lý / Giao diện" },
  { term: "Apps Script / Script / Deploy", re: wordRe("Apps\\s+Script|Script|Deploy"), hint: "Kết nối Sổ Google Sheets / Triển khai" },
  { term: "Server / Token", re: wordRe("Server|Token"), hint: "Hệ thống máy chủ / Mã bảo mật" },
  { term: "SHA-256 / Hash / OTP", re: wordRe("SHA-?256|Hash|OTP", "gi"), hint: "Mã hóa bảo mật / Mã xác thực 6 số" },
  { term: "WAN IP / Client IP / IP / Device ID", re: wordRe("WAN\\s+IP|Client\\s+IP|Device\\s+ID|IP", "g"), hint: "Địa chỉ mạng truy cập / Thiết bị" },
  { term: "Race condition", re: wordRe("Race\\s+condition"), hint: "Xung đột đồng bộ" },
  { term: "Mock / Demo", re: wordRe("Mock(?:\\s+data)?|Demo"), hint: "Dữ liệu mẫu / Mô phỏng" },
  { term: "SVG / HTML / CSS / JavaScript", re: wordRe("SVG|HTML|CSS|JavaScript", "g"), hint: "Hình ảnh sắc nét / Giao diện" },
  { term: "User / Username", re: wordRe("Username|User"), hint: "Tài khoản / Tên đăng nhập" },
  { term: "Inactive", re: wordRe("Inactive"), hint: "Tạm ngưng hoạt động" },
  { term: "OFF / ON (trạng thái)", re: wordRe("OFF|ON", "g"), hint: "Tạm ngưng / Đang hoạt động" },
  { term: "Root Admin / Super Admin / Admin", re: wordRe("Root\\s+Super\\s+Admin|Root\\s+Admin|Super\\s+Admin|Admin"), hint: "Quản trị hệ thống (trừ ngoại lệ 'Chào bạn, Admin' của lhmt)" },
  { term: "Staff", re: wordRe("Staff"), hint: "Nhân viên vận hành" },
  { term: "Waybill / Tracking", re: wordRe("Waybill(?:\\s+Code|\\s+No\\.?)?|Tracking"), hint: "Phiếu vận đơn / Mã vận đơn" },
  { term: "e-POD", re: wordRe("e-?POD"), hint: "Ký nhận điện tử" },
  { term: "Click", re: wordRe("Click"), hint: "Nhấn" },
  { term: "File", re: wordRe("File"), hint: "Tệp" },
  { term: "QR Code / Code", re: wordRe("QR\\s+Code|Code"), hint: "Mã QR / Mã" }
];

// Danh mục cảnh báo chuẩn hóa nghiệp vụ thuần Việt bổ sung (WARN — rà soát ở Hội thoại #4)
const ADVISORY_BIZ_RULES = [
  { term: "OMS (lẻ, không phải ODOMS)", re: wordRe("OMS", "g"), hint: "Thống nhất gọi ODOMS hoặc Hệ thống" },
  { term: "WMS", re: wordRe("WMS", "g"), hint: "Quản lý kho" },
  { term: "RMA", re: wordRe("RMA", "g"), hint: "Đổi trả / Hoàn hàng" },
  { term: "SKU", re: wordRe("SKU", "g"), hint: "Mã sản phẩm (nếu muốn thuần Việt 100%)" },
  { term: "Shipper", re: wordRe("Shipper"), hint: "Bưu tá" },
  { term: "Freeship / Phí ship", re: wordRe("Freeship|Phí\\s+ship"), hint: "Miễn phí vận chuyển / Phí vận chuyển" }
];

function isProtectedLhmtAdminGreeting(text, matchedValue) {
  return /^admin$/i.test(matchedValue) && /Chào bạn,\s*Admin/i.test(text);
}

function scanUiTermsForTarget(filePath, extractorFn) {
  const src = readUtf8(filePath);
  const visibleLines = extractorFn(src);
  const errors = [];
  const warnings = [];

  for (const row of visibleLines) {
    for (const rule of BANNED_IT_RULES) {
      rule.re.lastIndex = 0;
      let m;
      const seenOnLine = new Set();
      while ((m = rule.re.exec(row.text)) !== null) {
        const matched = m[0];
        if (isProtectedLhmtAdminGreeting(row.text, matched)) continue;
        const key = `${rule.term}::${matched.toLowerCase()}`;
        if (seenOnLine.has(key)) continue;
        seenOnLine.add(key);
        errors.push({
          file: relPath(filePath),
          line: row.lineNo,
          term: rule.term,
          matched,
          hint: rule.hint,
          excerpt: row.text.slice(0, 130)
        });
      }
    }

    for (const rule of ADVISORY_BIZ_RULES) {
      rule.re.lastIndex = 0;
      let m;
      const seenOnLine = new Set();
      while ((m = rule.re.exec(row.text)) !== null) {
        const matched = m[0];
        const key = `${rule.term}::${matched.toLowerCase()}`;
        if (seenOnLine.has(key)) continue;
        seenOnLine.add(key);
        warnings.push({
          file: relPath(filePath),
          line: row.lineNo,
          term: rule.term,
          matched,
          hint: rule.hint,
          excerpt: row.text.slice(0, 130)
        });
      }
    }
  }

  return { errors, warnings, scannedLines: visibleLines.length };
}

function checkBannedItTerms() {
  const htmlRes = scanUiTermsForTarget(PATHS.indexHtml, (src) => stripHtmlKeepVisibleLines(src, 1));
  const appRes = scanUiTermsForTarget(PATHS.appJs, extractJsVisibleUiLines);

  const errors = [...htmlRes.errors, ...appRes.errors];
  const warnings = [...htmlRes.warnings, ...appRes.warnings];

  return {
    title: "3. Quét sạch từ IT cấm trên giao diện (`index.html` & `js/app.js`)",
    passed: errors.length === 0,
    scannedLines: {
      indexHtml: htmlRes.scannedLines,
      appJs: appRes.scannedLines
    },
    errors,
    warnings
  };
}

// ============================================================================
// CHECK 4: QUÉT ĐƠN VỊ TIỀN TỆ CŨ (`đ`, `₫`, `VNĐ`) — CHỈ DÙNG `VND`
// ============================================================================
const OLD_CURRENCY_PATTERNS = [
  { label: "Ký hiệu ₫", re: /₫/g },
  { label: "Đơn vị VNĐ/vnđ", re: new RegExp(WB_LEFT + "vnđ" + WB_RIGHT, "gi") },
  { label: "Số kèm đ (VD: 0 đ / 100.000đ)", re: /(?:\d|\})\s*đ(?![A-Za-zÀ-ỹ])/g },
  { label: "Đơn vị (đ)", re: /\(\s*đ\s*\)/g },
  { label: "Bội số kèm đ (Triệu đ / Tr đ / Tỷ đ)", re: /(?:Triệu|Tr|Tỷ|nghìn|ngàn|\/)\s*đ(?![A-Za-zÀ-ỹ])/gi },
  { label: "Ký tự đ đứng lẻ", re: new RegExp(WB_LEFT + "đ" + WB_RIGHT, "g") }
];

function scanCurrencyForTarget(filePath, extractorFn) {
  const src = readUtf8(filePath);
  const visibleLines = extractorFn(src);
  const hits = [];

  for (const row of visibleLines) {
    for (const pat of OLD_CURRENCY_PATTERNS) {
      pat.re.lastIndex = 0;
      const m = pat.re.exec(row.text);
      if (m) {
        hits.push({
          file: relPath(filePath),
          line: row.lineNo,
          label: pat.label,
          matched: m[0],
          excerpt: row.text.slice(0, 130)
        });
        break; // mỗi dòng báo 1 lần là đủ rõ
      }
    }
  }
  return hits;
}

function checkCurrencyUnit() {
  const htmlHits = scanCurrencyForTarget(PATHS.indexHtml, (src) => stripHtmlKeepVisibleLines(src, 1));
  const appHits = scanCurrencyForTarget(PATHS.appJs, extractJsVisibleUiLines);
  const hits = [...htmlHits, ...appHits];

  return {
    title: "4. Kiểm tra đơn vị tiền tệ duy nhất `VND` (quét `đ` / `₫` / `VNĐ` trên `index.html` & `js/app.js`)",
    passed: hits.length === 0,
    hits
  };
}

// ============================================================================
// CHECK 5: CHỐT CHẶN CHỐNG GHI ĐÈ GOOGLE SHEETS & BẤT BIẾN DỮ LIỆU LÕI
// ============================================================================
function checkOverwriteGuardsAndInvariants() {
  const appSrc = readUtf8(PATHS.appJs);
  const engineSrc = readUtf8(PATHS.omsEngineJs);
  const mockSrc = readUtf8(PATHS.mockDataJs);
  const backendSrc = readUtf8(PATHS.backendGs);

  const checks = [];

  function assertCheck(name, ok, file, detail) {
    checks.push({ name, ok: Boolean(ok), file, detail });
  }

  // 5.1. Boot push guard chống race condition đẩy mảng đơn rỗng lên Google Sheets (app.js)
  const hasBootGuardFlag = /_bootPushGuardInstalled/.test(appSrc) && /_initialPullSettled\s*=\s*false/.test(appSrc);
  const hasEmptyOrdersBlock =
    /orders\.length\s*===\s*0/.test(appSrc) &&
    /AUDIT_LOGS_SYNC/.test(appSrc) &&
    /USERS_RBAC_SYNC/.test(appSrc) &&
    /saveLocalStateSnapshot\(\)/.test(appSrc);
  const hasFinallyRelease = /pullStateFromCloud\([\s\S]{0,40}\)\.finally\(\s*\(\)\s*=>\s*\{[\s\S]{0,120}_initialPullSettled\s*=\s*true/.test(appSrc);
  assertCheck(
    "Chốt chặn chống race condition đẩy mảng đơn rỗng trước khi PULL_ALL xong",
    hasBootGuardFlag && hasEmptyOrdersBlock && hasFinallyRelease,
    relPath(PATHS.appJs),
    hasBootGuardFlag && hasEmptyOrdersBlock && hasFinallyRelease
      ? "Đã cài `_bootPushGuardInstalled`, chặn `AUDIT_LOGS_SYNC`/`USERS_RBAC_SYNC` khi `orders.length === 0`, mở cờ trong `.finally()`."
      : "THIẾU hoặc bị sửa đổi chốt chặn `_bootPushGuardInstalled` / `_initialPullSettled` trong `initCloudSyncPanel()`!"
  );

  // 5.2. Chống vòng lặp pull -> push ngược trong oms_engine.js
  const hasIsPullingGuards = (engineSrc.match(/!window\.cloudSync\.isPulling/g) || []).length >= 3;
  const cloudAdapterCtorMatch = engineSrc.match(/class\s+CloudSyncAdapter[\s\S]*?constructor\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
  const ctorDoesNotPush = cloudAdapterCtorMatch ? !/pushStateToCloud|SYNC_ALL/.test(cloudAdapterCtorMatch[1]) : false;
  assertCheck(
    "Chốt chặn `!window.cloudSync.isPulling` & không tự đẩy `SYNC_ALL` khi khởi tạo",
    hasIsPullingGuards && ctorDoesNotPush,
    relPath(PATHS.omsEngineJs),
    hasIsPullingGuards && ctorDoesNotPush
      ? "Đã khóa `!window.cloudSync.isPulling` tại các điểm ghi và `CloudSyncAdapter.constructor` không tự push."
      : "Cảnh báo: thiếu kiểm tra `isPulling` hoặc phát hiện gọi `pushStateToCloud` trong constructor!"
  );

  // 5.3. Khóa thời gian thực <= Date.now() chỉ ở tầng hiển thị (app.js)
  const hasDisplayTimeClamping =
    /getValidOrdersUpToNow\s*\(/.test(appSrc) &&
    /getValidShipmentsUpToNow\s*\(/.test(appSrc) &&
    /getEffectiveInventoryAtNow\s*\(/.test(appSrc) &&
    /ordTs\s*<=\s*nowMs/.test(appSrc);
  assertCheck(
    "Khóa thời gian thực `<= Date.now()` chỉ ở tầng hiển thị (không sửa dữ liệu gốc)",
    hasDisplayTimeClamping,
    relPath(PATHS.appJs),
    hasDisplayTimeClamping
      ? "Đủ 3 hàm tầng hiển thị (`getValidOrdersUpToNow`, `getValidShipmentsUpToNow`, `getEffectiveInventoryAtNow`)."
      : "Thiếu hàm lọc mốc `<= Date.now()` ở tầng hiển thị!"
  );

  // 5.4. Bảo toàn 4 tài khoản gốc & kịch bản SP-AO-POLO-01 + 25 sản phẩm Thời trang (mock_data.js)
  const has4Users =
    /username:\s*"dttd"/.test(mockSrc) &&
    /username:\s*"lhmt"[\s\S]{0,300}isHiddenBackup:\s*true/.test(mockSrc) &&
    /username:\s*"ntqg"/.test(mockSrc) &&
    /username:\s*"nttn"/.test(mockSrc);
  const hasPoloScenario =
    /sku:\s*"SP-AO-POLO-01"[\s\S]{0,250}physicalStock:\s*10/.test(mockSrc) &&
    /LO-2026-A1/.test(mockSrc) &&
    /LO-2026-A2/.test(mockSrc) &&
    /SP261122001/.test(mockSrc) &&
    /TT261122101/.test(mockSrc) &&
    /POS261122301/.test(mockSrc) &&
    /LZ261122201/.test(mockSrc);
  const skuMatches = mockSrc.match(/\bsku:\s*"SP-[^"]+"/g) || [];
  assertCheck(
    "Bảo toàn 4 tài khoản gốc (`dttd`, `lhmt` ẩn dự phòng, `ntqg`, `nttn`), `SP-AO-POLO-01` & 25 SP Thời trang",
    has4Users && hasPoloScenario && skuMatches.length === 25,
    relPath(PATHS.mockDataJs),
    `4 tài khoản gốc=${has4Users ? "OK" : "LỖI"}, kịch bản SP-AO-POLO-01 (10 cái, 2 lô, 4 đơn)=${hasPoloScenario ? "OK" : "LỖI"}, số mã SP=${skuMatches.length}/25.`
  );

  // 5.5. Quy tắc ĐVVC 3 tầng & SĐT 10 số (oms_engine.js)
  const hasCarrierAndPhoneEngine =
    /resolveOrderCarrier\s*\(/.test(engineSrc) &&
    /"Tại quầy"/.test(engineSrc) &&
    /"Chưa gán ĐVVC"/.test(engineSrc) &&
    /normalizePhoneVN\s*\(/.test(engineSrc);
  assertCheck(
    "Quy tắc ĐVVC 3 tầng (`resolveOrderCarrier`) & chuẩn hóa SĐT 10 số (`normalizePhoneVN`)",
    hasCarrierAndPhoneEngine,
    relPath(PATHS.omsEngineJs),
    hasCarrierAndPhoneEngine
      ? "Đầy đủ 3 tầng ĐVVC (VanDon → Sàn/Excel → Tại quầy / Chưa gán ĐVVC) và chuẩn hóa SĐT VN."
      : "Thiếu hàm `resolveOrderCarrier` hoặc `normalizePhoneVN`!"
  );

  // 5.6. Backend 6 bảng PascalCase, LockService, tiền tệ số nguyên thuần, SĐT setNumberFormat("@")
  const requiredSheets = ["DatHang", "TonKho", "LuuKho", "VanDon", "NhanSu", "NhatKy"];
  const has6Sheets = requiredSheets.every((s) => new RegExp(`["']${s}["']`).test(backendSrc));
  const hasLockService = /LockService\.getScriptLock\(\)/.test(backendSrc);
  const hasPhoneTextFormat = /setNumberFormat\s*\(\s*["']@["']\s*\)/.test(backendSrc);
  const hasIntCurrency = /function\s+parseCurrencyVND\s*\(/.test(backendSrc) && /Math\.round/.test(backendSrc);
  const hasBackend3TierCarrier = /function\s+resolveOrderCarrierBackend\s*\(/.test(backendSrc);
  assertCheck(
    "Backend 6 bảng PascalCase, `LockService`, tiền tệ số nguyên thuần & SĐT `setNumberFormat(\"@\")`",
    has6Sheets && hasLockService && hasPhoneTextFormat && hasIntCurrency && hasBackend3TierCarrier,
    relPath(PATHS.backendGs),
    `6 bảng=${has6Sheets ? "OK" : "LỖI"}, LockService=${hasLockService ? "OK" : "LỖI"}, setNumberFormat("@")=${hasPhoneTextFormat ? "OK" : "LỖI"}, parseCurrencyVND=${hasIntCurrency ? "OK" : "LỖI"}, ĐVVC 3 tầng=${hasBackend3TierCarrier ? "OK" : "LỖI"}.`
  );

  const failedCount = checks.filter((c) => !c.ok).length;
  return {
    title: "5. Kiểm tra chốt chặn chống ghi đè Google Sheets & bất biến lõi",
    passed: failedCount === 0,
    checks,
    failedCount
  };
}

// ============================================================================
// OPTIONAL READ-ONLY CHECK (`--pull-only`): GET ?action=PULL_ALL (KHÔNG POST)
// ============================================================================
async function runReadOnlyPullCheck() {
  const engineSrc = readUtf8(PATHS.omsEngineJs);
  const urlMatch = engineSrc.match(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/);
  if (!urlMatch) {
    return {
      title: "6. Kiểm thử chỉ đọc Google Sheets (`GET ?action=PULL_ALL`)",
      passed: false,
      detail: "Không tìm thấy đường dẫn Apps Script trong `01_ODOMS_WEB_APP/js/oms_engine.js`."
    };
  }

  const endpointUrl = urlMatch[0];
  const pullUrl = `${endpointUrl}?action=PULL_ALL&t=${Date.now()}`;
  const res = await fetch(pullUrl, { method: "GET", redirect: "follow" });
  if (!res.ok) {
    return {
      title: "6. Kiểm thử chỉ đọc Google Sheets (`GET ?action=PULL_ALL`)",
      passed: false,
      detail: `Phản hồi không thành công (mã trạng thái ${res.status}).`
    };
  }

  const json = await res.json();
  if (!json || json.status !== "SUCCESS" || !json.data) {
    return {
      title: "6. Kiểm thử chỉ đọc Google Sheets (`GET ?action=PULL_ALL`)",
      passed: false,
      detail: `Gói tin PULL_ALL không hợp lệ: ${JSON.stringify(json).slice(0, 200)}`
    };
  }

  const d = json.data;
  const orders = Array.isArray(d.orders) ? d.orders : [];
  const inventory = Array.isArray(d.inventory) ? d.inventory : [];
  const batchesCount = inventory.reduce((sum, item) => sum + (Array.isArray(item.batches) ? item.batches.length : 0), 0);
  const shipments = Array.isArray(d.shipments) ? d.shipments : [];
  const users = Array.isArray(d.users) ? d.users : [];
  const logs = Array.isArray(d.auditLogs) ? d.auditLogs : [];

  const poloInv = inventory.find((x) => x && x.sku === "SP-AO-POLO-01");
  const badPhones = [];
  orders.forEach((o) => {
    const p = String(o.customerPhone || "").trim();
    if (p && !/^0\d{9,10}$/.test(p)) badPhones.push(`DatHang:${o.orderId}=${p}`);
  });
  shipments.forEach((s) => {
    const rp = String((s.receiver && s.receiver.phone) || s.receiverPhone || "").trim();
    if (rp && !/^0\d{9,10}$/.test(rp)) badPhones.push(`VanDon:${s.trackingCode}(nhan)=${rp}`);
  });

  const nonIntMoney = [];
  orders.forEach((o) => {
    if (typeof o.unitPrice !== "number" || !Number.isInteger(o.unitPrice)) {
      nonIntMoney.push(`DatHang:${o.orderId}=${JSON.stringify(o.unitPrice)}`);
    }
  });
  inventory.forEach((item) => {
    if (typeof item.price !== "number" || !Number.isInteger(item.price)) {
      nonIntMoney.push(`TonKho:${item.sku}=${JSON.stringify(item.price)}`);
    }
  });

  const emptyCarrier = orders.filter((o) => !String(o.carrier || "").trim()).map((o) => o.orderId);

  const ok = Boolean(poloInv) && inventory.length >= 25 && users.length >= 4 && badPhones.length === 0 && nonIntMoney.length === 0 && emptyCarrier.length === 0;

  return {
    title: "6. Kiểm thử chỉ đọc Google Sheets (`GET ?action=PULL_ALL` — KHÔNG ghi đè)",
    passed: ok,
    summary: {
      serverTime: json.serverTime || "",
      counts: {
        DatHang: orders.length,
        TonKho: inventory.length,
        LuuKho: batchesCount,
        VanDon: shipments.length,
        NhanSu: users.length,
        NhatKy: logs.length
      },
      hasPoloScenario: Boolean(poloInv),
      badPhones,
      nonIntMoney,
      emptyCarrier
    }
  };
}

// ============================================================================
// HIỂN THỊ BÁO CÁO ĐỐI CHIẾU
// ============================================================================
function printDivider() {
  console.log("=".repeat(82));
}

function statusTag(ok) {
  return ok ? "[PASS]" : "[FAIL]";
}

async function main() {
  printDivider();
  console.log("  ODOMS VERIFIER — BỘ KIỂM TRA GÁC CỔNG TỰ ĐỘNG (CHẾ ĐỘ CHỈ ĐỌC — 0 THƯ VIỆN NGOÀI)");
  console.log(`  Thư mục gốc: ${ROOT_DIR}`);
  console.log(`  Chế độ chạy: ${PULL_ONLY_MODE ? "CHỈ ĐỌC GOOGLE SHEETS (GET ?action=PULL_ALL)" : "QUÉT TĨNH MÃ NGUỒN CỤC BỘ"}`);
  printDivider();

  if (PULL_ONLY_MODE) {
    try {
      const pullRes = await runReadOnlyPullCheck();
      console.log(`\n${statusTag(pullRes.passed)} ${pullRes.title}`);
      if (pullRes.detail) {
        console.log(`  Chi tiết: ${pullRes.detail}`);
      } else if (pullRes.summary) {
        const s = pullRes.summary;
        console.log(`  Thời gian máy chủ: ${s.serverTime}`);
        console.log(`  Số bản ghi 6 bảng: DatHang=${s.counts.DatHang}, TonKho=${s.counts.TonKho}, LuuKho=${s.counts.LuuKho}, VanDon=${s.counts.VanDon}, NhanSu=${s.counts.NhanSu}, NhatKy=${s.counts.NhatKy}`);
        console.log(`  Kịch bản SP-AO-POLO-01: ${s.hasPoloScenario ? "CÓ" : "THIẾU"}`);
        console.log(`  SĐT sai chuẩn 10 số: ${s.badPhones.length}${s.badPhones.length ? " -> " + s.badPhones.slice(0, 5).join(", ") : ""}`);
        console.log(`  Tiền tệ không phải số nguyên: ${s.nonIntMoney.length}${s.nonIntMoney.length ? " -> " + s.nonIntMoney.slice(0, 5).join(", ") : ""}`);
        console.log(`  Đơn hàng trống cột ĐVVC: ${s.emptyCarrier.length}${s.emptyCarrier.length ? " -> " + s.emptyCarrier.slice(0, 5).join(", ") : ""}`);
      }
      printDivider();
      process.exit(pullRes.passed ? 0 : 1);
    } catch (err) {
      console.error(`[FAIL] Lỗi kết nối chỉ đọc PULL_ALL: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  const r1 = checkSyntax();
  const r2 = checkDuplicateHtmlIds();
  const r3 = checkBannedItTerms();
  const r4 = checkCurrencyUnit();
  const r5 = checkOverwriteGuardsAndInvariants();

  // In kết quả Mục 1
  console.log(`\n${statusTag(r1.passed)} ${r1.title}`);
  for (const item of r1.items) {
    console.log(`  ${item.ok ? "✔" : "✖"} ${item.file} — ${item.detail}`);
  }

  // In kết quả Mục 2
  console.log(`\n${statusTag(r2.passed)} ${r2.title}`);
  if (r2.passed) {
    console.log(`  ✔ Tổng số ID duy nhất: ${r2.totalUniqueIds} | Trùng lặp: 0`);
  } else {
    console.log(`  ✖ Phát hiện ${r2.duplicates.length} ID bị trùng:`);
    for (const d of r2.duplicates) {
      console.log(`    - id="${d.id}" xuất hiện tại các dòng: ${d.lines.join(", ")}`);
    }
  }

  // In kết quả Mục 3
  console.log(`\n${statusTag(r3.passed)} ${r3.title}`);
  console.log(
    `  Đã quét văn bản hiển thị: index.html (${r3.scannedLines.indexHtml} dòng) & js/app.js (${r3.scannedLines.appJs} dòng)`
  );
  if (r3.errors.length === 0) {
    console.log("  ✔ Sạch 100% từ kỹ thuật IT cấm trên giao diện.");
  } else {
    console.log(`  ✖ Phát hiện ${r3.errors.length} vị trí còn sót từ IT cấm (cần dọn sạch ở Hội thoại #4):`);
    for (const e of r3.errors) {
      console.log(`    - ${e.file}:${e.line} | [${e.term}] khớp "${e.matched}" -> gợi ý: ${e.hint}`);
      console.log(`      Trích: ${e.excerpt}`);
    }
  }
  if (r3.warnings.length > 0) {
    console.log(`  [WARN] ${r3.warnings.length} vị trí gợi ý chuẩn hóa thêm ngôn ngữ vận hành thuần Việt:`);
    for (const w of r3.warnings) {
      console.log(`    - ${w.file}:${w.line} | [${w.term}] khớp "${w.matched}" -> gợi ý: ${w.hint}`);
      console.log(`      Trích: ${w.excerpt}`);
    }
  }

  // In kết quả Mục 4
  console.log(`\n${statusTag(r4.passed)} ${r4.title}`);
  if (r4.hits.length === 0) {
    console.log("  ✔ 100% hiển thị tiền tệ dùng chuẩn VND (0 ký hiệu cũ đ / ₫ / VNĐ).");
  } else {
    console.log(`  ✖ Phát hiện ${r4.hits.length} vị trí còn sót đơn vị tiền tệ cũ:`);
    for (const h of r4.hits) {
      console.log(`    - ${h.file}:${h.line} | [${h.label}] khớp "${h.matched}"`);
      console.log(`      Trích: ${h.excerpt}`);
    }
  }

  // In kết quả Mục 5
  console.log(`\n${statusTag(r5.passed)} ${r5.title}`);
  for (const c of r5.checks) {
    console.log(`  ${c.ok ? "✔" : "✖"} ${c.name}`);
    console.log(`      [${c.file}] ${c.detail}`);
  }

  // Tổng kết
  const allChecks = [r1, r2, r3, r4, r5];
  const passCount = allChecks.filter((r) => r.passed).length;
  const failCount = allChecks.length - passCount;

  console.log("");
  printDivider();
  console.log(
    `  TỔNG KẾT GÁC CỔNG: ${passCount}/${allChecks.length} HẠNG MỤC ĐẠT | ${failCount} HẠNG MỤC CẦN XỬ LÝ` +
      ` | Lỗi IT cấm: ${r3.errors.length} | Cảnh báo ngôn ngữ: ${r3.warnings.length} | Tiền tệ cũ: ${r4.hits.length}`
  );
  printDivider();

  process.exit(failCount === 0 ? 0 : 1);
}

main();
