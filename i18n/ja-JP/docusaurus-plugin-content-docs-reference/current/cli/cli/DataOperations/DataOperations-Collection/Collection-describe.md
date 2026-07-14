---
title: "describe | Cloud"
slug: /cli/cli/Collection-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションの詳細を取得します。 | Cloud"
type: docx
token: A2rOdHew3oMHWNx6ngFc4nAbnyg
sidebar_position: 3
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
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

この操作はコレクションの詳細を取得します。

## Synopsis\{#synopsis}

```bash
zilliz collection describe
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    コレクション名を示します。

- **--database** (*string*) -

    データベース名を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても、それが属するデータベースが自動的に適用されます。

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
zilliz collection describe --name my_collection
```
