---
title: "describe | Cloud"
slug: /cli/cli/Cluster-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクラスターの詳細を取得します。 | Cloud"
type: docx
token: OgJTdgaTIoMPGGx0EmachVPKnHc
sidebar_position: 3
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
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

この操作はクラスターの詳細を取得します。

## Description\{#description}

このコマンドは、以下を含むクラスターの詳細を返します。

- クラスターの表示名（`clusterName`）

- 所属するプロジェクトの ID（`projectId`）

- 配置されているリージョン（`regionId`）

- 使用しているサブスクリプションプラン（`plan`）

- 現在のステータス（`status`）

- パブリックおよびプライベート接続エンドポイント（`connectAddress` および `privateLinkAddress`）

- 作成された時刻（`createTime`）

- レプリカ数（`replica`）

- CU サイズ（`cuSize`、無料クラスターおよびサーバーレスクラスターでは常に 0）

- ストレージサイズ（`storageSize`）およびデプロイオプション（`deploymentOption`）

- 作成されたバックアップ数（`snapshotNumber`、無料クラスターおよびサーバーレスクラスターでは常に 0）

- 設定されているオートスケーリングポリシー（`autoscaling`）

## Synopsis\{#synopsis}

```bash
zilliz cluster describe
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    クラスター ID を指定します。例: `in01-xxxxxxxxxxxx`。

    クラスターが `zilliz context set` を使用して設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`

    - `table`

    - `text`

    - `yaml`

    - `csv`

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz cluster describe --cluster-id in01-xxxxxxxxxxxx
```
