const fs = require('fs');
const file = 'App.tsx';
console.log('Reading file:', file);
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\r?\n/);
console.log('Original lines:', lines.length);

const imports = [
    "import { getTypeStyles, getFriendlyEventName } from './utils/eventHelpers';",
    "import DashboardStatCard from './components/DashboardStatCard';",
    "import LargeEventCard from './components/LargeEventCard';",
    "import EventSummaryCard from './components/EventSummaryCard';",
    "import ConductorProfileCard from './components/ConductorProfileCard';",
    "import Navbar from './components/Navbar';",
    "import Footer from './components/Footer';"
].join('\n');

// We want to delete from line 11 (index 10) to line 304 (index 303)
// Wait, let's verify line 11
console.log('Line 11:', lines[10]);
console.log('Line 304:', lines[303]);
console.log('Line 305:', lines[304]);

if (lines[10].includes('// --- Utility: Type Colors ---') && lines[303] === ');') {
    lines.splice(10, 294, imports);
    console.log('New lines:', lines.length);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Successfully wrote file.');
} else {
    console.log('Mismatch in expected lines. Aborting.');
}
