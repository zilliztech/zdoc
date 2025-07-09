---
title: "ElasticsearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Elasticsearch"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、およびElasticsearchについてから移行する際の考慮事項を処理する方法について説明します。 | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';


# ElasticsearchからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、および[Elasticsearchについて](https://www.elastic.co/elasticsearch)から移行する際の考慮事項を処理する方法について説明します。

## 前提条件{#prerequisites}

ElasticsearchからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### Elasticsearchの要件{#elasticsearch-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>バージョンの互換性</p></td>
     <td><p>Elasticsearch 7. xまたはそれ以降</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースクラスターはパブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>適切な資格情報を持つ有効なクラスターエンドポイントまたはクラウドID</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>各ソースインデックスには少なくとも1つの密なベクトル場が含まれている必要があります</p></td>
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

ElasticsearchのデータタイプがZilliz Cloudにどのようにマッピングされるかを理解することは、移行を計画する上で重要です。

<table>
   <tr>
     <th><p><strong>Elasticsearchフィールドタイプ</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールドタイプ</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー</p></td>
     <td><p>自動的にマップされます。新しいIDを生成するためにAuto IDを有効にします(元の値は破棄されます)。</p></td>
   </tr>
   <tr>
     <td><p>密度ベクトル</p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>ベクトルの寸法は変更されません。メトリックタイプとして<strong>L2</strong>または<strong>IP</strong>を指定してください。</p></td>
   </tr>
   <tr>
     <td><p>テキスト、文字列、キーワード、ip、日付、タイムスタンプ</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大長を設定してください(1から65,535バイト)。制限を超える文字列は移行エラーを引き起こす可能性があります。</p></td>
   </tr>
   <tr>
     <td><p>長い</p></td>
     <td><p>INT 64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>整数</p></td>
     <td><p>INT 32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>短い</p></td>
     <td><p>INT 16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>バイト</p></td>
     <td><p>INT 8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ダブル</p></td>
     <td><p>ダブル</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>フロート</p></td>
     <td><p>フロート</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>オブジェクト</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>アレイ</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Elasticsearch-specific取り扱いルール{#elasticsearch-specific-handling-rules}

### コレクションの命名規則{#collection-naming-rules}

Elasticsearchのインデックス名は、以下の考慮事項を考慮してZilliz Cloudに転送されます。

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

以下の機能は、Elasticsearchの移行には**サポートされていません**。

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
