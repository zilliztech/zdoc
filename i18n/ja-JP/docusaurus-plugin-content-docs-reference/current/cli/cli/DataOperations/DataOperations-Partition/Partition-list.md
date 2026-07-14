---
title: "list | Cloud"
slug: /cli/cli/Partition-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection 内の partition を一覧表示します。 | Cloud"
type: docx
token: QVxadXWKIo8YcHxZgD1c0F0VnXf
sidebar_position: 5
keywords: 
  - semantic search とは
  - Embedding model
  - 画像類似検索
  - Context Window
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

この操作は collection 内の partition を一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz partition list
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を示します。

- **--database** (*string*) -

    database 名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`, `table`, `text`, `yaml`, `csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## 例\{#example}

```bash
zilliz partition list --collection my_collection
```
