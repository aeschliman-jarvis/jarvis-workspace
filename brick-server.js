const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const MANUAL_PATH = path.join(__dirname, 'MANUAL.md');
const HTML_PATH = path.join(__dirname, 'manual-wall.html');

function parseManual(content) {
    const layers = [];
    let currentLayer = [];
    
    // Simple parsing logic: look for "Skill X:" headers
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.startsWith('### Skill')) {
            const title = line.split(': ')[1] || line.split('**')[1] || 'Unknown Skill';
            // Extract a "word" (first word of the title)
            const word = title.split(' ')[0]; 
            currentLayer.push({
                word: word,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                desc: `Automatically parsed from MANUAL.md: ${title}`
            });
        }
    });

    // Group into layers of 4 for the masonry look
    for (let i = 0; i < currentLayer.length; i += 4) {
        layers.push(currentLayer.slice(i, i + 4));
    }
    
    return layers.length > 0 ? layers : [[]];
}

const server = http.createServer((req, res) => {
    if (req.url === '/data') {
        res.setHeader('Content-Type', 'application/json');
        try {
            const content = fs.readFileSync(MANUAL_PATH, 'utf8');
            res.end(JSON.stringify(parseManual(content)));
        } catch (e) {
            res.end(JSON.stringify([]));
        }
    } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(fs.readFileSync(HTML_PATH, 'utf8'));
    }
});

server.listen(PORT, () => {
    console.log(`🧱 Jarvis Brick Wall live at http://localhost:${PORT}`);
});
