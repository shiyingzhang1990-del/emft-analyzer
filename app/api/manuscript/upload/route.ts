import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = file.name.toLowerCase()
    let text = ''

    if (filename.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (filename.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (filename.endsWith('.pdf')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
        const data = await pdfParse(buffer)
        text = data.text
      } catch {
        text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload .docx, .pdf, or .txt' }, { status: 400 })
    }

    return NextResponse.json({ text: text.slice(0, 100000), filename: file.name, size: file.size })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
