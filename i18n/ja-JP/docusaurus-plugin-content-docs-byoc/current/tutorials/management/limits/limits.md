---
title: "Zilliz Cloud の制限 | BYOC"
slug: /limits
sidebar_label: "Zilliz Cloud の制限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォーム上の制限に関する情報を提供します。このページで言及されている設定の大部分は、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、お問い合わせください。 | BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の制限

このページでは、Zilliz Cloud プラットフォーム上の制限に関する情報を提供します。このページで言及されている設定の大部分は、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、引き続き [お問い合わせ](https://support.zilliz.com/hc/en-us) いただけます。

## Organizations & Projects\{#organizations-and-projects}

次の表は、1 人のユーザーに許可される organization と project の最大数に関する制限を示しています。

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Project | 100 | 各ユーザーは、1 つの organization 内で最大 100 個の project を作成できます。 |

## Users & Roles\{#users-and-roles}

次の表は、Zilliz Cloud で許可されるユーザー数とロール数の上限を示しています。

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Cluster User | 500 | 1 つの cluster には、合計で最大 500 人のユーザーを含めることができます。 |
| Cluster Custom Role | 500 | 1 つの cluster には、合計で最大 500 個のカスタムロールを含めることができます。この制限を解除するには、[お問い合わせ](http://support.zilliz.com) ください。 |

## API Keys\{#api-keys}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| API Key | 100 | 各 organization には、最適なリソース利用とセキュリティのために、最大 100 個のカスタマイズされた API key を含めることができます。 |

## Console IP Allowlist\{#console-ip-allowlist}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| IPs in the organization console IP allowlist | 100 | 各 organization のコンソール IP 許可リストには、最大 100 個の IP または CIDR ブロックを含めることができます。 |

## Clusters\{#clusters}

### CUs\{#cus}

CU は、データの並列処理に使用される計算リソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージの異なる組み合わせで構成されます。CU の概念は Dedicated cluster にのみ適用されます。

| **Project Plan & Cluster Deployment Option** | **Limits** | **Remarks** |
| --- | --- | --- |
| Standard project の Dedicated serving cluster | CU size &lt;=32 | コンソールでは、1 つの cluster に対して最大 32 CUs を作成できます。 |
| Enterprise project の Dedicated serving cluster | CU size x Replica Count &lt;=204,800 | コンソールでは、1 つの cluster に対して最大 2,048 CUs を作成できます。<br/>ただし、replica を追加した場合の制限は CU size x Replica Count &lt;=204,800 です。 |

以下の場合は、ぜひ [お問い合わせ](https://support.zilliz.com/hc/en-us) ください。 

- Standard project 内の Dedicated clusters で 32 CUs を超える必要がある場合

- Enterprise project 内の Dedicated clusters で 1,024 CUs を超える必要がある場合

## Replicas\{#replicas}

replica を追加するには、その cluster に **少なくとも 8 CUs** が必要です。さらに、次の制限も適用されます。

| **Item** | **Limits** | **Remarks** |
| --- | --- | --- |
| Replica | 100 | 最大 100 個の replica を作成できます。 |
| Query CU x Replica Count | 204,800 | cluster replica x query CU は 204,800 を超えてはなりません。 |

<Admonition type="info" icon="📘" title="Notes">

以前の Milvus リリースと互換性のある一部の cluster では、replica を追加するために少なくとも 12 CUs が必要になる場合があります。 

query CU が少ない cluster に replica を追加するには、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

</Admonition>

## Databases\{#databases}

- 各 Serving-Dedicated cluster は最大 1024 個の database を持つことができます。

- デフォルト database は削除できません。

## Collections\{#collections}

Zilliz Cloud cluster 内の collection と partition の最大数は、その cluster に割り当てられた CUs 数と、互換性のある Milvus バージョンによって異なります。以下の説明を参照して、cluster 内の collection と partition の最大数を計算できます。

1 CU あたり最大 **1,024** 個の collection、または **4,096** 個の partition を作成でき、1 つの collection あたり最大 **1,024** 個の partition を許可します。cluster 内の collection 数と partition 数の上限は、次の式で計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- cluster 内の collection 総数は、cluster の CUs 数の 1,024 倍、または 16,384 のいずれか小さい方未満である必要があります。

- cluster 内のすべての collection にまたがる partition 総数は、cluster に割り当てられた CUs 数の 4,096 倍、または 65,536 のいずれか小さい方未満である必要があります。

- 両方の条件を満たす必要があります。

### Fields\{#fields}

| **Item** | **Max Number** |
| --- | --- |
| Fields per collection | 64 |
| Vector fields per collection | 10 |

field に関するその他の制限:

- VarChar や JSON などの一部の field は、想定より多くのメモリを使用し、cluster が満杯になる原因となる場合があります。

### Dimensions\{#dimensions}

vector field の最大次元数は **32,768** です。

### Shards\{#shards}

許可される shard の最大数は、cluster の CU size に依存します。

| CU Size | Max Number |
| --- | --- |
| 1 - 2 CU | 2 |
| 4 - 8 CU | 4 |
| 12 - 64 CU | 8 |
| \> 64 CU | 16 |

### Rate limit\{#rate-limit}

Zilliz Cloud は、collection および partition のデータ定義言語（DDL）操作にも rate limit を課しています。これには、collection の作成、load、release、drop が含まれます。以下の rate limit は、Serverless cluster と Dedicated cluster の両方の collection に適用されます。

|  | **Rate Limit** |
| --- | --- |
| Collection DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |
| Partition DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |

## Operations\{#operations}

このセクションでは、Zilliz Cloud cluster における一般的なデータ操作の rate limit に焦点を当てます。

### Insert and Upsert\{#insert-and-upsert}

insert および upsert 操作の rate limit は、cluster のデプロイメントオプションと使用中の CUs 数によって異なります。 

|  | Maximum Insert and Upsert Rate Limits |
| --- | --- |
| Dedicated cluster | 16 MB/s + 1 MB/s × CU<br/>最大で 256 MB/s まで。 |

例:

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、次の追加制限が適用されます。

- 単一 shard の書き込みレートは **32 MB/s** を超えてはなりません。

- データを insert する際は、スキーマで定義されたすべての field を含めてください。collection で AutoID が有効な場合は primary key を除外してください。

- データを upsert する際は、スキーマで定義されたすべての field を含めてください。

- insert または upsert された entity を検索や query で即座に取得できるようにするには、search または query リクエスト内の consistency level を **Strong** に変更することを検討してください。詳細は [Consistency Level](./consistency-level) を参照してください。

### Index\{#index}

index タイプは field タイプによって異なります。次の表は、index 化可能な field タイプと対応する index タイプを示しています。

| **Field Type** | **Index Type** | **Metric Type** |
| --- | --- | --- |
| Vector Field | AUTOINDEX | L2, IP, and COSINE |
| VarChar Field | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

flush リクエストの rate limit は 1 秒あたり 0.1 リクエストで、特定の cluster タイプでは collection レベルで適用されます。この rate limit は、Milvus v2.4.x 以降と互換性のある cluster に適用されます。

<Admonition type="info" icon="📘" title="Notes">

flush 操作を手動で実行することは推奨されません。Zilliz Cloud cluster がこれを適切に処理します。

</Admonition>

### Load\{#load}

load リクエストの rate limit は、cluster ごとに **20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

すでに load 済みの collection に対しては、新しいデータがこれらの collection に入ってくる場合でも、collection の load を実行する必要はありません。

</Admonition>

### Search\{#search}

各 search リクエスト/レスポンスは **64** MB を超えてはなりません。

各 search リクエストに含められる query vector の数（通常 **nq** と呼ばれます）は **16,384** 以下であり、各 search レスポンスが返す数（通常 **topK** と呼ばれます）は返却される entity 数として **16,384** 以下です。

### Query\{#query}

各 query リクエスト/レスポンスは **64** MB を超えてはなりません。

各 query レスポンスが返す entity 数は 16,384 以下です（通常 **topK** と呼ばれます）。

### Delete\{#delete}

各 delete リクエスト/レスポンスは **64** MB を超えてはなりません。

delete リクエストの rate limit は、cluster ごとに **0.5** MB/s です。

### Drop\{#drop}

drop リクエストの rate limit は、cluster ごとに **20** req/s です。

### Data import\{#data-import}

1 つの collection で、実行中または保留中の import job を最大 **10,000** 件まで持つことができます。

Zilliz Cloud は、web console 上で import するファイルにも制限を課しています。

| File Type | Local upload | From Object Storage |
| --- | --- | --- |
| JSON | 1 GB | import の合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Parquet | 1 GB | import の合計最大サイズは 1 TB、各ファイルの最大サイズは 10 GB、ファイル数は最大 1,000 個です。 |
| Numpy | Not support | import の合計最大サイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、サブディレクトリ数は最大 1,000 個です。 |

詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## Backup on Console\{#backup-on-console}

手動で作成した backup は永続的に保持されます。

自動作成された backup の最大保持期間は 30 日です。 

## Restore on Console\{#restore-on-console}

backup ファイルは、その backup ファイルの元の cluster と同じリージョン内で restore できます。restore 先の target cluster は、元の cluster と同じ CU type を使用する必要があります。

## IP Access List\{#ip-access-list}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Console IP Access | 100 | コンソール IP 許可リストには最大 100 個の IP アドレスを追加できます。 |

## Migration\{#migration}

他のベンダーから Zilliz Cloud cluster にデータを migration でき、migration ごとの collection の最大数は Zilliz Cloud cluster によって異なります。migration のたびに最大 **10** 個の collection を migration できます。



import DocCardList from '@theme/DocCardList';

<DocCardList />
