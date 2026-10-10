---
title: "Pinecone から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Pinecone から移行する際に Zilliz Cloud がデータ型マッピング、フィールド変換、Namespace の処理、コレクションの命名規則をどのように扱うかについて説明します。 | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinecone から Zilliz Cloud への移行

このトピックでは、[Pinecone](https://www.pinecone.io/) から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、Namespace の処理、コレクションの命名規則をどのように扱うかについて説明します。

インデックス設定と移行後の手順については、[外部移行の基本](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

Pinecone から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Pinecone の要件\{#pinecone-requirements}

| 要件 | 詳細 |
| --- | --- |
| インデックスタイプ | Pinecone Serverless インデックスからの移行のみをサポートします。 |
| API アクセス | アクセス権限を持つ Pinecone API キー |
| データの可用性 | Pinecone のソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。 |
| ベクトル次元 | 次元は 1 より大きい必要があります。単一次元のベクトルは移行の失敗を引き起こします。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズを見積もるには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用します） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud の IP](./zilliz-cloud-ips) を追加します |

## データ型マッピング\{#data-type-mapping}

Pinecone のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行を計画するうえで重要です。

| Pinecone のフィールド型 | Zilliz Cloud のフィールド型 | 備考 |
| --- | --- | --- |
| プライマリキー | VARCHAR（プライマリキー） | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| 密ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です。 |
| 疎ベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| メタデータ | 動的フィールド | デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。<br/>詳細については、[動的フィールド](./enable-dynamic-field) を参照してください。 |
| Namespace | パーティションキー / パーティション | パフォーマンス最適化のために推奨されます。<br/>詳細については、[Namespace の処理](./migrate-from-pinecone#namespace-processing) を参照してください。 |

## メタデータフィールドの変換\{#metadata-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud はメタデータスキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Pinecone のメタデータは、最大限の柔軟性を実現するために、最初は Zilliz Cloud の動的スキーマにマッピングされます。必要に応じて、メタデータフィールドを固定フィールドに変換することで、次のメリットを得られます。

- より厳密な検証のためのデータ型の適用

- より良いクエリパフォーマンスのためのインデックスの最適化

- 一貫したデータ管理のための構造化されたスキーマ

メタデータを固定フィールドに変換する場合は、次のとおりです。

| Pinecone のメタデータ型 | Zilliz の固定フィールド型 | 備考 |
| --- | --- | --- |
| 文字列 | VARCHAR | 最大 65,535 バイトをサポートします。 |
| 数値 (int/float) | DOUBLE | すべての数値型は DOUBLE になります。 |
| ブール値 | BOOL | 直接マッピングされます。 |
| 文字列のリスト | ARRAY&lt;VARCHAR&gt; | ネストされた配列をサポートします。 |

固定フィールドに変換されたメタデータフィールドでは、次の追加属性を構成できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効になっています。詳細については、[Nullable 属性](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-fields) を参照してください。

## Pinecone 固有の処理ルール\{#pinecone-specific-handling-rules}

### Namespace の処理\{#namespace-processing}

Pinecone の Namespace は、次の 2 つの戦略を使用して移行できます。

| 戦略 | 実装 | パフォーマンスへの影響 | ユースケース |
| --- | --- | --- | --- |
| **Namespace as Partition Key** *(推奨)* | Namespace がパーティションキーフィールドの値になります。 | 検索パフォーマンスの自動最適化 | 複数の Namespace を使用するほとんどのシナリオ |
| **Namespace as Partition** | 各 Namespace が個別のパーティションになります。 | 手動でのパーティション管理が必要です。 | Namespace が少なく安定しているシンプルなシナリオ |

<Admonition type="info" title="Notes">

Pinecone の `default` Namespace の処理:

- **As Partition**: Zilliz Cloud では `_default` パーティションになります。

- **As Partition Key**: 空の文字列 `""` の値になります。

パーティションとパーティションキーの概念の詳細については、[パーティションの管理](./manage-partitions) および [パーティションキーの使用](./use-partition-key) を参照してください。

</Admonition>

### コレクションの命名規則\{#collection-naming-rules}

Pinecone のインデックス名は、Zilliz Cloud との互換性のために自動的に処理されます。

| Pinecone のインデックス名 | Zilliz Cloud のコレクション名 | 適用されるルール |
| --- | --- | --- |
| `my-vector-index` | `my_vector_index` | Zilliz Cloud のコレクション命名規則に準拠するため、ハイフン（`-`）をアンダースコア（`_`）に変換します。 |
| `product_search` | `product_search` | 変更は不要です。 |

**命名の競合**: ターゲットデータベースに同じ名前のコレクションがすでに存在する場合は、次のいずれかを行う必要があります。

- 既存のコレクションを削除します。または

- 別のターゲットデータベースを選択します。または

- 移行の構成時にターゲットコレクションの名前を変更します。
