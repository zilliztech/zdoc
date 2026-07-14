---
title: "has | Cloud"
slug: /cli/cli/Collection-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションが存在するかどうかを確認します。 | Cloud"
type: docx
token: CidCduwW8oIywtxiHMQc8v2XnBe
sidebar_position: 8
keywords: 
  - Zilliz database
  - 非構造化データ
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# has

この操作はコレクションが存在するかどうかを確認します。

## Synopsis\{#synopsis}

```bash
zilliz collection has
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--name** (*string*) -

    **[必須]**

    コレクション名を示します。

- **--database** (*string*) -

    データベース名を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても、そのクラスターが属するデータベースが自動的に適用されます。

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
zilliz collection has --name my_collection
```
