---
title: "release | Cloud"
slug: /cli/cli/Collection-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションをメモリから解放します。 | Cloud"
type: docx
token: G0s2d1DVconhc5xeX02cJWbUnLf
sidebar_position: 12
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# release

この操作はコレクションをメモリから解放します。

## 使用方法\{#usage}

```bash
zilliz collection release
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    コレクション名を指定します。

- **--database** (*string*) -

    データベース名を指定します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても、それに属するデータベースが自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## 例\{#example}

```bash
zilliz collection release --name my_collection
```
