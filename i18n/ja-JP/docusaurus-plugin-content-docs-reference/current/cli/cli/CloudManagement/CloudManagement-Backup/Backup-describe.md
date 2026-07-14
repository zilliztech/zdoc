---
title: "describe | Cloud"
slug: /cli/cli/Backup-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はバックアップの詳細を取得します。 | Cloud"
type: docx
token: OQIRdZ8iOoZxd1xNPHtcWPTBnye
sidebar_position: 3
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

この操作はバックアップの詳細を取得します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

このコマンドを実行して、バックアップの詳細を取得できます。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synposis\{#synposis}

```bash
zilliz backup describe
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` のようなクラスター ID を示します。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    `backupx-xxxxx` のようなバックアップ ID を示します。

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
zilliz backup describe \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
