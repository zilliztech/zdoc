---
title: "get | Cloud"
slug: /cli/cli/Vector-get
sidebar_label: "get"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、主キー ID によってエンティティを取得します。 | Cloud"
type: docx
token: Nez2dlNZloLWEPxBHOWcad2anLf
sidebar_position: 2
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - get
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get

この操作は、主キー ID によってエンティティを取得します。

## Synopsis\{#synopsis}

```bash
zilliz vector get
--collection <value>
--id <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## オプション\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--id** (*array*) -

    **[REQUIRED]**

    主キー ID を JSON 配列で指定します。例: `'[1, 2, 3]'`。

- **--output-fields** (*array*) -

    返されるフィールドを JSON 配列で指定します。例: `'["title", "abstract"]'`。

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

## 例\{#example}

```bash
zilliz vector get --collection my_col --id '[1, 2, 3]'
```
