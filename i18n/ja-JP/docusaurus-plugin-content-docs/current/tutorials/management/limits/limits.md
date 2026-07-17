---
title: "Zilliz Cloud の制限事項 | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud の制限事項"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームの制限事項について説明します。これらの制限に関する問題を報告する必要がある場合は、リクエストを送信してください。 | Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の制限事項

このページでは、Zilliz Cloud プラットフォームの制限事項について説明します。これらの制限に関する問題を報告する必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

## Organizations & Projects\{#organizations-and-projects}

以下の表は、1 人のユーザーに対して許可される organization および project の最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Organization | 1 | アカウント登録が正常に完了すると、Zilliz Cloud は自動的に 1 つの organization を作成します。さらに organization が必要な場合は、[サポートチケットを作成](http://support.zilliz.com)してください。1 人のユーザーは複数の organization に参加できます。 |
| Project | 100 | 各ユーザーは、1 つの organization 内に最大 100 個の project を作成できます。 |

## Users & Roles\{#users-and-roles}

以下の表は、Zilliz Cloud で許可されるユーザーおよび role の最大数に関する制限を示しています。

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Organization User | 100 | 1 つの organization には、合計で最大 100 人の organization user を含めることができます。 |
| Cluster User | 500 | 1 つの cluster には、合計で最大 500 人のユーザーを含めることができます。 |
| Cluster Custom Role | 500 | 1 つの cluster には、合計で最大 500 個の custom role を含めることができます。この制限を解除するには、[お問い合わせ](http://support.zilliz.com)ください。 |

## API Keys\{#api-keys}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| API Key | 100 | 各 organization には、最適なリソース利用とセキュリティのために、最大 100 個のカスタマイズされた API key を含めることができます。 |

## Console IP Allowlist\{#console-ip-allowlist}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| organization console IP allowlist 内の IP | 100 | 各 organization console IP allowlist には、最大 100 個の IP または CIDR ブロックを含めることができます。 |

## Volumes\{#volumes}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Managed volume | 100 | 各 organization には、最大 100 個の managed volume を含めることができます。 |
| External volume | 100 | 各 organization には、最大 100 個の external volume を含めることができます。 |

## Clusters\{#clusters}

### cluster 数\{#number-of-clusters}

cluster の最大数は、支払い方法とデプロイオプションによって異なります。

- **有効な支払い方法なし**

    | **Cluster Deployment Option** | **最大数** | **備考** |
    | --- | --- | --- |
    | Free | 1 | 各 organization では Free cluster は 1 つのみ許可されます。必要に応じて既存の Free cluster を削除し、新しいものに置き換えることができます。 |
    | Serverless/Dedicated | 1 | 無料トライアル期間中は Serverless/Dedicated cluster を 1 つのみ作成できます。追加の cluster が必要な場合は、支払い方法を追加してください。 |

- **有効な支払い方法あり**

    | **Cluster Deployment Option** | **最大数** | **備考** |
    | --- | --- | --- |
    | Serving - Free | 1 | 各 organization では Free cluster は 1 つのみ許可されます。必要に応じて既存の Free cluster を削除し、新しいものに置き換えることができます。 |
    | Serving - Serverless | 100 | 各 project で最大 100 個の Serverless cluster を作成できます。 |
    | Serving - Dedicated | 100 | 各 project で最大 100 個の Dedicated cluster を作成できます。 |
    | On-demand | 20 | 各 project で最大 20 個の on-demand cluster を作成できます。 |

### CUs\{#cus}

CU はデータの並列処理に使用されるコンピュートリソースの基本単位であり、CU の種類によって CPU、メモリ、ストレージの組み合わせが異なります。CU の概念は Dedicated cluster にのみ適用されます。

| **Project Plan & Cluster Deployment Option** | **制限** | **備考** |
| --- | --- | --- |
| Standard project の Dedicated serving cluster | CU size &lt;=32 | コンソールでは、1 つの cluster に対して最大 32 CUs を作成できます。 |
| Enterprise project の Dedicated serving cluster | CU size x Replica Count &lt;=204,800 | コンソールでは、1 つの cluster に対して最大 2,048 CUs を作成できます。<br/>ただし、replica を追加する場合の制限は CU size x Replica Count &lt;=204,800 です。 |
| Enterprise project の On-demand cluster | 8&lt;= CU size &lt;= 256 | コンソールでは、1 つの on-demand cluster は 8 ～ 256 CUs をサポートします。<br/>8 CU ごとに、最大 3 TB のデータに対する検索が可能になります。 |

以下の場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。 

- Standard project の Dedicated cluster で 32 CUs を超える必要がある場合

- Enterprise project の Dedicated cluster で 1,024 CUs を超える必要がある場合

### vCUs\{#vcus}

virtual compute unit（vCU）は、読み取り操作（search や query など）および書き込み操作（insert、upsert、delete など）で消費されるリソースを測定するために使用されます。vCU の概念は Free および Serverless cluster にのみ適用されます。

| **Cluster Plan** | **制限** |
| --- | --- |
| Free | 月あたり 250 万 vCUs |
| Serverless | N/A |

### Capacity\{#capacity}

以下の表は、各 cluster plan の capacity 制限を示しています。

| **Cluster Plan** | **制限** |
| --- | --- |
| Free | 1 cluster あたり 5 GB（1 cluster あたり 100 万個の 768 次元 vector に相当） |
| Serverless | Zilliz Cloud の Serverless cluster には capacity 制限がありません。 |
| Dedicated (per CU) | Zilliz Cloud の Dedicated cluster には capacity 制限がありません。 |

<Admonition type="info" icon="📘" title="Notes">

Dedicated cluster capacity の上限は、使用される CU の種類とサイズに依存します。cluster の capacity が不足している場合は、CU の種類とサイズの調整を検討してください。詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

</Admonition>

## Replicas\{#replicas}

replica を追加するには、cluster に **少なくとも 8 CUs** が必要です。さらに、以下の制限も適用されます。

| **項目** | **制限** | **備考** |
| --- | --- | --- |
| Replica | 100 | 最大 100 個の replica を作成できます。 |
| Query CU x Replica Count | 204,800 | cluster replica x query CU は 204,800 を超えてはなりません。 |

<Admonition type="info" icon="📘" title="Notes">

以前の Milvus リリースと互換性のある一部の cluster では、replica を追加するために少なくとも 12 CUs が必要になる場合があります。 

query CU が少ない cluster に replica を追加するには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

</Admonition>

## Databases\{#databases}

- 各 Serving-Dedicated cluster は最大 1024 個の database を持つことができます。

- 各 project の各リージョンで、最大 64 個の on-demand compute database を作成できます。

- default database は削除できません。

## Collections\{#collections}

Zilliz Cloud cluster における collection および partition の最大数は、割り当てられた CU 数と互換性のある Milvus バージョンによって異なります。以下の説明を参照して、cluster 内の collection および partition の最大数を計算できます。

1 CU あたり最大 **1,024** 個の collection、または **4,096** 個の partition を作成でき、1 つの collection あたり最大 **1,024** 個の partition が許可されます。cluster 内の collection 数および partition 数の上限は、以下の式で計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- cluster 内の collection 総数は、cluster の CU 数の 1,024 倍、または 16,384 のいずれか小さい方未満である必要があります。

- cluster 内のすべての collection にまたがる partition 総数は、cluster に割り当てられた CU 数の 4,096 倍、または 65,536 のいずれか小さい方未満である必要があります。

- 両方の条件を満たす必要があります。

<Admonition type="info" icon="📘" title="Notes">

**Free** および **Serverless** cluster には、代わりに以下の制限が適用されます。

- **Free** cluster では最大 **5** 個の collection を使用できます。

- **Serverless** cluster では最大 **100** 個の collection をサポートします。

</Admonition>

### Fields\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>collection あたりの fields</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>collection あたりの vector fields</p></td>
     <td><ul><li><p>Free & Serverless: 4</p></li><li><p>Dedicated: 10</p></li></ul></td>
   </tr>
</table>

field に関するその他の制限:

- VarChar や JSON など一部の field は予想以上に多くのメモリを使用し、cluster が満杯になる原因となる可能性があります。

### Dimensions\{#dimensions}

vector field の最大 dimension 数は **32,768** です。

### Shards\{#shards}

許可される shard の最大数は、cluster plan と cluster の CU size によって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>Cluster Plan & CU Size</strong></p></th>
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

### Rate limit\{#rate-limit}

Zilliz Cloud では、collection および partition のデータ定義言語（DDL）操作（collection の作成、load、release、drop を含む）にもレート制限が課されます。以下のレート制限は、Serverless および Dedicated cluster の collection に適用されます。

|  | **Rate Limit** |
| --- | --- |
| Collection DDL Operation<br/>(create, load, release, drop) | 1 cluster あたり 20 req/s |
| Partition DDL Operation<br/>(create, load, release, drop) | 1 cluster あたり 20 req/s |

## Operations\{#operations}

このセクションでは、Zilliz Cloud cluster における一般的なデータ操作のレート制限について説明します。

### Insert and Upsert\{#insert-and-upsert}

insert および upsert 操作のレート制限は、cluster のデプロイオプションと使用中の CU 数によって異なります。 

|  | Insert および Upsert の最大レート制限 |
| --- | --- |
| Free cluster | 2 MB/s |
| Serverless cluster | 10 MB/s |
| Dedicated cluster | 16 MB/s + 1 MB/s × CU<br/>最大 256 MB/s まで。 |

例:

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限が適用されます。

- 1 つの shard に対する書き込みレートは **32 MB/s** を超えてはなりません。

- データを insert する際は、schema で定義されたすべての field を含めてください。collection で AutoID が有効になっている場合は primary key を除外してください。

- データを upsert する際は、schema で定義されたすべての field を含めてください。

- insert または upsert した entity を search や query で即座に取得可能にするには、search または query リクエストの consistency level を **Strong** に変更することを検討してください。詳細は [Consistency Level](./consistency-level) を参照してください。

### Index\{#index}

index type は field type によって異なります。以下の表は、index 可能な field type と対応する index type を示しています。

| **Field Type** | **Index Type** | **Metric Type** |
| --- | --- | --- |
| Vector Field | AUTOINDEX | L2, IP, and COSINE |
| VarChar Field | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

flush リクエストのレート制限は 1 秒あたり 0.1 リクエストで、特定の cluster タイプに対して collection レベルで課されます。このレート制限は以下に適用されます。

- Milvus v2.4.x 以降と互換性のある Serverless cluster。

- ベータ版にアップグレードされ、Milvus v2.4.x 以降と互換性のある Dedicated cluster。

<Admonition type="info" icon="📘" title="Notes">

flush 操作を手動で実行することは推奨されません。Zilliz Cloud cluster が自動的に適切に処理します。

</Admonition>

### Load\{#load}

load リクエストのレート制限は、1 cluster あたり **20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

新しいデータがこれらの collection に入ってきたとしても、すでに load 済みの collection に対して再度 load collection を実行する必要はありません。

</Admonition>

### Search\{#search}

各 search リクエスト/レスポンスは **64** MB 以下である必要があります。

各 search リクエストが含む query vector の数（通常 **nq** と呼ばれます）は、サブスクリプションプランによって異なります。

- Free および Serverless cluster では、**nq** は **10** 以下です。

- Dedicated cluster では、**nq** は **16,384** 以下です。

各 search レスポンスが返す件数（通常 **topK** と呼ばれます）は、サブスクリプションプランによって異なります。

- Free および Serverless cluster では、返される **topK** は **1,024** entity 以下です。

- Dedicated cluster では、返される **topK** は **16,384** entity 以下です。

### Query\{#query}

各 query リクエスト/レスポンスは **64** MB 以下である必要があります。

各 query レスポンスが返す entity は 16,384 件以下です（通常 **topK** と呼ばれます）。

### Delete\{#delete}

各 delete リクエスト/レスポンスは **64** MB 以下である必要があります。

delete リクエストのレート制限は、1 cluster あたり **0.5** MB/s です。

### Drop\{#drop}

drop リクエストのレート制限は、1 cluster あたり **20** req/s です。

### Data import\{#data-import}

1 つの collection で、実行中または保留中の import job を最大 **10,000** 件まで保持できます。

Zilliz Cloud では、Web コンソール上で import するファイルにも制限が課されます。

| File Type | Local upload | From Object Storage |
| --- | --- | --- |
| JSON | 1 GB | **Free**: 各 import リクエストでは最大 1 GB のデータを import できます。1 ファイルあたりの最大サイズは 1 GB、1 回の import あたりファイル数は 1,000 個以下です。<br/>**Serverless & Dedicated**: import の合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Parquet | 1 GB | **Free**: 各 import リクエストでは最大 1 GB のデータを import できます。1 ファイルあたりの最大サイズは 1 GB、1 回の import あたりファイル数は 1,000 個以下です。<br/>**Serverless & Dedicated**: import の合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Numpy | Not support | **Free**: 各 import リクエストでは最大 1 GB のデータを import できます。1 サブディレクトリあたりの最大サイズは 1 GB、1 回の import あたりサブディレクトリ数は 1,000 個以下です。<br/>**Serverless & Dedicated**: import の合計最大サイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、サブディレクトリ数は最大 1,000 個です。 |

詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## Backup on Console\{#backup-on-console}

手動で作成された backup は永久に保持されます。

自動的に作成された backup の最大保持期間は 30 日です。 

## Restore on Console\{#restore-on-console}

backup file は、元の cluster と同じリージョンで復元できます。復元先の cluster は、元の cluster と同じ CU type を使用する必要があります。

## IP Access List\{#ip-access-list}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Console IP Access | 100 | console IP allowlist には最大 100 個の IP アドレスを追加できます。 |
| Cluster IP Access | 100 | cluster IP allowlist には最大 100 個の IP アドレスを追加できます。 |

## Migration\{#migration}

他ベンダーから Zilliz Cloud cluster にデータを migration できます。migration ごとの collection 最大数は、対象となる Zilliz Cloud cluster のサブスクリプションプランによって異なります。

| 対象 cluster の Subscription Plan | migration ごとの collection 最大数 |
| --- | --- |
| Free | 5 |
| Serverless / Dedicated | 10 |

## Private Endpoints\{#private-endpoints}

| **項目** | **最大数** | **備考** |
| --- | --- | --- |
| Private Endpoint | 10 | 各 project で最大 10 個の private endpoint を作成できます。 |



import DocCardList from '@theme/DocCardList';

<DocCardList />
