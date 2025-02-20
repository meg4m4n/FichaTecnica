import React from 'react';
import { jsPDF } from 'jspdf';
import { FileDown } from 'lucide-react';
import type { TechnicalSheet } from '../types';

interface PDFExportProps {
  technicalSheet: Partial<TechnicalSheet>;
  currentPage: {
    shapes: any[];
    measurements: any[];
    image?: string;
  };
}

function PDFExport({ technicalSheet, currentPage }: PDFExportProps) {
  const handleExport = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add header with basic information
    pdf.setFontSize(16);
    pdf.text('Ficha Técnica', 105, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text([
      `Ref. Interna: ${technicalSheet.internalRef || ''}`,
      `Descrição: ${technicalSheet.description || ''}`,
      `Marca: ${technicalSheet.brand || ''}`,
      `Coleção: ${technicalSheet.collection || ''}`,
      `Tamanho Amostra: ${technicalSheet.sampleSize || ''}`,
      `Cliente: ${technicalSheet.client?.name || ''}`,
      `Tipo de Peça: ${technicalSheet.pieceType?.name || ''}`,
    ], 20, 30);

    // Add image if exists
    if (currentPage.image) {
      const img = new Image();
      img.src = currentPage.image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const aspectRatio = img.width / img.height;
      const maxWidth = 170; // mm
      const maxHeight = 120; // mm
      
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      pdf.addImage(
        currentPage.image,
        'PNG',
        20,
        70,
        width,
        height
      );
    }

    // Add measurements table
    if (currentPage.measurements.length > 0) {
      const startY = currentPage.image ? 200 : 70;
      
      pdf.setFontSize(12);
      pdf.text('Tabela de Medidas', 20, startY);
      
      const headers = ['Código', 'Descrição', 'Tolerância', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const rows = currentPage.measurements.map(m => [
        m.code,
        m.description,
        m.tolerance,
        m.sizes.XS?.toString() || '',
        m.sizes.S?.toString() || '',
        m.sizes.M?.toString() || '',
        m.sizes.L?.toString() || '',
        m.sizes.XL?.toString() || '',
        m.sizes.XXL?.toString() || '',
      ]);

      pdf.setFontSize(8);
      pdf.table(20, startY + 5, rows, headers, {
        headerBackgroundColor: '#f3f4f6',
        padding: 2,
        fontSize: 8,
        cellWidth: 'auto',
      });
    }

    // Save the PDF
    pdf.save(`ficha-tecnica-${technicalSheet.internalRef || 'nova'}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
    >
      <FileDown className="w-4 h-4 mr-2" />
      Exportar PDF
    </button>
  );
}

export default PDFExport;