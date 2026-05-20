import { Router } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "@certprep/database";
import { authenticate, AuthRequest } from "../middleware/auth";
import { notFound } from "../utils/errors";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user!.id },
      include: {
        certification: { select: { name: true, slug: true, provider: true } },
      },
    });
    res.json({ certificates });
  } catch (e) {
    next(e);
  }
});

router.get("/:certificationId/download", async (req: AuthRequest, res, next) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: {
        userId_certificationId: {
          userId: req.user!.id,
          certificationId: String(req.params.certificationId),
        },
      },
      include: {
        certification: true,
        user: { select: { name: true } },
      },
    });
    if (!cert) throw notFound("Certificate not found");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${cert.certification.slug}-certificate.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(28).text("Certificate of Achievement", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`This certifies that`, { align: "center" });
    doc.fontSize(22).text(cert.user.name, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(
      `has successfully completed the practice examination for`,
      { align: "center" }
    );
    doc.fontSize(18).text(cert.certification.name, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Score: ${cert.score}%`, { align: "center" });
    doc.text(`Issued: ${cert.issuedAt.toLocaleDateString()}`, { align: "center" });
    doc.text("MockCertify Platform", { align: "center" });
    doc.end();
  } catch (e) {
    next(e);
  }
});

export default router;
