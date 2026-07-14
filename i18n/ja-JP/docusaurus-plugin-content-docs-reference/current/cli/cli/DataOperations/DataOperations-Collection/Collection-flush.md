---
title: "flush | Cloud"
slug: /cli/cli/Collection-flush
sidebar_label: "flush"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションデータをディスクにフラッシュします。 | Cloud"
type: docx
token: DIVvdqJlOoneFwxqs0xcG313nmg
sidebar_position: 5
keywords: 
  - vector db とは
  - vector databases とは何か
  - vector databases の比較
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - flush
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# flush

この操作はコレクションデータをディスクにフラッシュします。

## Description\{#description}

このコマンドを実行すると、現在成長中のセグメントがシールされ、ディスクに保存されます。このコマンドを手動で実行すると、多数の小さなセグメントが生成される可能性があり、検索パフォーマンスに影響する場合があります。 

このコマンドを手動で実行するのではなく、Zilliz Cloud によるデータのディスクへのフラッシュに任せることを推奨します。

## Usage\{#usage}

```bash
zilliz collection flush
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

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても、それが属するデータベースが自動的に適用されます。

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

## Example\{#example}

```bash
zilliz collection flush --name my_collection
```
