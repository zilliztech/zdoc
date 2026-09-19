---
title: "Serverless クラスターのコスト | Cloud"
slug: /serverless-cluster-cost
sidebar_label: "Serverless クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Serverless クラスターは従量課金モデルを採用しており、主に読み取り操作と書き込み操作で消費されるリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ料金を支払うことができます。 | Cloud"
type: origin
token: Uk0Nw1ZdbiOEBtkAOKacLTf8nGe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Serverless クラスターのコスト

Zilliz Cloud の Serverless クラスターは従量課金モデルを採用しており、主に読み取り操作と書き込み操作で消費されるリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングする必要なく、実際に処理されたワークロードに対してのみ料金を支払うことができます。

Serverless クラスターの総コストは、以下のコンポーネントの合計です。

- [読み取り](./serverless-cluster-cost#vector-database-costs-read)操作と[書き込み](./serverless-cluster-cost#vector-database-costs-write)操作の両方に対するベクトルデータベースのコスト

- [ストレージコスト](./serverless-cluster-cost#storage-cost)

上記の 2 つの主要な課金項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [データ転送コスト](./data-transfer-cost)

- [監査ログのコスト](./audit-log-cost)

## ベクトルデータベースのコスト（書き込み）\{#vector-database-costs-write}

書き込みコストは、[insert](./insert-entities)、[upsert](./upsert-entities)、および [delete](./delete-entities) 操作で消費されるコンピュートリソースを測定します。

Import および bulk insert 操作では、**コストは発生しません**。

### コスト計算\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** 100 万 vCU あたり &#36;4。

- **Write vCU Usage:** 書き込み操作の対象となるデータサイズに基づいて計算されます。

### 例\{#example}

以下の表は、特定の量のデータを Serverless クラスターに書き込む際の vCU 使用量とコストの早見表です。

より大きなデータセットの場合は、vCU 使用量とコストを比例して拡大してください。たとえば、768 次元ベクトルを 1,000 万件書き込むと、約 750 万 vCU を使用し、コストは約 &#36;30 になります。

| **データサイズ (&ast;)** | **書き込み vCU 使用量（100 万単位）** | **書き込みコスト** |
| --- | --- | --- |
| 128 次元ベクトル 100 万件 | 0.125 | &#36;0.5 |
| 768 次元ベクトル 100 万件 | 0.75 | &#36;3 |
| 1536 次元ベクトル 100 万件 | 1.5 | &#36;6 |
| 2560 次元ベクトル 100 万件 | 2.5 | &#36;10 |

*&ast;上記の表のデータサイズにはスカラーは含まれません。*

*&ast;スキーマに複数のベクトルフィールドが含まれている場合、書き込みコストは線形に増加します。たとえば、スキーマに 2 つの 128 次元ベクトルフィールドがある場合、100 万エンティティを書き込む際の vCU 使用量は 0.125 × 2 = 0.25 となり、書き込みコストは約 &#36;0.5 × 2 = &#36;1 になります。*

書き込み vCU 使用量とコストを正確に計算するには、以下の指標を参照してください。

| **操作** | **vCU 使用量** |
| --- | --- |
| Insert | 挿入されたデータ 1 KB = 0.25 vCU |
| Delete | 削除されたエンティティ 1 件 = 1 vCU<br/>存在しないエンティティを削除した場合も 1 vCU を消費します。 |
| Upsert | 更新されたデータのサイズと削除されたエンティティ数に基づいて計算されます。<br/>存在しないエンティティを削除した場合も 1 vCU を消費します。 |

Serverless クラスターに 3 GB（3,145,728 KB）のエンティティを挿入し、その後 100,000 件のエンティティを削除したとします。

- `Insert operation vCU usage = 3,145,728 x 0.25 = 78,643 vCUs`

- `Delete operation vCU usage = 100,000 x 1 = 100,000 vCUs`

- `Total vCU usage = 1,000 + 78,643 = 178,643 vCUs`

- `Total vector database cost (write)  = 0.178643 x 4 = $0.72`

## ベクトルデータベースのコスト（読み取り）\{#vector-database-costs-read}

このコスト項目は、[search](./single-vector-search)、[hybrid search](./hybrid-search)、および [query](./get-and-scalar-query) 操作で消費されるリソースを測定します。

### コスト計算\{#cost-calculation}

```bash
Vector Database Cost (Read) = vCU Unit Price x Read vCU Usage 
```

- **vCU Unit Price:** 100 万 vCU あたり &#36;4

- **Read vCU Usage:** 以下の 3 つの要因に依存します。

    - search または query のリクエスト数: search または query を実行する回数が多いほど、vCU 使用量が高くなります。

    - 各 search または query でスキャンされるデータのサイズ: スキャンされるデータが多いほど、vCU 使用量が高くなります。

        *ヒント: 各 search または query の実行中、Zilliz Cloud はクラスター内のコレクション全体をスキャンします。search または query の際に [Partition Key](./use-partition-key) をフィルターとして使用すると、Zilliz Cloud は指定した Partition Key に一致するコレクションの一部のみをスキャンするため、読み取り vCU 使用量全体を抑えることができます。*

    - 各 search または query で返されるデータのサイズ: 返されるデータが多いほど、vCU 使用量が高くなります。たとえば、search でベクトルフィールドを含むすべてのフィールドを返すと、ID フィールドのみを返す search よりもはるかに多くの vCU を消費します。

    <Admonition type="info" title="Notes">

    各読み取り操作には最低 6 vCU のコストがかかります。

    </Admonition>

### 例\{#example}

以下の表は、さまざまなデータ量に対する 100 万回の読み取りリクエストの vCU 使用量とコストの例を示しています。

| **スキャンデータサイズ (&ast;)** | **読み取り vCU 使用量（100 万単位）** | **読み取りコスト** |
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

*&ast;上記の表のデータサイズにはスカラーは含まれません。*

上記の表からわかるように、データサイズが 100 万から 1,000 万、さらには 1 億に増加しても、vCU 使用量は比例して増加しません。

## ストレージコスト\{#storage-cost}

ストレージコストはベクトルデータベースのコストとは別に課金され、以下に依存します。

- クラスターのリージョン、クラスターのタイプ、およびプロジェクトプラン

- ストレージ使用量

詳細については、[ストレージ](./storage-cost) を参照してください。
