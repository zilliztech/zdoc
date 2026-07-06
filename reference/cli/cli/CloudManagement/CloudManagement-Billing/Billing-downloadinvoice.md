---
title: "download-invoice | Cloud"
slug: /cli/cli/Billing-downloadinvoice
sidebar_label: "download-invoice"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation downloads an invoice as PDF. Use `zilliz billing invoices` to list available invoice IDs first. The PDF is saved as `./.pdf` if neither `--output-file` nor `--dir` is supplied. | Cloud"
type: docx
token: RnGZdWUpmojfvHxReFicTHYEnwd
sidebar_position: 2
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - download-invoice
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# download-invoice

This operation downloads an invoice as PDF. Use `zilliz billing invoices` to list available invoice IDs first. The PDF is saved as `./<invoiceId>.pdf` if neither `--output-file` nor `--dir` is supplied.

## Synopsis\{#synopsis}

```bash
zilliz billing download-invoice
--invoice-id <string>
[--output-file <path> | --dir <path>]
```

## Options\{#options}

- **--invoice-id** (*string*) -

    **[REQUIRED]**

    Specifies the invoice ID to download. Use `zilliz billing invoices` to list IDs.

- **--output-file, -o** (*path*) -

    Specifies the output file path. Auto-appends `.pdf` if missing. Mutually exclusive with `--dir`.

- **--dir, -d** (*path*) -

    Specifies a directory to save the PDF as `<dir>/<invoiceId>.pdf`. Mutually exclusive with `--output-file`.

## Example\{#example}

```bash
# Save to ./<invoiceId>.pdf
zilliz billing download-invoice --invoice-id inv-xxxx

# Save to a specific directory
zilliz billing download-invoice --invoice-id inv-xxxx -d ~/Downloads

# Save to an explicit file path
zilliz billing download-invoice --invoice-id inv-xxxx -o ~/Downloads/march.pdf
```
