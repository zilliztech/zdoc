---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Qdrant から移行する際に、Zilliz Cloud がデータ型マッピング、payload フィールド変換、collection 命名ルールをどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

このトピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型マッピング、payload フィールド変換、collection 命名ルールをどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Qdrant の要件\{#qdrant-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソース Qdrant cluster はパブリックインターネットからアクセス可能である必要があります |
| API アクセス | アクセス権限を持つ cluster endpoint と API key |
| データの有無 | ソース collection にはデータが含まれている必要があります。空の collection は移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| cluster 容量 | 十分なストレージおよび計算リソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加します |

## データ型マッピング\{#data-type-mapping}

移行計画を立てるうえで、Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは重要です。

| Qdrant フィールド型 | Zilliz Cloud フィールド型 | 備考 |
| --- | --- | --- |
| Primary key | VARCHAR (primary key) | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| Dense vector | FLOAT_VECTOR | 次元はそのまま正確に保持され、変更は不要です |
| Sparse vector | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| Payload | JSON (dynamic fields) | デフォルトでは dynamic schema としてマッピングされ、固定フィールドに変換できます。<br/>詳細は [Dynamic Field](./enable-dynamic-field) を参照してください。 |

## Payload フィールド変換\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud は payload schema を検出するために 100 行をサンプリングします。必要に応じて追加のフィールドを手動で追加できます。

</Admonition>

Qdrant の payload は、最大限の柔軟性を得るために、最初は Zilliz Cloud の dynamic schema にマッピングされます。必要に応じて、payload フィールドを固定フィールドに変換して、以下の利点を得ることができます。

- より強力な検証のためのデータ型の強制

- より良いクエリパフォーマンスのための最適化された index

- 一貫したデータ管理のための構造化 schema

payload を固定フィールドに変換する場合:

| Qdrant Payload 型 | Zilliz 固定フィールド型 | 備考 |
| --- | --- | --- |
| Integer | INT64 | 直接的な型変換 |
| Float | DOUBLE | すべての浮動小数点数は DOUBLE になります |
| Bool | BOOL | 直接マッピング |
| Keyword | VARCHAR | 最大 65,535 バイトをサポート |
| Geo | JSON | JSON 構造として保持されます。固定フィールドには変換できません |
| Datetime | VARCHAR | 最大 65,535 バイトをサポート |
| UUID | VARCHAR | 最大 65,535 バイトをサポート |

### 配列型のサポート\{#array-type-support}

配列型は既存の payload データでは検出されず、dynamic fields から変換することもできません。ただし、ほとんどの配列型は移行設定時に新しいフィールドとして手動で追加できます。

| Qdrant 配列型 | Zilliz Cloud 配列型 | 手動追加の可否 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Geo&gt; | サポート対象外 | ❌ 利用不可 |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |

固定フィールドに変換された payload フィールドについては、追加の属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細は [Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細は [Default values](./nullable-fields) を参照してください。

- **Partition Key**: 必要に応じて INT64 または VARCHAR フィールドを partition key として指定できます。各 collection でサポートされる partition key は 1 つだけであり、選択したフィールドは nullable にできない点に注意してください。詳細は [Use Partition Key](./use-partition-key) を参照してください。

## Qdrant 固有の処理ルール\{#qdrant-specific-handling-rules}

### Collection 命名ルール\{#collection-naming-rules}

Qdrant の collection 名は、以下の点を考慮して Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| 命名の競合 | 同じ名前の collection が database にすでに存在する場合、移行ジョブを送信できません | 既存の collection を削除する、別のターゲット database を選択する、または移行設定中に名前を変更してください |
| 特殊文字 | collection 名は Qdrant からそのまま保持されます | collection 名が Zilliz Cloud の命名規則に準拠していることを確認してください |
