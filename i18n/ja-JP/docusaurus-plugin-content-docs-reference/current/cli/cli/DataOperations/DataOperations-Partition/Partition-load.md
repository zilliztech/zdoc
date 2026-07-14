---
title: "load | Cloud"
slug: /cli/cli/Partition-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はパーティションをメモリにロードします。 | Cloud"
type: docx
token: GYyKdrbkvozJxVx6uGhcpMfonoe
sidebar_position: 6
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# load

この操作はパーティションをメモリにロードします。

## Synopsis\{#synopsis}

```bash
zilliz partition load
--collection <value>
--names <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--names** (*array*) -

    **[REQUIRED]**

    パーティション名を JSON 配列として示します。

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
zilliz partition load --collection my_collection --names '["p1", "p2"]'
```
