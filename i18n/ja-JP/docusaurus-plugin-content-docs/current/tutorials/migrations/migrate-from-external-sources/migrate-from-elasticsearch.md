---
title: "Elasticsearch から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-elasticsearch
sidebar_key: migrate-from-elasticsearch
sidebar_label: "Elasticsearch"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Elasticsearch から移行する際のデータ型マッピング、コレクション命名規則、および考慮事項について説明します。| Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - elasticsearch

---

import Admonition from '@theme/Admonition';


# Elasticsearch から Zilliz Cloud への移行

このトピックでは、[Elasticsearch](https://www.elastic.co/elasticsearch) から移行する際のデータ型マッピング、コレクション命名規則、および考慮事項について Zilliz Cloud がどのように処理するかを説明します。

## 前提条件\{#prerequisites}

Elasticsearch から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Elasticsearch の要件\{#elasticsearch-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>バージョンの互換性</p></td>
     <td><p>Elasticsearch 7.x 以降</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースクラスターはパブリックインターネットからアクセス可能である必要があります</p></td>
   </tr>
   <tr>
     <td><p>API アクセス</p></td>
     <td><p>適切な認証情報を持つ有効なクラスターエンドポイントまたはクラウド ID</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>各ソースインデックスには、少なくとも 1 つの密ベクトルフィールドが含まれている必要があります</p></td>
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
     <td><p>十分なストレージおよび計算リソース（CU サイズを見積もるには<a href="https://zilliz.com/pricing#calculator">CU 計算ツール</a>を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a> を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型マッピング\{#data-type-mapping}

Elasticsearch のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

<table>
   <tr>
     <th><p><strong>Elasticsearch フィールド型</strong></p></th>
     <th><p><strong>Zilliz Cloud フィールド型</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>主キー</p></td>
     <td><p>主キー</p></td>
     <td><p>自動的にマッピングされます。自動ID を有効にすると新しい ID が生成されます（元の値は破棄されます）。</p></td>
   </tr>
   <tr>
     <td><p>dense_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>ベクトルの次元数は変更されません。メトリックタイプとして<strong>L2</strong>または<strong>IP</strong>を指定してください。</p></td>
   </tr>
   <tr>
     <td><p>text, string, keyword, ip, date, timestamp</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大長（1〜65,535 バイト）を設定してください。制限を超える文字列は移行エラーを引き起こす可能性があります。</p></td>
   </tr>
   <tr>
     <td><p>long</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>short</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>byte</p></td>
     <td><p>INT8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>float</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>object</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>arrays</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Elasticsearch 固有の処理規則\{#elasticsearch-specific-handling-rules}

### コレクション命名規則\{#collection-naming-rules}

Elasticsearch のインデックス名は、以下の考慮事項を踏まえて Zilliz Cloud に転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>デフォルトの命名</p></td>
     <td><p>コレクション名はソースインデックス名と完全に一致します</p></td>
     <td><p>名前は OpenSearch からそのまま保持されます</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>ハイフン (-) またはドット (.) を含むインデックス名はエラーを引き起こし、ジョブの送信を防ぎます</p></td>
     <td><p>手動でインデックス名をアンダースコアまたはその他の有効な文字に変更してください</p></td>
   </tr>
   <tr>
     <td><p>名前の競合</p></td>
     <td><p>同じ名前のコレクションが既に存在する場合、ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除する、別のデータベースを選択する、または移行設定中に名前を変更してください</p></td>
   </tr>
</table>

### 移行に関する考慮事項\{#migration-considerations}

以下の機能は、Elasticsearch からの移行では**サポートされていません**。

<table>
   <tr>
     <th><p>制限事項</p></th>
     <th><p>影響</p></th>
     <th><p>代替案</p></th>
   </tr>
   <tr>
     <td><p>動的フィールドから固定フィールドへの変換</p></td>
     <td><p>既存の動的フィールドを固定型に変換することはできません</p></td>
     <td><p>フィールドは元の動的性質を維持します</p></td>
   </tr>
   <tr>
     <td><p>フィールドの追加</p></td>
     <td><p>移行中に新しいフィールドを追加することはできません</p></td>
     <td><p>既存の Elasticsearch フィールドのみが移行されます</p></td>
   </tr>
   <tr>
     <td><p>スパースベクトル</p></td>
     <td><p>現在のリリースではサポートされていません</p></td>
     <td><p>密ベクトルの代替案を検討するか、ロードマップについてサポートにお問い合わせください</p></td>
   </tr>
</table>
