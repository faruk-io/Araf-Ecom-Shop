import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { StoreInfo } from '../models/store.model';

// Generates the same receipt layout as the reference PDF: letterhead,
// order/date, billed-to block, payment method, itemized table, totals,
// thank-you note, and a tracking link footer. Built client-side with
// jsPDF — no server round trip needed since everything required is
// already in the placed Order object.
//
// jspdf/jspdf-autotable are dynamically imported inside generate() rather
// than imported at the top of this file. This service is reachable from
// CartDrawerComponent, which is loaded eagerly at the app root — a static
// import here would pull jsPDF's ~250kB dependency chain (it drags in
// html2canvas, which we never use) into the INITIAL bundle every visitor
// downloads, just for a button most people never click. Dynamic import
// keeps it as a separate chunk, fetched only on first "Download invoice" click.
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  async generate(order: Order, storeInfo: StoreInfo | null): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const storeName = storeInfo?.store_name || 'Araf Solutions';
    const storeAddr = storeInfo?.store_addr || '';
    const storePhone = storeInfo?.store_phone || '';

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = 56;

    // Letterhead
    doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(24, 31, 59);
    doc.text(storeName, margin, y);
    y += 20;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 96, 120);
    if (storeAddr) { doc.text(storeAddr, margin, y); y += 13; }
    if (storePhone) { doc.text(storePhone, margin, y); y += 13; }

    y += 10;
    doc.setDrawColor(220, 224, 235).line(margin, y, pageWidth - margin, y);
    y += 26;

    // Title + order code/date
    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(24, 31, 59);
    doc.text('ORDER RECEIPT', margin, y);
    doc.setFontSize(11);
    doc.text(`Order #${order.id}`, pageWidth - margin, y, { align: 'right' });
    y += 16;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(120, 126, 148);
    const placedDate = order.placedAt ? new Date(order.placedAt) : new Date();
    const dateStr = placedDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    doc.text(`Date: ${dateStr}`, pageWidth - margin, y, { align: 'right' });
    y += 30;

    // Billed to
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(70, 90, 160);
    doc.text('BILLED TO', margin, y);
    y += 15;
    /* doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(24, 31, 59);
    doc.text(order.name, margin, y); y += 14;
    doc.text(order.phone, margin, y); y += 14; */
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(24, 31, 59);
    const nameLines = doc.splitTextToSize(order.name, 240);
    doc.text(nameLines, margin, y); y += 14 * nameLines.length;
    doc.text(order.phone, margin, y); y += 14;

    const addrLines = doc.splitTextToSize(order.addr, 240);
    doc.text(addrLines, margin, y);

    // Payment (right column, same starting y as Billed to)
    //let py = y - 14 * 2 - 15;
   // Payment (right column, same starting y as Billed to)
    let py = y - 14 * nameLines.length - 14 - 15;

    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(70, 90, 160);
    doc.text('PAYMENT', pageWidth - margin - 160, py);
    py += 15;
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(24, 31, 59);
    doc.text('Cash on Delivery', pageWidth - margin - 160, py); py += 14;
    doc.text('Confirmation: by call', pageWidth - margin - 160, py);

    y += Math.max(14 * addrLines.length, 20) + 26;

    // Items table
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['ITEM', 'QTY', 'PRICE', 'AMOUNT']],
      body: order.items.map(i => [
        i.name, String(i.qty), `Tk ${i.price.toLocaleString('en-IN')}`, `Tk ${(i.price * i.qty).toLocaleString('en-IN')}`
      ]),
      styles: { font: 'helvetica', fontSize: 9, textColor: [24, 31, 59], cellPadding: 8 },
      headStyles: { fillColor: [244, 246, 251], textColor: [90, 96, 120], fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 70 },
        3: { halign: 'center', cellWidth: 80 }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 24;

    /* const totalsRight = pageWidth - margin;
    const line = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 11 : 10)
         .setTextColor(24, 31, 59);
      doc.text(label, totalsRight - 160, y);
      doc.text(value, totalsRight, y, { align: 'right' });
      y += bold ? 20 : 16;
    };
    line('Subtotal', `Tk ${order.subtotal.toLocaleString('en-IN')}`);
    line(`Delivery — ${order.deliveryZone}`, `Tk ${order.deliveryCharge.toLocaleString('en-IN')}`);
    if (order.discount > 0) line('Discount', `− Tk ${order.discount.toLocaleString('en-IN')}`);
    doc.setDrawColor(220, 224, 235).line(totalsRight - 160, y - 4, totalsRight, y - 4);
    y += 6;
    line('AMOUNT PAYABLE ON DELIVERY', `Tk ${order.total.toLocaleString('en-IN')}`, true); */

    const totalsRight = pageWidth - margin;
    // Reserve a block wide enough for the widest label AND the widest
    // value, with a gap between them — not just a gap before the page
    // edge. A right-aligned value's start position moves left by its own
    // width, so measuring only "label end vs. page edge" wasn't enough.
    const totalsLabels: [string, string, boolean][] = [
      ['Subtotal', `Tk ${order.subtotal.toLocaleString('en-IN')}`, false],
      [`Delivery — ${order.deliveryZone}`, `Tk ${order.deliveryCharge.toLocaleString('en-IN')}`, false],
      ...(order.discount > 0 ? [['Discount', `\u2212 Tk ${order.discount.toLocaleString('en-IN')}`, false] as [string, string, boolean]] : []),
      ['AMOUNT PAYABLE ON DELIVERY', `Tk ${order.total.toLocaleString('en-IN')}`, true]
    ];
    doc.setFont('helvetica', 'bold').setFontSize(11);
    const widestLabel = Math.max(...totalsLabels.map(([label]) => doc.getTextWidth(label)));
    const widestValue = Math.max(...totalsLabels.map(([, value]) => doc.getTextWidth(value)));
    const gap = 16;
    const blockWidth = widestLabel + gap + widestValue;
    const labelStartX = totalsRight - blockWidth;

    const line = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 11 : 10)
         .setTextColor(24, 31, 59);
      doc.text(label, labelStartX, y);
      doc.text(value, totalsRight, y, { align: 'right' });
      y += bold ? 20 : 16;
    };
    for (let i = 0; i < totalsLabels.length - 1; i++) line(...totalsLabels[i]);
    doc.setDrawColor(220, 224, 235).line(labelStartX, y - 4, totalsRight, y - 4);
    y += 6;
    line(...totalsLabels[totalsLabels.length - 1]);

    y += 20;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 96, 120);
    const thankYou = doc.splitTextToSize(
      `Thank you for your order! Our team will call you on ${order.phone} to confirm before delivery. No payment is needed until your order arrives.`,
      pageWidth - margin * 2
    );
    doc.text(thankYou, margin, y);
    y += thankYou.length * 13 + 18;

    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(70, 90, 160);
    doc.text('TRACK YOUR ORDER', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal').setTextColor(42, 85, 162);
    const trackUrl = `${window.location.origin}/track?id=${order.id}`;
    doc.textWithLink(trackUrl, margin, y, { url: trackUrl });

    // Footer
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(150, 155, 175);
    doc.text(
      `${storeName} · ${storePhone} · All amounts in Bangladeshi Taka (BDT).`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' }
    );

    doc.save(`Order-Receipt-${order.id}.pdf`);
  }
}
