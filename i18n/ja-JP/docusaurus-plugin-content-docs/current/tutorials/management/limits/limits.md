---
title: "Zilliz Cloud の制限事項 | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud の制限事項"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームの制限事項に関する情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、リクエストを送信してください。 | Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の制限事項

このページでは、Zilliz Cloud プラットフォームの制限事項に関する情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

## 組織とプロジェクト\{#organizations-and-projects}

次の表は、単一ユーザーに許可される組織とプロジェクトの最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織 | 1 | Zilliz Cloud は、アカウント登録が正常に完了すると自動的に 1 つの組織を作成します。さらに組織が必要な場合は、[サポートチケットを作成](http://support.zilliz.com)してください。ユーザーは複数の組織に参加できます。 |
| プロジェクト | 100 | 各ユーザーは、1 つの組織内に最大 100 個のプロジェクトを作成できます。 |

## ユーザーとロール\{#users-and-roles}

次の表は、Zilliz Cloud で許可されるユーザーとロールの最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織ユーザー | 100 | 1 つの組織には、合計で最大 100 人の組織ユーザーを含めることができます。 |
| クラスターユーザー | 500 | 1 つのクラスターには、合計で最大 500 人のユーザーを含めることができます。 |
| クラスターのカスタムロール | 500 | 1 つのクラスターには、合計で最大 500 個のカスタムロールを含めることができます。この制限の解除については、[お問い合わせ](http://support.zilliz.com)ください。 |

## API キー\{#api-keys}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| API キー | 100 | 各組織には、最適なリソース利用とセキュリティのために、最大 100 個のカスタマイズされた API キーを含めることができます。 |

## コンソール IP 許可リスト\{#console-ip-allowlist}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| 組織コンソール IP 許可リスト内の IP | 100 | 各組織コンソール IP 許可リストには、最大 100 個の IP または CIDR ブロックを含めることができます。 |

## ボリューム\{#volumes}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| マネージドボリューム | 100 | 各組織には、最大 100 個のマネージドボリュームを含めることができます。 |
| 外部ボリューム | 100 | 各組織には、最大 100 個の外部ボリュームを含めることができます。 |

## クラスター\{#clusters}

### クラスター数\{#number-of-clusters}

クラスターの最大数は、支払い方法とデプロイオプションによって異なります。

- **有効な支払い方法がない場合**

    | **クラスターデプロイオプション** | **最大数** | **備考** |
    | --- | --- | --- |
    | Free | 1 | 各組織では 1 つの Free クラスターのみ許可されます。必要に応じて、既存の Free クラスターを削除して新しいものに置き換えることができます。 |
    | Serverless/Dedicated | 1 | 無料トライアル期間中に作成できる Serverless/Dedicated クラスターは 1 つだけです。追加のクラスターが必要な場合は、支払い方法を追加してください。 |

- **有効な支払い方法がある場合**

    | **クラスターデプロイオプション** | **最大数** | **備考** |
    | --- | --- | --- |
    | Serving - Free | 1 | 各組織では 1 つの Free クラスターのみ許可されます。必要に応じて、既存の Free クラスターを削除して新しいものに置き換えることができます。 |
    | Serving - Serverless | 100 | 各プロジェクトで最大 100 個の Serverless クラスターを作成できます。 |
    | Serving - Dedicated | 100 | 各プロジェクトで最大 100 個の Dedicated クラスターを作成できます。 |
    | On-demand | 20 | 各プロジェクトで最大 20 個の on-demand クラスターを作成できます。 |

### CUs\{#cus}

CU は、データの並列処理に使用されるコンピュートリソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージのさまざまな組み合わせで構成されます。CU の概念は Dedicated クラスターにのみ適用されます。

| **プロジェクトプランとクラスターデプロイオプション** | **制限** | **備考** |
| --- | --- | --- |
| Standard プロジェクトの Dedicated serving クラスター | CU size &lt;=32 | コンソールでは、単一のクラスターに対して最大 32 CUs を作成できます。 |
| Enterprise プロジェクトの Dedicated serving クラスター | CU size x Replica Count &lt;=204,800 | コンソールでは、単一のクラスターに対して最大 2,048 CUs を作成できます。<br/>ただし、レプリカを追加する場合の制限は CU size x Replica Count &lt;=204,800 です。 |
| Enterprise プロジェクトの On-demand クラスター | 8&lt;= CU size &lt;= 256 | コンソールでは、単一の on-demand クラスターは 8 ～ 256 CUs をサポートします。<br/>8 CU ごとに、最大 3 TB のデータに対する検索が可能になります。 |

次の場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。 

- Standard プロジェクトの Dedicated クラスターで 32 CUs を超える場合

- Enterprise プロジェクトの Dedicated クラスターで 1,024 CUs を超える場合

### vCUs\{#vcus}

仮想コンピュートユニット（vCU）は、読み取り操作（search や query など）および書き込み操作（insert、upsert、delete など）によって消費されるリソースを測定するために使用されます。vCU の概念は Free および Serverless クラスターにのみ適用されます。

| **クラスタープラン** | **制限** |
| --- | --- |
| Free | 月あたり 250 万 vCUs |
| Serverless | N/A |

### 容量\{#capacity}

次の表は、各クラスタープランタイプの容量制限を示しています。

| **クラスタープラン** | **制限** |
| --- | --- |
| Free | クラスターあたり 5 GB（クラスターあたり 100 万個の 768 次元ベクトルに相当） |
| Serverless | Zilliz Cloud の Serverless クラスターには容量制限がありません。 |
| Dedicated (per CU) | Zilliz Cloud の Dedicated クラスターには容量制限がありません。 |

<Admonition type="info" icon="📘" title="注意">

Dedicated クラスターの容量上限は、使用する CU タイプとサイズによって異なります。クラスターの容量が不足している場合は、CU タイプとサイズの調整を検討してください。詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

</Admonition>

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに **少なくとも 8 CUs** が必要です。さらに、次の制限も適用されます。

| **項目** | **制限** | **備考** |
| --- | --- | --- |
| レプリカ | 100 | 最大 100 個のレプリカを作成できます。 |
| Query CU x Replica Count | 204,800 | クラスターのレプリカ数 x query CU は 204,800 を超えてはなりません。 |

<Admonition type="info" icon="📘" title="注意">

以前の Milvus リリースと互換性のある一部のクラスターでは、レプリカを追加するために少なくとも 12 CUs が必要になる場合があります。 

より少ない query CUs のクラスターにレプリカを追加するには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

</Admonition>

## データベース\{#databases}

- 各 Serving-Dedicated クラスターには最大 1024 個のデータベースを作成できます。

- 各プロジェクト・各リージョンごとに、最大 64 個の on-demand compute データベースを作成できます。

- デフォルトデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloud クラスターにおけるコレクションとパーティションの最大数は、割り当てられた CUs の数と、互換性のある Milvus バージョンによって異なります。以下の説明を参照して、クラスター内のコレクションとパーティションの最大数を計算できます。

1 CU あたり最大 **1,024** 個のコレクション、または **4,096** 個のパーティションを作成でき、1 コレクションあたり最大 **1,024** 個のパーティションが許可されます。次の式を使用して、クラスター内のコレクション数およびパーティション数の上限を計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内の CUs 数の 1,024 倍、または 16,384 のいずれか小さい方未満である必要があります。

- クラスター内のすべてのコレクションにまたがるパーティションの総数は、クラスターに割り当てられた CUs 数の 4,096 倍、または 65,536 のいずれか小さい方未満である必要があります。

- 両方の条件を満たす必要があります。

<Admonition type="info" icon="📘" title="注意">

**Free** および **Serverless** クラスターには、代わりに次の制限が適用されます。

- **Free** クラスターでは、最大 **5** 個のコレクションが許可されます。

- **Serverless** クラスターでは、最大 **100** 個のコレクションがサポートされます。

</Admonition>

### フィールド\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションごとのフィールド</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>コレクションごとのベクトルフィールド</p></td>
     <td><ul><li><p>Free & Serverless: 4</p></li><li><p>Dedicated: 10</p></li></ul></td>
   </tr>
</table>

フィールドに関するその他の制限:

- VarChar や JSON などの一部のフィールドは、想定以上のメモリを使用し、クラスターが満杯になる原因となることがあります。

### 次元数\{#dimensions}

ベクトルフィールドの最大次元数は **32,768** です。

### シャード\{#shards}

許可されるシャードの最大数は、クラスタープランとクラスターの CU size によって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>クラスタープランと CU Size</strong></p></th>
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

Zilliz Cloud は、コレクションおよびパーティションのデータ定義言語（DDL）操作にもレート制限を設けています。これには、コレクションの作成、load、release、drop が含まれます。次のレート制限は、Serverless および Dedicated クラスターの両方のコレクションに適用されます。

|  | **レート制限** |
| --- | --- |
| コレクション DDL 操作<br/>(create, load, release, drop) | クラスターあたり 20 req/s |
| パーティション DDL 操作<br/>(create, load, release, drop) | クラスターあたり 20 req/s |

## 操作\{#operations}

このセクションでは、Zilliz Cloud クラスターにおける一般的なデータ操作のレート制限に焦点を当てます。

### Insert と Upsert\{#insert-and-upsert}

insert および upsert 操作のレート制限は、クラスターのデプロイオプションと使用中の CUs 数によって異なります。 

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

さらに、次の追加制限が適用されます。

- 単一シャードの書き込みレートは **32 MB/s** を超えてはなりません。

- データを insert する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションで AutoID が有効な場合は、primary key を除外してください。

- データを upsert する際は、スキーマで定義されたすべてのフィールドを含めてください。

- insert または upsert されたエンティティを search や query ですぐに取得可能にするには、search または query リクエストの consistency level を **Strong** に変更することを検討してください。詳細は [Consistency Level](./consistency-level) をお読みください。

### インデックス\{#index}

インデックスタイプはフィールドタイプによって異なります。次の表は、インデックス化可能なフィールドタイプと、それに対応するインデックスタイプを示しています。

| **フィールドタイプ** | **インデックスタイプ** | **メトリックタイプ** |
| --- | --- | --- |
| ベクトルフィールド | AUTOINDEX | L2、IP、COSINE |
| VarChar フィールド | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

flush リクエストのレート制限は 1 秒あたり 0.1 リクエストで、特定のクラスタータイプに対してコレクションレベルで適用されます。このレート制限は次に適用されます。

- Milvus v2.4.x 以降と互換性のある Serverless クラスター。

- Milvus v2.4.x 以降と互換性のある、beta バージョンにアップグレードされた Dedicated クラスター。

<Admonition type="info" icon="📘" title="注意">

flush 操作を手動で実行することは推奨されません。Zilliz Cloud クラスターがこれを適切に処理します。

</Admonition>

### Load\{#load}

load リクエストのレート制限は、クラスターあたり **20** req/s です。

<Admonition type="info" icon="📘" title="注意">

すでに load 済みのコレクションについては、新しいデータがそれらのコレクションに入ってきている場合でも、コレクションの load を実行する必要はありません。

</Admonition>

### Search\{#search}

各 search リクエスト/レスポンスは **64** MB を超えてはなりません。

各 search リクエストが保持する query vector の数（通常 **nq** と呼ばれます）は、サブスクリプションプランによって異なります。

- Free および Serverless クラスターでは、**nq** は **10** 以下です。

- Dedicated クラスターでは、**nq** は **16,384** 以下です。

各 search レスポンスが保持する数（通常 **topK** と呼ばれます）も、サブスクリプションプランによって異なります。

- Free および Serverless クラスターでは、返される **topK** は **1,024** エンティティ以下です。

- Dedicated クラスターでは、返される **topK** は **16,384** エンティティ以下です。

### Query\{#query}

各 query リクエスト/レスポンスは **64** MB を超えてはなりません。

各 query レスポンスが返すエンティティ数は 16,384 以下です（通常 **topK** と呼ばれます）。

### Delete\{#delete}

各 delete リクエスト/レスポンスは **64** MB を超えてはなりません。

delete リクエストのレート制限は、クラスターあたり **0.5** MB/s です。

### Drop\{#drop}

drop リクエストのレート制限は、クラスターあたり **20** req/s です。

### データインポート\{#data-import}

1 つのコレクションでは、実行中または保留中のインポートジョブを最大 **10,000** 件まで持つことができます。

Zilliz Cloud は、Web コンソールでインポートするファイルにも制限を設けています。

| ファイルタイプ | ローカルアップロード | オブジェクトストレージから |
| --- | --- | --- |
| JSON | 1 GB | **Free**: 各インポートリクエストでは最大 1 GB のデータをインポートでき、ファイルごとの最大サイズは 1 GB、1 回のインポートあたり最大 1,000 ファイルまでです。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルまでです。 |
| Parquet | 1 GB | **Free**: 各インポートリクエストでは最大 1 GB のデータをインポートでき、ファイルごとの最大サイズは 1 GB、1 回のインポートあたり最大 1,000 ファイルまでです。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルまでです。 |
| Numpy | サポートされていません | **Free**: 各インポートリクエストでは最大 1 GB のデータをインポートでき、サブディレクトリごとの最大サイズは 1 GB、1 回のインポートあたり最大 1,000 サブディレクトリまでです。<br/>**Serverless & Dedicated**: インポートの合計最大サイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、最大 1,000 サブディレクトリまでです。 |

詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永続的に保持されます。

自動作成されたバックアップの最大保持期間は 30 日です。 

## コンソールでの復元\{#restore-on-console}

バックアップファイルは、そのバックアップファイルの元のクラスターと同じリージョン内で復元できます。復元先のクラスターは、元のものと同じ CU タイプを使用している必要があります。

## IP アクセスリスト\{#ip-access-list}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| コンソール IP アクセス | 100 | コンソール IP 許可リストに最大 100 個の IP アドレスを追加できます。 |
| クラスター IP アクセス | 100 | クラスター IP 許可リストに最大 100 個の IP アドレスを追加できます。 |

## 移行\{#migration}

他ベンダーから Zilliz Cloud クラスターへデータを移行できます。移行ごとのコレクションの最大数は、対象となる Zilliz Cloud クラスターのサブスクリプションプランによって異なります。

| 対象クラスターのサブスクリプションプラン | 移行ごとのコレクション最大数 |
| --- | --- |
| Free | 5 |
| Serverless / Dedicated | 10 |

## プライベートエンドポイント\{#private-endpoints}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| プライベートエンドポイント | 10 | 各プロジェクトで最大 10 個のプライベートエンドポイントを作成できます。 |



import DocCardList from '@theme/DocCardList';

<DocCardList />
