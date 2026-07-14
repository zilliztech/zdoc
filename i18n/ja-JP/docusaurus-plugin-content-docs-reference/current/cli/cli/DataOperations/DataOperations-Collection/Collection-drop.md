---
title: "drop | Cloud"
slug: /cli/cli/Collection-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection を削除します。この操作は元に戻せません。 | Cloud"
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

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

この操作は collection を削除します。この操作は元に戻せません。

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

    削除する collection 名を示します。

- **--database** (*string*) -

    database 名を示します。

    `zilliz context set` を使用して cluster が設定されている場合、このオプションが未設定であれば、それが属する database が自動的に適用されます。

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
