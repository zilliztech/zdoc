---
title: "create | Cloud"
slug: /cli/cli/Cluster-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいクラスターを作成します。 | Cloud"
type: docx
token: GZ2jdLkKAojfofxm9BTcvwVCn4b
sidebar_position: 1
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
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

この操作は新しいクラスターを作成します。

## Description\{#description}

Dedicated クラスターについて、Zilliz Cloud は次のクラスタータイプを提供しています：**Performance-optimized、Capacity-optimized**、および **Tiered-storage**。

### Performance-optimized クラスター\{#performance-optimized-cluster}

- 低レイテンシと高スループットを重視するシナリオ向けに設計されています。

- 生成 AI、レコメンデーションシステム、チャットボットなどのリアルタイムアプリケーションに最適です。

### Capacity-optimized クラスター\{#capacity-optimized-cluster}

- 大規模データセットの処理向けに設計されており、Performance-optimized に比べて検索性能は抑えられる一方で、5 倍のデータ容量を備えています。

- 大規模な非構造化データ検索、著作権検出、本人確認に最適です。

### Tiered-storage クラスター\{#tiered-storage-cluster}

- 超大規模でコスト重視のワークロードに最適です。

- 低コストで大量のデータを保存する必要があるアプリケーションに最適です。Tiered-storage クラスターの容量は Capacity-optimized クラスターの 4 倍です。

このコマンドをオプションなしで実行すると、一連の対話型プロンプトが開始されます。

<Admonition type="info" icon="📘" title="注意">

Tiered-storage クラスターは BYOC プロジェクトでは利用できません。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz cluster create
--name <value>
--type <serverless | free | dedicated>
[--project-id <value>]
[--region <value>]
[--cu-type <Performance-optimized | Capacity-optimized | Tiered-storage>]
[--cu-size <value>]
[--plan <Free | Serverless | Standard | Enterprise>]
[--output <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    クラスターの表示名を指定します。 

    値は、英字で始まる 255 文字以内の英数字文字列です。

- **--type** (*string*) -

    **[REQUIRED]**

    クラスタータイプを指定します。 

    使用可能な値:

    - `serverless`,

    - `free`,  および

    - `dedicated`.

- **--project-id** (*string*) -

    クラスターを作成するプロジェクトを指定します。

- **--region** (*string*) -

    クラウドリージョンを指定します。

    使用可能な値:

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

    <Admonition type="info" icon="📘" title="注意">

    BYOC プロジェクトで利用可能なリージョンについては、組織のオーナーに確認してください。

    </Admonition>

- **--cu-type** (*string*) -

    コンピュートユニットのタイプを指定します（dedicated のみ）。 

    使用可能な値: 

    - `Performance-optimized`,

    - `Capacity-optimized`,

    - `Tiered-storage`.

- **--cu-size** (*integer*) -

    コンピュートユニットの数を指定します（dedicated のみ）。

    CU は、データの並列処理に使用されるコンピュートリソースの基本単位であり、CU タイプごとに CPU、メモリ、ストレージの組み合わせが異なります。CU の概念は **Dedicated** クラスターにのみ適用されます。

    - **Standard** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 32 以下である必要があります。

    - **Enterprise** プロジェクト内の **Dedicated** クラスターでは、CU サイズとレプリカ数の積は 1,024 以下である必要があります。

- **--plan** (*string*) -

    サブスクリプションプランを指定します（dedicated のみ）。 

    使用可能な値: 

    - `Free`,

    - `Serverless`,

    - `Standard`,

    - `Enterprise`.

- **--output, -o** (*string*) -

    出力形式。 

    使用可能な値: 

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz cluster create --name my-cluster \
--type serverless \
--region aws-us-west-2
```
