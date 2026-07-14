---
title: "list | Cloud"
slug: /cli/cli/Backup-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はすべてのバックアップを一覧表示します。 | Cloud"
type: docx
token: VHhWdygYaoyAmQxRpP6cvmIYndc
sidebar_position: 6
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作はすべてのバックアップを一覧表示します。

## Description\{#description}

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

このコマンドをオプションなしで実行すると、追加オプションを設定するかどうかを尋ねられます。プロンプトのデフォルトは yes で、オプション設定をガイドします。プロンプトに対して N を入力すると、このコマンドはすべてのバックアップを取得します。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup list
[--project-id <value>]
[--cluster-id <value>]
[--creation-method <manual | auto>]
[--backup-type <CLUSTER | COLLECTION>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## Options\{#options}

- **--project-id** (*string*) -

    フィルタリング条件としてプロジェクト ID を指定します。`proj-xxxxx` のような形式です。

- **--cluster-id** (*string*) -

    フィルタリング条件としてクラスター ID を指定します。`inxx-xxxxx` のような形式です。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--creation-method** (*string*) -

    フィルタリング条件として作成方法を指定します。 

    指定可能な値は `manual` と `auto` です。

- **--backup-type** (*string*) -

    フィルタリング条件としてバックアップの種類を指定します。

    指定可能な値は `CLUSTER` と `COLLECTION` です。

- **--page-size** (*integer*) -

    1 ページあたりの項目数を指定します。デフォルト値は **10** です。

- **--page** (*integer*) -

    ページ番号を指定します。デフォルト値は **1** です。

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

- **--all, -a** (*boolean*) -

    すべてのページを取得するかどうかを指定します。

## Example\{#example}

```bash
# List all backups
zilliz backup list

# List backups for a specific cluster
zilliz backup list --cluster-id in01-xxxxxxxxxxxx
```
