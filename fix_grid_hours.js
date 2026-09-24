const fs = require('fs');
const path = require('path');

const files = [
    'gab-edt-frontend/src/app/admin/timetable/page.tsx',
    'gab-edt-frontend/src/app/teacher/timetable/page.tsx',
    'gab-edt-frontend/src/app/student/timetable/page.tsx'
];

files.forEach(f => {
    let p = path.join(__dirname, f);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace hours array
    content = content.replace(/Array\.from\(\{ length: 11 \}, \(_, i\) => i \+ 8\);?( \/\/ 8 à 18)?/, "Array.from({ length: 15 }, (_, i) => i + 6); // 6 à 20");
    
    // Replace event rendering math
    content = content.replace(/\(evt\.startHour - 8\) \* 80/g, "(evt.startHour - 6) * 80");
    
    // Replace click / drop logic
    content = content.replace(/\(y \/ 80\) \+ 8/g, "(y / 80) + 6");
    
    // Replace red indicator line
    content = content.replace(/\(new Date\(\)\.getHours\(\) - 8\) \* 80/g, "(new Date().getHours() - 6) * 80");
    
    fs.writeFileSync(p, content);
    console.log(`Updated grid hours in ${f}`);
});
