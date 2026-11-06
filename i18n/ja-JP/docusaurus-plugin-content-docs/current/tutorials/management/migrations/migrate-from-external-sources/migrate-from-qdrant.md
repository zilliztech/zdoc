---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Qdrant から移行する際に Zilliz Cloud がデータ型マッピング、ペイロードフィールドの変換、コレクション命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

このトピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型マッピング、ペイロードフィールドの変換、コレクション命名規則をどのように処理するかについて説明します。

インデックス設定と移行後の手順については、[External Migration Basics](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、次の要件を満たしていることを確認してください。

### Qdrant の要件\{#qdrant-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソースの Qdrant クラスターにパブリックインターネットからアクセスできる必要があります。 |
| API アクセス | アクセス権限を持つクラスターエンドポイントと API キー |
| データの可用性 | ソースコレクションにデータが含まれている必要があります。空のコレクションは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズの見積もりには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用してください） |
| ネットワークアクセス | ネットワーク制限を使用する場合は、[Zilliz Cloud IP アドレス](./zilliz-cloud-ips) を許可リストに追加してください。 |

## データ型マッピング\{#data-type-mapping}

Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画を立てるうえで重要です。

| Qdrant のフィールド型 | Zilliz Cloud のフィールド型 | 注記 |
| --- | --- | --- |
| プライマリキー | VARCHAR（プライマリキー） | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にしてください（元の値は破棄されます）。 |
| 密ベクトル | FLOAT_VECTOR | 次元は正確に保持され、変更は不要です |
| スパースベクトル | SPARSE_FLOAT_VECTOR | サンプルデータ内で空でない場合にのみマッピングされます。 |
| ペイロード | JSON（動的フィールド） | デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。<br/>詳細は [Dynamic Field](./enable-dynamic-field) を参照してください。 |

## ペイロードフィールドの変換\{#payload-field-conversion}

<Admonition type="info" title="Notes">

Zilliz Cloud は、ペイロードスキーマを検出するために 100 行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。

</Admonition>

Qdrant のペイロードは、柔軟性を最大限に確保するため、最初は Zilliz Cloud の動的スキーマにマッピングされます。必要に応じて、ペイロードフィールドを固定フィールドに変換すると、次の利点が得られます。

- データ型が強制されるため、より強力な検証が可能になります

- インデックスが最適化されるため、クエリパフォーマンスが向上します

- スキーマが構造化されるため、一貫したデータ管理が可能になります

ペイロードを固定フィールドに変換する場合:

| Qdrant のペイロード型 | Zilliz の固定フィールド型 | 注記 |
| --- | --- | --- |
| 整数 | INT64 | 型が直接変換されます。 |
| 浮動小数点 | DOUBLE | すべての浮動小数点数が DOUBLE になります。 |
| 真偽値 | BOOL | 直接マッピングされます。 |
| キーワード | VARCHAR | 最大 65,535 バイトをサポートします。 |
| 地理情報 | JSON | JSON 構造として保持されます。固定フィールドには変換できません。 |
| 日時 | VARCHAR | 最大 65,535 バイトをサポートします。 |
| UUID | VARCHAR | 最大 65,535 バイトをサポートします。 |

### 配列型のサポート\{#array-type-support}

既存のペイロードデータでは配列型は検出されず、動的フィールドから変換することはできません。ただし、ほとんどの配列型は、移行設定中に新しいフィールドとして手動で追加できます。

| Qdrant の配列型 | Zilliz Cloud の配列型 | 手動追加の可否 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;Geo&gt; | サポートされていません | ❌ 利用できません |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ 新しいフィールドとして追加できます |

固定フィールドに変換されたペイロードフィールドでは、次の追加属性を設定できます。

- **Nullable**: フィールドが null 値を受け入れるかどうかを決定します。この機能はデフォルトで有効になっています。詳細は、[Nullable attribute](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#KL0mdOeSgoJtVfxQUvIcvGGenAd) を参照してください。

- **Default Value**: データがない場合に使用するフォールバック値を設定します。詳細は、[Default values](https://zilliverse.feishu.cn/wiki/DjROwgK6ziCf7Rkoji6ccyEUnsg#LuoQdz5asouWjbxkKbscpywSnaf) を参照してください。

- **Partition Key**: オプションで、INT64 または VARCHAR フィールドをパーティションキーとして指定できます。各コレクションがサポートするパーティションキーは 1 つのみで、選択したフィールドを Nullable にすることはできません。詳細は、[Use Partition Key](./use-partition-key) を参照してください。

## Qdrant 固有の処理ルール\{#qdrant-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

Qdrant のコレクション名は、次の点に注意して Zilliz Cloud に引き継がれます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| 名前の競合 | データベースに同じ名前のコレクションがすでに存在する場合、移行ジョブを送信できません | 既存のコレクションを削除するか、別のターゲットデータベースを選択するか、移行設定中に名前を変更してください |
| 特殊文字 | コレクション名は Qdrant からそのまま保持されます | コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください |
