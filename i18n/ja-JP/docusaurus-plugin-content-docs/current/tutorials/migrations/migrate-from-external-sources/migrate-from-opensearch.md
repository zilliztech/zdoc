---
title: "Open SearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "OpenSearch"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、およびOpen Searchから移行する際の考慮事項を処理する方法について説明します。 | Cloud"
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
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database

---

import Admonition from '@theme/Admonition';


# Open SearchからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、および[Open Search](https://opensearch.org/)から移行する際の考慮事項を処理する方法について説明します。

## 前提条件{#prerequisites}

Open SearchからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### Open Searchの要件{#opensearch-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースOpen Searchクラスタは、パブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>認証プロセス</p></td>
     <td><p>必要な権限を持つ有効なクラスターエンドポイント、ユーザー名、およびパスワード</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>各ソースインデックスには少なくとも1つのk-NNベクトル場が含まれている必要があります</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>ソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザーの役割</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量</p></td>
     <td><p>十分なストレージとコンピューティングリソース(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用してCU体格を推定)</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用する場合は、許可リストに<a href="./zilliz-cloud-ips">Zilliz CloudのIPアドレス</a>を追加してください。</p></td>
   </tr>
</table>

## データ型マッピング{#data-type-mapping}

以下の表は、Open SearchのフィールドタイプがZilliz Cloudのフィールドタイプにマップされる方法と、カスタマイズオプションの詳細をまとめたものです。

<table>
   <tr>
     <th><p><strong>Open Searchフィールドタイプ</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールドタイプ</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー</p></td>
     <td><p>Zilliz Cloudでは、Open Searchの主キー（<a href="https://opensearch.org/docs/latest/field-types/metadata-fields/id/">ID</a>）が自動的に主キーとしてマップされます。</p><p>データを移行する際には、自動IDを有効にすることができます。ただし、そうすると、ソーステーブルの元の主キー値は破棄されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NNベクトル</a></p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>Open Searchの<code>float</code>ベクトルタイプは、Zilliz Cloud上の<code>FLOAT_VECTOR</code>にマップされます。Open Searchのバイト/バイナリベクトルは移行に対応していません。</p><p>ベクトルの寸法は変わりません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">エイリアス</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>エイリアスフィールドはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">バイナリ</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>バイナリデータは文字列としてZilliz Cloudに保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">数値の</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>INT 8</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ダブル</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>フロート</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>フロート</p></td>
     <td><p><code>FLOAT</code>にマップされます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>INT 32</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>INT 64</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>INT 16</p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">ブール値</a></p></td>
     <td><p>BOOL</p></td>
     <td><p><code>true</code>または<code>false</code>を格納します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">日付</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として保存されます。正しいフォーマット変換を確認してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IPアドレス</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
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
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON形式で保存されます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">ストリング</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>VARCHAR</p></td>
     <td><p><code>VARCHAR</code>にマップされましたこれが私の人生です。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>INT 32</p></td>
     <td><p>INT32として記憶される。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">オートコンプリート</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">地理的な</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">ランク</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">パーコレーター</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">派生した</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudでは派生フィールドはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">スターツリー</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>スターツリーフィールドはZilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays">配列</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>配列は移行ではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields">マルチフィールド</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>マルチフィールドは移行ではサポートされていません。</p></td>
   </tr>
</table>

## Open Search固有の処理ルール{#opensearch-specific-handling-rules}

### コレクションの命名規則{#collection-naming-rules}

以下の考慮事項を考慮して、Open Searchインデックス名がZilliz Cloudに転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>インパクト</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>デフォルトの命名</p></td>
     <td><p>コレクション名はソースインデックス名と完全に一致します</p></td>
     <td><p>名前はOpen Searchからそのまま保存されます</p></td>
   </tr>
   <tr>
     <td><p>特殊キャラクター</p></td>
     <td><p>ハイフン(-)またはドット(.)を含むインデックス名はエラーを引き起こし、ジョブの送信を防止します</p></td>
     <td><p>インデックスの名前を手動でアンダースコアやその他の有効な文字に変更する</p></td>
   </tr>
   <tr>
     <td><p>名前の衝突</p></td>
     <td><p>同じ名前のコレクションがすでに存在する場合、ジョブを送信できません</p></td>
     <td><p>移行設定中に既存のコレクションを削除するか、別のデータベースを選択するか、名前を変更してください</p></td>
   </tr>
</table>

### 移行に関する考慮事項{#migration-considerations}

以下の機能はOpen Searchの移行には**サポートされていません**:

<table>
   <tr>
     <th><p>制限</p></th>
     <th><p>インパクト</p></th>
     <th><p>オルタナティブ</p></th>
   </tr>
   <tr>
     <td><p>ダイナミックフィールドから固定フィールドへの変換</p></td>
     <td><p>既存の動的フィールドを固定型に変換できません</p></td>
     <td><p>フィールドは元の動的な性質を維持します</p></td>
   </tr>
   <tr>
     <td><p>フィールドを追加</p></td>
     <td><p>移行中に新しいフィールドを追加できません</p></td>
     <td><p>既存のElasticsearchフィールドのみが移行されます</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>現在のリリースではサポートされていません</p></td>
     <td><p>ロードマップには、密集したベクトルの代替案またはサポートに連絡することを検討してください</p></td>
   </tr>
</table>
