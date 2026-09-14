import { jsPDF } from 'jspdf'

function sanitizeFileName(value) {
  return String(value || 'certificate')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'certificate'
}

function formatIssuedDate(issuedAt) {
  const date = issuedAt ? new Date(issuedAt) : new Date()
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function resolveCertificateFields(cert, userName, courseName) {
  return {
    learner: userName || cert?.userName || cert?.user?.name || 'Learner',
    course: courseName || cert?.courseName || cert?.course?.title || 'Course',
    certId: cert?.certificateId || `CERT-${Date.now()}`,
    issued: formatIssuedDate(cert?.issuedAt),
    score: cert?.score,
  }
}

function drawCorner(doc, x, y, dx, dy) {
  doc.setDrawColor(124, 58, 237)
  doc.setLineWidth(0.9)
  doc.line(x, y + dy * 14, x, y)
  doc.line(x, y, x + dx * 14, y)
}

/**
 * Generate a landscape A4 SkillHub certificate and download it as a .pdf file.
 */
export function downloadCertificatePdf(cert, userName, courseName) {
  const { learner, course, certId, issued, score } = resolveCertificateFields(cert, userName, courseName)

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageWidth = 297
  const pageHeight = 210
  const centerX = pageWidth / 2

  doc.setFillColor(250, 245, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setDrawColor(124, 58, 237)
  doc.setLineWidth(1.4)
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3, 'S')

  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.45)
  doc.roundedRect(11.5, 11.5, pageWidth - 23, pageHeight - 23, 2, 2, 'S')

  drawCorner(doc, 18, 18, 1, 1)
  drawCorner(doc, pageWidth - 18, 18, -1, 1)
  drawCorner(doc, 18, pageHeight - 18, 1, -1)
  drawCorner(doc, pageWidth - 18, pageHeight - 18, -1, -1)

  doc.setTextColor(124, 58, 237)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('SKILLHUB  —  CERTIFICATE OF COMPLETION', centerX, 36, { align: 'center' })

  doc.setTextColor(30, 27, 75)
  doc.setFont('times', 'bold')
  doc.setFontSize(32)
  doc.text('Certificate of Achievement', centerX, 56, { align: 'center' })

  doc.setDrawColor(124, 58, 237)
  doc.setLineWidth(0.7)
  doc.line(centerX - 24, 62, centerX + 24, 62)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(100, 116, 139)
  doc.text('This certifies that', centerX, 78, { align: 'center' })

  doc.setFont('times', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(30, 27, 75)
  const learnerLines = doc.splitTextToSize(learner, pageWidth - 56)
  doc.text(learnerLines, centerX, 94, { align: 'center' })

  const afterNameY = 94 + Math.max(0, learnerLines.length - 1) * 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(100, 116, 139)
  doc.text('has successfully completed', centerX, afterNameY + 14, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(49, 46, 129)
  const courseLines = doc.splitTextToSize(course, pageWidth - 56)
  doc.text(courseLines, centerX, afterNameY + 28, { align: 'center' })

  const metaY = Math.min(afterNameY + 28 + courseLines.length * 8 + 18, 158)

  doc.setDrawColor(196, 181, 253)
  doc.setLineWidth(0.3)
  doc.line(48, metaY - 10, pageWidth - 48, metaY - 10)

  const items = [
    { label: 'ISSUED ON', value: issued },
    { label: 'CERTIFICATE ID', value: certId },
  ]
  if (score != null && score !== '') {
    items.push({ label: 'SCORE', value: `${score}%` })
  }

  const gap = items.length === 3 ? 72 : 80
  const startX = centerX - ((items.length - 1) * gap) / 2
  items.forEach((item, index) => {
    const x = startX + index * gap
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(item.label, x, metaY, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(71, 85, 105)
    doc.text(String(item.value), x, metaY + 8, { align: 'center' })
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('Verified by SkillHub  ·  Official Certificate of Completion', centerX, pageHeight - 22, {
    align: 'center',
  })

  doc.save(`SkillHub-Certificate-${sanitizeFileName(course)}-${sanitizeFileName(certId)}.pdf`)
}
