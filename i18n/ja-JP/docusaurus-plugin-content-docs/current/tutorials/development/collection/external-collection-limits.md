---
title: "External Collection の制限 | Cloud"
slug: /external-collection-limits
sidebar_label: "External Collection の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は external collection の raw data を保存せず、外部データソースへの metadata と mapping のみを維持するため、external collection は読み取り専用です。そのため、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込み操作やメンテナンス操作を実行することはできません。 | Cloud"
type: origin
token: P9HuwHZyXilwRTkVoDBcjAMlnrb
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# External Collection の制限

Zilliz Cloud は external collection の raw data を保存せず、外部データソースへの metadata と mapping のみを維持するため、external collection は読み取り専用です。そのため、Zilliz Cloud 側から `insert`、`upsert`、`delete`、`import`、`flush`、`compact` などの書き込み操作やメンテナンス操作を実行することはできません。

managed collection と比較すると、external collection には次の制限があります。

- external collection にアクセスするには API key を使用する必要があります。

- Zilliz Cloud は primary key の一意性を強制せず、primary key または `AutoID` を設定することはできません。

- dynamic field を有効にすることはできません。

- partition を使用することはできません。そのため、partition key と  はサポートされていません。

- schema で functions を定義することはできません。

- BM25 を使用した text match は使用できません。

- 外部データをクエリ可能にするには、まず index を作成し、その後 `RefreshExternalCollection` を手動でトリガーして、Zilliz Cloud がデータの metadata と index を構築できるようにする必要があります。

- external collection では、backup、restore、migration は現在サポートされていません。

次の表は、external collection と managed collection でサポートされる操作を詳細に比較したものです。

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>マネージド Collection</strong></p><p>(Serving Cluster)</p></th>
     <th><p><strong>External Collection</strong></p><p>(Serving Cluster または Databases for On-Demand Compute)</p></th>
     <th><p><strong>マネージド Collection</strong></p><p>(On-Demand Compute Database)</p></th>
   </tr>
   <tr>
     <td rowspan="13"><p><strong>Collection 管理</strong></p></td>
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
     <td rowspan="2"><p><strong>Schema</strong></p></td>
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
     <td rowspan="3"><p><strong>Partition</strong></p></td>
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
     <td rowspan="3"><p><strong>Index</strong></p></td>
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
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Full-text Search/Text Match</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
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

