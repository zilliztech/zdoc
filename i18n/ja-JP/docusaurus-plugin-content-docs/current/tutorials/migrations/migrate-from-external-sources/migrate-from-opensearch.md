---
title: "OpenSearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "OpenSearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz CloudがOpenSearchからの移行時にデータ型マッピング、コレクション名付け規則、および考慮事項をどのように処理するかについて説明します。 | Cloud"
type: origin
token: VFMLwxpsniVGKYkE3DecmpQ2nrg
sidebar_position: 7
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - amazon
  - opensearch
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';


# OpenSearchからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudが[OpenSearch](https://opensearch.org/)からの移行時にデータ型マッピング、コレクション名付け規則、および考慮事項をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

OpenSearchからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### OpenSearchの要件\{#opensearch-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースOpenSearchクラスターがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>認証</p></td>
     <td><p>有効なクラスターエンドポイント、ユーザー名、およびパスワード（必要な権限を含む）</p></td>
   </tr>
   <tr>
     <td><p>ベクターフール要件</p></td>
     <td><p>各ソースインデックスには少なくとも1つのk-NNベクターフールが含まれている必要があります</p></td>
   </tr>
   <tr>
     <td><p>データ可用性</p></td>
     <td><p>ソースインデックスにデータが含まれている必要があります。空のインデックスは移行できません。</p></td>
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

以下の表は、OpenSearchのフィールドタイプがZilliz Cloudのフィールドタイプにどのようにマッピングされるかをまとめています。また、カスタマイズオプションの詳細も提供します。

<table>
   <tr>
     <th><p><strong>OpenSearchフィールドタイプ</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールドタイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー</p></td>
     <td><p>OpenSearchのプライマリキー（<a href="https://opensearch.org/docs/latest/field-types/metadata-fields/id/">_id</a>）は、Zilliz Cloudのプライマリキーとして自動的にマッピングされます。</p><p>データを移行する際、自動IDを有効にすることができます。ただし、この場合、ソーステーブルの元のプライマリキー値は破棄されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NNベクター</a></p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>OpenSearchの<code>float</code>ベクタータイプは、Zilliz Cloudの<code>FLOAT_VECTOR</code>にマッピングされます。OpenSearchのバイト/バイナリベクターは移行サポートされていません。</p><p>ベクター次元は変更されません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">エイリアス</a></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>エイリアスフィールドはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">バイナリ</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>バイナリデータはZilliz Cloudでは文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">数値</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>byte</code></p></td>
     <td><p>INT8</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p>DOUBLE</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>half_float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p><code>FLOAT</code>にマッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>integer</code></p></td>
     <td><p>INT32</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>long</code></p></td>
     <td><p>INT64</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>short</code></p></td>
     <td><p>INT16</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>unsigned_long</code></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><code>scaled_float</code></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">ブール</a></p></td>
     <td><p>BOOL</p></td>
     <td><p><code>true</code>または<code>false</code>を保存します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">日付</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。正しい形式変換を確保してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IPアドレス</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">範囲</a></p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">オブジェクト</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>nested</code></p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>flat_object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>join</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">文字列</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>keyword</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p><code>VARCHAR</code>にマッピングされます。</p></td>
   </tr>
   <tr>
     <td><p><code>match_only_text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>token_count</code></p></td>
     <td><p>INT32</p></td>
     <td><p>INT32として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><code>wildcard</code></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">オートコンプリート</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">地理的</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">ランク</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">パーコレーター</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">派生</a></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>派生フィールドはZilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">スターツリー</a></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>スターツリーフィールドはZilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays">配列</a></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>配列は移行サポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields">マルチフィールド</a></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>マルチフィールドは移行サポートされていません。</p></td>
   </tr>
</table>

## OpenSearch固有の処理ルール\{#opensearch-specific-handling-rules}

### コレクション名付けルール\{#collection-naming-rules}

OpenSearchインデックス名は、以下の考慮事項でZilliz Cloudに転送されます：

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p>デフォルトのネーミング</p></td>
     <td><p>コレクション名はソースインデックス名と完全に一致します</p></td>
     <td><p>OpenSearchからの名前をそのまま保持</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>ハイフン（-）またはドット（.）を含むインデックス名はエラーを引き起こし、ジョブ提出を妨げます</p></td>
     <td><p>アンダースコアまたはその他の有効な文字を使用するように手動でインデックス名を変更</p></td>
   </tr>
   <tr>
     <td><p>ネーミング競合</p></td>
     <td><p>同じ名前のコレクションが既に存在する場合、ジョブを提出できません</p></td>
     <td><p>既存のコレクションを削除、異なるデータベースを選択、または移行構成中に名前を変更してください</p></td>
   </tr>
</table>

### 移行時の考慮事項\{#migration-considerations}

以下の機能はOpenSearch移行では**サポートされていません**：

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
   <tr>
     <td><p>スパースベクター</p></td>
     <td><p>現在のリリースではサポートされていません</p></td>
     <td><p>密ベクターの代替案を検討するか、ロードマップについてはサポートに問い合わせてください</p></td>
   </tr>
</table>

