---
title: "Zilliz Cloud の制限 | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud の制限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームの制限に関する情報を提供します。これらの制限に関する問題を報告する必要がある場合は、リクエストを送信してください。 | Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の制限

このページでは、Zilliz Cloud プラットフォームの制限に関する情報を提供します。これらの制限に関する問題を報告する必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

## 組織とプロジェクト\{#organizations-and-projects}

以下の表は、1 人のユーザーに許可される組織とプロジェクトの最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織 | 1 | Zilliz Cloud は、アカウント登録が正常に完了すると自動的に 1 つの組織を作成します。さらに組織が必要な場合は、[サポートチケットを作成](http://support.zilliz.com)してください。1 人のユーザーは複数の組織に参加できます。 |
| プロジェクト | 100 | 各ユーザーは 1 つの組織内に最大 100 個のプロジェクトを作成できます。 |

## ユーザーとロール\{#users-and-roles}

以下の表は、Zilliz Cloud で許可されるユーザーとロールの最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織ユーザー | 100 | 1 つの組織には、合計で最大 100 人の組織ユーザーを含めることができます。 |
| クラスターユーザー | 500 | 1 つのクラスターには、合計で最大 500 人のユーザーを含めることができます。 |
| クラスターカスタムロール | 500 | 1 つのクラスターには、合計で最大 500 個のカスタムロールを含めることができます。この制限の解除については、[お問い合わせください](http://support.zilliz.com)。 |

## API キー\{#api-keys}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| API Key | 100 | 最適なリソース利用とセキュリティのため、各組織には最大 100 個のカスタマイズされた API キーを含めることができます。 |

## コンソール IP 許可リスト\{#console-ip-allowlist}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織コンソール IP 許可リスト内の IP | 100 | 各組織コンソール IP 許可リストには、最大 100 個の IP または CIDR ブロックを含めることができます。 |

## ボリューム\{#volumes}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| マネージドボリューム | 100 | 各組織には最大 100 個のマネージドボリュームを含めることができます。 |
| 外部ボリューム | 100 | 各組織には最大 100 個の外部ボリュームを含めることができます。 |

## クラスター\{#clusters}

### クラスター数\{#number-of-clusters}

クラスターの最大数は、支払い方法とデプロイオプションによって異なります。

- **有効な支払い方法がない場合**

    | **クラスターデプロイオプション** | **最大数** | **備考** |
    | --- | --- | --- |
    | Free | 1 | 各組織では 1 つの Free クラスターのみ許可されます。必要に応じて、既存の Free クラスターを削除し、新しいものに置き換えることができます。 |
    | Serverless/Dedicated | 1 | 無料トライアル期間中に作成できる Serverless/Dedicated クラスターは 1 つのみです。追加のクラスターが必要な場合は、支払い方法を追加してください。 |

- **有効な支払い方法がある場合**

    | **クラスターデプロイオプション** | **最大数** | **備考** |
    | --- | --- | --- |
    | Serving - Free | 1 | 各組織では 1 つの Free クラスターのみ許可されます。必要に応じて、既存の Free クラスターを削除し、新しいものに置き換えることができます。 |
    | Serving - Serverless | 100 | 各プロジェクトでは最大 100 個の Serverless クラスターを作成できます。 |
    | Serving - Dedicated | 100 | 各プロジェクトでは最大 100 個の Dedicated クラスターを作成できます。 |
    | On-demand | 20 | 各プロジェクトでは最大 20 個のオンデマンドクラスターを作成できます。 |

### CU\{#cus}

CU は、データの並列処理に使用される計算リソースの基本単位であり、CU の種類ごとに CPU、メモリ、ストレージの組み合わせが異なります。CU の概念は Dedicated クラスターにのみ適用されます。

| **プロジェクトプランとクラスターデプロイオプション** | **制限** | **備考** |
| --- | --- | --- |
| Standard プロジェクトの Dedicated serving クラスター | CU size &lt;=32 | コンソールでは、単一のクラスターに対して最大 32 CU を作成できます。 |
| Enterprise プロジェクトの Dedicated serving クラスター | CU size x Replica Count &lt;=10,240 | コンソールでは、単一のクラスターに対して最大 1,024 CU を作成できます。<br/>ただし、レプリカを追加する場合の制限は CU size x Replica Count &lt;=10,240 です。 |
| Enterprise プロジェクトのオンデマンドクラスター | 8&lt;= CU size &lt;= 256 | コンソールでは、単一のオンデマンドクラスターは 8 ～ 256 CU をサポートします。<br/>8 CU ごとに、最大 3 TB のデータに対する検索が可能になります。 |

以下の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us) 

- Standard プロジェクトの Dedicated クラスターで 32 CU を超える CU が必要な場合

- Enterprise プロジェクトの Dedicated クラスターで 1,024 CU を超える CU が必要な場合

### vCU\{#vcus}

virtual compute unit (vCU) は、読み取り操作（search や query など）および書き込み操作（insert、upsert、delete など）で消費されるリソースを測定するために使用されます。vCU の概念は Free と Serverless クラスターにのみ適用されます。

| **クラスタープラン** | **制限** |
| --- | --- |
| Free | 月あたり 250 万 vCU |
| Serverless | N/A |

### 容量\{#capacity}

以下の表は、各クラスタープランタイプの容量に関する制限を示しています。

| **クラスタープラン** | **制限** |
| --- | --- |
| Free | クラスターあたり 5 GB（クラスターあたり 768 次元ベクトル 100 万件相当） |
| Serverless | Zilliz Cloud の Serverless クラスターには容量制限はありません。 |
| Dedicated (per CU) | Zilliz Cloud の Dedicated クラスターには容量制限はありません。 |

<Admonition type="info" icon="📘" title="Notes">

Dedicated クラスターの容量上限は、使用する CU のタイプとサイズによって異なります。クラスター容量が不足している場合は、CU のタイプとサイズの調整を検討してください。詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

</Admonition>

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに **12 CU 以上** が必要です。さらに、以下の制限が適用されます。

| **項目** | **制限** | **備考** |
| --- | --- | --- |
| Replica | 10 | 最大 10 個のレプリカを作成できます。 |
| Query CU x Replica Count | 10,240 | クラスターのレプリカ数 x query CU は 10,240 を超えてはなりません。 |

## データベース\{#databases}

- 各 Serving-Dedicated クラスターは最大 1024 個のデータベースを持つことができます。

- 各プロジェクト、各リージョンごとに、最大 64 個のオンデマンドコンピュートデータベースを作成できます。

- デフォルトデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloud クラスター内のコレクションとパーティションの最大数は、割り当てられた CU の数と、互換性のある Milvus バージョンによって異なります。以下の説明を参照して、クラスター内のコレクションとパーティションの最大数を計算できます。

1 CU あたり最大 **1,024** 個のコレクション、または **4,096** 個のパーティションを作成でき、1 コレクションあたり最大 **1,024** 個のパーティションが許可されます。以下の式を使用して、クラスター内のコレクションとパーティションの数の上限を計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内の CU 数の 1,024 倍、または 16,384 のいずれか小さい方未満である必要があります。

- クラスター内のすべてのコレクションにまたがるパーティションの総数は、クラスターに割り当てられた CU 数の 4,096 倍、または 65,536 のいずれか小さい方未満である必要があります。

- 両方の条件を満たす必要があります。

<Admonition type="info" icon="📘" title="Notes">

**Free** および **Serverless** クラスターについては、代わりに次の制限が適用されます。

- **Free** クラスターでは最大 **5** 個のコレクションが許可されます。

- **Serverless** クラスターでは最大 **100** 個のコレクションがサポートされます。

</Admonition>

### フィールド\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションあたりのフィールド数</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>コレクションあたりのベクトルフィールド数</p></td>
     <td><ul><li><p>Free & Serverless: 4</p></li><li><p>Dedicated: 10</p></li></ul></td>
   </tr>
</table>

フィールドに関するその他の制限:

- VarChar や JSON など一部のフィールドは、想定より多くのメモリを使用し、クラスターが満杯になる原因となる場合があります。

### 次元\{#dimensions}

ベクトルフィールドの最大次元数は **32,768** です。

### シャード\{#shards}

許可されるシャードの最大数は、クラスタープランとクラスターの CU サイズによって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>クラスタープランと CU サイズ</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Free</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Serverless</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>Dedicated</p></td>
     <td><p>1 - 2 CU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4 - 8 CU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12 - 64 CU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><p>> 64 CU</p></td>
     <td><p>16</p></td>
   </tr>
</table>

### レート制限\{#rate-limit}

Zilliz Cloud は、コレクションおよびパーティションのデータ定義言語 (DDL) 操作（コレクションの作成、load、release、drop を含む）にもレート制限を適用します。以下のレート制限は、Serverless と Dedicated クラスターの両方のコレクションに適用されます。

|  | **レート制限** |
| --- | --- |
| Collection DDL Operation<br/>(create, load, release, drop) | クラスターあたり 20 req/s |
| Partition DDL Operation<br/>(create, load, release, drop) | クラスターあたり 20 req/s |

## 操作\{#operations}

このセクションでは、Zilliz Cloud クラスターにおける一般的なデータ操作のレート制限に焦点を当てます。

### Insert and Upsert\{#insert-and-upsert}

insert および upsert 操作のレート制限は、クラスターのデプロイオプションと使用中の CU 数によって異なります。 

|  | insert および upsert の最大レート制限 |
| --- | --- |
| Free クラスター | 2 MB/s |
| Serverless クラスター | 10 MB/s |
| Dedicated クラスター | 16 MB/s + 1 MB/s × CU<br/>最大 256 MB/s。 |

例:

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限が適用されます。

- 単一シャードの書き込みレートは **32 MB/s** を超えてはなりません。

- データを insert する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションで AutoID が有効な場合は primary key を除外してください。

- データを upsert する際は、スキーマで定義されたすべてのフィールドを含めてください。

- insert または upsert されたエンティティを search や query で即座に取得可能にするには、search または query リクエストの consistency level を **Strong** に変更することを検討してください。詳細は [Consistency Level](./consistency-level) を参照してください。

### Index\{#index}

インデックスタイプはフィールドタイプによって異なります。以下の表は、インデックスを作成できるフィールドタイプと対応するインデックスタイプを示しています。

| **フィールドタイプ** | **インデックスタイプ** | **メトリックタイプ** |
| --- | --- | --- |
| Vector Field | AUTOINDEX | L2、IP、COSINE |
| VarChar Field | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

flush リクエストのレート制限はコレクションレベルで 1 秒あたり 0.1 リクエストで、特定のクラスタータイプに適用されます。このレート制限は以下に適用されます。

- Milvus v2.4.x 以降と互換性のある Serverless クラスター。

- ベータバージョンにアップグレードされ、Milvus v2.4.x 以降と互換性のある Dedicated クラスター。

<Admonition type="info" icon="📘" title="Notes">

flush 操作を手動で実行することは推奨されません。Zilliz Cloud クラスターが適切に処理します。

</Admonition>

### Load\{#load}

load リクエストのレート制限はクラスターあたり **20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

すでにロード済みのコレクションについては、新しいデータがこれらのコレクションに入ってきても、コレクションの load を実行する必要はありません。

</Admonition>

### Search\{#search}

各 search request/response は **64** MB 以下でなければなりません。

各 search request に含まれるクエリベクトルの数（通常 **nq** と呼ばれます）は、サブスクリプションプランによって異なります。

- Free および Serverless クラスターでは、**nq** は **10** 以下です。

- Dedicated クラスターでは、**nq** は **16,384** 以下です。

各 search response に含まれる数（通常 **topK** と呼ばれます）は、サブスクリプションプランによって異なります。

- Free および Serverless クラスターでは、返される **topK** は **1,024** エンティティ以下です。

- Dedicated クラスターでは、返される **topK** は **16,384** エンティティ以下です。

### Query\{#query}

各 query request/response は **64** MB 以下でなければなりません。

各 query response で返されるエンティティ数は 16,384 件以下です（通常 **topK** と呼ばれます）。

### Delete\{#delete}

各 delete request/response は **64** MB 以下でなければなりません。

delete リクエストのレート制限はクラスターあたり **0.5** MB/s です。

### Drop\{#drop}

drop リクエストのレート制限はクラスターあたり **20** req/s です。

### データインポート\{#data-import}

1 つのコレクションでは、実行中または保留中のインポートジョブを最大 **10,000** 件保持できます。

Zilliz Cloud は、Web コンソール上でインポートするファイルにも制限を適用します。

| File Type | ローカルアップロード | Object Storage から |
| --- | --- | --- |
| JSON | 1 GB | **Free**: 各 import request では最大 1 GB のデータをインポートでき、1 ファイルあたり最大 1 GB、1 回のインポートで 1,000 ファイル以下です。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルです。 |
| Parquet | 1 GB | **Free**: 各 import request では最大 1 GB のデータをインポートでき、1 ファイルあたり最大 1 GB、1 回のインポートで 1,000 ファイル以下です。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルです。 |
| Numpy | Not support | **Free**: 各 import request では最大 1 GB のデータをインポートでき、1 サブディレクトリあたり最大 1 GB、1 回のインポートで 1,000 サブディレクトリ以下です。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、最大 1,000 サブディレクトリです。 |

詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永続的に保持されます。

自動的に作成されたバックアップの最大保持期間は 30 日です。 

## コンソールでの復元\{#restore-on-console}

バックアップファイルは、バックアップファイルの元のクラスターと同じリージョンで復元できます。復元先クラスターは、元のクラスターと同じ CU タイプを使用する必要があります。

## IP アクセスリスト\{#ip-access-list}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Console IP Access | 100 | コンソール IP 許可リストには最大 100 個の IP アドレスを追加できます。 |
| Cluster IP Access | 100 | クラスター IP 許可リストには最大 100 個の IP アドレスを追加できます。 |

## 移行\{#migration}

他ベンダーから Zilliz Cloud クラスターにデータを移行できます。1 回の移行あたりのコレクションの最大数は、Zilliz Cloud クラスターのサブスクリプションプランによって異なります。

| 対象クラスターのサブスクリプションプラン | 1 回の移行あたりのコレクション最大数 |
| --- | --- |
| Free | 5 |
| Serverless / Dedicated | 10 |

## プライベートエンドポイント\{#private-endpoints}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Private Endpoint | 10 | 各プロジェクトでは最大 10 個のプライベートエンドポイントを作成できます。 |



import DocCardList from '@theme/DocCardList';

<DocCardList />
