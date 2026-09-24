const fs = require('fs');
const path = require('path');

const helperCode = `
export const formatDateLocal = (d: Date) => {
  return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
};
`;

const apiFile = path.join('gab-edt-frontend', 'src', 'lib', 'api.ts');
let apiContent = fs.readFileSync(apiFile, 'utf8');
if (!apiContent.includes('formatDateLocal')) {
    fs.appendFileSync(apiFile, helperCode);
}

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('toISOString().split(\'T\')[0]') || content.includes('toISOString().split("T")[0]')) {
        if (!content.includes('formatDateLocal')) {
             if (content.match(/import \{.*\} from ['"]@\/lib\/api['"];?/)) {
                 content = content.replace(/(import \{)(.*)(\} from ['"]@\/lib\/api['"];?)/, "$1$2, formatDateLocal$3");
             } else {
                 content = content.replace(/(import.*from ['"]@\/lib\/api['"];?)/, "$1\nimport { formatDateLocal } from '@/lib/api';");
             }
        }
        content = content.replace(/new Date\(\)\.toISOString\(\)\.split\(['"]T['"]\)\[0\]/g, "formatDateLocal(new Date())");
        content = content.replace(/([a-zA-Z0-9_]+)\.toISOString\(\)\.split\(['"]T['"]\)\[0\]/g, "formatDateLocal($1)");
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
};

const files = [
    'gab-edt-frontend/src/app/teacher/timetable/page.tsx',
    'gab-edt-frontend/src/app/student/timetable/page.tsx',
    'gab-edt-frontend/src/app/teacher/page.tsx',
    'gab-edt-frontend/src/app/teacher/attendance/page.tsx',
    'gab-edt-frontend/src/app/student/page.tsx',
    'gab-edt-frontend/src/app/admin/cours/page.tsx'
];

files.forEach(f => processFile(path.join(__dirname, f)));
