---
title: "create | Cloud"
slug: /cli/cli/Alias-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection を指す alias を作成します。 | Cloud"
type: docx
token: WxTjdBaBqoNhRex5kR0cfekqnOc
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は、collection を指す alias を作成します。

## Description\{#description}

collection に alias を割り当て、その alias に対して検索/クエリを実行すると、関連付けられた collection が応答するようにできます。指定した alias に関連付けられた collection を変更するには、このコマンドを使用します。

プロンプトを指定せずにこのコマンドを実行すると、セットアップを支援する一連の対話型プロンプトが開始されます。

## Synopsis\{#synopsis}

```bash
zilliz alias create
--collection <value>
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    対象の collection 名を示します。

- **--alias** (*string*) -

    **[REQUIRED]**

    alias 名を示します。

    値は、先頭がアンダースコア (_) または英字で始まる、最大 **255** 文字の英数字文字列である必要があります。

- **--database** (*string*) -

    database 名を示します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションを設定しなくても、それが属する database が自動的に適用されます。

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
zilliz alias create --collection my_collection --alias my_alias
```
