// Branded PDF receipt generation for paid course transactions.
import { jsPDF } from "jspdf";

import { Courses, Users } from "./store";

export function downloadInvoice(tx) {
  const user = Users.byId(tx.userId);
  const course = Courses.byId(tx.courseId);
  if (!user || !course) return;
  buildInvoicePdf(tx, user, course).save(`EduVibe-Invoice-${tx.invoiceNumber}.pdf`);
}

function buildInvoicePdf(tx, user, course) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Background
  doc.setFillColor(250, 248, 244);
  doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

  // Header bar
  doc.setFillColor(45, 40, 36);
  doc.rect(0, 0, W, 80, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(250, 248, 244);
  doc.setFontSize(20);
  doc.text("EDUVIBE", 48, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(232, 154, 79);
  doc.text("MASTERY, ILLUMINATED", 48, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(250, 248, 244);
  doc.text("INVOICE", W - 48, 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(232, 154, 79);
  doc.text(tx.invoiceNumber, W - 48, 56, { align: "right" });

  // Meta block
  let y = 130;
  doc.setTextColor(120, 110, 100);
  doc.setFontSize(9);
  doc.text("BILLED TO", 48, y);
  doc.text("PAYMENT DATE", W / 2, y);
  doc.text("STATUS", W - 48, y, { align: "right" });

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 40, 36);
  doc.text(user.name, 48, y);
  doc.text(new Date(tx.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), W / 2, y);
  doc.setTextColor(tx.status === "paid" ? 22 : 200, tx.status === "paid" ? 130 : 60, tx.status === "paid" ? 80 : 60);
  doc.text(tx.status.toUpperCase(), W - 48, y, { align: "right" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text(tx.billingEmail, 48, y);

  // Line item table
  y += 50;
  doc.setDrawColor(220, 215, 208);
  doc.setLineWidth(0.5);
  doc.line(48, y, W - 48, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text("DESCRIPTION", 48, y);
  doc.text("AMOUNT", W - 48, y, { align: "right" });
  y += 8;
  doc.line(48, y, W - 48, y);

  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(45, 40, 36);
  const titleLines = doc.splitTextToSize(course.title, W - 200);
  doc.text(titleLines, 48, y);
  doc.text(`$${tx.subtotal.toFixed(2)}`, W - 48, y, { align: "right" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text(
    `${course.category} · ${course.level} · Instructor: ${course.instructorName}`,
    48,
    y
  );

  // Totals
  y += 60;
  const labelX = W - 200;
  const valueX = W - 48;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 110, 100);
  doc.text("Subtotal", labelX, y);
  doc.setTextColor(45, 40, 36);
  doc.text(`$${tx.subtotal.toFixed(2)}`, valueX, y, { align: "right" });

  if (tx.discount > 0) {
    y += 18;
    doc.setTextColor(120, 110, 100);
    doc.text(`Discount${tx.couponCode ? ` (${tx.couponCode})` : ""}`, labelX, y);
    doc.setTextColor(200, 100, 60);
    doc.text(`-$${tx.discount.toFixed(2)}`, valueX, y, { align: "right" });
  }

  y += 18;
  doc.setDrawColor(220, 215, 208);
  doc.line(labelX, y + 4, valueX, y + 4);
  y += 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(45, 40, 36);
  doc.text("Total paid", labelX, y);
  doc.text(`$${tx.amount.toFixed(2)}`, valueX, y, { align: "right" });

  // Payment method
  y += 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text("PAYMENT METHOD", 48, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 40, 36);
  doc.text(`${tx.cardBrand} ending in ${tx.cardLast4}`, 48, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text(tx.cardholderName, 48, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(160, 150, 140);
  doc.text(
    "Thank you for learning with EduVibe. This invoice was generated for a sandbox transaction.",
    W / 2,
    doc.internal.pageSize.getHeight() - 32,
    { align: "center" }
  );
  return doc;
}