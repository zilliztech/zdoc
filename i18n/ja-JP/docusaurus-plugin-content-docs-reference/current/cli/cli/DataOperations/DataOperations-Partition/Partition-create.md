---
title: "create | Cloud"
slug: /cli/cli/Partition-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection に partition を作成します。 | Cloud"
type: docx
token: JBRhd3cb5owndqxODOxcd08InRe
sidebar_position: 1
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AI Hallucination
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

この操作は collection に partition を作成します。

## Description\{#description}

partition は collection のサブセットです。各 partition は親 collection と同じデータ構造を共有しますが、collection 内のデータの一部のみを含みます。

collection を作成すると、Zilliz Cloud は collection 内に **default** という名前の partition も作成します。他の partition を追加しない場合、collection に挿入されるすべての entity は default partition に格納され、すべての検索およびクエリはその中で実行されます。

特定の条件に基づいて、さらに partition を追加し、それらに entity を挿入できます。その後、特定の partition 内に検索やクエリを制限でき、検索パフォーマンスを向上させることができます。

1 つの collection には最大 1,024 個の partition を作成できます。

## Synopsis\{#synopsis}

```bash
zilliz partition create
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を指定します。

- **--partition** (*string*) -

    **[REQUIRED]**

    partition 名を指定します。

    値は **255** 文字以内の文字列で、**アンダースコア (_) または英字で始まる** 必要があります。

- **--database** (*string*) -

    database 名を指定します。

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

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz partition create --collection my_collection --partition my_partition
```
