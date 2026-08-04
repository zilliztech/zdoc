---
title: "download-invoice | Cloud"
slug: /cli/cli/Billing-downloadinvoice
sidebar_label: "download-invoice"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将发票下载为 PDF。请先使用 `zilliz billing invoices` 列出可用的发票 ID。如果既未提供 `--output-file` 也未提供 `--dir`，PDF 将保存为 `./.pdf`。 | Cloud"
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

此操作会将发票下载为 PDF。请先使用 `zilliz billing invoices` 列出可用的发票 ID。如果既未提供 `--output-file` 也未提供 `--dir`，PDF 将保存为 `./<invoiceId>.pdf`。

## 简介\{#synopsis}

```bash
zilliz billing download-invoice
--invoice-id <string>
[--output-file <path> | --dir <path>]
```

## 选项\{#options}

- **--invoice-id** (*string*) -

    **[必需]**

    指定要下载的发票 ID。使用 `zilliz billing invoices` 列出 ID。

- **--output-file, -o** (*path*) -

    指定输出文件路径。如果缺少 `.pdf`，会自动追加。与 `--dir` 互斥。

- **--dir, -d** (*path*) -

    指定一个目录，将 PDF 保存为 `<dir>/<invoiceId>.pdf`。与 `--output-file` 互斥。

## 示例\{#example}

```bash
# Save to ./<invoiceId>.pdf
zilliz billing download-invoice --invoice-id inv-xxxx

# Save to a specific directory
zilliz billing download-invoice --invoice-id inv-xxxx -d ~/Downloads

# Save to an explicit file path
zilliz billing download-invoice --invoice-id inv-xxxx -o ~/Downloads/march.pdf
```
