---
title: "drop | Cloud"
slug: /cli/cli/Database-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースを削除します。（Dedicated のみ） | Cloud"
type: docx
token: WjbrdMFuXoR2etxfpMdcmIebnCh
sidebar_position: 3
keywords: 
  - 語彙検索
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

この操作はデータベースを削除します。（Dedicated のみ）

<Admonition type="info" icon="📘" title="注記">

このコマンドは Dedicated クラスターに適用されます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database drop
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--name** (*string*) -

    **[必須]**

    削除するデータベース名を指定します。

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

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを指定します。

## 例\{#example}

```bash
zilliz database drop --name my_database
```
