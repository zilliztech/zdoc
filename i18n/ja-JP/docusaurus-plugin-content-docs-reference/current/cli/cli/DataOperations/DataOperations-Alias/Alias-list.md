---
title: "list | Cloud"
slug: /cli/cli/Alias-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべての alias を一覧表示します。 | Cloud"
type: docx
token: L8PEdl4Dio11q5x4rPBc4OFZn8b
sidebar_position: 5
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
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

この操作はすべての alias を一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz alias list [OPTIONS]
```

## Options\{#options}

- **--database** (*string*) -

    **[REQUIRED]**

    データベース名を指定します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションが未設定であれば、それが属するデータベースが自動的に適用されます。

- **--collection** (*string*) -

    collection 名によるフィルターを指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングする JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz alias list --database default
```
