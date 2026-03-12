import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFReportOptions {
    title: string;
    subtitle?: string;
    dateRange?: string;
    category?: string;
    columns: string[];
    rows: any[][];
    filename: string;
}

export const generatePDFReport = ({
    title,
    subtitle,
    dateRange,
    category,
    columns,
    rows,
    filename
}: PDFReportOptions) => {
    const doc = new jsPDF();
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
    const pageCount = (doc as any).internal.getNumberOfPages();
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
