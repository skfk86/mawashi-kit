// يملأ بيانات العميل في كل ملفات المشروع: node setup/apply.mjs setup/client.json
import fs from 'node:fs'; import path from 'node:path';
const cfgPath = process.argv[2] || 'setup/client.json';
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const missing = Object.entries(cfg).filter(([, v]) => !String(v).trim()).map(([k]) => k);
if (missing.length) { console.error('حقول ناقصة في', cfgPath, ':', missing.join(', ')); process.exit(1); }
if (!/^[a-z][a-z0-9]*$/.test(cfg.SLUG)) { console.error('SLUG: حروف إنجليزية صغيرة وأرقام فقط'); process.exit(1); }
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(cfg.PACKAGE_ID)) { console.error('PACKAGE_ID غير صالح'); process.exit(1); }
const skip = new Set(['.git', 'node_modules', 'setup']);
let files = 0, left = new Set();
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (skip.has(f)) continue;
    const p = path.join(d, f), st = fs.statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    const buf = fs.readFileSync(p); if (buf.includes(0)) continue; // ملف ثنائي
    let s = buf.toString('utf8'); const o = s;
    s = s.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => k in cfg ? cfg[k] : (left.add(k), m));
    if (s !== o) { fs.writeFileSync(p, s); files++; }
  }
})('.');
console.log(`تم تعديل ${files} ملف.`);
if (left.size) { console.error('رموز بلا قيمة:', [...left].join(', ')); process.exit(1); }
