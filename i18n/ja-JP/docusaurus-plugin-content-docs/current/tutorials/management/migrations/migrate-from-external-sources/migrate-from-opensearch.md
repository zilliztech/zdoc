---
title: "OpenSearch から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "OpenSearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、OpenSearch から移行する際のデータ型マッピング、collection の命名規則、および考慮事項について説明します。 | Cloud"
type: origin
token: VFMLwxpsniVGKYkE3DecmpQ2nrg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# OpenSearch から Zilliz Cloud への移行

このトピックでは、[OpenSearch](https://opensearch.org/) から移行する際に、Zilliz Cloud がデータ型マッピング、collection の命名規則、および考慮事項をどのように扱うかについて説明します。

## 前提条件\{#prerequisites}

OpenSearch から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### OpenSearch の要件\{#opensearch-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソース OpenSearch cluster はパブリックインターネットからアクセス可能である必要があります |
| 認証 | 必要な権限を持つ有効な cluster endpoint、ユーザー名、およびパスワード |
| vector フィールド要件 | 各ソース index には少なくとも 1 つの k-NN vector フィールドが含まれている必要があります |
| データ可用性 | ソース index にはデータが含まれている必要があります。空の index は移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| cluster 容量 | 十分なストレージおよびコンピュートリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用してください） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加してください |

## データ型マッピング\{#data-type-mapping}

次の表は、OpenSearch のフィールド型が Zilliz Cloud のフィールド型にどのようにマッピングされるかを、カスタマイズオプションの詳細とあわせてまとめたものです。

| **OpenSearch フィールド型** | **Zilliz Cloud フィールド型** | **説明** |
| --- | --- | --- |
| Primary key | Primary key | OpenSearch の primary key（[_id](https://opensearch.org/docs/latest/field-types/metadata-fields/id/)）は、Zilliz Cloud で自動的に primary key としてマッピングされます。<br/>データの移行時に Auto ID を有効にできます。ただし、有効にすると、ソーステーブルの元の primary key 値は破棄されます。 |
| [k-NN vector](https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/) | FLOAT_VECTOR | OpenSearch の `float` vector 型は、Zilliz Cloud では `FLOAT_VECTOR` にマッピングされます。OpenSearch の Byte/Binary vector は移行でサポートされていません。<br/>vector 次元は変更されません。 |
| [Alias](https://opensearch.org/docs/latest/field-types/supported-field-types/alias/) | サポートされていません | Alias フィールドはサポートされていません。 |
| [Binary](https://opensearch.org/docs/latest/field-types/supported-field-types/binary/) | VARCHAR | Binary データは Zilliz Cloud では文字列として保存されます。 |
| [Numeric](https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/) |  |  |
| `byte` | INT8 | 直接マッピングされます。 |
| `double` | DOUBLE | 直接マッピングされます。 |
| `float` | FLOAT | 直接マッピングされます。 |
| `half_float` | FLOAT | `FLOAT` にマッピングされます。 |
| `integer` | INT32 | 直接マッピングされます。 |
| `long` | INT64 | 直接マッピングされます。 |
| `short` | INT16 | 直接マッピングされます。 |
| `unsigned_long` | サポートされていません | Zilliz Cloud ではサポートされていません。 |
| `scaled_float` | サポートされていません | Zilliz Cloud ではサポートされていません。 |
| [Boolean](https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/) | BOOL | `true` または `false` を格納します。 |
| [Date](https://opensearch.org/docs/latest/field-types/supported-field-types/dates/) | VARCHAR | 文字列として保存されます。正しい形式に変換されていることを確認してください。 |
| [IP address](https://opensearch.org/docs/latest/field-types/supported-field-types/ip/) | VARCHAR | 文字列として保存されます。 |
| [Range](https://opensearch.org/docs/latest/field-types/supported-field-types/range/) | JSON | JSON 形式で保存されます。 |
| [Object](https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/) |  |  |
| `object` | JSON | JSON 形式で保存されます。 |
| `nested` | JSON | JSON 形式で保存されます。 |
| `flat_object` | JSON | JSON 形式で保存されます。 |
| `join` | VARCHAR | 文字列として保存されます。 |
| [String](https://opensearch.org/docs/latest/field-types/supported-field-types/string/) |  |  |
| `keyword` | VARCHAR | 文字列として保存されます。 |
| `text` | VARCHAR | `VARCHAR` にマッピングされます。 |
| `match_only_text` | VARCHAR | 文字列として保存されます。 |
| `token_count` | INT32 | INT32 として保存されます。 |
| `wildcard` | サポートされていません | Zilliz Cloud ではサポートされていません。 |
| [Autocomplete](https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/) | VARCHAR | 文字列として保存されます。 |
| [Geographic](https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/) | VARCHAR | 文字列として保存されます。 |
| [Rank](https://opensearch.org/docs/latest/field-types/supported-field-types/rank/) | VARCHAR | 文字列として保存されます。 |
| [Percolator](https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/) | VARCHAR | 文字列として保存されます。 |
| [Derived](https://opensearch.org/docs/latest/field-types/supported-field-types/derived/) | サポートされていません | Derived フィールドは Zilliz Cloud ではサポートされていません。 |
| [Star-tree](https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/) | サポートされていません | Star-tree フィールドは Zilliz Cloud ではサポートされていません。 |
| [Arrays](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays) | サポートされていません | Arrays は移行ではサポートされていません。 |
| [Multifields](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields) | サポートされていません | Multifields は移行ではサポートされていません。 |

## OpenSearch 固有の処理ルール\{#opensearch-specific-handling-rules}

### Collection の命名規則\{#collection-naming-rules}

OpenSearch の index 名は、以下の点を考慮して Zilliz Cloud に引き継がれます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| デフォルトの命名 | collection 名はソース index 名と完全に一致します | 名前は OpenSearch からそのまま保持されます |
| 特殊文字 | ハイフン（-）またはドット（.）を含む index 名はエラーの原因となり、ジョブを送信できません | index 名をアンダースコアまたはその他の有効な文字を使用するよう手動で変更してください |
| 命名の競合 | 同じ名前の collection がすでに存在する場合、ジョブを送信できません | 既存の collection を削除するか、別の database を選択するか、移行設定時に名前を変更してください |

### 移行時の考慮事項\{#migration-considerations}

以下の機能は、OpenSearch の移行では**サポートされていません**。

| 制限事項 | 影響 | 代替案 |
| --- | --- | --- |
| Dynamic から fixed フィールドへの変換 | 既存の dynamic フィールドを fixed 型に変換できません | フィールドは元の dynamic な性質を維持します |
| フィールドの追加 | 移行中に新しいフィールドを追加できません | 既存の Elasticsearch フィールドのみが移行されます |
| Sparse vectors | 現在のリリースではサポートされていません | dense vector の代替を検討するか、ロードマップについてサポートにお問い合わせください |
