---
title: "PostgreSQLからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz CloudがPostgreSQLからの移行時にデータ型マッピング、コレクション名付け規則、および考慮事項をどのように処理するかについて説明します。 | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - postgresql
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# PostgreSQLからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudが[PostgreSQL](https://www.postgresql.org/)からの移行時にデータ型マッピング、コレクション名付け規則、および考慮事項をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

PostgreSQLからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### PostgreSQLの要件\{#postgresql-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースPostgreSQLデータベースがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>データベースアクセス</p></td>
     <td><p>有効なデータベースエンドポイント、ユーザー名、および必要な権限を持つパスワード</p></td>
   </tr>
   <tr>
     <td><p>pgvector拡張機能</p></td>
     <td><p>ベクターのデータ保存にpgvector拡張機能を使用する必要があるテーブル</p></td>
   </tr>
   <tr>
     <td><p>ベクターフール要件</p></td>
     <td><p>各ソーステーブルには少なくとも1つのベクターフールが含まれており、ベクターフールにはnull値を含めることはできません。</p></td>
   </tr>
   <tr>
     <td><p>データ可用性</p></td>
     <td><p>ソーステーブルにはデータが含まれている必要があります。空のテーブルは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザーロール</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスターキャパシティ</p></td>
     <td><p>十分なストレージおよびコンピュートリソース（必要CUサイズの見積もりには<a href="https://zilliz.com/pricing#calculator">CU計算機</a>を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IP</a>を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型マッピング\{#data-type-mapping}

PostgreSQLのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行計画にとって極めて重要です：

<table>
   <tr>
     <th><p>PostgreSQLフィールド型</p></th>
     <th><p>Zilliz Cloudフィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー / 自動ID</p></td>
     <td><ul><li><p><strong>単一フィールドのプライマリキー</strong>: ターゲットコレクションのプライマリキーとして直接マッピングされます。</p></li><li><p><strong>プライマリキーがない場合</strong>: ターゲットコレクションで自動IDが有効になり、プライマリキーのないテーブルをサポートします。</p></li><li><p><strong>複合プライマリキー:</strong> 自動IDが有効になります。複合キーは通常のスカラーのフィールドとして処理されます。</p><p>データを移行する際、自動IDを有効にすることもできます。ただし、その場合、ソースコレクションの元のプライマリキー値は破棄されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>ベクター次元数は変更されません。</p></td>
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

## PostgreSQL固有の処理ルール\{#postgresql-specific-handling-rules}

### コレクション名付けルール\{#collection-naming-rules}

PostgreSQLテーブル名は、以下の考慮事項でZilliz Cloudに転送されます：

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p><strong>デフォルトの名前付け</strong></p></td>
     <td><p>コレクション名はソーステーブル名と完全に一致します</p></td>
     <td><p>PostgreSQLからの名前がそのまま保持されます</p></td>
   </tr>
   <tr>
     <td><p><strong>命名競合</strong></p></td>
     <td><p>同じ名前のコレクションが既に存在する場合、ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除、異なるデータベースを選択、または移行構成中に名前を変更してください</p></td>
   </tr>
   <tr>
     <td><p><strong>コレクション名の変更</strong></p></td>
     <td><p>移行中にサポートされています</p></td>
     <td><p>移行構成プロセス中にコレクション名を変更できます</p></td>
   </tr>
</table>

### 移行時の考慮事項\{#migration-considerations}

以下の機能はPostgreSQL移行では**サポートされていません**：

<table>
   <tr>
     <th><p>制限</p></th>
     <th><p>影響</p></th>
     <th><p>代替案</p></th>
   </tr>
   <tr>
     <td><p>動的から固定フィールドへの変換</p></td>
     <td><p>既存の動的フィールドを固定型に変換できません</p></td>
     <td><p>フィールドは元の動的性質を維持します</p></td>
   </tr>
   <tr>
     <td><p>フィールドの追加</p></td>
     <td><p>移行中に新しいフィールドを追加できません</p></td>
     <td><p>既存のElasticsearchフィールドのみが移行されます</p></td>
   </tr>
</table>

