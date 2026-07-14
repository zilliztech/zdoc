---
title: "invoices | Cloud"
slug: /cli/cli/Billing-invoices
sidebar_label: "invoices"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、請求書の一覧表示、または特定の請求書の詳細取得を行います。 | Cloud"
type: docx
token: Pw8Xd2yoGolKYZxsg1ZcJ0Odnmb
sidebar_position: 3
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - invoices
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# invoices

この操作では、請求書の一覧表示、または特定の請求書の詳細取得を行います。

## Description\{#description}

Zilliz Cloud は organization レベルで課金されます。請求書にアクセスするには、**Organization Owner** または **Billing Admin** 権限が必要です。

オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトが開始されます。

<Admonition type="info" icon="📘" title="注意">

請求書の税金は、提供された請求先住所に基づいて計算されます。VAT または GST ID の入力が必要な企業は、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz billing invoices
[--invoice-id <value>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[-all]
```

## Options\{#options}

- **--invoice-id** (*string*) -

    請求書 ID を指定します。指定した場合、この請求書の詳細を表示します。値は `inv-xxxxx` のような形式です。

- **--page-size** (*integer*) -

    1 ページあたりの項目数を指定します。デフォルト値は **10** です。

- **--page** (*integer*) -

    取得するページ番号を指定します。デフォルト値は **1** です。

- **--all, -a** (*boolean*) -

    すべてのページを取得するかどうかを指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz billing invoices
```
