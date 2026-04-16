import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFReportOptions {
    title: string;
    subtitle?: string;
    dateRange?: string;
    category?: string;
    columns: string[];
    rows: (string | number)[][];
    filename: string;
    chartImage?: string; // base64 PNG de la gráfica
    metrics?: { label: string; value: string }[];
}

export const generatePDFReport = ({
    title,
    subtitle,
    dateRange,
    category,
    columns,
    rows,
    filename,
    chartImage,
    metrics,
}: PDFReportOptions) => {
    // Handling Next.js interop for jsPDF
    const JS_PDF = typeof jsPDF === 'function' ? jsPDF : (jsPDF as any).jsPDF;
    const doc = new JS_PDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(64, 196, 170); // #40C4AA (Teal)
    doc.text('BIZBAZAR', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('REPORTE DEL SISTEMA', 14, 25);

    // -- Title and Date --
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text(title.toUpperCase(), 14, 40);

    let currentY = 46;

    if (subtitle) {
        doc.setFontSize(11);
        doc.text(subtitle, 14, currentY);
        currentY += 6;
    }

    if (dateRange) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Periodo: ${dateRange}`, 14, currentY);
        currentY += 6;
    }

    if (category) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Categoría: ${category}`, 14, currentY);
        currentY += 6;
    }

    // -- Metrics Cards --
    if (metrics && metrics.length > 0) {
        currentY += 4;
        const cardWidth = (pageWidth - 28 - (metrics.length - 1) * 4) / metrics.length;
        metrics.forEach((m, i) => {
            const x = 14 + i * (cardWidth + 4);
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(x, currentY, cardWidth, 18, 3, 3, 'F');
            doc.setFontSize(7);
            doc.setTextColor(120);
            doc.text(m.label.toUpperCase(), x + 4, currentY + 6);
            doc.setFontSize(12);
            doc.setTextColor(30);
            doc.text(m.value, x + 4, currentY + 14);
        });
        currentY += 24;
    }

    // -- Chart Image --
    if (chartImage) {
        currentY += 2;
        const imgWidth = pageWidth - 28;
        const imgHeight = 70;
        try {
            doc.addImage(chartImage, 'PNG', 14, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 6;
        } catch (e) {
            console.error('Error adding chart image to PDF:', e);
        }
    }

    // -- Table --
    autoTable(doc, {
        startY: currentY + 4,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: {
            fillColor: [64, 196, 170],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        margin: { top: 20 },
    });

    // -- Footer --
    const pageCount = typeof doc.getNumberOfPages === 'function' ? doc.getNumberOfPages() : (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Generado el: ${new Date().toLocaleString('es-MX')}`,
            14,
            doc.internal.pageSize.getHeight() - 10
        );
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 30,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    doc.save(`${filename}.pdf`);
};

