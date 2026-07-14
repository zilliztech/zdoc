---
title: "list | Cloud"
slug: /cli/cli/Index-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションのインデックスを一覧表示します。 | Cloud"
type: docx
token: Kw0KdCb7yom9alxtZRTcV3m7nCb
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
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

この操作はコレクションのインデックスを一覧表示します。

## 使用法\{#usage}

```bash
zilliz index list
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--database** (*string*) -

    データベース名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`, `table`, `text`, `yaml`, `csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## 例\{#example}

```bash
zilliz index list --collection my_collection
```
