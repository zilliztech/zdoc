---
title: "Tencent Cloud から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Tencent Cloud VectorDB から移行する際に、Zilliz Cloud がデータ型マッピング、JSON フィールド変換、collection 命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Tencent Cloud から Zilliz Cloud への移行

このトピックでは、[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb) から移行する際に、Zilliz Cloud がデータ型マッピング、JSON フィールド変換、collection 命名規則をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

Tencent Cloud VectorDB から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Tencent Cloud VectorDB の要件\{#tencent-cloud-vectordb-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソース VectorDB インスタンスはパブリックインターネットからアクセス可能である必要があります |
| API アクセス | 必要な権限を持つ有効なインスタンス URL と API key |
| データの可用性 | ソース collection にはデータが含まれている必要があります。空の collection は移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| cluster 容量 | 十分なストレージおよびコンピュートリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加してください |

## データ型マッピング\{#data-type-mapping}

Tencent Cloud VectorDB のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

| VectorDB フィールドタイプ | Zilliz Cloud フィールドタイプ | 説明 |
| --- | --- | --- |
| 主キー | VARCHAR (Primary key) | Tencent Cloud VectorDB の主キーは、Zilliz Cloud でも自動的に主キーとしてマッピングされます。<br/>データ移行時に Auto ID を有効にできます。ただし、有効にするとソース collection の元の主キー値は破棄されます。 |
| Dense vector | FLOAT_VECTOR | Dense vector フィールドは、変更不要で FLOAT_VECTOR として転送されます。 |
| JSON | JSON (dynamic fields) | デフォルトでは dynamic schema としてマッピングされ、固定フィールドに変換することもできます。<br/>詳細については [Dynamic Field](./enable-dynamic-field) を参照してください。 |

## JSON フィールド変換\{#json-field-conversion}

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud は JSON schema を検出するために 100 行をサンプリングします。必要に応じて追加のフィールドを手動で追加できます。

</Admonition>

Tencent Cloud VectorDB の JSON フィールドは、最大限の柔軟性を確保するため、最初は Zilliz Cloud の dynamic schema にマッピングされます。必要に応じて、JSON フィールドを固定フィールドに変換し、以下の利点を得ることができます。

- より強力な検証のためのデータ型の強制

- より優れたクエリパフォーマンスのための最適化された index

- 一貫したデータ管理のための構造化された schema

以下の JSON フィールドタイプは、dynamic から固定フィールドへ自動変換できます。

| VectorDB JSON タイプ | Zilliz 固定フィールドタイプ | 注記 |
| --- | --- | --- |
| string | VARCHAR | 最大 65,535 バイトをサポート |
| uint64 | INT32 | 型調整を伴う数値変換 |
| double | DOUBLE | 直接的な型変換 |
| array | ARRAY | 対応する要素型でサポート |

固定フィールドに変換された JSON フィールドについては、追加属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細については、[Default values](./nullable-fields) を参照してください。

- **Partition Key**: 必要に応じて、INT64 または VARCHAR フィールドを partition key として指定できます。各 collection では partition key を 1 つのみサポートし、選択したフィールドは nullable にできない点に注意してください。詳細については、[Use Partition Key](./use-partition-key) を参照してください。

## Tencent Cloud VectorDB 固有の処理ルール\{#tencent-cloud-vectordb-specific-handling-rules}

### Collection 命名規則\{#collection-naming-rules}

Tencent Cloud VectorDB の collection 名は、以下の点を考慮して Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| デフォルト命名 | collection 名はソース collection 名と完全に一致します | 名前は Tencent Cloud VectorDB からそのまま保持されます |
| 命名の競合 | 同じ名前の collection が database にすでに存在する場合、移行ジョブを送信できません | 既存の collection を削除するか、別のターゲット database を選択するか、移行設定時に名前を変更してください |
| 特殊文字 | collection 名は Qdrant からそのまま保持されます | collection 名が Zilliz Cloud の命名規則に準拠していることを確認してください |
