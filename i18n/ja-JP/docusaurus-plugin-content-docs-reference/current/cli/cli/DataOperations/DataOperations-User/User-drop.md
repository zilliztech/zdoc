---
title: "drop | Cloud"
slug: /cli/cli/User-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースユーザーを削除します。 | Cloud"
type: docx
token: Isx7dzFS9obGxyxEwgncxs67nXe
sidebar_position: 3
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
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

この操作はデータベースユーザーを削除します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスターを切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user drop
--user <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    削除するユーザー名を指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。使用可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを指定します。

## Example\{#example}

```bash
zilliz user drop --user my_user
```
