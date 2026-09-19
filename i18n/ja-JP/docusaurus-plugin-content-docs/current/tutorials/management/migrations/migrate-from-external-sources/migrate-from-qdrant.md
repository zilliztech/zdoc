---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Qdrant から移行する際に、Zilliz Cloud がデータ型マッピング、ペイロードフィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

このトピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型マッピング、ペイロードフィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。

## 事前準備\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

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
| クラスター容量 | 十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加します |

## データ型マッピング\{#data-type-mapping}

Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行を計画するうえで重要です。

| Qdrant のフィールド型 | Zilliz Cloud のフィールド型 | 備考 |
| --- | --- | --- |
| プライマリキー | VARCHAR（primary key） | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| 密ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です |
| スパースベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| ペイロード | JSON（動的フィールド） | デフォルトでは動的スキーマとしてマッピングされ、固定フィールドに変換できます。<br/>詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。 |

## ペイロードフィールドの変換\{#payload-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud は、ペイロードのスキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Qdrant のペイロードは、最大限の柔軟性を確保するために、まず Zilliz Cloud の動的スキーマにマッピングされます。必要に応じて、ペイロードフィールドを固定フィールドに変換すると、次の利点が得られます。

- より強力な検証のためのデータ型の強制

- より良いクエリパフォーマンスのための最適化されたインデックス作成

- 一貫したデータ管理のための構造化されたスキーマ

ペイロードを固定フィールドに変換する場合:

| Qdrant のペイロード型 | Zilliz の固定フィールド型 | 備考 |
| --- | --- | --- |
| Integer | INT64 | 直接的な型変換 |
| Float | DOUBLE | すべての浮動小数点数は DOUBLE になります |
| Bool | BOOL | 直接マッピング |
| Keyword | VARCHAR | 最大 65,535 バイトをサポート |
| Geo | JSON | JSON 構造として保持されます。固定フィールドには変換できません |
| Datetime | VARCHAR | 最大 65,535 バイトをサポート |
| UUID | VARCHAR | 最大 65,535 バイトをサポート |

### 配列型のサポート\{#array-type-support}

配列型は、既存のペイロードデータでは検出されず、動的フィールドから変換することもできません。ただし、ほとんどの配列型は、移行設定時に新しいフィールドとして手動で追加できます:

| Qdrant の配列型 | Zilliz Cloud の配列型 | 手動追加の可否 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Geo&gt; | サポート対象外 | ❌ 利用できません |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |

固定フィールドに変換されたペイロードフィールドには、以下の追加属性を設定できます:

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[Nullable 属性](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-fields) を参照してください。

- **Partition Key**: 必要に応じて、INT64 または VARCHAR フィールドをパーティションキーとして指定できます。各コレクションでサポートされるパーティションキーは 1つだけであり、選択したフィールドを null 許容にすることはできない点に注意してください。詳細については、[Partition Key の使用](./use-partition-key) を参照してください。

## Qdrant 固有の処理ルール\{#qdrant-specific-handling-rules}

### コレクションの命名規則\{#collection-naming-rules}

Qdrant のコレクション名は、以下の点を考慮して Zilliz Cloud に引き継がれます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| 命名の競合 | 同じ名前のコレクションがデータベースにすでに存在する場合、移行ジョブを送信できません | 既存のコレクションを削除するか、別のターゲットデータベースを選択するか、移行設定時に名前を変更してください |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください |
