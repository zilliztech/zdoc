---
title: "suspend | Cloud"
slug: /cli/cli/Cluster-suspend
sidebar_label: "suspend"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は実行中のクラスターを一時停止します。一時停止するとコンピュート料金の請求が停止されます。 | Cloud"
type: docx
token: RjlQdGJyzolWm0xZVyUc6yAdnyc
sidebar_position: 10
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - 一時停止
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# suspend

この操作は実行中のクラスターを一時停止します。一時停止するとコンピュート料金の請求が停止されます。

## Synopsis\{#synopsis}

```bash
zilliz cluster suspend
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## オプション\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    一時停止するクラスターの ID を指定します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

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
zilliz cluster suspend --cluster-id in01-xxxxxxxxxxxx
```
