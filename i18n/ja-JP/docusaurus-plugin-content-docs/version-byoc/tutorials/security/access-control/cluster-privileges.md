---
title: "特権について | BYOC"
slug: /cluster-privileges
sidebar_label: "特権について"
beta: FALSE
notebook: FALSE
description: "特権とは、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。特権は役割に割り当てられ、ユーザーに付与され、ユーザーがリソースで実行できる操作を定義します。特権の例としては、`collection01`という名前のコレクションにデータを挿入する許可があります。 | BYOC"
type: origin
token: FVfVwmh72ieEF5kAPBzcZdj9nUe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - privileges
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm

---

import Admonition from '@theme/Admonition';


# 特権について

特権とは、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。特権は役割に割り当てられ、ユーザーに付与され、ユーザーがリソースで実行できる操作を定義します。特権の例としては、`collection_01`という名前のコレクションにデータを挿入する許可があります。

特権**グループ**は、個々の特権の組み合わせです。一般的に使用される特権の特権グループを作成して、役割の付与過程を簡素化できます。使いやすさのために、Zilliz Cloudはコレクション、データベース、クラスターレベルで合計9つの組み込み特権グループを提供しています。

次の図は、特権と特権グループのさまざまな付与過程を示しています。

![DZJ3wap77hAp4CbpIqBcFyRVnLd](/byoc/ja-JP/DZJ3wap77hAp4CbpIqBcFyRVnLd.png)

このトピックでは、Zilliz Cloudで利用可能な組み込みの特権グループと特権について詳しく説明します。

## 組み込みの特権グループ{#built-in-privilege-groups}

Zilliz Cloudには、コレクション、データベース、クラスターレベルで合計9つの権限グループが組み込まれており、[ロール作成](./cluster-roles)時に直接選択できます。

<Admonition type="info" icon="📘" title="ノート">

<p>組み込み特権グループの3つのレベルには、カスケード関係はありません。クラスターレベルで特権グループを設定しても、そのインスタンスのすべてのデータベースとコレクションの権限が自動的に設定されるわけではありません。データベースレベルとコレクションレベルの特権は手動で設定する必要があります。</p>

</Admonition>

### コレクションレベルの権限グループ{#collection-level-privilege-groups}

- **CollectionReadOnly(COLL_RO)**:コレクションデータを読み取る権限を含む

- **CollectionReadWrite(COLL_RW)**:コレクションデータを読み書きする権限を含みます

- **CollectionAdmin(COLL_ADMIN)**:コレクションデータを読み書きし、コレクションを管理する権限が含まれます。

次の表に、コレクションレベルの3つの組み込み特権グループに含まれる特定の特権を示します。

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>CollectionReadOnly</strong></p></th>
     <th><p><strong>CollectionReadWrite</strong></p></th>
     <th><p><strong>CollectionAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

### データベースレベルの権限グループ{#database-level-privilege-groups}

- **DatabaseReadOnly(DB_RO)**:データベースデータを読み取る権限を含みます

- **DatabaseReadWrite(DB_RW)**:データベースデータを読み書きする権限を含みます

- **DatabaseAdmin(DB_Admin)**:データベースデータを読み書きし、データベースを管理する権限が含まれています。

以下の表は、データベースレベルの3つの組み込み特権グループに含まれる特定の特権を示しています。

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>DatabaseReadOnly</strong></p></th>
     <th><p><strong>DatabaseReadWrite</strong></p></th>
     <th><p><strong>DatabaseAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

### クラスターレベルの特権グループ{#cluster-level-privilege-groups}

- **Cluster ReadOnly(Cluster_RO)**:インスタンスデータを読み取る権限を含みます

- **Cluster ReadWrite(Cluster_RW)**:インスタンスデータを読み書きする権限が含まれています

- **ClusterAdmin(Cluster_Admin)**:インスタンスデータを読み書きし、インスタンスを管理する権限が含まれます。

次の表に、クラスターレベルの3つの組み込み特権グループに含まれる特定の特権を示します。

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>ClusterReadOnly</strong></p></th>
     <th><p><strong>ClusterReadWrite</strong></p></th>
     <th><p><strong>ClusterAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

## すべての特権{#all-privileges}

以下は、Zilliz Cloudで利用可能なすべての権限です。

以下の権限を持つ独自の権限グループを作成する必要がある場合、または権限を持つカスタムロールを作成する必要がある場合は、[お問い合わせ](http://support.zilliz.com)ください。

### データベースの権限{#database-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>現在のインスタンスのすべてのデータベースを表示する</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>データベースの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>データベースを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>データベースを削除</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>データベースのプロパティを変更する</p></td>
   </tr>
</table>

### コレクション権限{#collection-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>コレクションフラッシュ操作の状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>コレクションのロード状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>コレクションの読み込み状況を確認する</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>コレクション権限を持つすべてのコレクションを表示する</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>コレクションのすべてのエイリアスを表示する</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>コレクションの詳細を見る</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>エイリアスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>コレクションの統計情報を取得する（例:コレクション内のエンティティの数）</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>コレクションを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>コレクションを削除する</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>コレクションをロードする</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>コレクションをリリースする</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>コレクション内のすべてのエンティティをシールされたセグメントに保持します。フラッシュ操作の後に挿入されたエンティティは、新しいセグメントに保存されます。</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>手動で圧縮をトリガーする</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>コレクションの名前を変更する</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>コレクションのエイリアスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>コレクションのエイリアスを削除する</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>データベース内のすべてのコレクションをフラッシュする</p></td>
   </tr>
</table>

### パーティションの権限{#partition-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認する</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>コレクション内のすべてのパーティションを表示する</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>パーティションを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>パーティションを削除する</p></td>
   </tr>
</table>

### インデックス権限{#index-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>インデックスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>インデックスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>インデックスを削除</p></td>
   </tr>
</table>

### リソース管理の権限{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>ロードバランスを実現する</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>リソースグループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>リソースグループを削除する</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>リソースグループを更新する</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>リソースグループの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>現在のインスタンスのすべてのリソースグループを表示する</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>リソースグループ間でノードを転送する</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>リソースグループ間でレプリカを転送する</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを作成してください</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを復元します</p></td>
   </tr>
</table>

### エンティティの権限{#entity-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>クエリを実行する</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>検索を行う</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>図形を挿入</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>エンティティを削除</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>図形をUpsert</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>一括挿入または図形のインポート</p></td>
   </tr>
</table>

### RBACの権限{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>特権プログラム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>ユーザーまたはロールを作成する</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>ユーザーのパスワードを更新する</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>ユーザーパスワードまたはロールを削除する</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>特定の役割が付与されたすべてのユーザーを表示する</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>ユーザーまたは役割を管理するか、ユーザーに役割を付与する</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>ユーザーに付与されたすべてのロールを表示する</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>特権グループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>特権グループを削除する</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>現在のインスタンスのすべての特権グループを表示する</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>特権グループに特権を追加または削除する</p></td>
   </tr>
</table>

