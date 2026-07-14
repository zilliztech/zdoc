---
title: "PostgreSQL から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、PostgreSQL から移行する際に、Zilliz Cloud がデータ型マッピング、collection の命名規則、および考慮事項をどのように処理するかについて説明します。 | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# PostgreSQL から Zilliz Cloud への移行

このトピックでは、[PostgreSQL](https://www.postgresql.org/) から移行する際に、Zilliz Cloud がデータ型マッピング、collection の命名規則、および考慮事項をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

PostgreSQL から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### PostgreSQL の要件\{#postgresql-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | ソース PostgreSQL データベースがパブリックインターネットからアクセス可能である必要があります |
| データベースアクセス | 必要な権限を持つ有効なデータベースエンドポイント、ユーザー名、およびパスワード |
| pgvector 拡張機能 | テーブルは vector データ保存のために pgvector 拡張機能を使用している必要があります |
| vector フィールド要件 | 各ソーステーブルには少なくとも 1 つの vector フィールドが含まれている必要があり、vector フィールドに null 値を含めることはできません。 |
| データの可用性 | ソーステーブルにはデータが含まれている必要があります。空のテーブルは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| cluster 容量 | 十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加してください |

## データ型マッピング\{#data-type-mapping}

PostgreSQL のデータ型がどのように Zilliz Cloud にマッピングされるかを理解することは、移行計画において重要です。

<table>
   <tr>
     <th><p>PostgreSQL フィールド型</p></th>
     <th><p>Zilliz Cloud フィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key / Auto ID</p></td>
     <td><ul><li><p><strong>単一フィールドの primary key</strong>: ターゲット collection の primary key として直接マッピングされます。</p></li><li><p><strong>primary key がない場合</strong>: primary key を持たないテーブルをサポートするために、ターゲット collection で Auto ID が有効になります。</p></li><li><p><strong>複合 primary key:</strong> Auto ID が有効になり、複合キーは通常の scalar フィールドとして扱われます。</p><p>データ移行時に、Auto ID を有効にすることができます。ただし、有効にした場合、ソース collection の元の primary key 値は破棄されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>vector の次元数は変更されません。</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## PostgreSQL 固有の処理ルール\{#postgresql-specific-handling-rules}

### collection の命名規則\{#collection-naming-rules}

PostgreSQL のテーブル名は、以下の点を考慮して Zilliz Cloud に移行されます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| **デフォルトの命名** | collection 名はソーステーブル名と完全に一致します | PostgreSQL からそのまま名前が保持されます |
| **命名の競合** | 同じ名前の collection がすでに存在する場合、ジョブを送信できません | 既存の collection を削除するか、別のデータベースを選択するか、移行設定中に名前を変更してください |
| **collection 名の変更** | 移行中にサポートされます | 移行設定プロセス中に collection 名を変更できます |

### 移行時の考慮事項\{#migration-considerations}

以下の機能は、PostgreSQL 移行では**サポートされていません**。

| 制限 | 影響 | 代替手段 |
| --- | --- | --- |
| Dynamic から fixed フィールドへの変換 | 既存の dynamic フィールドを fixed 型に変換できません | フィールドは元の dynamic の性質を維持します |
| フィールドの追加 | 移行中に新しいフィールドを追加できません | 既存の Elasticsearch フィールドのみが移行されます |

