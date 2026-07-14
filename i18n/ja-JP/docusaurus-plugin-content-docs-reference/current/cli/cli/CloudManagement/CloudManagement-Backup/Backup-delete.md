---
title: "delete | Cloud"
slug: /cli/cli/Backup-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はバックアップを削除します。 | Cloud"
type: docx
token: F01Gdx5b8onjxOxbhficUecWndf
sidebar_position: 2
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
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

この操作はバックアップを削除します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

バックアップが不要になった場合は削除できます。削除されたバックアップは即座に利用できなくなります。十分に注意して操作してください。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup delete 
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
[--yes]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxx` のようなクラスター ID を示します。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    削除するバックアップの ID を示します。`backupx-xxxxx` のような形式です。

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

    対話型プロンプトをスキップするかどうかを示します。

## Example\{#example}

```bash
zilliz backup delete \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
