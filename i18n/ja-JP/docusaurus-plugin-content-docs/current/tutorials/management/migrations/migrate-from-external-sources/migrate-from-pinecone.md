---
title: "Pinecone から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Pinecone から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、namespace 処理、collection 命名規則をどのように扱うかを説明します。 | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinecone から Zilliz Cloud への移行

このトピックでは、[Pinecone](https://www.pinecone.io/) から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、namespace 処理、collection 命名規則をどのように扱うかを説明します。

## 前提条件\{#prerequisites}

Pinecone から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Pinecone の要件\{#pinecone-requirements}

| 要件 | 詳細 |
| --- | --- |
| Index type | Pinecone Serverless index からの移行のみをサポート |
| API access | アクセス権限を持つ Pinecone API key |
| Data availability | Pinecone のソース index にはデータが含まれている必要があります。空の index は移行できません。 |
| Vector dimension | 次元は 1 より大きい必要があります。単一次元 vector は移行失敗の原因になります |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| User role | Organization Owner または Project Admin |
| Cluster capacity | 十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| Network access | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加 |

## データ型マッピング\{#data-type-mapping}

Pinecone のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

| Pinecone フィールド型 | Zilliz Cloud フィールド型 | Notes |
| --- | --- | --- |
| Primary key | VARCHAR (primary key) | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| Dense vector | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です |
| Sparse vector | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| Metadata | Dynamic fields | デフォルトで dynamic schema としてマッピングされます。fixed fields に変換することもできます。<br/>詳細は [Dynamic Field](./enable-dynamic-field) を参照してください。 |
| Namespace | Partition key / partition | パフォーマンス最適化のために推奨されます。<br/>詳細は [Namespace processing](./migrate-from-pinecone#namespace-processing) を参照してください。 |

## Metadata フィールドの変換\{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud は metadata schema を検出するために 100 行をサンプリングします。必要に応じて追加のフィールドを手動で追加できます。

</Admonition>

Pinecone metadata は、最大限の柔軟性を得るために、最初は Zilliz Cloud の dynamic schema にマッピングされます。必要に応じて metadata フィールドを fixed fields に変換することで、次の利点が得られます。

- より強力な検証のためのデータ型の強制

- より優れたクエリ性能のための最適化された index

- 一貫したデータ管理のための構造化された schema

metadata を fixed fields に変換する場合:

| Pinecone Metadata Type | Zilliz Fixed Field Type | Notes |
| --- | --- | --- |
| String | VARCHAR | 最大 65,535 バイトをサポート |
| Number (int/float) | DOUBLE | すべての数値型は DOUBLE になります |
| Boolean | BOOL | 直接マッピング |
| List of strings | ARRAY&lt;VARCHAR&gt; | ネストされた配列をサポート |

fixed fields に変換された metadata フィールドについては、追加の属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細は [Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが存在しない場合のフォールバック値を設定します。詳細は [Default values](./nullable-fields) を参照してください。

## Pinecone 固有の処理ルール\{#pinecone-specific-handling-rules}

### Namespace 処理\{#namespace-processing}

Pinecone namespace は、次の 2 つの戦略で移行できます。

| Strategy | Implementation | Performance Impact | Use Case |
| --- | --- | --- | --- |
| **Namespace as Partition Key** *(推奨)* | namespace は partition key フィールド内の値になります | 検索パフォーマンスのための自動最適化 | 複数の namespace を持つほとんどのシナリオ |
| **Namespace as Partition** | 各 namespace は個別の partition になります | 手動の partition 管理が必要 | namespace が少なく安定しているシンプルなシナリオ |

<Admonition type="info" icon="📘" title="Notes">

Pinecone の `default` namespace の処理:

- **As Partition**: Zilliz Cloud では `_default` partition になります

- **As Partition Key**: 空文字列 `""` の値になります

partition および partition key の概念の詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

</Admonition>

### Collection 命名規則\{#collection-naming-rules}

Pinecone index 名は、Zilliz Cloud との互換性のために自動的に処理されます。

| Pinecone Index Name | Zilliz Cloud Collection Name | Rule Applied |
| --- | --- | --- |
| `my-vector-index` | `my_vector_index` | Zilliz Cloud の collection 命名規則に準拠するため、ハイフン (`-`) はアンダースコア (`_`) に変換されます |
| `product_search` | `product_search` | 変更は不要 |

**命名の競合**: ターゲット database に同じ名前の collection がすでに存在する場合は、次のいずれかを行う必要があります。

- 既存の collection を削除する、または

- 別のターゲット database を選択する、または

- 移行設定時にターゲット collection の名前を変更する

