# How to replace a policy PDF

Policies, procedures, forms, guides and reports are **Documents** in the CMS. Each one has a fixed web address (for example
`https://ihna.edu.au/ihna-policies/IHNA_Privacy_Policy.pdf`). When you replace the file, that address serves the new file
straight away. You do not need a developer or a deploy.

## Replace the file

1. Sign in to the CMS at `/admin`.
2. Open **Content → Documents**.
3. Search for the document by its title (for example "Privacy Policy") or by its address (for example `IHNA_Privacy_Policy`).
4. Open the document. At the top, remove the current file and upload the new PDF. Only PDF files are accepted.
5. Update anything else that changed: **Title** or **Effective date**. You can add a line to **Notes**, such as the version number
   or who approved it. Only staff can see notes.
6. Select **Save**.

The address stays the same, so every existing link keeps working: the Policies and Procedures page (`/policies-links-forms/`),
course pages, emails and printed QR codes. Open the address in a new browser tab to check the new file. If your browser still
shows the old file, reload the page.

## Things to know

- **Public path** is the document's web address. You cannot change it after the document is created. If a document really has to
  move, ask a developer: the old address then needs a redirect.
- **Link text on the Policies and Procedures page** is part of that page's code (`src/app/(site)/policies-links-forms/page.tsx`).
  Replacing a file needs no change there; a new title or a new link on that page is a developer's change.
- **Add a new document:** choose **Create new**, upload the PDF, and fill in the title, category, audience and public path. The
  public path starts with `/pdf/`, `/ihna-policies/`, `/ihna-procedures/`, `/IHNA_International_Course_Guide/`, `/alumni/docs/`,
  `/wp-content/uploads/pdf/`, `/wp-content/uploads/guides/` or `/brochures/` and ends with `.pdf` (for example
  `/ihna-policies/IHNA_New_Policy.pdf`). You can paste a full address; it is cleaned up when you save. Ask a developer to link it
  from the page where it belongs.
- **Course brochures** are documents with the category `brochure`, saved under `/brochures/` and picked on the course as its
  **Brochure**.
- **Deleting** a document takes its address offline, so only an administrator can delete one. To retire a policy, replace the file
  instead.
