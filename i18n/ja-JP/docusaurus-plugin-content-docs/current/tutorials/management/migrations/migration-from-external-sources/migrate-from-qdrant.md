---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Qdrant から移行する際に、Zilliz Cloud がデータ型のマッピング、payload フィールド変換、コレクション命名規則をどのように扱うかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

このトピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型のマッピング、payload フィールド変換、コレクション命名規則をどのように扱うかについて説明します。

## 前提条件\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、次の要件を満たしていることを確認してください。

### Qdrant の要件\{#qdrant-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソース Qdrant クラスターはパブリックインターネットからアクセス可能である必要があります |
| API アクセス | アクセス権限を持つクラスターエンドポイントと API キー |
| データの可用性 | ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージおよびコンピュートリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加してください |

## データ型マッピング\{#data-type-mapping}

Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

| Qdrant フィールド型 | Zilliz Cloud フィールド型 | 注記 |
| --- | --- | --- |
| プライマリキー | VARCHAR (プライマリキー) | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| Dense vector | FLOAT_VECTOR | 次元はそのまま正確に保持され、変更は不要です |
| Sparse vector | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| Payload | JSON (動的フィールド) | デフォルトで動的スキーマとしてマッピングされ、固定フィールドに変換することもできます。<br/>詳細は [Dynamic Field](./enable-dynamic-field) を参照してください。 |

## Payload フィールド変換\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud は payload スキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Qdrant payload は、最大限の柔軟性を得るために、初期状態では Zilliz Cloud の動的スキーマにマッピングされます。必要に応じて payload フィールドを固定フィールドに変換し、次の利点を得ることができます。

- より強力な検証のためのデータ型の強制

- より良いクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化スキーマ

payload を固定フィールドに変換する場合:

| Qdrant Payload 型 | Zilliz 固定フィールド型 | 注記 |
| --- | --- | --- |
| Integer | INT64 | 直接的な型変換 |
| Float | DOUBLE | すべての float 数値は DOUBLE になります |
| Bool | BOOL | 直接マッピング |
| Keyword | VARCHAR | 最大 65,535 バイトをサポート |
| Geo | JSON | JSON 構造として保持されます。固定フィールドには変換できません |
| Datetime | VARCHAR | 最大 65,535 バイトをサポート |
| UUID | VARCHAR | 最大 65,535 バイトをサポート |

### Array 型のサポート\{#array-type-support}

Array 型は既存の payload データでは検出されず、動的フィールドから変換することはできません。ただし、ほとんどの array 型は移行設定中に新しいフィールドとして手動で追加できます。

| Qdrant Array 型 | Zilliz Cloud Array 型 | 手動追加の可否 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;Geo&gt; | サポートされていません | ❌ 利用不可 |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加可能 |

固定フィールドに変換された payload フィールドについては、追加属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細は [Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細は [Default values](./nullable-fields) を参照してください。

- **Partition Key**: 必要に応じて INT64 または VARCHAR フィールドをパーティションキーとして指定できます。各コレクションでサポートされるパーティションキーは 1 つのみであり、選択したフィールドは nullable にできないことに注意してください。詳細は [Use Partition Key](./use-partition-key) を参照してください。

## Qdrant 固有の処理ルール\{#qdrant-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

Qdrant のコレクション名は、次の点を考慮して Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| 命名の競合 | 同じ名前のコレクションがデータベースにすでに存在する場合、移行ジョブを送信できません | 既存のコレクションを削除する、別のターゲットデータベースを選択する、または移行設定中に名前を変更してください |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください |
