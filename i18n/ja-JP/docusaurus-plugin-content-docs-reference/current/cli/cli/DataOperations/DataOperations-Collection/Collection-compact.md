---
title: "compact | Cloud"
slug: /cli/cli/Collection-compact
sidebar_label: "compact"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation compacts コレクション segments to optimize storage. | Cloud"
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

---

import Admonition from '@theme/Admonition';


# compact

This operation compacts コレクション segments to optimize storage.

## Description\{#description}

Zilliz Cloud automatically compacts コレクション segments at intervals. In most cases, you do not need to run this command manually unless you need to optimize storage in the コレクション.

Clustering Compaction is designed to improve search performance and reduce costs in large コレクション. This guide will help you understand clustering Compaction and how this feature can improve search performance. Unlike normal Compaction, clustering Compaction redistributes entities within a コレクション's segments based on values in a スカラー field.

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

    Indicates the コレクション name. You can run `zilliz collection list` to obtain the list of all existing コレクション.

- **--database** (*string*) -

    Indicates the データベース name.

    If a クラスター is configured using `zilliz context set`, the データベース it belongs automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

- **--clustering** (*boolean*) -

    Indicates whether to perform clustering Compaction.

## Example\{#example}

```bash
zilliz collection compact --name my_collection
```
