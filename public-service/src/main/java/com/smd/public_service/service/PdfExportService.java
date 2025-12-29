package com.smd.public_service.service;

import com.smd.public_service.dto.*;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.io.font.constants.StandardFonts;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Service để xuất giáo trình thành file PDF
 */
@Service
public class PdfExportService {

    private static final Logger logger = LoggerFactory.getLogger(PdfExportService.class);

    private final PublicSyllabusService publicSyllabusService;

    public PdfExportService(PublicSyllabusService publicSyllabusService) {
        this.publicSyllabusService = publicSyllabusService;
    }

    /**
     * Xuất giáo trình thành PDF
     *
     * @param syllabusId ID của giáo trình
     * @param version    Phiên bản giáo trình (tuỳ chọn)
     * @return Mảng byte của file PDF
     */
    public byte[] exportSyllabusToPdf(Long syllabusId, String version) throws IOException {
        try {
            // Lấy thông tin chi tiết giáo trình
            SyllabusDetailDto detail = publicSyllabusService.getSyllabusDetail(syllabusId);

            if (detail == null) {
                throw new IllegalArgumentException("Giáo trình không tìm thấy: " + syllabusId);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Set font hỗ trợ tiếng Việt
            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            // === Header ===
            Paragraph title = new Paragraph("GIÁO TRÌNH")
                    .setFont(boldFont)
                    .setFontSize(24)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            Paragraph subTitle = new Paragraph(detail.getSubjectName() != null ? detail.getSubjectName() : "")
                    .setFont(boldFont)
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(subTitle);

            // === Thông tin cơ bản ===
            document.add(new Paragraph("THÔNG TIN CƠ BẢN").setFont(boldFont).setFontSize(12));

            Table basicInfoTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .useAllAvailableWidth();

            addTableRow(basicInfoTable, boldFont, font, "Mã môn học:", detail.getSubjectCode() != null ? detail.getSubjectCode() : "");
            addTableRow(basicInfoTable, boldFont, font, "Tên môn học:", detail.getSubjectName() != null ? detail.getSubjectName() : "");
            addTableRow(basicInfoTable, boldFont, font, "Giáo trình:", detail.getSyllabusCode() != null ? detail.getSyllabusCode() : "");
            addTableRow(basicInfoTable, boldFont, font, "Năm học:", detail.getAcademicYear() != null ? detail.getAcademicYear() : "");
            addTableRow(basicInfoTable, boldFont, font, "Kỳ học:", detail.getSemester() != null ? detail.getSemester().toString() : "");
            addTableRow(basicInfoTable, boldFont, font, "Phiên bản:", version != null ? version : detail.getVersion() != null ? detail.getVersion() : "");
            addTableRow(basicInfoTable, boldFont, font, "Tín chỉ:", detail.getCredits() != null ? detail.getCredits().toString() : "");
            addTableRow(basicInfoTable, boldFont, font, "Trạng thái:", detail.getStatus() != null ? detail.getStatus() : "");

            document.add(basicInfoTable);
            document.add(new Paragraph("")); // Khoảng trống

            // === Mục tiêu ===
            if (detail.getLearningObjectives() != null && !detail.getLearningObjectives().isEmpty()) {
                document.add(new Paragraph("MỤC TIÊU MÔN HỌC").setFont(boldFont).setFontSize(12));
                document.add(new Paragraph(detail.getLearningObjectives()).setFont(font));
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === Nội dung ===
            if (detail.getContent() != null && !detail.getContent().isEmpty()) {
                document.add(new Paragraph("NỘI DUNG MÔN HỌC").setFont(boldFont).setFontSize(12));
                document.add(new Paragraph(detail.getContent()).setFont(font));
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === CLOs (Course Learning Outcomes) ===
            if (detail.getClos() != null && !detail.getClos().isEmpty()) {
                document.add(new Paragraph("LEARNING OUTCOMES (CLO)").setFont(boldFont).setFontSize(12));

                Table cloTable = new Table(UnitValue.createPercentArray(new float[]{10, 90}))
                        .useAllAvailableWidth();
                cloTable.addHeaderCell(createHeaderCell("STT", boldFont));
                cloTable.addHeaderCell(createHeaderCell("Mô tả", boldFont));

                int index = 1;
                for (CloSummaryDto clo : detail.getClos()) {
                    cloTable.addCell(new Cell().add(new Paragraph(String.valueOf(index)).setFont(font)));
                    cloTable.addCell(new Cell().add(new Paragraph(clo.getDescription() != null ? clo.getDescription() : "").setFont(font)));
                    index++;
                }

                document.add(cloTable);
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === CLO-PLO Mapping ===
            List<CloMappingDto> mappings = publicSyllabusService.getCloMappings(syllabusId);
            if (mappings != null && !mappings.isEmpty()) {
                document.add(new Paragraph("CLO-PLO MAPPING").setFont(boldFont).setFontSize(12));

                Table mappingTable = new Table(UnitValue.createPercentArray(new float[]{35, 35, 30}))
                        .useAllAvailableWidth();
                mappingTable.addHeaderCell(createHeaderCell("CLO", boldFont));
                mappingTable.addHeaderCell(createHeaderCell("PLO", boldFont));
                mappingTable.addHeaderCell(createHeaderCell("Mức độ", boldFont));

                for (CloMappingDto mapping : mappings) {
                    mappingTable.addCell(new Cell().add(new Paragraph(mapping.getCloCode() != null ? mapping.getCloCode() : "").setFont(font)));
                    mappingTable.addCell(new Cell().add(new Paragraph(mapping.getPloCode() != null ? mapping.getPloCode() : "").setFont(font)));
                    mappingTable.addCell(new Cell().add(new Paragraph(mapping.getMappingLevel() != null ? mapping.getMappingLevel() : "").setFont(font)));
                }

                document.add(mappingTable);
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === Phương pháp đánh giá ===
            if (detail.getAssessmentMethods() != null && !detail.getAssessmentMethods().isEmpty()) {
                document.add(new Paragraph("PHƯƠNG PHÁP ĐÁNH GIÁ").setFont(boldFont).setFontSize(12));
                document.add(new Paragraph(detail.getAssessmentMethods()).setFont(font));
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === Phương pháp giảng dạy ===
            if (detail.getTeachingMethods() != null && !detail.getTeachingMethods().isEmpty()) {
                document.add(new Paragraph("PHƯƠNG PHÁP GIẢNG DẠY").setFont(boldFont).setFontSize(12));
                document.add(new Paragraph(detail.getTeachingMethods()).setFont(font));
                document.add(new Paragraph("")); // Khoảng trống
            }

            // === Mô tả môn học ===
            if (detail.getDescription() != null && !detail.getDescription().isEmpty()) {
                document.add(new Paragraph("MÔ TẢ MÔN HỌC").setFont(boldFont).setFontSize(12));
                document.add(new Paragraph(detail.getDescription()).setFont(font));
            }

            // === Footer ===
            document.add(new Paragraph(""));
            Paragraph footer = new Paragraph("Ngày cập nhật: " + (detail.getUpdatedAt() != null ? detail.getUpdatedAt() : ""))
                    .setFont(font)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(footer);

            document.close();

            logger.info("Xuất PDF thành công cho giáo trình ID: {}", syllabusId);
            return outputStream.toByteArray();

        } catch (IOException e) {
            logger.error("Lỗi khi xuất PDF: {}", e.getMessage());
            throw new IOException("Không thể xuất PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Thêm hàng vào bảng thông tin cơ bản
     */
    private void addTableRow(Table table, PdfFont boldFont, PdfFont font, String label, String value) {
        Cell labelCell = new Cell().add(new Paragraph(label).setFont(boldFont));
        labelCell.setBackgroundColor(ColorConstants.LIGHT_GRAY);
        table.addCell(labelCell);

        table.addCell(new Cell().add(new Paragraph(value != null ? value : "").setFont(font)));
    }

    /**
     * Tạo header cell cho bảng
     */
    private Cell createHeaderCell(String text, PdfFont font) {
        Cell cell = new Cell().add(new Paragraph(text).setFont(font));
        cell.setBackgroundColor(ColorConstants.LIGHT_GRAY);
        cell.setTextAlignment(TextAlignment.CENTER);
        return cell;
    }
}
