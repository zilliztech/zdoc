---
title: "Tencent Cloud から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Tencent Cloud VectorDB から移行する際に、Zilliz Cloud がデータ型のマッピング、JSON フィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Tencent Cloud から Zilliz Cloud への移行

このトピックでは、[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb) から移行する際に、Zilliz Cloud がデータ型のマッピング、JSON フィールドの変換、コレクションの命名規則をどのように処理するかについて説明します。

インデックス設定と移行後の手順については、[外部移行の基本](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

Tencent Cloud VectorDB から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Tencent Cloud VectorDB の要件\{#tencent-cloud-vectordb-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソースの VectorDB インスタンスは、パブリックインターネットからアクセスできる必要があります。 |
| API アクセス | 有効なインスタンス URL と、必要な権限を持つ API キーが必要です。 |
| データの可用性 | ソースコレクションにデータが含まれている必要があります。空のコレクションは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソースが必要です（[CU 計算ツール](https://zilliz.com/pricing#calculator) を使用して CU サイズを見積もってください）。 |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加してください。 |

## データ型のマッピング\{#data-type-mapping}

移行を計画するには、Tencent Cloud VectorDB のデータ型が Zilliz Cloud でどのようにマッピングされるかを理解することが重要です。

| VectorDB のフィールド型 | Zilliz Cloud のフィールド型 | 説明 |
| --- | --- | --- |
| プライマリキー | VARCHAR (Primary key) | Tencent Cloud VectorDB のプライマリキーは、Zilliz Cloud のプライマリキーとして自動的にマッピングされます。<br/>データを移行するときに Auto ID を有効にできます。ただし、有効にすると、ソースコレクションの元のプライマリキー値は破棄されます。 |
| 密ベクトル | FLOAT_VECTOR | 密ベクトルフィールドは FLOAT_VECTOR として転送され、変更は不要です。 |
| JSON | JSON (dynamic fields) | デフォルトでは動的スキーマとしてマッピングされ、固定フィールドに変換できます。<br/>詳細は、[動的フィールド](./enable-dynamic-field) を参照してください。 |

## JSON フィールドの変換\{#json-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud は、JSON スキーマを検出するために 100 行をサンプリングします。必要に応じて、フィールドを手動で追加できます。

</Admonition>

Tencent Cloud VectorDB の JSON フィールドは、最大限の柔軟性を確保するために、最初は Zilliz Cloud の動的スキーマにマッピングされます。JSON フィールドは、必要に応じて固定フィールドに変換することで、次の利点を得られます。

- データ型が強制されるため、より強力な検証が可能になります。

- インデックスが最適化され、クエリパフォーマンスが向上します。

- スキーマが構造化され、一貫したデータ管理が可能になります。

以下の JSON フィールド型は、動的フィールドから固定フィールドに自動的に変換できます。

| VectorDB の JSON 型 | Zilliz の固定フィールド型 | 注記 |
| --- | --- | --- |
| string | VARCHAR | 最大 65,535 バイトをサポートします。 |
| uint64 | INT32 | 型調整を伴う数値変換です。 |
| double | DOUBLE | 直接的な型変換です。 |
| array | ARRAY | 対応する要素型でサポートされます。 |

固定フィールドに変換された JSON フィールドでは、追加の属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れるかどうかを指定します。この機能はデフォルトで有効になっています。詳細は、[Nullable 属性](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#KL0mdOeSgoJtVfxQUvIcvGGenAd) を参照してください。

- **Default Value**: データが欠落している場合に使用するフォールバック値を設定します。詳細は、[デフォルト値](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#LuoQdz5asouWjbxkKbscpywSnaf) を参照してください。

- **Partition Key**: 必要に応じて、INT64 または VARCHAR フィールドをパーティションキーとして指定できます。各コレクションは 1つのパーティションキーのみをサポートし、選択したフィールドは Nullable にできません。詳細は、[パーティションキーの使用](./use-partition-key) を参照してください。

## Tencent Cloud VectorDB 固有の処理ルール\{#tencent-cloud-vectordb-specific-handling-rules}

### コレクションの命名規則\{#collection-naming-rules}

Tencent Cloud VectorDB のコレクション名は、次の点を考慮して Zilliz Cloud に転送されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| デフォルトの命名 | コレクション名はソースのコレクション名と完全に一致します。 | 名前は Tencent Cloud VectorDB からそのまま保持されます。 |
| 命名の競合 | 同じ名前のコレクションがデータベースにすでに存在する場合、移行ジョブを送信できません。 | 既存のコレクションを削除するか、別のターゲットデータベースを選択するか、移行設定時に名前を変更してください。 |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます。 | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください。 |
