import jsPDF from 'jspdf';

interface ReportData {
    jobTitle: string;
    fileName: string;
    analyzedAt: string;
    ats_score: number;
    skill_match: number;
    experience_score: number;
    keyword_density: number;
    missing_skills: string[];
    strengths: string[];
    suggestions: string[];
    skill_breakdown: Record<string, number>;
}

export async function exportReportAsPDF(data: ReportData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    let y = 0;

    const addPage = () => {
        doc.addPage();
        y = 20;
    };

    const checkPage = (needed: number) => {
        if (y + needed > ph - 15) addPage();
    };

    // ─── Header ───────────────────────────────────────────────────
    // Dark header background
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pw, 40, 'F');

    // Purple accent line
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pw, 1.5, 'F');

    doc.setTextColor(241, 240, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HireSense AI', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(157, 157, 184);
    doc.text('AI-Powered Resume Analysis Report', 14, 24);
    doc.text(new Date(data.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 31);

    // Right: ATS score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    const atsColor = data.ats_score >= 75 ? [16, 185, 129] : data.ats_score >= 50 ? [245, 158, 11] : [239, 68, 68];
    doc.setTextColor(atsColor[0], atsColor[1], atsColor[2]);
    doc.text(`${data.ats_score}`, pw - 24, 20, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(157, 157, 184);
    doc.text('ATS SCORE', pw - 14, 27, { align: 'right' });

    y = 50;

    // ─── Job / Resume Info ────────────────────────────────────────
    doc.setFillColor(19, 19, 31);
    doc.roundedRect(12, y, pw - 24, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(241, 240, 255);
    doc.text(data.jobTitle, 18, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 107, 138);
    doc.text(`Resume: ${data.fileName}`, 18, y + 15);
    y += 28;

    // ─── Score Boxes ──────────────────────────────────────────────
    checkPage(35);
    const scores = [
        { label: 'Skill Match', value: data.skill_match, color: [139, 92, 246] },
        { label: 'Experience', value: data.experience_score, color: [59, 130, 246] },
        { label: 'Keywords', value: data.keyword_density, color: [6, 182, 212] },
        { label: 'ATS Score', value: data.ats_score, color: atsColor },
    ];
    const boxW = (pw - 28) / 4 - 2;
    scores.forEach((s, i) => {
        const bx = 12 + i * (boxW + 3);
        doc.setFillColor(s.color[0], s.color[1], s.color[2]);
        (doc as jsPDF & { setGState: (state: unknown) => void }).setGState(new (doc as unknown as { GState: new (args: object) => unknown }).GState({ opacity: 0.1 }));
        doc.roundedRect(bx, y, boxW, 24, 3, 3, 'F');
        (doc as jsPDF & { setGState: (state: unknown) => void }).setGState(new (doc as unknown as { GState: new (args: object) => unknown }).GState({ opacity: 1 }));
        doc.setTextColor(s.color[0], s.color[1], s.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(`${s.value}`, bx + boxW / 2, y + 13, { align: 'center' });
        doc.setFontSize(7);
        doc.setTextColor(107, 107, 138);
        doc.text(s.label.toUpperCase(), bx + boxW / 2, y + 20, { align: 'center' });
    });
    y += 32;

    // ─── Helper to draw a section ─────────────────────────────────
    const drawSection = (title: string, items: string[], color: [number, number, number]) => {
        checkPage(30);

        // Section header
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(12, y, 3, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(241, 240, 255);
        doc.text(title, 18, y + 5.5);
        y += 12;

        items.forEach((item) => {
            const lines = doc.splitTextToSize(`• ${item}`, pw - 32);
            checkPage(lines.length * 5 + 4);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(196, 181, 253);
            lines.forEach((line: string) => { doc.text(line, 18, y); y += 5; });
            y += 2;
        });
        y += 6;
    };

    // ─── Skill Breakdown ─────────────────────────────────────────
    checkPage(50);
    doc.setFillColor(139, 92, 246);
    doc.rect(12, y, 3, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(241, 240, 255);
    doc.text('Skill Breakdown', 18, y + 5.5);
    y += 12;

    Object.entries(data.skill_breakdown).forEach(([key, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(157, 157, 184);
        doc.text(key.charAt(0).toUpperCase() + key.slice(1), 18, y + 3);
        doc.text(`${val}%`, pw - 14, y + 3, { align: 'right' });

        // bar track
        doc.setFillColor(30, 30, 46);
        doc.roundedRect(60, y, pw - 80, 4, 1, 1, 'F');

        // bar fill
        const barColor = val >= 70 ? [16, 185, 129] : val >= 50 ? [245, 158, 11] : [239, 68, 68];
        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        doc.roundedRect(60, y, ((pw - 80) * val) / 100, 4, 1, 1, 'F');
        y += 9;
    });
    y += 6;

    // ─── Missing skills, strengths, suggestions ───────────────────
    drawSection('Missing Skills', data.missing_skills, [239, 68, 68]);
    drawSection('Your Strengths', data.strengths, [16, 185, 129]);
    drawSection('AI Improvement Suggestions', data.suggestions, [245, 158, 11]);

    // ─── Footer ──────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(10, 10, 15);
        doc.rect(0, ph - 10, pw, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(107, 107, 138);
        doc.text('Generated by HireSense AI · hiresense.ai', pw / 2, ph - 4, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pw - 14, ph - 4, { align: 'right' });
    }

    // Save
    const safeName = `${data.jobTitle.replace(/\s+/g, '_')}_ATS_Report.pdf`;
    doc.save(safeName);
}
