---
title: "download-invoice | Cloud"
slug: /cli/cli/Billing-downloadinvoice
sidebar_label: "download-invoice"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は請求書を PDF としてダウンロードします。まず `zilliz billing invoices` を使用して利用可能な請求書 ID を一覧表示してください。`--output-file` も `--dir` も指定されていない場合、PDF は `./.pdf` として保存されます。 | Cloud"
type: docx
token: RnGZdWUpmojfvHxReFicTHYEnwd
sidebar_position: 2
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
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

この操作は請求書を PDF としてダウンロードします。まず `zilliz billing invoices` を使用して利用可能な請求書 ID を一覧表示してください。`--output-file` も `--dir` も指定されていない場合、PDF は `./<invoiceId>.pdf` として保存されます。

## Synopsis\{#synopsis}

```bash
zilliz billing download-invoice
--invoice-id <string>
[--output-file <path> | --dir <path>]
```

## Options\{#options}

- **--invoice-id** (*string*) -

    **[REQUIRED]**

    ダウンロードする請求書 ID を指定します。ID の一覧表示には `zilliz billing invoices` を使用します。

- **--output-file, -o** (*path*) -

    出力ファイルのパスを指定します。`.pdf` 拡張子がない場合は自動的に追加されます。`--dir` とは同時に使用できません。

- **--dir, -d** (*path*) -

    PDF を `<dir>/<invoiceId>.pdf` として保存するディレクトリを指定します。`--output-file` とは同時に使用できません。

## Example\{#example}

```bash
# ./<invoiceId>.pdf に保存
zilliz billing download-invoice --invoice-id inv-xxxx

# 特定のディレクトリに保存
zilliz billing download-invoice --invoice-id inv-xxxx -d ~/Downloads

# 明示的なファイルパスに保存
zilliz billing download-invoice --invoice-id inv-xxxx -o ~/Downloads/march.pdf
```
