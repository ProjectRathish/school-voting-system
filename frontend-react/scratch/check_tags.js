
import fs from 'fs';

const content = fs.readFileSync('d:\\school_voting_system\\frontend-react\\src\\pages\\school-admin\\NominationManagement.tsx', 'utf8');

let boxCount = 0;
let typographyCount = 0;
let paperCount = 0;
let dialogCount = 0;

const openBox = content.match(/<Box/g) || [];
const closeBox = content.match(/<\/Box>/g) || [];

console.log('Box:', openBox.length, closeBox.length);

const openTypography = content.match(/<Typography/g) || [];
const closeTypography = content.match(/<\/Typography>/g) || [];

console.log('Typography:', openTypography.length, closeTypography.length);

const openPaper = content.match(/<Paper/g) || [];
const closePaper = content.match(/<\/Paper>/g) || [];

console.log('Paper:', openPaper.length, closePaper.length);

const openDialog = content.match(/<Dialog/g) || [];
const closeDialog = content.match(/<\/Dialog>/g) || [];

console.log('Dialog:', openDialog.length, closeDialog.length);

const openBraces = content.match(/\{/g) || [];
const closeBraces = content.match(/\}/g) || [];

console.log('Braces:', openBraces.length, closeBraces.length);
