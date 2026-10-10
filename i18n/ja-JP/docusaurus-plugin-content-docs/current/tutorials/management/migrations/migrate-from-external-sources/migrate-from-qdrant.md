---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本トピックでは、Qdrant から移行する際に Zilliz Cloud がデータ型のマッピング、ペイロードフィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

本トピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型のマッピング、ペイロードフィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。

インデックス設定と移行後の手順については、[External Migration Basics](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Qdrant の要件\{#qdrant-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソースの Qdrant クラスターがパブリックインターネットからアクセスできる必要があります。 |
| API アクセス | アクセス権限を持つクラスターエンドポイントと API キー |
| データの可用性 | ソースのコレクションにデータが含まれている必要があります。空のコレクションは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズを見積もるには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用します） |
| ネットワークアクセス | ネットワーク制限を使用する場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加します。 |

## データ型のマッピング\{#data-type-mapping}

Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行を計画するうえで重要です。

| Qdrant のフィールド型 | Zilliz Cloud のフィールド型 | 備考 |
| --- | --- | --- |
| プライマリキー | VARCHAR（primary key） | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| 密ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です。 |
| スパースベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| ペイロード | JSON（動的フィールド） | デフォルトでは動的スキーマとしてマッピングされ、固定フィールドに変換することもできます。<br/>詳細は、[Dynamic Field](./enable-dynamic-field) を参照してください。 |

## ペイロードフィールドの変換\{#payload-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud は、ペイロードスキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Qdrant のペイロードは、最大限の柔軟性を確保するために、最初は Zilliz Cloud の動的スキーマにマッピングされます。必要に応じて、ペイロードフィールドを固定フィールドに変換することで、次の利点を得られます。

- より厳密な検証を実現するデータ型の適用

- クエリパフォーマンスを向上させるインデックスの最適化

- 一貫したデータ管理を実現する構造化されたスキーマ

ペイロードを固定フィールドに変換する場合、次のとおりです。

| Qdrant のペイロード型 | Zilliz の固定フィールド型 | 備考 |
| --- | --- | --- |
| 整数 | INT64 | 型を直接変換 |
| 浮動小数点数 | DOUBLE | すべての浮動小数点数が DOUBLE になります。 |
| ブール値 | BOOL | 直接マッピング |
| キーワード | VARCHAR | 最大 65,535 バイトをサポートします。 |
| 地理情報 | JSON | JSON 構造として保持されます。固定フィールドには変換できません。 |
| 日時 | VARCHAR | 最大 65,535 バイトをサポートします。 |
| UUID | VARCHAR | 最大 65,535 バイトをサポートします。 |

### 配列型のサポート\{#array-type-support}

配列型は既存のペイロードデータでは検出されず、動的フィールドから変換することはできません。ただし、ほとんどの配列型は、移行の構成時に新しいフィールドとして手動で追加できます。

| Qdrant の配列型 | Zilliz Cloud の配列型 | 手動追加の可否 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Geo&gt; | サポートされていません | ❌ 使用できません |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |

固定フィールドに変換されたペイロードフィールドでは、追加の属性を構成できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効になっています。詳細は、[Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合に使用するフォールバック値を設定します。詳細は、[Default values](./nullable-fields) を参照してください。

- **Partition Key**: 任意で INT64 または VARCHAR フィールドをパーティションキーとして指定します。各コレクションがサポートするパーティションキーは 1 つのみで、選択したフィールドは null 許容にできないことに注意してください。詳細は、[Use Partition Key](./use-partition-key) を参照してください。

## Qdrant 固有の処理ルール\{#qdrant-specific-handling-rules}

### コレクションの命名規則\{#collection-naming-rules}

Qdrant のコレクション名は、次の考慮事項を踏まえて Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| 命名の競合 | 同じ名前のコレクションがデータベースにすでに存在する場合、移行ジョブを送信できません | 既存のコレクションを削除するか、別のターゲットデータベースを選択するか、移行の構成時に名前を変更します |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認します |
