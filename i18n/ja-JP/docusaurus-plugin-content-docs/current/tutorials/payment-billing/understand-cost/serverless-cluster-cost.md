---
title: "サーバーレスクラスターのコスト | Cloud"
slug: /serverless-cluster-cost
sidebar_key: serverless-cluster-cost
sidebar_label: "サーバーレスクラスター"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のサーバーレスクラスターは操作単位の課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されたリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングすることなく、実際に処理されたワークロードに対してのみ支払いを行うことができます。| Cloud"
type: origin
token: Uk0Nw1ZdbiOEBtkAOKacLTf8nGe
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - serverless
  - cost
  - billing

---

import Admonition from '@theme/Admonition';


# サーバーレスクラスターのコスト

Zilliz Cloud のサーバーレスクラスターは操作課金モデルを採用しており、主に読み取りおよび書き込み操作で消費されたリソースに対して課金されます。これにより、事前に固定容量をプロビジョニングすることなく、実際に処理されたワークロードに対してのみ支払いを行うことができます。

サーバーレスクラスターの総コストは、以下のコンポーネントの合計です：

- [読み取り](./serverless-cluster-cost#vector-database-costs-read) および [書き込み](./serverless-cluster-cost#vector-database-costs-write) 操作の両方に対するベクターデータベースコスト

- [ストレージ費用](./serverless-cluster-cost#storage-cost)

上記の 2 つの主要な課金項目に加えて、以下のオプションの追加料金が発生する場合があります：

- [データ転送コスト](./data-transfer-cost)

- [監査ログコスト](./audit-log-cost)

## ベクターデータベースコスト（書き込み）\{#vector-database-costs-write}

書き込みコストは、[挿入、更新、削除操作](./insert-update-delete) によって消費されるコンピューティングリソースを測定します。

インポートおよびバルク挿入操作は課金され**ません**。

### コスト計算\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU 単価:** 100 万 vCU あたり &#36;4。

- **書き込み vCU 使用量:** 書き込み操作に関与するデータサイズに基づいて計算されます。

### 例\{#example}

以下の表は、Serverless クラスターに特定の量のデータを書き込む際の vCU 使用量とコストの参考チャートです。

より大きなデータセットの場合、vCU 使用量とコストを比例して拡大してください。例えば、1000 万個の 768 次元ベクトルを書き込む場合、約 750 万 vCU が使用され、コストは約 &#36;30 となります。

<table>
   <tr>
     <th><p><strong>データサイズ (&ast;)</strong></p></th>
     <th><p><strong>書き込み vCU 使用量（100 万）</strong></p></th>
     <th><p><strong>書き込みコスト</strong></p></th>
   </tr>
   <tr>
     <td><p>100 万個の 128 次元ベクトル</p></td>
     <td><p>0.125</p></td>
     <td><p>&#36;0.5</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 768 次元ベクトル</p></td>
     <td><p>0.75</p></td>
     <td><p>&#36;3</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 1536 次元ベクトル</p></td>
     <td><p>1.5</p></td>
     <td><p>&#36;6</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 2560 次元ベクトル</p></td>
     <td><p>2.5</p></td>
     <td><p>&#36;10</p></td>
   </tr>
</table>

*&ast;上記表のデータサイズにはスカラーは含まれません。*

*&ast;スキーマに複数のベクトルフィールドが含まれる場合、書き込みコストは線形に増加します。例えば、スキーマに 2 つの 128 次元ベクトルフィールドがある場合、100 万エンティティを書き込む際の vCU 使用量は 0.125 × 2 = 0.25 となり、書き込みコストは約 &#36;0.5 × 2 = &#36;1 となります。*

書き込み vCU 使用量とコストを正確に計算するには、以下の指標を参照してください。

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>vCU 使用量</strong></p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>挿入されたデータ 1 KB = 0.25 vCU</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>削除されたエンティティ 1 件 = 1 vCU</p><p>存在しないエンティティを削除した場合も 1 vCU が消費されます。</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>更新されたデータのサイズと削除されたエンティティ数に基づいて計算されます。</p><p>存在しないエンティティを削除した場合も 1 vCU が消費されます。</p></td>
   </tr>
</table>

Serverless クラスターに 3 GB（3,145,728 KB）のエンティティを挿入し、その後 100,000 件のエンティティを削除したと仮定します。

- `Insert 操作の vCU 使用量 = 3,145,728 x 0.25 = 78,643 vCUs`

- `Delete 操作の vCU 使用量 = 100,000 x 1 = 100,000 vCUs`

- `合計 vCU 使用量 = 100,000 + 78,643 = 178,643 vCUs`

- `合計ベクトルデータベースコスト（書き込み） = 0.178643 x 4 = $0.72`

## ベクトルデータベースコスト（読み取り）\{#vector-database-costs-read}

このコスト項目は、[検索、ハイブリッド検索、およびクエリ操作](./search-query-get) によって消費されるリソースを測定します。

### コスト計算\{#cost-calculation}

```bash
Vector Database Cost (Read) = vCU Unit Price x Read vCU Usage 
```

- **vCU 単価:** &#36;4 / 100 万 vCU

- **読み取り vCU 使用量:** 以下の 3 つの要因に依存します。

    - 検索またはクエリリクエストの数: 実行する検索またはクエリが多いほど、vCU 使用量は高くなります。

    - 各検索またはクエリでスキャンされるデータサイズ: スキャンされるデータが多いほど、vCU 使用量は高くなります。

        *ヒント: 各検索またはクエリ中に、Zilliz Cloud はクラスター内のコレクション全体をスキャンします。検索またはクエリ中に [パーティションキー](./use-partition-key) をフィルターとして使用すると、Zilliz Cloud は指定されたパーティションキーに一致するコレクションの一部のみをスキャンするため、全体的な読み取り vCU 使用量を削減できます。*

    - 各検索またはクエリで返されるデータサイズ: 返されるデータが多いほど、vCU 使用量は高くなります。たとえば、検索でベクトルフィールドを含むすべてのフィールドを返す場合、ID フィールドのみを返す検索よりもはるかに多くの vCU を消費します。

    <Admonition type="info" icon="📘" title="Notes">

    <p>各読み取り操作には、最低 6 vCU のコストがかかります。</p>

    </Admonition>

### 例\{#example}

以下の表は、異なるデータ量に対する 100 万件の読み取りリクエストにおける vCU 使用量とコストの例を示しています:

<table>
   <tr>
     <th><p><strong>スキャンデータサイズ (&ast;)</strong></p></th>
     <th><p><strong>読み取り vCU 使用量 (100 万)</strong></p></th>
     <th><p><strong>読み取りコスト</strong></p></th>
   </tr>
   <tr>
     <td><p>100 万個の 128 次元ベクトル</p></td>
     <td><p>5</p></td>
     <td><p>&#36;20</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 768 次元ベクトル</p></td>
     <td><p>15</p></td>
     <td><p>&#36;60</p></td>
   </tr>
   <tr>
     <td><p>500 万個の 768 次元ベクトル</p></td>
     <td><p>35</p></td>
     <td><p>&#36;140</p></td>
   </tr>
   <tr>
     <td><p>1000 万個の 768 次元ベクトル</p></td>
     <td><p>55</p></td>
     <td><p>&#36;220</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 1536 次元ベクトル</p></td>
     <td><p>25</p></td>
     <td><p>&#36;100</p></td>
   </tr>
   <tr>
     <td><p>1000 万個の 1536 次元ベクトル</p></td>
     <td><p>75</p></td>
     <td><p>&#36;300</p></td>
   </tr>
   <tr>
     <td><p>1 億個の 1536 次元ベクトル</p></td>
     <td><p>290</p></td>
     <td><p>&#36;1160</p></td>
   </tr>
   <tr>
     <td><p>100 億個の 1536 次元ベクトル</p></td>
     <td><p>1,495</p></td>
     <td><p>&#36;5980</p></td>
   </tr>
   <tr>
     <td><p>100 万個の 2560 次元ベクトル</p></td>
     <td><p>30</p></td>
     <td><p>&#36;120</p></td>
   </tr>
</table>

*&ast;上記表のデータサイズにはスカラーは含まれません。* 

上記の表から、データサイズが 100 万から 1000 万、さらに 1 億に増加しても、vCU 使用量は比例して増加しないことがわかります。

## ストレージ費用\{#storage-cost}

ストレージ費用はベクトルデータベースのコストとは別に課金され、以下に依存します:

- クラスターリージョン、クラスタイプ、およびプロジェクトプラン

- ストレージ使用量

詳細については、[ストレージ](./storage-cost) をご覧ください。

