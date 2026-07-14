---
title: "create | Cloud"
slug: /cli/cli/Collection-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "この操作は、現在の Zilliz Cloud クラスターコンテキストでコレクションを作成します。 | Cloud"
type: docx
token: Oq1Pd3N3popZ2ExT184cksHfnxh
sidebar_position: 2
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AIチャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - 作成
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は、現在の Zilliz Cloud クラスターコンテキストでコレクションを作成します。

## Description\{#description}

現在の Zilliz Cloud クラスターコンテキストでコレクションを作成します。一般的なスキーマには CLI オプションを使用し、高度なコレクション定義や外部コレクションには JSON body を渡します。

## Synopsis\{#synopsis}

```bash
zilliz collection create
[--name <value>]
[--dimension <value>]
[--metric-type <value>]
[--id-type <value>]
[--auto-id]
[--primary-field <value>]
[--vector-field <value>]
[--api-key <value>]
[--database <value>]
[--body <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    コレクション名を指定します。

- **--dimension** (*integer*) -

    ベクトル次元を指定します。`--body` が指定されていない場合は必須です。

- **--metric-type** (*string*) -

    距離メトリックを指定します。デフォルト: `COSINE`。選択肢: `COSINE`, `L2`, `IP`。

- **--id-type** (*string*) -

    主キーの型を指定します。選択肢: `Int64`, `VarChar`。

- **--auto-id** (*boolean*) -

    Zilliz Cloud が主キー値を自動的に生成するかどうかを指定します。

- **--primary-field** (*string*) -

    主キーフィールド名を指定します。

- **--vector-field** (*string*) -

    ベクトルフィールド名を指定します。

- **--api-key** (*string*) -

    このコマンド用の API キーを指定します。この値は、環境変数または設定済みの API キーを上書きします。

- **--database** (*string*) -

    データベース名を指定します。

- **--body** (*string*) -

    生の JSON リクエスト body を渡します。JSON オブジェクト文字列または `file://path` を使用します。たとえば `file://schema.json` です。body は他のフラグとマージされます。

## Example\{#example}

```bash
# Quick create with defaults
zilliz collection create --name my_collection --dimension 768

# Create with a body file
zilliz collection create --body file://schema.json
```
