// Certificate issuance + PDF generation (client-side, localStorage-backed).
import { jsPDF } from "jspdf";

import { Courses, Users, Enrollments, progressFor } from "./store";

const KEY = "lumen.certificates";










function read() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function write(list) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export const Certificates = {
  all() {
    return read();
  },
  forUser(userId) {
    return read().filter((c) => c.userId === userId);
  },
  get(userId, courseId) {
    return read().find((c) => c.userId === userId && c.courseId === courseId);
  },
  /** Issue a certificate if the course is 100% complete and not already issued. */
  issueIfEligible(userId, courseId, score = 100) {
    const existing = Certificates.get(userId, courseId);
    if (existing) return existing;
    const course = Courses.byId(courseId);
    const enrollment = Enrollments.get(userId, courseId);
    if (!course || !enrollment) return null;
    if (progressFor(course, enrollment.completedTopicIds) !== 100) return null;
    const cert = {
      id: `cert-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      courseId,
      issuedAt: new Date().toISOString(),
      score: Math.round(score)
    };
    const list = read();
    list.push(cert);
    write(list);
    return cert;
  }
};

/** Build and trigger download of a Lumen-branded completion certificate. */
export function downloadCertificate(cert) {
  const user = Users.byId(cert.userId);
  const course = Courses.byId(cert.courseId);
  if (!user || !course) return;
  generateCertificatePdf(cert, user, course).save(
    `Lumen-Certificate-${course.slug}-${user.name.replace(/\s+/g, "-")}.pdf`
  );
}

function generateCertificatePdf(cert, user, course) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(250, 248, 244);
  doc.rect(0, 0, W, H, "F");

  // Outer frame
  doc.setDrawColor(45, 40, 36);
  doc.setLineWidth(2);
  doc.rect(28, 28, W - 56, H - 56);
  doc.setLineWidth(0.5);
  doc.rect(38, 38, W - 76, H - 76);

  // Top accent bar
  doc.setFillColor(232, 154, 79); // glow
  doc.rect(38, 38, W - 76, 6, "F");

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(45, 40, 36);
  doc.text("LUMEN", W / 2, 90, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text("MASTERY, ILLUMINATED", W / 2, 106, { align: "center" });

  // Title
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(120, 110, 100);
  doc.text("Certificate of Completion", W / 2, 160, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(38);
  doc.setTextColor(45, 40, 36);
  doc.text("This is to certify that", W / 2, 210, { align: "center" });

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.setTextColor(232, 154, 79);
  doc.text(user.name, W / 2, 270, { align: "center" });

  // Underline
  const nameWidth = doc.getTextWidth(user.name);
  doc.setDrawColor(232, 154, 79);
  doc.setLineWidth(1);
  doc.line(W / 2 - nameWidth / 2, 280, W / 2 + nameWidth / 2, 280);

  // Body
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.setTextColor(70, 65, 60);
  doc.text("has successfully completed the course", W / 2, 320, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(45, 40, 36);
  const titleLines = doc.splitTextToSize(course.title, W - 200);
  doc.text(titleLines, W / 2, 360, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(110, 100, 92);
  doc.text(
    `instructed by ${course.instructorName} · ${course.durationHours} hours of curriculum`,
    W / 2,
    400,
    { align: "center" }
  );

  // Score / date / id row
  const baseY = H - 110;
  const colW = (W - 160) / 3;

  const drawCol = (label, value, x) => {
    doc.setDrawColor(180, 170, 160);
    doc.setLineWidth(0.5);
    doc.line(x, baseY, x + colW - 20, baseY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(45, 40, 36);
    doc.text(value, x + (colW - 20) / 2, baseY + 22, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 110, 100);
    doc.text(label.toUpperCase(), x + (colW - 20) / 2, baseY + 38, { align: "center" });
  };

  const issued = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  drawCol("Final Score", `${cert.score}%`, 80);
  drawCol("Date Issued", issued, 80 + colW);
  drawCol("Certificate ID", cert.id.toUpperCase(), 80 + colW * 2);

  return doc;
}