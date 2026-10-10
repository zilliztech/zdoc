---
title: "Tencent Cloud から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Tencent Cloud VectorDB から移行する際に Zilliz Cloud がデータ型マッピング、JSON フィールド変換、コレクション命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Tencent Cloud から Zilliz Cloud への移行

このトピックでは、[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb) から移行する際に、Zilliz Cloud がデータ型マッピング、JSON フィールド変換、コレクション命名規則をどのように処理するかについて説明します。

インデックス設定と移行後の手順については、[External Migration Basics](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

Tencent Cloud VectorDB から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Tencent Cloud VectorDB の要件\{#tencent-cloud-vectordb-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソースの VectorDB インスタンスはパブリックインターネットからアクセス可能である必要があります。 |
| API アクセス | 必要な権限を持つ有効なインスタンス URL と API キー |
| データの可用性 | ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズの見積もりには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加してください。 |

## データ型マッピング\{#data-type-mapping}

Tencent Cloud VectorDB のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行を計画するうえで重要です。

| VectorDB フィールド型 | Zilliz Cloud フィールド型 | 説明 |
| --- | --- | --- |
| プライマリキー | VARCHAR（プライマリキー） | Tencent Cloud VectorDB のプライマリキーは、Zilliz Cloud のプライマリキーとして自動的にマッピングされます。<br/>データを移行する際に Auto ID を有効にできます。ただし、有効にすると、ソースコレクションの元のプライマリキー値は破棄されます。 |
| 密ベクトル | FLOAT_VECTOR | 密ベクトルフィールドは、変更を加えることなく FLOAT_VECTOR として転送されます。 |
| JSON | JSON（動的フィールド） | デフォルトでは動的スキーマとしてマッピングされ、固定フィールドに変換できます。<br/>詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。 |

## JSON フィールド変換\{#json-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud は JSON スキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Tencent Cloud VectorDB の JSON フィールドは、最大限の柔軟性を得るために、最初は Zilliz Cloud の動的スキーマにマッピングされます。オプションで JSON フィールドを固定フィールドに変換することで、次のものを得ることができます。

- より強力な検証のためのデータ型の適用

- より良いクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化されたスキーマ

次の JSON フィールド型は、動的フィールドから固定フィールドへ自動的に変換できます。

| VectorDB JSON 型 | Zilliz 固定フィールド型 | 注記 |
| --- | --- | --- |
| string | VARCHAR | 最大 65,535 バイトをサポート |
| uint64 | INT32 | 型調整を伴う数値変換 |
| double | DOUBLE | 直接的な型変換 |
| array | ARRAY | 対応する要素型でサポート |

固定フィールドに変換された JSON フィールドについては、追加の属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効になっています。詳細については、[Nullable attribute](./nullable-fields) を参照してください。

- **Default Value**: データが欠落している場合のフォールバック値を設定します。詳細については、[Default values](./nullable-fields) を参照してください。

- **Partition Key**: オプションで INT64 または VARCHAR フィールドをパーティションキーとして指定します。各コレクションがサポートするパーティションキーは 1つだけであり、選択したフィールドを nullable にできないことに注意してください。詳細については、[Use Partition Key](./use-partition-key) を参照してください。

## Tencent Cloud VectorDB 固有の処理規則\{#tencent-cloud-vectordb-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

Tencent Cloud VectorDB のコレクション名は、次の考慮事項を踏まえて Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| デフォルトの命名 | コレクション名はソースコレクション名と完全に一致します | 名前は Tencent Cloud VectorDB からそのまま保持されます |
| 命名の競合 | 同じ名前のコレクションがデータベースにすでに存在する場合、移行ジョブを送信できません | 既存のコレクションを削除するか、別のターゲットデータベースを選択するか、移行設定時に名前を変更します |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください |
