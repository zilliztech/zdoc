---
title: "describe | Cloud"
slug: /cli/cli/Project-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はプロジェクトの詳細を取得します。 | Cloud"
type: docx
token: OBDNd4bW2oCJqhxEPDSccggSnif
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

この操作はプロジェクトの詳細を取得します。

## Synopsis\{#synopsis}

```bash
zilliz project describe
--project-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## オプション\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    `proj-xxxxx` のようなプロジェクト ID を指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## 例\{#example}

```bash
zilliz project describe --project-id proj-xxxxxxxxxxxx
```
