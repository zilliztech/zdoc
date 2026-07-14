---
title: "alter | Cloud"
slug: /cli/cli/Alias-alter
sidebar_label: "alter"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、alias を別の collection に再割り当てします。 | Cloud"
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

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# alter

この操作は、alias を別の collection に再割り当てします。

## Description\{#description}

collection に alias を割り当て、その alias に対して検索/クエリを実行すると、関連付けられた collection が応答するようにできます。指定した alias に関連付けられた collection を変更するには、このコマンドを使用します。

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

    新しい対象 collection を示します。

- **--alias** (*string*) -

    **[REQUIRED]**

    再割り当てする alias 名を示します。

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

## Example\{#example}

```bash
zilliz alias alter --collection new_collection --alias my_alias
```
