---
title: "drop | Cloud"
slug: /cli/cli/Collection-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a コレクション. This action is irreversible. | Cloud"
type: docx
token: IM2CdOqn5oKCTUxFVImcbDCRnFc
sidebar_position: 4
keywords: 
  - ベクトルデータベースの例
  - rag ベクトルデータベース
  - ベクトル db とは
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a コレクション. This action is irreversible.

## Synopsis\{#synopsis}

```bash
zilliz collection drop
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the コレクション name to drop.

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

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを示します。

## Example\{#example}

```bash
zilliz collection drop --name my_collection
```
