---
title: "drop | Cloud"
slug: /cli/cli/Role-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はロールを削除します。 | Cloud"
type: docx
token: YzVadE24uorV0gx5Se3ceumqnDh
sidebar_position: 3
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
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

この操作はロールを削除します。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターでのみ使用できます。`zilliz context set` を実行してクラスター間を切り替えることができます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role drop
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
[--yes]
```

## オプション\{#options}

- **--role** (*string*) -

    **[必須]**

    削除するロール名を示します。

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

    出力をフィルタリングする JMESPath 式を示します。

- **--yes, -y** (*boolean*) -

    確認プロンプトをスキップするかどうかを示します。

- **--database** (*string*) -

    データベース名を示します。デフォルト値は `default` です。

## 例\{#example}

```bash
zilliz role drop --role my_role
```
