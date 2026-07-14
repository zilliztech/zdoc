---
title: "export | Cloud"
slug: /cli/cli/Backup-export
sidebar_label: "export"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はバックアップを外部ストレージにエクスポートします。 | Cloud"
type: docx
token: MqCqdE8mqotzaXxk8nfcOvHinX0
sidebar_position: 5
keywords: 
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - 近似最近傍探索
  - zilliz
  - zilliz cloud
  - cloud
  - エクスポート
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# export

この操作はバックアップを外部ストレージにエクスポートします。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

バックアップファイルは、インテグレーション ID で識別される統合ストレージサービスにエクスポートできます。この操作は非同期であり、ジョブが作成されます。ジョブの進行状況を取得するには、[`zilliz job describe`](./Job-describe) を実行できます。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Usage\{#usage}

```bash
zilliz backup export
--cluster-id <value>
--backup-id <value>
--integration-id <value>
[--directory <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` のようなクラスター ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    `backupx-xxxxx` のようなバックアップ ID を示します。

- **--integration-id** (*string*) -

    **[REQUIRED]**

    `integ-xxxxx` のようなストレージインテグレーション ID を示します。

- **--directory** (*string*) -

    外部ストレージ内の対象ディレクトリを示します。

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
zilliz backup export --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--integration-id integ-xxxx
```
