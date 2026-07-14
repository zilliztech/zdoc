---
title: "restore-cluster | Cloud"
slug: /cli/cli/Backup-restorecluster
sidebar_label: "restore-cluster"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作は、バックアップを新しいクラスターに復元します。 | Cloud"
type: docx
token: XAhudiqXqoHS1zxSDqgcNY9anxb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - restore-cluster
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# restore-cluster

この操作は、バックアップを新しいクラスターに復元します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した際に、クラスター全体または特定のコレクションを復元できます。

クラスターを復元すると、新しいクラスターが作成され、バックアップされたすべてのコレクションがそこにコピーされます。オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトが開始されます。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ使用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup restore-cluster
--cluster-id <value>
--backup-id <value>
--project-id <value>
--name <value>
--cu-size <value>
--collection-status <KEEP | RELEASE>
--restore-version-policy <LATEST | ORIGINAL>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` に似た形式の、ソースクラスター ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--backup-id** (*string*) -

    **[REQUIRED]**

    `backupx-xxxxx` に似た形式の、復元するバックアップの ID を示します。

- **--project-id** (*string*) -

    **[REQUIRED]**

    `proj-xxxxx` に似た形式の、ターゲットプロジェクト ID を示します。

- **--name** (*string*) -

    **[REQUIRED]**

    新しいクラスター名を示します。

- **--cu-size** (*integer*) -

    **[REQUIRED]**

    新しいクラスターのコンピュートユニット (CU) を示します。

    CU は、データの並列処理に使用される計算リソースの基本単位であり、CU のタイプごとに CPU、メモリ、ストレージの組み合わせが異なります。CU の概念は **Dedicated** クラスターにのみ適用されます。

    - **Standard** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 32 以下である必要があります。

    - **Enterprise** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 1,024 以下である必要があります。

- **--collection-status** (*string*) -

    **[REQUIRED]**

    復元後のコレクションの状態を示します。

    使用可能な値: `KEEP` および `RELEASE`。

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

    出力をフィルタリングする JMESPath 式を示します。

- **--restore-version-policy** (*string*) -

    DB バージョンの復元ポリシーを指定します。使用可能な値: `LATEST` および `ORIGINAL`。

## Example\{#example}

```bash
# コレクションをロードした状態で復元
zilliz backup restore-cluster --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--project-id proj-xxxx \
--name restored \
--cu-size 1 \
--collection-status KEEP \
--restore-version-policy LATEST
```
