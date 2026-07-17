---
title: "Zilliz Cloud の制限 | BYOC"
slug: /limits
sidebar_label: "Zilliz Cloud の制限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームにおける制限について説明します。このページで言及されている設定のほとんどは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、お問い合わせいただくことも可能です。 | BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の制限

このページでは、Zilliz Cloud プラットフォームにおける制限について説明します。このページで言及されている設定のほとんどは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

## Organizations & Projects\{#organizations-and-projects}

次の表は、1 人のユーザーに対して許可される organization と project の最大数に関する制限を示しています。

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Project | 100 | 各ユーザーは、1 つの organization 内に最大 100 個の project を作成できます。 |

## Users & Roles\{#users-and-roles}

次の表は、Zilliz Cloud で許可されるユーザー数およびロール数の最大制限を示しています。

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Cluster User | 500 | 1 つの cluster には合計で最大 500 人のユーザーを含めることができます。 |
| Cluster Custom Role | 500 | 1 つの cluster には合計で最大 500 個のカスタムロールを作成できます。この制限の解除については [お問い合わせ](http://support.zilliz.com)ください。 |

## API Keys\{#api-keys}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| API Key | 100 | 各 organization には、最適なリソース利用とセキュリティのために、最大 100 個のカスタマイズされた API key を含めることができます。 |

## Console IP Allowlist\{#console-ip-allowlist}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| organization の console IP allowlist 内の IP | 100 | 各 organization の console IP allowlist には、最大 100 個の IP または CIDR ブロックを含めることができます。 |

## Clusters\{#clusters}

### CUs\{#cus}

CU は、データの並列処理に使用される計算リソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージの異なる組み合わせで構成されます。CU の概念は Dedicated cluster にのみ適用されます。

| **Project Plan & Cluster Deployment Option** | **Limits** | **Remarks** |
| --- | --- | --- |
| Standard project 内の Dedicated serving cluster | CU size &lt;=32 | コンソールでは、1 つの cluster に対して最大 32 CUs を作成できます。 |
| Enterprise project 内の Dedicated serving cluster | CU size x Replica Count &lt;=204,800 | コンソールでは、1 つの cluster に対して最大 2,048 CUs を作成できます。<br/>ただし、replica を追加する場合、制限は CU size x Replica Count &lt;=204,800 です。 |

以下の場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。 

- Standard project の Dedicated cluster で 32 CUs を超える場合

- Enterprise project の Dedicated cluster で 1,024 CUs を超える場合

## Replicas\{#replicas}

replica を追加するには、cluster に **少なくとも 8 CUs** が必要です。さらに、以下の制限も適用されます。

| **Item** | **Limits** | **Remarks** |
| --- | --- | --- |
| Replica | 100 | 最大 100 個の replica を作成できます。 |
| Query CU x Replica Count | 204,800 | cluster replica x query CU は 204,800 を超えてはいけません。 |

<Admonition type="info" icon="📘" title="Notes">

以前の Milvus リリースと互換性のある一部の cluster では、replica を追加するために少なくとも 12 CUs が必要な場合があります。 

より少ない query CU を持つ cluster に replica を追加するには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

</Admonition>

## Databases\{#databases}

- 各 Serving-Dedicated cluster には最大 1024 個の database を作成できます。

- デフォルト database は削除できません。

## Collections\{#collections}

Zilliz Cloud cluster における collection および partition の最大数は、割り当てられた CUs の数と、互換性のある Milvus バージョンによって異なります。以下の説明を参照して、cluster 内の collection および partition の最大数を計算できます。

1 CU あたり最大 **1,024** 個の collection、または **4,096** 個の partition を作成でき、1 つの collection には最大 **1,024** 個の partition を作成できます。以下の式を使用して、cluster 内の collection 数と partition 数の上限を計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- cluster 内の collection の総数は、cluster 内の CUs 数の 1,024 倍、または 16,384 のいずれか小さい方未満である必要があります。

- cluster 内のすべての collection にまたがる partition の総数は、cluster に割り当てられた CUs 数の 4,096 倍、または 65,536 のいずれか小さい方未満である必要があります。

- 両方の条件を満たす必要があります。

### Fields\{#fields}

| **Item** | **Max Number** |
| --- | --- |
| collection あたりの fields | 64 |
| collection あたりの vector fields | 10 |

fields に関するその他の制限:

- VarChar や JSON などの一部の field は、想定より多くのメモリを使用し、cluster がいっぱいになる原因となる場合があります。

### Dimensions\{#dimensions}

vector field の最大次元数は **32,768** です。

### Shards\{#shards}

許可される shard の最大数は、cluster の CU size によって異なります。

| CU Size | Max Number |
| --- | --- |
| 1 - 2 CU | 2 |
| 4 - 8 CU | 4 |
| 12 - 64 CU | 8 |
| \> 64 CU | 16 |

### Rate limit\{#rate-limit}

Zilliz Cloud は、collection および partition のデータ定義言語（DDL）操作（collection の作成、load、release、drop を含む）にもレート制限を適用します。以下のレート制限は、Serverless cluster と Dedicated cluster の両方の collection に適用されます。

|  | **Rate Limit** |
| --- | --- |
| Collection DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |
| Partition DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |

## Operations\{#operations}

このセクションでは、Zilliz Cloud cluster における一般的なデータ操作のレート制限に焦点を当てます。

### Insert and Upsert\{#insert-and-upsert}

insert および upsert 操作のレート制限は、cluster のデプロイメントオプションと使用中の CUs 数に依存します。 

|  | Maximum Insert and Upsert Rate Limits |
| --- | --- |
| Dedicated cluster | 16 MB/s + 1 MB/s × CU<br/>最大で 256 MB/s まで。 |

例:

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限が適用されます。

- 単一 shard の書き込みレートは **32 MB/s** を超えてはいけません。

- データを insert する際は、スキーマで定義されたすべての field を含めてください。collection で AutoID が有効になっている場合は、primary key を除外してください。

- データを upsert する際は、スキーマで定義されたすべての field を含めてください。

- insert または upsert された entity を検索および query で即座に取得可能にするには、search または query リクエストの consistency level を **Strong** に変更することを検討してください。詳細は [Consistency Level](./consistency-level) を参照してください。

### Index\{#index}

index type は field type によって異なります。次の表は、index 可能な field type と、それに対応する index type を示しています。

| **Field Type** | **Index Type** | **Metric Type** |
| --- | --- | --- |
| Vector Field | AUTOINDEX | L2, IP, and COSINE |
| VarChar Field | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

flush リクエストのレート制限は 1 秒あたり 0.1 リクエストで、特定の cluster タイプに対して collection レベルで適用されます。このレート制限は、Milvus v2.4.x 以降と互換性のある cluster に適用されます。

<Admonition type="info" icon="📘" title="Notes">

flush 操作を手動で実行することは推奨されません。Zilliz Cloud cluster がこれを適切に処理します。

</Admonition>

### Load\{#load}

load リクエストのレート制限は、cluster あたり **20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

すでに load 済みの collection については、新しいデータがその collection に流入している場合でも、load collection を実行する必要はありません。

</Admonition>

### Search\{#search}

各 search リクエスト/レスポンスは **64** MB を超えてはいけません。

各 search リクエストに含められる query vector の数（通常 **nq** と呼ばれる）は **16,384** 以下であり、各 search レスポンスが返す数（通常 **topK** と呼ばれる）も返却 entity 数として **16,384** 以下でなければなりません。

### Query\{#query}

各 query リクエスト/レスポンスは **64** MB を超えてはいけません。

各 query レスポンスが返せる entity 数は 16,384 以下です（通常 **topK** と呼ばれます）。

### Delete\{#delete}

各 delete リクエスト/レスポンスは **64** MB を超えてはいけません。

delete リクエストのレート制限は、cluster あたり **0.5** MB/s です。

### Drop\{#drop}

drop リクエストのレート制限は、cluster あたり **20** req/s です。

### Data import\{#data-import}

1 つの collection に対して、実行中または保留中の import ジョブを最大 **10,000** 件まで持つことができます。

Zilliz Cloud は、Web コンソール上で import するファイルにも制限を設けています。

| File Type | Local upload | From Object Storage |
| --- | --- | --- |
| JSON | 1 GB | 最大 import 合計サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Parquet | 1 GB | 最大 import 合計サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Numpy | Not support | 最大 import 合計サイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、サブディレクトリ数は最大 1,000 個です。 |

詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## Backup on Console\{#backup-on-console}

手動で作成された backup は永続的に保持されます。

自動作成された backup の最大保持期間は 30 日です。 

## Restore on Console\{#restore-on-console}

backup ファイルは、その元の cluster と同じリージョン内で復元できます。復元先 cluster は、元の cluster と同じ CU タイプを使用する必要があります。

## IP Access List\{#ip-access-list}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Console IP Access | 100 | console IP allowlist に最大 100 個の IP アドレスを追加できます。 |

## Migration\{#migration}

他ベンダーから Zilliz Cloud cluster にデータを migration でき、migration ごとの collection の最大数は Zilliz Cloud cluster によって異なります。migration 1 回あたり最大 **10** 個の collection を migration できます。



import DocCardList from '@theme/DocCardList';

<DocCardList />
