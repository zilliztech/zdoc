---
title: "Serverless クラスターコスト | Cloud"
slug: /serverless-cluster-cost
sidebar_label: "Serverless クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Serverless クラスターは従量課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されるリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ支払います。 | Cloud"
type: origin
token: Uk0Nw1ZdbiOEBtkAOKacLTf8nGe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Serverless クラスターコスト

Zilliz Cloud の Serverless クラスターは従量課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されるリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ支払います。

Serverless クラスターの合計コストは、以下のコンポーネントの合計です。

- [読み取り](./serverless-cluster-cost#vector-database-costs-read)および[書き込み](./serverless-cluster-cost#vector-database-costs-write)操作の両方に対するベクトルデータベースコスト

- [ストレージコスト](./serverless-cluster-cost#storage-cost)

上記の 2 つの主要な課金項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [データ転送コスト](./data-transfer-cost)

- [監査ログコスト](./audit-log-cost)

## Vector database costs (write)\{#vector-database-costs-write}

書き込みコストは、[insert](./insert-entities)、[upsert](./upsert-entities)、および [delete](./delete-entities) 操作で消費されるコンピュートリソースを測定します。

Import および bulk insert 操作では**コストは発生しません**。

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** 100 万 vCU あたり &#36;4。

- **Write vCU Usage:** 書き込み操作に含まれるデータサイズに基づいて計算されます。

### Example\{#example}

以下の表は、特定量のデータを Serverless クラスターに書き込む場合の vCU 使用量とコストのクイックリファレンスです。 

より大きなデータセットの場合は、vCU 使用量とコストを比例してスケールするだけです。たとえば、768 次元ベクトルを 1,000 万件書き込むと、約 750 万 vCU を使用し、コストは約 &#36;30 になります。

| **Data Size (&ast;)** | **Write vCU usage (million)** | **Write Cost** |
| --- | --- | --- |
| 128 次元ベクトル 100 万件 | 0.125 | &#36;0.5 |
| 768 次元ベクトル 100 万件 | 0.75 | &#36;3 |
| 1536 次元ベクトル 100 万件 | 1.5 | &#36;6 |
| 2560 次元ベクトル 100 万件 | 2.5 | &#36;10 |

*&ast;上記の表のデータサイズには scalar は含まれません。*

*&ast;スキーマに複数の vector フィールドが含まれる場合、書き込みコストは線形に増加します。たとえば、スキーマに 2 つの 128 次元 vector フィールドがある場合、100 万 entity の書き込みに対する vCU 使用量は 0.125 × 2 = 0.25、書き込みコストは約 &#36;0.5 × 2 = &#36;1 です。*

書き込み vCU 使用量とコストを正確に計算するには、以下の指標を参照してください。

| **Operation** | **vCU Usage** |
| --- | --- |
| Insert | 挿入データ 1 KB = 0.25 vCU |
| Delete | 削除された entity 1 件 = 1 vCU<br/>存在しない entity を削除した場合も 1 vCU 消費します。 |
| Upsert | 更新されたデータのサイズと削除された entity 数に基づいて計算されます。<br/>存在しない entity を削除した場合も 1 vCU 消費します。 |

3 GB（3,145,728 KB）の entity を Serverless クラスターに挿入し、その後 100,000 件の entity を削除したとします。

- `Insert operation vCU usage = 3,145,728 x 0.25 = 78,643 vCUs`

- `Delete operation vCU usage = 100,000 x 1 = 100,000 vCUs`

- `Total vCU usage = 1,000 + 78,643 = 178,643 vCUs`

- `Total vector database cost (write)  = 0.178643 x 4 = $0.72`

## Vector database costs (read)\{#vector-database-costs-read}

このコスト項目は、[search](./single-vector-search)、[hybrid search](./hybrid-search)、および [query](./get-and-scalar-query) 操作で消費されるリソースを測定します。 

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Read) = vCU Unit Price x Read vCU Usage 
```

- **vCU Unit Price:** 100 万 vCU あたり &#36;4

- **Read vCU Usage:** 以下の 3 つの要因によって決まります。

    - 検索またはクエリリクエストの数: 検索またはクエリを多く実行するほど、vCU 使用量は増えます。

    - 各検索またはクエリでスキャンされるデータサイズ: スキャンされるデータが多いほど、vCU 使用量は増えます。

        *ヒント: 各検索またはクエリの間、Zilliz Cloud はクラスター内の collection 全体をスキャンします。検索またはクエリ中に [partition key](./use-partition-key) をフィルターとして使用すると、Zilliz Cloud は指定された partition key に一致する collection の一部のみをスキャンするため、全体の読み取り vCU 使用量を抑えられます。*

    - 各検索またはクエリで返されるデータサイズ: 返されるデータが多いほど、vCU 使用量は増えます。たとえば、検索で vector フィールドを含むすべてのフィールドを返す場合、ID フィールドのみを返す検索よりもはるかに多くの vCU を消費します。

    <Admonition type="info" icon="📘" title="Notes">

    各読み取り操作には最低 6 vCU のコストがかかります。

    </Admonition>

### Example\{#example}

以下の表は、さまざまなデータ量に対する 100 万回の読み取りリクエストにおける vCU 使用量とコストの例を示しています。

| **Scan Data Size (&ast;)** | **Read vCU Usage (million)** | **Read Cost** |
| --- | --- | --- |
| 128 次元ベクトル 100 万件 | 5 | &#36;20 |
| 768 次元ベクトル 100 万件 | 15 | &#36;60 |
| 768 次元ベクトル 500 万件 | 35 | &#36;140 |
| 768 次元ベクトル 1,000 万件 | 55 | &#36;220 |
| 1536 次元ベクトル 100 万件 | 25 | &#36;100 |
| 1536 次元ベクトル 1,000 万件 | 75 | &#36;300 |
| 1536 次元ベクトル 1 億件 | 290 | &#36;1160 |
| 1536 次元ベクトル 100 億件 | 1,495 | &#36;5980 |
| 2560 次元ベクトル 100 万件 | 30 | &#36;120 |

*&ast;上記の表のデータサイズには scalar は含まれません。* 

上記の表から、データサイズが 100 万から 1,000 万、さらに 1 億へと増加しても、vCU 使用量は比例して増加しないことがわかります。 

## Storage cost\{#storage-cost}

ストレージコストはベクトルデータベースコストとは別に課金され、以下に依存します。

- クラスターリージョン、クラスタータイプ、プロジェクトプラン

- ストレージ使用量

詳細については、[Storage](./storage-cost) を参照してください。

