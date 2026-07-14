---
title: "describe-policy | Cloud"
slug: /cli/cli/Backup-describepolicy
sidebar_label: "describe-policy"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クラスターのバックアップポリシーを説明します。 | Cloud"
type: docx
token: WcQadTMuCo9voCxPT86cxFzFnkf
sidebar_position: 4
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - describe-policy
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe-policy

この操作は、クラスターのバックアップポリシーを説明します。

## Description\{#description}

Zilliz Cloud では、クラスターに対して **自動バックアップ** を有効にでき、予期しない問題が発生した場合のデータ復旧に役立ちます。自動バックアップは **クラスター全体** に適用され、個々のコレクションを自動的にバックアップすることはサポートされていません。

このコマンドを実行すると、指定したクラスターに適用される現在の自動バックアップポリシーの設定を確認できます。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup describe-policy
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[必須]**

    `inxx-xxxxx` に似たクラスター ID を指定します。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz backup describe-policy --cluster-id in01-xxxxxxxxxxxx
```
