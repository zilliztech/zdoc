---
title: "Cluster Role の管理（コンソール） | Cloud"
slug: /cluster-roles
sidebar_label: "Cluster Role の管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cluster Role は、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster role は cluster、database、および collection レベルでの cluster user の権限を制御します。 | Cloud"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Cluster Role の管理（コンソール）

Cluster Role は、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster role は cluster、database、および collection レベルでの cluster user の権限を制御します。

Zilliz Cloud は 2 種類の cluster role を提供しています。built-in role と custom role です。 

cluster role を管理するには、**Organization Owner**、**Project Admin**、または **Cluster_Admin** 権限を持つ role が必要です。

## 組み込み cluster role\{#built-in-cluster-roles}

Zilliz Cloud は、vector database system で一般的に必要とされる異なる権限を持つ 3 つの組み込み cluster role を提供しています。組み込み role は編集または削除できません。

- **Admin**: Cluster Admin role は、cluster とそのすべてのリソース（databases、collections）を管理するための完全な権限を持ちます。

    次の表は、この role に対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>cluster のプロパティ（CU サイズ、Replica 数、auto-scale）を管理する</p></li><li><p>collections と indexes を管理する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster users と roles を管理する</p></li><li><p>cluster backups を管理する</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべての index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべての partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべての vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべての alias 操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべての role 操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべての user 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**: Cluster Read-Write role は、cluster を表示し、そのすべてのリソース（databases、collections）を管理する権限を持ちます。

    次の表は、この role に対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>collections と indexes を管理する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster users と roles を表示する</p></li><li><p>cluster backups を表示する</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべての index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべての partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべての vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべての alias 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**: Cluster Read-Only role は、cluster とそのリソース（databases、collections）を表示する権限を持ちます。

    次の表は、この role に対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>collections と indexes を表示する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster users と roles を表示する</p></li><li><p>cluster backups を表示する</p></li></ul></td>
         <td><ul><li><p>collection 操作の一部</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe Collection</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get Collection Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get Collection Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has Collection</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List Collections</a></p></li></ul></li><li><p>index 操作の一部</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe Index</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List Indexes</a></p></li></ul></li><li><p>partition 操作の一部</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List Partitions</a></p></li></ul></li><li><p>alias 操作の一部</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe Alias</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List Aliases</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## Custom cluster role\{#custom-cluster-roles}

Custom role は、事前定義されたアクセスを提供する built-in role とは異なり、cluster、database、および collection レベルでカスタマイズされた権限を付与する柔軟性を提供します。 

collection レベルのアクセス制御には、custom role を作成することを推奨します。

<Admonition type="info" icon="📘" title="注意">

この機能は Dedicated cluster でのみ利用できます。

現在、Zilliz Cloud は Web コンソール上で built-in privilege group を使用した custom role の作成のみをサポートしています。特定の権限または custom privilege group を使用して custom role を作成する必要がある場合は、まず [サポートチケットを作成](http://support.zilliz.com) してください。こちらでこの機能を有効化します。機能が有効化された後、SDK を使用して [custom privilege group を作成](./cluster-privileges#custom-privilege-groups) できます。

</Admonition>

## Custom cluster role を作成する\{#create-a-custom-cluster-role}

<Procedures>

1. 対象 cluster の **Roles** タブに移動します。**+ Cluster Role** をクリックします。

    ![add-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/add-cluster-role.png "add-cluster-role")

1. role 名と説明（任意）を入力します。

1. collection、database、および cluster レベルで権限を設定します。built-in privilege group を選択してから、対象リソースを選択します。 

    Zilliz Cloud は合計 9 個の built-in privilege group を提供しています。 

    - Collection Privilege Group: Admin (`COLL_ADMIN`), Read-Write (`COLL_RW`), Read-Only (`COLL_RO`)

    - Database Privilege Group: Admin (`DB_Admin`), Read-Write (`DB_RW`), Read-Only (`DB_RO`)

    - Cluster Privilege Group: Admin (`Cluster_Admin`), Read-Write (`Cluster_RW`), Read-Only (`Cluster_RO`)

    <Admonition type="info" icon="📘" title="注意">

    3 つのレベルの built-in privilege group にはカスケード関係はありません。インスタンスレベルで built-in privilege group を設定しても、そのインスタンス配下のすべての databases と collections に対する権限が自動的に設定されるわけではありません。database レベルおよび collection レベルの権限は手動で設定する必要があります。

    </Admonition>

    各 built-in privilege group に含まれる具体的な権限の詳細については、[Privileges & Privilege Groups](./cluster-privileges#built-in-privilege-groups) を参照してください。

    ![CWALbSrKOo56DPxID45c7Jjgn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/cwalbsrkoo56dpxid45c7jjgn9c.png "CWALbSrKOo56DPxID45c7Jjgn9c")

1. **Create** をクリックします。各 cluster には最大 500 個の custom cluster role を作成できます。

</Procedures>

## ユーザーに role を付与する\{#grant-a-role-to-a-user}

cluster role を作成した後、それをユーザーに付与できます。Users タブに移動し、[新しい cluster user を作成](./cluster-users#create-a-cluster-user) するとき、または [既存の cluster user の role を編集](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) するときに role を付与します。

![grant-role-to-user](https://zdoc-images.s3.us-west-2.amazonaws.com/grant-role-to-user.png "grant-role-to-user")

## ユーザーから role を取り消す\{#revoke-a-role-from-a-user}

cluster role がユーザーに適さなくなった場合、その role を取り消すことができます。Users タブに移動し、対象ユーザーを見つけて、[edit role](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) をクリックします。ダイアログボックスで別の role を選択します。 

![revoke-role-from-user](https://zdoc-images.s3.us-west-2.amazonaws.com/revoke-role-from-user.png "revoke-role-from-user")

## Custom cluster role を編集する\{#edit-a-custom-cluster-role}

Custom cluster role の権限を調整できます。調整内容は、この role を付与されているすべてのユーザーに適用されます。

![edit-custom-role](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-custom-role.png "edit-custom-role")

## Custom cluster role を削除する\{#delete-a-custom-cluster-role}

role が不要になった場合、custom cluster role を削除できます。

ユーザーに付与されている role は削除できません。まず対象 role を付与されているユーザーを特定し、その後それらのユーザーに別の role を割り当てる必要があります。 

![delete-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-cluster-role.png "delete-cluster-role")

