---
title: "create | Cloud"
slug: /cli/cli/Partition-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a partition in a コレクション. | Cloud"
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

---

import Admonition from '@theme/Admonition';


# create

This operation creates a partition in a コレクション.

## Description\{#description}

A partition is a subset of a コレクション. Each partition shares the same data structure with its parent コレクション but contains only a subset of the data in the コレクション.

When creating a コレクション, Zilliz Cloud also creates a partition named **default** in the コレクション. If you are not going to add any other partitions, all entities inserted into the コレクション go into the default partition, and all searches and queries are carried out within it.

特定の条件に基づいて、さらに partition を追加し、それらに entity を挿入できます。その後、特定の partition 内に検索やクエリを制限でき、検索パフォーマンスを向上させることができます。

A コレクション can have up to 1,024 partitions.

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

    Indicates a コレクション name.

- **--partition** (*string*) -

    **[REQUIRED]**

    partition 名を指定します。

    値は **255** 文字以内の文字列で、**アンダースコア (_) または英字で始まる** 必要があります。

- **--database** (*string*) -

    Indicates the データベース name.

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
