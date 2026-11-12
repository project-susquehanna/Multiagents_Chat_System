name: pdf-generator

description:
Use this skill when the user explicitly requests creating, generating, exporting, saving, or converting a PDF file.
Use this skill only when the user explicitly wants a PDF file output.

when to use:
- Use this skill when the user explicitly asks to generate, export, save as, convert to, or create a PDF file.
- Use this skill when the user provides text, notes, a summary, a report, or HTML and explicitly wants a PDF file.
- Use this skill when the user explicitly asks to generate, export, save, convert, or create a PDF file.

do not use:
- Do not use this skill for ordinary chat, summarization, explanation, polishing, or translation.
- Do not use this skill unless the user explicitly requests PDF output.
- Do not automatically use generatePDF just because the user mentions a document, report, or summary.
- Do not use this skill for normal chat, normal summarization, explanation, rewriting, or translation.
- Do not use this skill unless PDF output is explicitly requested.

tools:
  - generatePDF

args schema:

generatePDF:
  args:
    html: string, required. Non-empty HTML content used to generate a PDF. toolFunction receives the entire args object and reads args.html.
    filename: string, optional. Output PDF filename; a .pdf extension is recommended. toolFunction receives the entire args object and reads args.filename.

args examples:

Example 1:
{
  "html": "<h1>Summary</h1><p>This is the PDF content.</p>",
  "filename": "summary.pdf"
}

Example 2:
{
  "html": "<h1>Report</h1><ul><li>First point</li><li>Second point</li></ul>",
  "filename": "report.pdf"
}

rules:
- tool must be "generatePDF".
- args must be an object.
- args must strictly follow args schema.
- html is required and must not be empty.
- filename is optional.
- If the user does not provide filename, use "document.pdf".
- filename should end with .pdf.
- html should be valid HTML or a valid HTML fragment.
- Do not rename html to content, text, body, markdown, or data.
- Do not rename filename to name, file, title, path, or output.
- Return valid JSON only.
