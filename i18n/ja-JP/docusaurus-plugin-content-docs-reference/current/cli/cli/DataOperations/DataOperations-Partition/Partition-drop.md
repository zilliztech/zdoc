---
title: "drop | Cloud"
slug: /cli/cli/Partition-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は partition を削除します。 | Cloud"
type: docx
token: DT7Jduvj2osqF0xVhwMcU2t7nmd
sidebar_position: 2
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

この操作は partition を削除します。

## Synopsis\{#synopsis}

```bash
zilliz partition drop
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を示します。

- **--partition** (*string*) -

    **[REQUIRED]**

    削除する partition 名を示します。

- **--database** (*string*) -

    database 名を示します。

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

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを示します。

## Example\{#example}

```bash
zilliz partition drop --collection my_collection --partition my_partition
```
