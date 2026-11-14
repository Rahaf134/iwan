const fs = require('fs');
const path = require('path');

// 1. حذف الملفات الأربعة المؤقتة لتنظيف المجلد
['project', 'exportedAt', 'fileCount', 'files'].forEach((temp) => {
    const p = path.join(__dirname, temp);
    if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
        fs.unlinkSync(p);
    }
});

// 2. قراءة الملفات الفعلية من داخل خاصية files
const raw = JSON.parse(fs.readFileSync('ewan-backup.json', 'utf8'));
const filesData = raw.files || raw;

let count = 0;

if (Array.isArray(filesData)) {
    for (const item of filesData) {
        const filePath = item.path || item.filePath || item.name;
        const content = item.content ?? item.code ?? '';
        if (!filePath) continue;
        const cleanPath = filePath.replace(/^\/+/, '');
        const fullPath = path.join(__dirname, cleanPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf8');
        console.log('Created:', cleanPath);
        count++;
    }
} else if (typeof filesData === 'object' && filesData !== null) {
    for (const [filePath, val] of Object.entries(filesData)) {
        const cleanPath = filePath.replace(/^\/+/, '');
        const fullPath = path.join(__dirname, cleanPath);
        const content = (typeof val === 'object' && val !== null && 'content' in val) ? val.content : val;
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf8');
        console.log('Created:', cleanPath);
        count++;
    }
}

console.log(`\nDone! Extracted ${count} files successfully.`);