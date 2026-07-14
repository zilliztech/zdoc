---
title: "describe | Cloud"
slug: /cli/cli/Index-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はインデックスの詳細を取得します。 | Cloud"
type: docx
token: T0VYdnnlIo0VwAxLaBjcryM1n7b
sidebar_position: 2
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
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

この操作はインデックスの詳細を取得します。

## Synopsis\{#synopsis}

```bash
zilliz index describe
--collection <value>
--index-name <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--index-name** (*string*) -

    **[REQUIRED]**

    インデックス名を示します。

- **--database** (*string*) -

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
zilliz index describe --collection my_collection --index-name my_index
```
