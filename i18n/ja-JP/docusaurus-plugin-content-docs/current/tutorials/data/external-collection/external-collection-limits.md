---
title: "外部コレクションの制限 | Cloud"
slug: /external-collection-limits
sidebar_key: external-collection-limits
sidebar_label: "制限"
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloud は外部コレクションの生データを保存せず、メタデータと外部データソースへのマッピングのみを保持するため、外部コレクションは読み取り専用です。その結果、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込みまたはメンテナンス操作を実行することはできません。"
type: origin
token: P9HuwHZyXilwRTkVoDBcjAMlnrb
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - external collection

---

import Admonition from '@theme/Admonition';


# 外部コレクションの制限

Zilliz Cloud は外部コレクションの生データを保存せず、メタデータと外部データソースへのマッピングのみを保持するため、外部コレクションは読み取り専用です。その結果、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込み操作やメンテナンス操作を実行することはできません。

マネージドコレクションと比較して、外部コレクションには以下の制限があります：

- 外部コレクションにアクセスするには API キーを使用する必要があります。

- Zilliz Cloud は主キーの一意性を強制せず、主キーまたは `AutoID` を設定することもできません。

- ダイナミックフィールドを有効にすることはできません。

- パーティションを使用することはできません。その結果、パーティションキーと  | Cloud はサポートされていません。

- 外部データをクエリ可能にするには、まずインデックスを作成し、次に手動で `RefreshExternalCollection` をトリガーして、Zilliz Cloud がデータのメタデータとインデックスを構築できるようにする必要があります。

- バックアップ、リストア、および移行は、現在、外部コレクションではサポートされていません。

- 外部コレクションを作成できるのは、On-Demand Compute データベースでのみです。Serving Dedicated クラスタでの外部コレクションの作成サポートは近日中に提供予定です。

以下の表は、外部コレクションとマネージドコレクションがサポートする操作を詳細に比較しています。

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>マネージドコレクション</strong></p><p>(Serving クラスタ)</p></th>
     <th><p><strong>外部コレクション</strong></p><p>(On-Demand Compute 用データベース)</p></th>
     <th><p><strong>マネージドコレクション</strong></p><p>(On-Demand Compute データベース)</p></th>
   </tr>
   <tr>
     <td rowspan="13"><p><strong>コレクション管理</strong></p></td>
     <td><p><strong>CreateCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DescribeCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>RenameCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>ダイナミックフィールド</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>主キー</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>自動ID</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>TTL</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>NULL許容/デフォルト値</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>ロードされたエンティティ</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>自動IDの挿入を許可</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>mmap</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>タイムゾーン</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>スキーマ</strong></p></td>
     <td><p><strong>AddField</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>AlterField</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>パーティション</strong></p></td>
     <td><p><strong>CreatePartition</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropPartition</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>パーティションキー</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="7"><p><strong>データ書き込み</strong></p></td>
     <td><p><strong>Insert</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Delete</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Upsert</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>BulkInsert / Import</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Flush</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>シャード</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Truncate</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>データ同期</strong></p></td>
     <td><p><strong>RefreshExternalCollection</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td><p><strong>GetRefreshProgress</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td><p><strong>ListRefreshジョブ</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>インデックス</strong></p></td>
     <td><p><strong>CreateIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>DescribeIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>Load/Release</strong></p></td>
     <td><p><strong>LoadCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>ReleaseCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p><strong>Search/Query</strong></p></td>
     <td><p><strong>Search</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Query</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>HybridSearch</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>関数</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>全文検索/テキスト一致</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>メンテナンス</strong></p></td>
     <td><p><strong>手動コンパクション</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>クラスタリングキー</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>バックアップとリストア</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>移行</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

