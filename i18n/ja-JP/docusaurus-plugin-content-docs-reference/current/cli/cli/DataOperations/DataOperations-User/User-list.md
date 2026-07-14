---
title: "list | Cloud"
slug: /cli/cli/User-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、すべてのデータベースユーザーを一覧表示します。 | Cloud"
type: docx
token: RhYcd912ioVJNOxjy9kc3rnbnzK
sidebar_position: 5
keywords: 
  - Milvusとは
  - Milvus database
  - milvus lite
  - milvus benchmark
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

この操作では、すべてのデータベースユーザーを一覧表示します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスターを切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user list
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## オプション\{#options}

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
zilliz user list
```
