---
title: "外部コレクションの制限 | Cloud"
slug: /external-collection-limits
sidebar_label: "外部コレクションの制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は外部コレクションの生データを保存せず、外部データソースへのメタデータとマッピングのみを維持するため、外部コレクションは読み取り専用です。そのため、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込み操作やメンテナンス操作を実行することはできません。 | Cloud"
type: origin
token: P9HuwHZyXilwRTkVoDBcjAMlnrb
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 外部コレクションの制限

Zilliz Cloud は外部コレクションの生データを保存せず、外部データソースへのメタデータとマッピングのみを維持するため、外部コレクションは読み取り専用です。そのため、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込み操作やメンテナンス操作を実行することはできません。

マネージドコレクションと比較すると、外部コレクションには次の制限があります。

- 外部コレクションにアクセスするには API キーを使用する必要があります。

- Zilliz Cloud はプライマリキーの一意性を強制せず、プライマリキーまたは `AutoID` を設定することはできません。

- dynamic field を有効にすることはできません。

- パーティションを使用することはできません。そのため、パーティションキーと はサポートされていません。

- 外部データをクエリ可能にするには、まずインデックスを作成し、その後 `RefreshExternalCollection` を手動でトリガーして、Zilliz Cloud がそのデータのメタデータとインデックスを構築できるようにする必要があります。

- 外部コレクションでは、バックアップ、復元、移行は現在サポートされていません。

- 外部コレクションを作成できるのは、オンデマンドコンピューティング用データベースに限られます。サービング Dedicated クラスターでの外部コレクション作成サポートは、近日公開予定です。

次の表は、外部コレクションとマネージドコレクションでサポートされる操作を詳細に比較したものです。

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>マネージドコレクション</strong></p><p>（サービングクラスター）</p></th>
     <th><p><strong>外部コレクション</strong></p><p>（オンデマンドコンピューティング用データベース）</p></th>
     <th><p><strong>マネージドコレクション</strong></p><p>（オンデマンドコンピューティング用データベース）</p></th>
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
     <td><p><strong>Dynamic Field</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Primary Key</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Auto ID</strong></p></td>
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
     <td><p><strong>Nullable/Default Value</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Loaded Entities</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Allow Insert Auto ID</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>MMAP</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Timezone</strong></p></td>
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
     <td><p><strong>Partition Key</strong></p></td>
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
     <td><p><strong>Shard</strong></p></td>
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
     <td><p><strong>ListRefreshJobs</strong></p></td>
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
     <td><p><strong>Functions</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Full-text Search/Text Match</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>メンテナンス</strong></p></td>
     <td><p><strong>Manual Compaction</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Clustering Key</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Backup & restore</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Migration</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

