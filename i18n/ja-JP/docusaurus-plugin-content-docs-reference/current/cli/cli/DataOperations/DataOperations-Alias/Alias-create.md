---
title: "create | Cloud"
slug: /cli/cli/Alias-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an alias pointing to a コレクション. | Cloud"
type: docx
token: WxTjdBaBqoNhRex5kR0cfekqnOc
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates an alias pointing to a コレクション.

## Description\{#description}

You can assign an alias to a コレクション and conduct searches/queries against the alias so that the associated コレクション responds. Use this command to change the コレクション associated with the specified alias.

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

    Indicates the target コレクション name.

- **--alias** (*string*) -

    **[REQUIRED]**

    alias 名を示します。

    値は、先頭がアンダースコア (_) または英字で始まる、最大 **255** 文字の英数字文字列である必要があります。

- **--database** (*string*) -

    Indicates the データベース name.

    If a クラスター is configured using `zilliz context set`, the データベース it belongs automatically applies if this option is left unconfigured.

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
