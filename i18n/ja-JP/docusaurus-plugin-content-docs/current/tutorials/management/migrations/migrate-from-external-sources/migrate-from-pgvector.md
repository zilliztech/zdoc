---
title: "PostgreSQL から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、PostgreSQL から移行する際の Zilliz Cloud におけるデータ型マッピング、コレクションの命名規則、および注意事項について説明します。 | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# PostgreSQL から Zilliz Cloud への移行

このトピックでは、[PostgreSQL](https://www.postgresql.org/) から移行する際の Zilliz Cloud におけるデータ型マッピング、コレクションの命名規則、および注意事項について説明します。

## 前提条件\{#prerequisites}

PostgreSQL から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### PostgreSQL の要件\{#postgresql-requirements}

| 要件 | 詳細 |
| --- | --- |
| ネットワークアクセス | 移行元の PostgreSQL データベースがパブリックインターネットからアクセス可能であること |
| データベースアクセス | 必要な権限を持つ有効なデータベースエンドポイント、ユーザー名、パスワード |
| pgvector 拡張機能 | テーブルでベクトルデータの保存に pgvector 拡張機能が使用されていること |
| ベクトルフィールドの要件 | 各移行元テーブルに少なくとも 1 つのベクトルフィールドが含まれており、ベクトルフィールドに null 値が含まれていないこと |
| データの可用性 | 移行元テーブルにデータが含まれていること。空のテーブルは移行できません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加すること |

## データ型マッピング\{#data-type-mapping}

移行を計画する際は、PostgreSQL のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することが重要です。

<table>
   <tr>
     <th><p>PostgreSQL フィールド型</p></th>
     <th><p>Zilliz Cloud フィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key / Auto ID</p></td>
     <td><ul><li><p><strong>単一フィールドのプライマリキー</strong>: 移行先コレクションのプライマリキーとして直接マッピングされます。</p></li><li><p><strong>プライマリキーがない場合</strong>: プライマリキーのないテーブルに対応するため、移行先コレクションで Auto ID が有効になります。</p></li><li><p><strong>複合プライマリキー:</strong> Auto ID が有効になり、複合キーは通常のスカラーフィールドとして扱われます。</p></li></ul><p>データ移行時に Auto ID を有効にできますが、その場合は移行元コレクションの元のプライマリキー値が破棄されます。</p></td>
   </tr>
   <tr>
     <td><p>ベクトル</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>ベクトル次元は変更されません。</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納されます。</p></td>
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

PostgreSQL のテーブル名は、以下の点に留意して Zilliz Cloud に引き継がれます。

| シナリオ | 影響 | 解決策 |
| --- | --- | --- |
| **デフォルトの命名** | コレクション名は移行元のテーブル名と完全に一致します | PostgreSQL の名前がそのまま保持されます |
| **命名の競合** | 同名のコレクションが既に存在する場合、ジョブを送信できません | 既存のコレクションを削除するか、別のデータベースを選択するか、移行設定時に名前を変更してください |
| **コレクション名の変更** | 移行中にサポートされます | 移行の設定プロセス中にコレクション名を変更できます |

### 移行時の注意事項\{#migration-considerations}

PostgreSQL からの移行では、以下の機能は**サポートされていません**。

| 制限事項 | 影響 | 代替案 |
| --- | --- | --- |
| 動的フィールドから固定フィールドへの変換 | 既存の動的フィールドを固定型に変換することはできません | フィールドは元の動的な性質を維持します |
| フィールドの追加 | 移行中に新しいフィールドを追加することはできません | 既存の Elasticsearch フィールドのみが移行されます |

