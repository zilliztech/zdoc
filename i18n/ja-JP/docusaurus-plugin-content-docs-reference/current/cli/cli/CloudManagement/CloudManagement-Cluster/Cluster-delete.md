---
title: "delete | Cloud"
slug: /cli/cli/Cluster-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクラスターを削除します。このアクションは元に戻せません。 | Cloud"
type: docx
token: S4Omd93kpoyuqtx4E7scLCoXnyB
sidebar_position: 2
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
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

この操作はクラスターを削除します。このアクションは元に戻せません。

## 説明\{#description}

クラスターを削除すると、保存されているデータも消去されます。十分に注意して実行してください。オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトが表示されます。

## Synopsis\{#synopsis}

```bash
zilliz cluster delete
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## オプション\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    削除するクラスターの ID を示します。これは `inxx-xxxxx` に似た形式です。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

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

## 例\{#example}

```bash
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx

# Skip confirmation prompt
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx -y
```
