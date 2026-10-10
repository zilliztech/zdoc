---
title: "PostgreSQL から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、PostgreSQL から移行する際に Zilliz Cloud がデータ型マッピング、コレクションの命名規則、および考慮事項をどのように処理するかについて説明します。 | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# PostgreSQL から Zilliz Cloud への移行

このトピックでは、[PostgreSQL](https://www.postgresql.org/) から移行する際に Zilliz Cloud がデータ型マッピング、コレクションの命名規則、および考慮事項をどのように処理するかについて説明します。

インデックス設定と移行後の手順については、[External Migration Basics](./external-migration-basics#index-settings) を参照してください。

## 事前準備\{#prerequisites}

PostgreSQL から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### PostgreSQL の要件\{#postgresql-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソースの PostgreSQL データベースは、パブリックインターネットからアクセスできる必要があります。 |
| データベースアクセス | 必要な権限を持つ有効なデータベースエンドポイント、ユーザー名、およびパスワード |
| pgvector 拡張機能 | テーブルは、ベクトルデータの保存に pgvector 拡張機能を使用する必要があります。 |
| ベクトルフィールドの要件 | 各ソーステーブルには少なくとも 1 つのベクトルフィールドが含まれている必要があり、ベクトルフィールドには null 値を含めることはできません。 |
| データの可用性 | ソーステーブルにはデータが含まれている必要があります。空のテーブルは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（CU サイズを見積もるには [CU 計算ツール](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用する場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加してください。 |

## データ型マッピング\{#data-type-mapping}

PostgreSQL のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行を計画するうえで重要です：

<table>
   <tr>
     <th><p>PostgreSQL のフィールド型</p></th>
     <th><p>Zilliz Cloud のフィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>主キー</p></td>
     <td><p>主キー / Auto ID</p></td>
     <td><ul><li><p><strong>単一フィールドの主キー</strong>：ターゲットコレクションの主キーとして直接マッピングされます。</p></li><li><p><strong>主キーが存在しない場合</strong>：主キーを持たないテーブルをサポートするため、ターゲットコレクションで Auto ID が有効になります。</p></li><li><p><strong>複合主キー：</strong>Auto ID が有効になり、複合キーは通常のスカラーフィールドとして扱われます。</p></li></ul><p>データを移行する際に Auto ID を有効にできます。ただし、有効にすると、ソースコレクションの元の主キー値は破棄されます。</p></td>
   </tr>
   <tr>
     <td><p>ベクトル</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>ベクトルの次元は変更されません。</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><ul><li></li></ul></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><ul><li></li></ul></td>
   </tr>
</table>

## PostgreSQL 固有の処理ルール\{#postgresql-specific-handling-rules}

### コレクションの命名規則\{#collection-naming-rules}

PostgreSQL のテーブル名は、以下の考慮事項を踏まえて Zilliz Cloud に転送されます：

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| **デフォルトの命名** | コレクション名はソーステーブル名と完全に一致します。 | 名前は PostgreSQL からそのまま保持されます。 |
| **命名の競合** | 同じ名前のコレクションがすでに存在する場合、ジョブを送信できません。 | 既存のコレクションを削除するか、別のデータベースを選択するか、移行構成時に名前を変更します。 |
| **コレクション名の変更** | 移行時にサポートされています。 | 移行構成プロセス中にコレクションの名前を変更できます。 |

### 移行時の考慮事項\{#migration-considerations}

PostgreSQL の移行では、以下の機能は**サポートされていません**：

| 制限事項 | 影響 | 代替方法 |
| --- | --- | --- |
| 動的フィールドから固定フィールドへの変換 | 既存の動的フィールドを固定型に変換できません。 | フィールドは元の動的な性質を維持します。 |
| フィールドの追加 | 移行中に新しいフィールドを追加できません。 | 既存の Elasticsearch フィールドのみが移行されます。 |

