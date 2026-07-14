---
title: "list | Cloud"
slug: /cli/cli/Alert-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクトのアラートルールを一覧表示します。 | Cloud"
type: docx
token: DTiIdd5NBocV9JxsNHZcoUownwh
sidebar_position: 5
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作は、プロジェクトのアラートルールを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz alert list
[--project-id <value>]
[--page-size <value>]
[--page <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--project-id** (*string*) -

    `proj-xxxxx` のようなプロジェクト ID を示します。

    `zilliz context set` を使用してプロジェクトが設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--page-size** (*integer*) -

    1 ページあたりの項目数を示します。デフォルト値は **10** です。

- **--page** (*integer*) -

    ページ番号を示します。デフォルト値は **1** です。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert list
```
