---
title: "alter | Cloud"
slug: /cli/cli/Alias-alter
sidebar_label: "alter"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation reassigns an alias to another コレクション. | Cloud"
type: docx
token: PLvbdUqI6onWmWxFPYKcgcFpnwb
sidebar_position: 1
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - alter
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# alter

This operation reassigns an alias to another コレクション.

## Description\{#description}

You can assign an alias to a コレクション and conduct searches/queries against the alias so that the associated コレクション responds. Use this command to change the コレクション associated with the specified alias.

プロンプトなしでこのコマンドを実行すると、セットアップを支援する一連の対話型プロンプトが起動します。

## Synopsis\{#synopsis}

```bash
zilliz alias alter
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

    Indicates the new target コレクション.

- **--alias** (*string*) -

    **[REQUIRED]**

    再割り当てする alias 名を示します。

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
zilliz alias alter --collection new_collection --alias my_alias
```
