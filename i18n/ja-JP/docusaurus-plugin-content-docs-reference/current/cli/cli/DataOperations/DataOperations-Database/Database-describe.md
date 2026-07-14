---
title: "describe | Cloud"
slug: /cli/cli/Database-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースの詳細を取得します。（Dedicated のみ） | Cloud"
type: docx
token: A8XSdcz0UoXHnyxHPcOcaLExn3o
sidebar_position: 2
keywords: 
  - Milvus とは
  - Milvus database
  - Milvus lite
  - Milvus benchmark
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

この操作はデータベースの詳細を取得します。（Dedicated のみ）

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターに適用されます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database describe
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[必須]**

    データベース名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz database describe --name my_database
```
