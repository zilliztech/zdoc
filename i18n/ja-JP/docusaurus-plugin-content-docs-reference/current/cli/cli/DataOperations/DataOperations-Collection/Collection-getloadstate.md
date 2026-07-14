---
title: "get-load-state | Cloud"
slug: /cli/cli/Collection-getloadstate
sidebar_label: "get-load-state"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection のロード状態を取得します。 | Cloud"
type: docx
token: ROPbdTU6doxFGRxxcfYcgyBPnqg
sidebar_position: 6
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - get-load-state
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-load-state

この操作は collection のロード状態を取得します。

## Synopsis\{#synopsis}

```bash
zilliz collection get-load-state
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--partition-names <value>]
```

## オプション\{#options}

- **--name** (*string*) -

    **[必須]**

    collection 名を示します。

- **--database** (*string*) -

    database 名を示します。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションを設定しなくても、そのクラスターに属する database が自動的に適用されます。

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

- **--partition-names** (*array*) -

    ロード状態を確認する partition 名を示します。異なる partition 名でこのオプションを連続して指定できます。

## 例\{#example}

```bash
zilliz collection get-load-state --name my_collection
```
