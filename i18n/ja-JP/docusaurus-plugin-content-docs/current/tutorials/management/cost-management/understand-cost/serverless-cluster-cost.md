---
title: "Serverless Cluster のコスト | Cloud"
slug: /serverless-cluster-cost
sidebar_label: "Serverless Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Serverless cluster は従量課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されたリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ料金を支払います。 | Cloud"
type: origin
token: Uk0Nw1ZdbiOEBtkAOKacLTf8nGe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Serverless Cluster のコスト

Zilliz Cloud の Serverless cluster は従量課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されたリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ料金を支払います。

Serverless cluster の総コストは、以下のコンポーネントの合計です。

- [read](./serverless-cluster-cost#vector-database-costs-read) 操作と [write](./serverless-cluster-cost#vector-database-costs-write) 操作の両方に対する Vector database cost

- [Storage cost](./serverless-cluster-cost#storage-cost)

上記 2 つの主要な課金項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [Data transfer cost](./data-transfer-cost)

- [Audit log cost](./audit-log-cost)

## Vector database costs (write)\{#vector-database-costs-write}

write cost は、[insert](./insert-entities)、[upsert](./upsert-entities)、および [delete](./delete-entities) 操作によって消費されるコンピュートリソースを測定します。

Import および bulk insert 操作ではコストは**発生しません**。

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** 100 万 vCU あたり &#36;4。

- **Write vCU Usage:** write 操作に含まれるデータサイズに基づいて計算されます。

### Example\{#example}

以下の表は、特定量のデータを Serverless cluster に書き込む際の vCU 使用量とコストの早見表です。 

より大きなデータセットの場合は、vCU 使用量とコストを比例して単純にスケールしてください。たとえば、768 次元ベクトルを 1,000 万件書き込むと、約 750 万 vCU を使用し、コストは約 &#36;30 になります。

| **データサイズ (&ast;)** | **Write vCU 使用量（百万）** | **Write Cost** |
| --- | --- | --- |
| 128 次元ベクトル 100 万件 | 0.125 | &#36;0.5 |
| 768 次元ベクトル 100 万件 | 0.75 | &#36;3 |
| 1536 次元ベクトル 100 万件 | 1.5 | &#36;6 |
| 2560 次元ベクトル 100 万件 | 2.5 | &#36;10 |

*&ast;上記の表のデータサイズには scalar は含まれません。*

*&ast;schema に複数の vector field が含まれている場合、write cost は線形に増加します。たとえば、schema に 128 次元の vector field が 2 つある場合、100 万 entities の書き込みにおける vCU 使用量は 0.125 × 2 = 0.25、write cost はおおよそ &#36;0.5 × 2 = &#36;1 です。*

write vCU 使用量とコストを正確に計算するには、以下の指標を参照してください。

| **Operation** | **vCU Usage** |
| --- | --- |
| Insert | 挿入データ 1 KB = 0.25 vCU |
| Delete | 削除された 1 entity = 1 vCU<br/>存在しない entity を削除した場合も 1 vCU 消費します。 |
| Upsert | 更新されたデータのサイズと削除された entities 数に基づいて計算されます。<br/>存在しない entity を削除した場合も 1 vCU 消費します。 |

Serverless cluster に 3 GB（3,145,728 KB）の entities を挿入し、その後 100,000 entities を削除したとします。

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

- **Read vCU Usage:** 以下の 3 つの要因に依存します。

    - search または query リクエスト数: 実行する search または query が多いほど、vCU 使用量は高くなります。

    - 各 search または query でスキャンされるデータサイズ: スキャンされるデータが多いほど、vCU 使用量は高くなります。

        *ヒント: 各 search または query の実行中、Zilliz Cloud は cluster 内の collection 全体をスキャンします。[partition key](./use-partition-key) を search または query 時のフィルターとして使用すると、Zilliz Cloud は指定された partition key に一致する collection の一部のみをスキャンするため、全体の read vCU 使用量を下げることができます。*

    - 各 search または query で返されるデータサイズ: 返されるデータが多いほど、vCU 使用量は高くなります。たとえば、search で vector field を含むすべての field を返す場合、ID field のみを返す search よりもはるかに多くの vCU を消費します。

    <Admonition type="info" icon="📘" title="注">

    各 read 操作には最低 6 vCU のコストがかかります。

    </Admonition>

### Example\{#example}

以下の表は、さまざまなデータ量に対する 100 万回の read リクエストにおける vCU 使用量とコストの例を示しています。

| **スキャンデータサイズ (&ast;)** | **Read vCU Usage (million)** | **Read Cost** |
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

上記の表から、データサイズが 100 万から 1,000 万、さらに 1 億へと増加しても、vCU 使用量は比例して増加しないことが分かります。 

## Storage cost\{#storage-cost}

Storage cost は vector database cost とは別に課金され、以下に依存します。

- Cluster region、cluster type、および project plan

- Storage usage

詳細については、[Storage](./storage-cost) を参照してください。

