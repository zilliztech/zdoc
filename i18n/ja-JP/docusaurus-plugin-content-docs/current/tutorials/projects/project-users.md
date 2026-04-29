---
title: "プロジェクトユーザーの管理 | Cloud"
slug: /project-users
sidebar_key: project-users
sidebar_label: "プロジェクトユーザー"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、ユーザーをプロジェクトに招待し、職務に基づいてロールを割り当てることができます。これらのロールは、プロジェクトリソースへのアクセス権限と実行可能な操作を決定します。| Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - プロジェクトユーザー

---

import Admonition from '@theme/Admonition';


# プロジェクトユーザーの管理

Zilliz Cloud では、ユーザーをプロジェクトに招待し、職務に基づいてロールを割り当てることができます。これらのロールは、プロジェクトリソースへのアクセス権限と実行可能な操作を決定します。

本トピックでは、プロジェクトユーザーの管理方法について説明します。

## ユーザーをプロジェクトに招待する\{#invite-a-user-to-a-project}

ユーザーをプロジェクトに招待するには、**組織オーナー** または **プロジェクト管理者** である必要があります。

1. 招待したいユーザーのメールアドレスを入力します。

1. アクセス権限の割り当て方法を選択します：

    - [プロジェクト管理者](./project-users#project-admin) — プロジェクトとそのすべてのリソースに対する完全な制御権限を付与します。

    - カスタム [プロジェクトアクセスポリシー](./project-users#project-access) — プロジェクト内でのユーザーに対する特定の権限を設定します。

招待された受信者は、プロジェクトに参加するために 48 時間以内に承諾しなければならないメール招待を受け取ります。あるいは、Web コンソールから招待リンクをコピーして招待対象者と共有することもできます。

ユーザーがプロジェクトに参加すると、そのプロジェクトが所属する組織の 組織メンバー に自動的になります。

<Admonition type="info" icon="📘" title="Notes">

<p>毎回、同じロールを持つ 1 人以上のユーザーをプロジェクトに招待することができます。</p>

</Admonition>

### プロジェクト管理者\{#project-admin}

**プロジェクト管理者** ロールは、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限を持ちます。

### プロジェクトアクセス\{#project-access}

アクセス権限を最小限に抑えるために、招待されたユーザーに対してクラスターと ボリューム アクセスの詳細な権限を設定することもできます。

![Gs3jwYjb6hVbunbyASAcVUp3nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/Gs3jwYjb6hVbunbyASAcVUp3nIe.png)

- **クラスターアクセス**

    デフォルトでは、**Include all future clusters** オプションが有効になった状態で **All Clusters** へのアクセスが付与されます。**読み書き** などのロールを割り当てて、これらのクラスター全体における招待ユーザーの権限を定義できます。招待が承諾されると、ユーザーはプロジェクト内の現在および将来のすべてのクラスターに対して指定された権限を持ちます。

    アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。また、**Include all future clusters** オプションを無効にして、 newly created クラスターをアクセス範囲から除外することもできます。

    クラスターアクセスポリシーを追加するには、**+ Cluster Access** をクリックします。

- **ボリューム アクセス**

    デフォルトでは、**Include all future volumes** オプションが有効になった状態で **All ボリュームs** へのアクセスが付与されます。**読み書き** などのロールを割り当てて、これらのボリューム全体における招待ユーザーの権限を定義できます。招待が承諾されると、ユーザーはプロジェクト内の現在および将来のすべてのボリュームに対して指定された権限を持ちます。

    アクセスを制限するには、ドロップダウンから特定のボリュームを選択します。また、**Include all future volumes** オプションを無効にして、 newly created ボリュームをアクセス範囲から除外することもできます。

    クラスターアクセスポリシーを追加するには、**+ ボリューム Access** をクリックします。

**読み書き**、**読み取り専用**、および **Cluster Admin** ロールの具体的な権限については、以下のセクションをご覧ください。

#### 読み書き\{#read-write}

読み書き ロールは、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限を持ちます。

#### 読み取り専用\{#read-only}

読み取り専用 ロールは、プロジェクトとそのリソース（クラスター、データベース、コレクション）を表示する権限を持ちます。

#### Cluster Admin\{#cluster-admin}

Cluster Admin ロールは、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限を持ちます。

プロジェクト読み書き ロールの権限に加えて、Cluster Admin はクラスターのスケール、一時停止、再開などのクラスター操作を実行できます。

### プロジェクトロールとアクセスの比較\{#project-role-and-access-comparison}

以下の表は、異なるプロジェクトロールの権限を簡単に比較したものです。

**クラスター操作**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>Create Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Scale Cluster Query CU</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Scale Cluster Replica</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>一時停止 Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Resume Cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View Cluster List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View クラスターの詳細</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Cluster Metrics</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**クラスターユーザー**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Cluster User List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Reset the パスワード of a Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete Cluster User</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**監査ログ**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>Enable 監査ログ</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit 監査ログ 設定</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Disable 監査ログ</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View the Status of 監査ログ</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**データプレーン操作**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>Create Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>List/Describe Collection</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Insert/Upsert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Query/Search/Get</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Bulk Import</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>All other RESTful operations</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>Depends</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Cluster Admin と プロジェクト読み書き ロールは、同じデータプレーンの権限を共有します。</p>

</Admonition>

**バックアップと復元**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Backup List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Backup</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Restore a cluster backup file to a 新しいクラスター</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Restore a collection backup file to an existing cluster</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete cluster backup</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**ボリューム**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View ボリューム List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create ボリューム</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete ボリューム</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**移行**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Migration ジョブ</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Migration Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Cancel a Migration Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View the Details of a Migration Job (View Migrated Collections/データベースs)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**ジョブ**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Job List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Job Details</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Cancel Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Retry Job</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**プロジェクトアラート**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Alert List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Edit Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Delete Alert</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View Alert 履歴</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

**共同作業者**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>Invite Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit the ロール of a Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Remove Project Collaborator</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**クラスター IP ホワイトリスト**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Add IP Address to the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Modify IP Address in the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete IP Address from the Cluster IP Allowlist</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**プライベート エンドポイント**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View プライベート Endpoint List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create プライベート Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete プライベート Endpoint</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**CMEK**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View CMEK List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Add CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete CMEK</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

**統合**

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>プロジェクト管理者</strong></p></th>
     <th><p><strong>Cluster Admin</strong></p></th>
     <th><p><strong>プロジェクト読み書き</strong></p></th>
     <th><p><strong>プロジェクト読み取り専用</strong></p></th>
   </tr>
   <tr>
     <td><p>View Integrations List</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>View データdog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create データdog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Edit データdog 統合設定</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete データdog Integration</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>View ストレージ統合</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Create ストレージ統合</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Delete ストレージ統合</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

## 招待の取り消しまたは再送信\{#revoke-or-resend-an-invitation}

既存の組織メンバーを同じ組織内のプロジェクトに招待する場合、別途招待状を送らずとも自動的にプロジェクトへのアクセス権が付与されます。ただし、まだ所属していない組織内のプロジェクトに誰かを招待する場合、その組織に参加するための招待状が送られ、同時に指定されたプロジェクトへのアクセス権も付与されます。

![CKuxwsNxihJzNtbQ4fBc1xHRnxf](https://zdoc-images.s3.us-west-2.amazonaws.com/CKuxwsNxihJzNtbQ4fBc1xHRnxf.png)

招待を取り消したり再送信したりするには、**組織オーナー** または **プロジェクト管理者** である必要があります。

<Admonition type="info" icon="📘" title="Notes">

<p>ユーザーが招待を承諾する前に、招待を取り消したり再送信したりすることができます。</p>

</Admonition>

## 共同作業者のロールを編集する\{#edit-a-collaborators-role}

ユーザーが招待を承諾すると、プロジェクトの共同作業者になります。

共同作業者のロールを編集するには、**組織オーナー** または **プロジェクト管理者** である必要があります。

![DCvMwB44UhQdXRbmxdUc493ynJb](https://zdoc-images.s3.us-west-2.amazonaws.com/DCvMwB44UhQdXRbmxdUc493ynJb.png)

## 共同作業者を削除する\{#remove-a-collaborator}

プロジェクトの共同作業者を削除するには、**組織オーナー** または **プロジェクト管理者** である必要があります。

![HKpow0x7qheStnb0zcOcDlyunHc](https://zdoc-images.s3.us-west-2.amazonaws.com/HKpow0x7qheStnb0zcOcDlyunHc.png)

## プロジェクトから退出する\{#leave-a-project}

プロジェクトから共同作業者を削除するだけでなく、自分自身も退出することでプロジェクトから離れることができます。

![DTwiwN0AThgVZLb60dMcSblDnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/DTwiwN0AThgVZLb60dMcSblDnsb.png)

プロジェクトの唯一の管理者である場合、プロジェクトには常に少なくとも 1 人の プロジェクト管理者 が必要であるため、退出することはできません。

<Admonition type="caution" icon="🚧" title="Warning">

<p>プロジェクトから退出すると、プロジェクトおよび関連リソースへのアクセス権は取り消されます。</p>

</Admonition>

