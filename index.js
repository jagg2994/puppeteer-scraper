const express = require('express');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada', {
      waitUntil: 'networkidle2',
    });

    await page.waitForTimeout(3000);
    await browser.close();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Panama Compra');

    worksheet.columns = [
      { header: 'Número', key: 'numero' },
      { header: 'Descripción', key: 'descripcion' },
      { header: 'Fecha', key: 'fecha' },
      { header: 'Enlace', key: 'enlace' },
    ];

    worksheet.addRow({
      numero: '12345',
      descripcion: 'Sistema de pruebas',
      fecha: '2024-06-26',
      enlace: 'https://ejemplo.com/12345'
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resultados.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al scrapear:', error);
    res.status(500).send({ error: error.toString() });
  }
});

app.listen(3000, () => {
  console.log('✅ Microservicio Puppeteer corriendo en puerto 3000');
});
