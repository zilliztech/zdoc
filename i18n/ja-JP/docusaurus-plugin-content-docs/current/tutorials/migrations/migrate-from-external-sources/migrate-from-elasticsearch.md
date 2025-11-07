---
title: "ElasticsearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Elasticsearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudがデータ型マッピング、コレクション名付け規則、およびElasticsearchからの移行時の考慮事項をどのように処理するかについて説明します。 | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 4
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - elasticsearch
  - 安価なベクターデータベース
  - 管理型ベクターデータベース
  - Pinecone ベクターデータベース
  - 音声検索

---

import Admonition from '@theme/Admonition';


# ElasticsearchからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudがデータ型マッピング、コレクション名付け規則、および[Elasticsearch](https://www.elastic.co/elasticsearch)からの移行時の考慮事項をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

ElasticsearchからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### Elasticsearchの要件\{#elasticsearch-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>バージョン互換性</p></td>
     <td><p>Elasticsearch 7.x以降</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースクラスターがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>適切な認証情報を持つ有効なクラスターのエンドポイントまたはクラウドID</p></td>
   </tr>
   <tr>
     <td><p>ベクターフール要件</p></td>
     <td><p>各ソースインデックスには少なくとも1つの密ベクターフールが含まれている必要があります</p></td>
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

Elasticsearchのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行計画において重要です：

<table>
   <tr>
     <th><p><strong>Elasticsearchフィールド型</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールド型</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー</p></td>
     <td><p>自動的にマッピングされます。新しいIDを生成するには自動IDを有効にしてください（元の値は破棄されます）。</p></td>
   </tr>
   <tr>
     <td><p>密集ベクター</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>ベクター次元数は変更されません。<strong>L2</strong>または<strong>IP</strong>をメトリクスタイプとして指定します。</p></td>
   </tr>
   <tr>
     <td><p>テキスト、文字列、キーワード、IP、日付、タイムスタンプ</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大長を設定します（1〜65,535バイト）。制限を超える文字列は移行エラーを引き起こす可能性があります。</p></td>
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
     <td><p>配列</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Elasticsearch固有の処理ルール\{#elasticsearch-specific-handling-rules}

### コレクション名付け規則\{#collection-naming-rules}

Elasticsearchのインデックス名は、以下の点を考慮してZilliz Cloudに転送されます：

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p>デフォルトの名前付け</p></td>
     <td><p>コレクション名はソースインデックス名と完全に一致します</p></td>
     <td><p>OpenSearchからの名前がそのまま保持されます</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>ハイフン（-）またはドット（.）を含むインデックス名はエラーを引き起こし、ジョブ送信を阻止します</p></td>
     <td><p>アンダースコアまたは他の有効な文字を使用するように手動でインデックス名を変更します</p></td>
   </tr>
   <tr>
     <td><p>名前衝突</p></td>
     <td><p>同じ名前のコレクションが既に存在する場合、ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除する、別のデータベースを選択する、または移行構成中に名前を変更します</p></td>
   </tr>
</table>

### 移行時の考慮事項\{#migration-considerations}

以下の機能はElasticsearch移行では**サポートされていません**：

<table>
   <tr>
     <th><p>制限</p></th>
     <th><p>影響</p></th>
     <th><p>代替手段</p></th>
   </tr>
   <tr>
     <td><p>動的から固定フィールドへの変換</p></td>
     <td><p>既存の動的フィールドを固定型に変換できません</p></td>
     <td><p>フィールドは元の動的性質を維持します</p></td>
   </tr>
   <tr>
     <td><p>フィールドの追加</p></td>
     <td><p>移行中に新しいフィールドを追加できません</p></td>
     <td><p>Elasticsearchに既存のフィールドのみが移行されます</p></td>
   </tr>
   <tr>
     <td><p>スパースベクター</p></td>
     <td><p>現在のリリースではサポートされていません</p></td>
     <td><p>密ベクターの代替案を検討するか、ロードマップについてサポートに連絡してください</p></td>
   </tr>
</table>

