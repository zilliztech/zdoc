---
title: "compact | Cloud"
slug: /cli/cli/Collection-compact
sidebar_label: "compact"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ストレージを最適化するために collection セグメントを compaction します。 | Cloud"
type: docx
token: PgZ0dL39ho6wLbxJKANcm0jyn9b
sidebar_position: 1
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - cloud
  - compact
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# compact

この操作は、ストレージを最適化するために collection セグメントを compaction します。

## Description\{#description}

Zilliz Cloud は一定間隔で collection セグメントを自動的に compaction します。ほとんどの場合、collection 内のストレージを最適化する必要がある場合を除き、このコマンドを手動で実行する必要はありません。

Clustering compaction は、大規模な collection において検索パフォーマンスを向上させ、コストを削減するために設計されています。このガイドは、clustering compaction と、この機能がどのように検索パフォーマンスを向上させるのかを理解するのに役立ちます。通常の compaction とは異なり、clustering compaction は scalar field 内の値に基づいて collection のセグメント内で entity を再配置します。

オプションを指定せずにこのコマンドを実行すると、設定を支援する対話型プロンプトが開始されます。

## Synopsis\{#synopsis}

```bash
zilliz collection compact
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--clustering]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    collection 名を示します。`zilliz collection list` を実行して、既存のすべての collection の一覧を取得できます。

- **--database** (*string*) -

    database 名を示します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションを設定しなければ、その cluster が属する database が自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

- **--clustering** (*boolean*) -

    clustering compaction を実行するかどうかを示します。

## Example\{#example}

```bash
zilliz collection compact --name my_collection
```
