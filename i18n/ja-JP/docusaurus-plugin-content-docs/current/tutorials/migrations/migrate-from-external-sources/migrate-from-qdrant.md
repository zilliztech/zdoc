---
title: "Qdrant から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_key: migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Qdrant から移行する際に Zilliz Cloud がデータ型のマッピング、ペイロードフィールドの変換、およびコレクションの命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - qdrant

---

import Admonition from '@theme/Admonition';


# Qdrant から Zilliz Cloud への移行

このトピックでは、[Qdrant](https://qdrant.tech/) から移行する際に、Zilliz Cloud がデータ型のマッピング、ペイロードフィールドの変換、およびコレクション命名規則をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

Qdrant から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Qdrant の要件\{#qdrant-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソース Qdrant クラスターはパブリックインターネットからアクセス可能である必要があります</p></td>
   </tr>
   <tr>
     <td><p>API アクセス</p></td>
     <td><p>アクセス権限を持つクラスターエンドポイントと API キー</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

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
     <td><p>クラスター容量</p></td>
     <td><p>十分なストレージおよびコンピューティングリソース（CU サイズの見積もりには<a href="https://zilliz.com/pricing#calculator">CU 計算機</a>を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a>を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型のマッピング\{#data-type-mapping}

Qdrant のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

<table>
   <tr>
     <th><p>Qdrant フィールド型</p></th>
     <th><p>Zilliz Cloud フィールド型</p></th>
     <th><p>注記</p></th>
   </tr>
   <tr>
     <td><p>主キー</p></td>
     <td><p>VARCHAR (主キー)</p></td>
     <td><p>自動的にマッピングされます。新しい ID を生成するには自動 ID を有効にしてください（元の値は破棄されます）。</p></td>
   </tr>
   <tr>
     <td><p>密ベクトル</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>次元数はそのまま保持され、変更は不要です</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>サンプルデータで空でない場合にのみマッピングされます。</p></td>
   </tr>
   <tr>
     <td><p>ペイロード</p></td>
     <td><p>JSON (動的フィールド)</p></td>
     <td><p>デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換することも可能です。</p><p>詳細については、<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
</table>

## ペイロードフィールドの変換\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud はペイロードスキーマを検出するために 100 行をサンプリングします。必要に応じて手動で追加のフィールドを追加できます。</p>

</Admonition>

Qdrant のペイロードは、最大限の柔軟性のために当初 Zilliz Cloud の動的スキーマにマッピングされます。オプションでペイロードフィールドを固定フィールドに変換することで、以下のような利点を得られます。

- より強力な検証のためのデータ型の強制
- より良いクエリパフォーマンスのための最適化されたインデックス
- 一貫したデータ管理のための構造化されたスキーマ

ペイロードを固定フィールドに変換する場合：

<table>
   <tr>
     <th><p>Qdrant ペイロード型</p></th>
     <th><p>Zilliz 固定フィールド型</p></th>
     <th><p>注記</p></th>
   </tr>
   <tr>
     <td><p>Integer</p></td>
     <td><p>INT64</p></td>
     <td><p>直接的な型変換</p></td>
   </tr>
   <tr>
     <td><p>Float</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>すべての浮動小数点数は DOUBLE になります</p></td>
   </tr>
   <tr>
     <td><p>Bool</p></td>
     <td><p>BOOL</p></td>
     <td><p>直接的なマッピング</p></td>
   </tr>
   <tr>
     <td><p>キーword</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大 65,535 バイトまでサポート</p></td>
   </tr>
   <tr>
     <td><p>Geo</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON 構造として保持されます。固定フィールドに変換することはできません</p></td>
   </tr>
   <tr>
     <td><p>Datetime</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大 65,535 バイトまでサポート</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大 65,535 バイトまでサポート</p></td>
   </tr>
</table>

### 配列型のサポート\{#array-type-support}

既存のペイロードデータでは配列型は検出されず、動的フィールドから変換することはできません。ただし、ほとんどの配列型は移行設定中に新しいフィールドとして手動で追加できます。

<table>
   <tr>
     <th><p>Qdrant 配列型</p></th>
     <th><p>Zilliz Cloud 配列型</p></th>
     <th><p>手動追加の可否</p></th>
   </tr>
   <tr>
     <td><p>配列&lt;Integer&gt;</p></td>
     <td><p>ARRAY&lt;INT64&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;Float&gt;</p></td>
     <td><p>ARRAY&lt;DOUBLE&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;Bool&gt;</p></td>
     <td><p>ARRAY&lt;BOOL&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;キーword&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;Geo&gt;</p></td>
     <td><p>非サポート</p></td>
     <td><p>❌ 利用不可</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;Datetime&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列&lt;UUID&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
</table>

固定フィールドに変換されたペイロードフィールドについては、追加の属性を設定できます。

- **NULL 許容**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[NULL 許容属性](./nullable-fields) を参照してください。

- **デフォルト値**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-fields) を参照してください。

- **パーティションキー**: オプションで INT64 または VARCHAR フィールドをパーティションキーとして指定できます。各コレクションは 1 つのパーティションキーのみをサポートしており、選択されたフィールドは NULL 許容であってはならないことに注意してください。詳細については、[パーティションキーの使用](./use-partition-key) を参照してください。

## Qdrant 固有の処理規則\{#qdrant-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

Qdrant のコレクション名は、以下の考慮事項を踏まえて Zilliz Cloud に転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>名前の競合</p></td>
     <td><p>データベース内に同じ名前のコレクションが既に存在する場合、移行ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除する、異なるターゲットデータベースを選択する、または移行設定中に名前を変更する</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>コレクション名は Qdrant からそのまま保持されます</p></td>
     <td><p>コレクション名が Zilliz Cloud の命名規則に準拠していることを確認してください</p></td>
   </tr>
</table>
