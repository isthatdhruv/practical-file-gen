const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const SUBJECT_CODES = {
    computer_networks: 'BCS 653',
    compiler_design: 'BCS 651',
    software_engineering: 'BCS 652',
    big_data: 'BCS 654'
};

app.post('/generate', async (req, res) => {
    const { name, roll, branch, subject, professor } = req.body; // <-- add professor

    const subjectFilePath = path.join(__dirname, 'templates', `${subject}.pdf`);
    const logoPath = path.join(__dirname, 'templates', 'logo.png');

    if (!fs.existsSync(subjectFilePath)) return res.status(404).send('Subject file not found.');

    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const html = await ejs.renderFile(path.join(__dirname, 'views', 'frontpage.ejs'), {
        name,
        roll,
        branch,
        subject,
        subjectCode: SUBJECT_CODES[subject] || '',
        logoBase64,
        professor // <-- pass professor to template
    });

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const frontPagePdf = await page.pdf({ format: 'A4' });
    await browser.close();

    const subjectPdfBytes = fs.readFileSync(subjectFilePath);
    const subjectPdf = await PDFDocument.load(subjectPdfBytes);
    const finalPdf = await PDFDocument.create();

    const front = await PDFDocument.load(frontPagePdf);
    const [firstPage] = await finalPdf.copyPages(front, [0]);
    finalPdf.addPage(firstPage);

    const pages = await finalPdf.copyPages(subjectPdf, subjectPdf.getPageIndices());
    pages.forEach(p => finalPdf.addPage(p));

    const finalBytes = await finalPdf.save();

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${subject}_file.pdf"`
    });
    res.send(Buffer.from(finalBytes));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
