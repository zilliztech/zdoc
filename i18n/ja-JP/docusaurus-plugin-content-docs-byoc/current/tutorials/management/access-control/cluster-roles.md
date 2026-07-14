---
title: "Cluster Role を管理する（Console） | BYOC"
slug: /cluster-roles
sidebar_label: "Cluster Role を管理する（Console）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "cluster role は、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster role は cluster ユーザーの cluster、database、collection レベルでの権限を制御します。 | BYOC"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Cluster Role を管理する（Console）

cluster role は、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster role は cluster ユーザーの cluster、database、collection レベルでの権限を制御します。

Zilliz Cloud は 2 種類の cluster role を提供しています: 組み込みロールとカスタムロールです。 

cluster role を管理するには、**Organization Owner**、**Project Admin**、または **Cluster_Admin** 権限を持つロールである必要があります。

## 組み込み cluster role\{#built-in-cluster-roles}

Zilliz Cloud は、vector database system で一般的に必要となる異なる権限を持つ 3 つの組み込み cluster role を提供しています。組み込みロールは編集または削除できません。

- **Admin**: Cluster Admin ロールには、cluster とそのすべてのリソース（databases、collections）を管理するための完全な権限があります。

    次の表は、このロールに対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>cluster のプロパティ（CU サイズ、レプリカ数、自動スケール）を管理する</p></li><li><p>collections と indexes を管理する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster ユーザーとロールを管理する</p></li><li><p>cluster バックアップを管理する</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべての index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべての partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべての vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべての alias 操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべての role 操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべての user 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**: Cluster Read-Write ロールには、cluster を表示し、そのすべてのリソース（databases、collections）を管理する権限があります。

    次の表は、このロールに対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>collections と indexes を管理する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster ユーザーとロールを表示する</p></li><li><p>cluster バックアップを表示する</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべての collection 操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべての index 操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべての partition 操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべての vector 操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべての alias 操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**: Cluster Read-Only ロールには、cluster とそのリソース（databases、collections）を表示する権限があります。

    次の表は、このロールに対応する UI 権限と API 権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>collections と indexes を表示する</p></li><li><p>cluster メトリクスを表示する</p></li><li><p>cluster ユーザーとロールを表示する</p></li><li><p>cluster バックアップを表示する</p></li></ul></td>
         <td><ul><li><p>一部の collection 操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe Collection</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get Collection Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get Collection Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has Collection</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List Collections</a></p></li></ul></li><li><p>一部の index 操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe Index</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List Indexes</a></p></li></ul></li><li><p>一部の partition 操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List Partitions</a></p></li></ul></li><li><p>一部の alias 操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe Alias</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List Aliases</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタム cluster role\{#custom-cluster-roles}

カスタムロールは、事前定義されたアクセスを提供する組み込みロールとは異なり、cluster、database、collection レベルで柔軟にカスタマイズされた権限を付与できます。 

collection レベルのアクセス制御には、カスタムロールを作成することを推奨します。

<Admonition type="info" icon="📘" title="Notes">

この機能は Dedicated cluster でのみ利用できます。

現在、Zilliz Cloud は web console 上で、組み込み privilege group を使用したカスタムロールの作成のみをサポートしています。特定の権限やカスタム privilege group を使用してカスタムロールを作成する必要がある場合は、まず [support ticket を作成](http://support.zilliz.com) して、この機能を有効にできるようにしてください。機能が有効になると、SDK を使用して [custom privilege group を作成](./cluster-privileges#custom-privilege-groups) できます。

</Admonition>

## カスタム cluster role を作成する\{#create-a-custom-cluster-role}

<Procedures>

1. 対象 cluster の **Roles** タブに移動します。**+ Cluster Role** をクリックします。

    ![add-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/add-cluster-role.png "add-cluster-role")

1. ロール名と説明（任意）を入力します。

1. collection、database、cluster レベルで権限を設定します。組み込み privilege group を選択し、次に対象リソースを選択します。 

    Zilliz Cloud は合計 9 個の組み込み privilege group を提供しています。 

    - Collection Privilege Group: Admin (`COLL_ADMIN`)、Read-Write (`COLL_RW`)、Read-Only (`COLL_RO`)

    - Database Privilege Group: Admin (`DB_Admin`)、Read-Write (`DB_RW`)、Read-Only (`DB_RO`)

    - Cluster Privilege Group: Admin (`Cluster_Admin`)、Read-Write (`Cluster_RW`)、Read-Only (`Cluster_RO`)

    <Admonition type="info" icon="📘" title="Notes">

    組み込み privilege group の 3 つのレベルにはカスケード関係はありません。instance レベルで組み込み privilege group を設定しても、その instance 配下のすべての databases と collections に対する権限が自動的に設定されるわけではありません。database レベルと collection レベルの権限は手動で設定する必要があります。

    </Admonition>

    各組み込み privilege group の具体的な権限については、[Privileges & Privilege Groups](./cluster-privileges#built-in-privilege-groups) を参照してください。

    ![CWALbSrKOo56DPxID45c7Jjgn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/cwalbsrkoo56dpxid45c7jjgn9c.png "CWALbSrKOo56DPxID45c7Jjgn9c")

1. **Create** をクリックします。各 cluster には最大 500 個のカスタム cluster role を作成できます。

</Procedures>

## ユーザーにロールを付与する\{#grant-a-role-to-a-user}

cluster role を作成したら、それをユーザーに付与できます。Users タブに移動し、[新しい cluster user を作成する](./cluster-users#create-a-cluster-user) とき、または [既存の cluster user のロールを編集する](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) ときにロールを付与します。

![grant-role-to-user](https://zdoc-images.s3.us-west-2.amazonaws.com/grant-role-to-user.png "grant-role-to-user")

## ユーザーからロールを取り消す\{#revoke-a-role-from-a-user}

cluster role がユーザーに適さなくなった場合は、そのロールを取り消すことができます。Users タブに移動し、対象ユーザーを見つけて、[edit role](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) をクリックします。ダイアログボックスで別のロールを選択します。 

![revoke-role-from-user](https://zdoc-images.s3.us-west-2.amazonaws.com/revoke-role-from-user.png "revoke-role-from-user")

## カスタム cluster role を編集する\{#edit-a-custom-cluster-role}

カスタム cluster role の権限を調整できます。調整内容は、このロールを付与されているすべてのユーザーに適用されます。

![edit-custom-role](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-custom-role.png "edit-custom-role")

## カスタム cluster role を削除する\{#delete-a-custom-cluster-role}

ロールが不要になった場合は、カスタム cluster role を削除できます。

ユーザーに付与済みのロールは削除できません。まず対象ロールを付与されているユーザーを特定し、その後それらのユーザーに別のロールを割り当てる必要があります。 

![delete-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-cluster-role.png "delete-cluster-role")

