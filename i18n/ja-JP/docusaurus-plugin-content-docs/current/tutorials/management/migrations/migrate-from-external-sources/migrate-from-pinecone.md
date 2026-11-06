---
title: "Pinecone から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Pinecone から移行する際に、Zilliz Cloud がデータ型マッピング、フィールド変換、Namespace の処理、コレクションの命名規則をどのように扱うかについて説明します。 | Cloud"
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
| API アクセス | アクセス権限のある Pinecone API キー |
| データの可用性 | Pinecone のソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。 |
| ベクトル次元 | 次元は 1 より大きい必要があります。単一次元のベクトルは移行失敗の原因になります。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズを見積もるには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用します） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud の IP](./zilliz-cloud-ips) を追加します。 |

## データ型マッピング\{#data-type-mapping}

Pinecone のデータ型が Zilliz Cloud でどのようにマッピングされるかを理解することは、移行を計画するうえで重要です。

| Pinecone のフィールド型 | Zilliz Cloud のフィールド型 | 備考 |
| --- | --- | --- |
| プライマリキー | VARCHAR（プライマリキー） | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| 密ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です。 |
| スパースベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| メタデータ | 動的フィールド | デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。<br/>詳細については、[動的フィールド](./enable-dynamic-field) を参照してください。 |
| Namespace | パーティションキー / パーティション | パフォーマンス最適化のために推奨されます。<br/>詳細については、[Namespace の処理](./migrate-from-pinecone#namespace-processing) を参照してください。 |

## メタデータフィールドの変換\{#metadata-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud はメタデータスキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Pinecone のメタデータは、最大限の柔軟性を実現するために、最初は Zilliz Cloud の動的スキーマにマッピングされます。任意でメタデータフィールドを固定フィールドに変換すると、次のメリットを得られます。

- より厳密な検証を実現するデータ型の適用

- クエリパフォーマンスを向上させるインデックスの最適化

- 一貫したデータ管理を実現する構造化スキーマ

メタデータを固定フィールドに変換すると、次のようにマッピングされます。

| Pinecone のメタデータ型 | Zilliz の固定フィールド型 | 備考 |
| --- | --- | --- |
| 文字列 | VARCHAR | 最大 65,535 バイトをサポートします。 |
| 数値 (int/float) | DOUBLE | すべての数値型は DOUBLE になります。 |
| ブール値 | BOOL | 直接マッピングされます。 |
| 文字列のリスト | ARRAY&lt;VARCHAR&gt; | ネストされた配列をサポートします。 |

固定フィールドに変換されたメタデータフィールドでは、次の追加属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れるかどうかを決定します。この機能はデフォルトで有効になっています。詳細については、[Nullable 属性](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#KL0mdOeSgoJtVfxQUvIcvGGenAd) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#LuoQdz5asouWjbxkKbscpywSnaf) を参照してください。

## Pinecone 固有の処理ルール\{#pinecone-specific-handling-rules}

### Namespace の処理\{#namespace-processing}

Pinecone の Namespace は、次の 2 つの戦略を使用して移行できます。

| 戦略 | 実装 | パフォーマンスへの影響 | ユースケース |
| --- | --- | --- | --- |
| **Namespace をパーティションキーとして使用** *（推奨）* | Namespace がパーティションキーフィールドの値になります | 検索パフォーマンスの自動最適化 | 複数の Namespace があるほとんどのシナリオ |
| **Namespace をパーティションとして使用** | 各 Namespace が個別のパーティションになります | 手動でのパーティション管理が必要です | Namespace が少なく安定しているシンプルなシナリオ |

<Admonition type="info" title="Notes">

Pinecone の `default` Namespace は次のように処理されます。

- **パーティションとして**: Zilliz Cloud では `_default` パーティションになります。

- **パーティションキーとして**: 空の文字列 `""` になります。

パーティションとパーティションキーの概念の詳細については、[パーティションの管理](./manage-partitions) および [パーティションキーの使用](./use-partition-key) を参照してください。

</Admonition>

### コレクションの命名規則\{#collection-naming-rules}

Pinecone のインデックス名は、Zilliz Cloud との互換性のために自動的に処理されます。

| Pinecone のインデックス名 | Zilliz Cloud のコレクション名 | 適用されるルール |
| --- | --- | --- |
| `my-vector-index` | `my_vector_index` | Zilliz Cloud のコレクション命名規則に準拠するため、ハイフン（`-`）はアンダースコア（`_`）に変換されます。 |
| `product_search` | `product_search` | 変更は不要です。 |

**命名の競合**: ターゲットデータベースに同じ名前のコレクションがすでに存在する場合は、次のいずれかを行う必要があります。

- 既存のコレクションを削除します。または

- 別のターゲットデータベースを選択します。または

- 移行の設定中にターゲットコレクションの名前を変更します。
