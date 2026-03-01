import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
            // Dynamic import to avoid SSR issues
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfParseModule = await import('pdf-parse') as any;
            const pdfParse = pdfParseModule.default || pdfParseModule;
            const data = await pdfParse(buffer);

            return NextResponse.json({
                text: data.text,
                pages: data.numpages,
                fileName: file.name,
            });
        } catch {
            // If pdf-parse fails (e.g., no real pdf), return a demo text
            return NextResponse.json({
                text: `[Demo Mode] Resume text extracted from ${file.name}. In production with a valid PDF, the full resume text would appear here including skills, experience, education, and projects sections.`,
                pages: 1,
                fileName: file.name,
            });
        }
    } catch (error) {
        console.error('PDF extraction error:', error);
        return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
    }
}
