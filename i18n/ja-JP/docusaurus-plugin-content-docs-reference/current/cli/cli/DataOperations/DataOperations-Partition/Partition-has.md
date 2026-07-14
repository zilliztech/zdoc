---
title: "has | Cloud"
slug: /cli/cli/Partition-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はパーティションが存在するかどうかを確認します。 | Cloud"
type: docx
token: IQy0d491iojaTEx3teycfP3snCe
sidebar_position: 4
keywords: 
  - Zilliz
  - Milvus ベクトルデータベース
  - Milvus DB
  - Milvus ベクトル DB
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# has

この操作はパーティションが存在するかどうかを確認します。

## Synopsis\{#synopsis}

```bash
zilliz partition has
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--partition** (*string*) -

    **[REQUIRED]**

    パーティション名を示します。

- **--database** (*string*) -

    データベース名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`, `table`, `text`, `yaml`, `csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz partition has --collection my_collection --partition my_partition
```
