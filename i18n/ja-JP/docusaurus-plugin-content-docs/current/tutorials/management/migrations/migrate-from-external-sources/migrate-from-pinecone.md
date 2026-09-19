---
title: "Pinecone から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Pinecone から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、namespace 処理、コレクションの命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinecone から Zilliz Cloud への移行

このトピックでは、[Pinecone](https://www.pinecone.io/) から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、namespace 処理、コレクションの命名規則をどのように処理するかについて説明します。

## 事前準備\{#prerequisites}

Pinecone から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Pinecone の要件\{#pinecone-requirements}

| 要件 | 詳細 |
| --- | --- |
| インデックスタイプ | Pinecone Serverless インデックスからの移行のみをサポート |
| API アクセス | アクセス権限を持つ Pinecone API キー |
| データの可用性 | Pinecone のソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。 |
| ベクトル次元 | 次元は 1 より大きい必要があります。単一次元のベクトルは移行失敗の原因になります |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加します |

## データ型マッピング\{#data-type-mapping}

移行計画を立てるうえで、Pinecone のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは重要です。

| Pinecone フィールド型 | Zilliz Cloud フィールド型 | 備考 |
| --- | --- | --- |
| プライマリキー | VARCHAR (primary key) | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| Dense ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です |
| Sparse ベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| メタデータ | 動的フィールド | デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換することもできます。<br/>詳細は [Dynamic Field](./enable-dynamic-field) を参照してください。 |
| namespace | パーティションキー / パーティション | パフォーマンス最適化のために推奨されます。<br/>詳細は [Namespace processing](./migrate-from-pinecone#namespace-processing) を参照してください。 |

## メタデータフィールドの変換\{#metadata-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud はメタデータスキーマを検出するために 100 行をサンプリングします。必要に応じて、フィールドを手動で追加できます。

</Admonition>

Pinecone のメタデータは、最大限の柔軟性を得るために、最初は Zilliz Cloud の動的スキーマにマッピングされます。必要に応じてメタデータフィールドを固定フィールドに変換することで、次の利点を得られます。

- より強力な検証のためのデータ型の強制

- より優れたクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化されたスキーマ

メタデータを固定フィールドに変換する場合:

| Pinecone メタデータ型 | Zilliz 固定フィールド型 | 備考 |
| --- | --- | --- |
| String | VARCHAR | 最大 65,535 バイトをサポート |
| Number (int/float) | DOUBLE | すべての数値型は DOUBLE になります |
| Boolean | BOOL | 直接マッピングされます |
| 文字列のリスト | ARRAY&lt;VARCHAR&gt; | ネストされた配列をサポート |

固定フィールドに変換されたメタデータフィールドについては、追加の属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細は [Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが存在しない場合のフォールバック値を設定します。詳細は [Default values](./nullable-fields) を参照してください。

## Pinecone 固有の処理ルール\{#pinecone-specific-handling-rules}

### namespace の処理\{#namespace-processing}

Pinecone の namespace は、次の 2 つの戦略で移行できます。

| 戦略 | 実装 | パフォーマンスへの影響 | ユースケース |
| --- | --- | --- | --- |
| **namespace をパーティションキーとして使用** *(推奨)* | namespace がパーティションキーフィールドの値になります | 検索パフォーマンスの自動最適化 | 複数の namespace を持つほとんどのシナリオ |
| **namespace をパーティションとして使用** | 各 namespace が個別のパーティションになります | 手動でのパーティション管理が必要 | namespace が少なく安定しているシンプルなシナリオ |

<Admonition type="info" title="Notes">

Pinecone の `default` namespace の処理:

- **パーティションとして使用**: Zilliz Cloud では `_default` パーティションになります

- **パーティションキーとして使用**: 空の文字列 `""` の値になります

パーティションおよびパーティションキーの概念の詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

</Admonition>

### コレクションの命名規則\{#collection-naming-rules}

Pinecone のインデックス名は、Zilliz Cloud との互換性のために自動的に処理されます。

| Pinecone インデックス名 | Zilliz Cloud コレクション名 | 適用されるルール |
| --- | --- | --- |
| `my-vector-index` | `my_vector_index` | Zilliz Cloud のコレクション命名規則に準拠するため、ハイフン（`-`）はアンダースコア（`_`）に変換されます |
| `product_search` | `product_search` | 変更は不要です |

**命名の競合**: ターゲットデータベースに同じ名前のコレクションがすでに存在する場合は、次のいずれかを行う必要があります。

- 既存のコレクションを削除する、または

- 別のターゲットデータベースを選択する、または

- 移行設定時にターゲットコレクションの名前を変更する
