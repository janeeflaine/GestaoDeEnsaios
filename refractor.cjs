const fs = require('fs');
const file = 'App.tsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\n/);
if (lines[0].endsWith('\r')) {
    lines = lines.map(l => l.replace(/\r$/, ''));
}

const imports = [
    "import { getTypeStyles, getFriendlyEventName } from './utils/eventHelpers';",
    "import DashboardStatCard from './components/DashboardStatCard';",
    "import LargeEventCard from './components/LargeEventCard';",
    "import EventSummaryCard from './components/EventSummaryCard';",
    "import ConductorProfileCard from './components/ConductorProfileCard';",
    "import Navbar from './components/Navbar';",
    "import Footer from './components/Footer';"
].join('\r\n'); // Using \r\n for Windows

if (lines[10].includes('// --- Utility: Type Colors ---') && lines[302].includes(');')) {
    lines.splice(10, 294, imports);
    fs.writeFileSync(file, lines.join('\r\n'), 'utf8');
    console.log('Successfully wrote file App.tsx.');
} else {
    console.log('Mismatch:', lines[10], lines[302]);
}
