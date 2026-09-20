import { Router } from 'express'
import multer from 'multer'
import { PDFParse } from 'pdf-parse'

const router = Router()

// Configure multer to store file in memory (max 5MB) and filter for PDFs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    if (isPdf) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are supported. Please upload a .pdf document.'))
    }
  },
})

/**
 * POST /api/upload/resume
 * Receives a PDF resume, parses the text with pdf-parse, and returns clean text.
 */
router.post('/resume', (req, res) => {
  upload.single('resumePdf')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large. Maximum allowed size is 5MB.' })
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` })
    } else if (err) {
      return res.status(400).json({ error: err.message })
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No PDF file was uploaded.' })
    }

    let parser = null
    try {
      parser = new PDFParse({ data: req.file.buffer })
      const textResult = await parser.getText()
      const rawText = textResult?.text || ''

      // Clean up extracted text: normalize whitespace and consecutive blank lines
      const cleanedText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      if (!cleanedText || cleanedText.length < 20) {
        return res.status(400).json({
          error:
            'Could not extract readable text from this PDF. It may be an image-only scan or password protected.',
        })
      }

      const infoResult = await parser.getInfo().catch(() => null)
      const pageCount = infoResult?.total || textResult?.pages?.length || 1

      res.json({
        filename: req.file.originalname,
        text: cleanedText,
        charCount: cleanedText.length,
        wordCount: cleanedText.split(/\s+/).length,
        pageCount,
      })
    } catch (parseError) {
      console.error('PDF Parse error:', parseError)
      res.status(500).json({
        error: 'Failed to process PDF file. Make sure the file is not corrupted or password protected.',
      })
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {})
      }
    }
  })
})

export default router
