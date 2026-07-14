---
title: "delete | Cloud"
slug: /cli/cli/Vector-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はフィルター式によってエンティティを削除します。 | Cloud"
type: docx
token: NtaUdIxZBoupfkxG52lco4oZnzf
sidebar_position: 1
keywords: 
  - 類似性検索
  - マルチモーダル RAG
  - llm hallucinations
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - cloud
  - 削除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

この操作は、フィルター式によってエンティティを削除します。

## Description\{#description}

Zilliz Cloud は、ニーズに合ったフィルター式を構築するのに役立つ便利なフィルタリング演算子一式を提供します。詳細については、[フィルタリングの概要](/docs/filtering-overview) および関連ページを参照してください。

## Synopsis\{#synopsis}

```bash
zilliz vector delete
--collection <value>
--filter <value>
[--partition <value>]
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を示します。

- **--filter** (*string*) -

    **[REQUIRED]**

    削除するエンティティのフィルター式を示します。

- **--partition** (*string*) -

    partition 名を示します。

- **--database** (*string*) -

    database 名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。使用可能な値:

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
zilliz vector delete --collection my_col --filter 'id in [1, 2, 3]'
```
