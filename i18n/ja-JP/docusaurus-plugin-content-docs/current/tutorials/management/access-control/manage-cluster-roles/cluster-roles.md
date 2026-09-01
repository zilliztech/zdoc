---
title: "クラスターロールの管理（コンソール） | Cloud"
slug: /cluster-roles
sidebar_label: "クラスターロールの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターロールは、クラスター内でユーザーが持つ権限を定義します。具体的には、クラスターロールはクラスター、データベース、コレクションの各レベルでクラスターユーザーの権限を制御します。 | Cloud"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クラスターロールの管理（コンソール）

クラスターロールは、クラスター内でユーザーが持つ権限を定義します。具体的には、クラスターロールはクラスター、データベース、コレクションの各レベルでクラスターユーザーの権限を制御します。

Zilliz Cloud は、組み込みロールとカスタムロールの 2 種類のクラスターロールを提供します。

クラスターロールを管理するには、**Organization Owner** または **Project Admin** であるか、**Cluster_Admin** 権限を持つロールが必要です。

## 組み込みクラスターロール\{#built-in-cluster-roles}

Zilliz Cloud は、ベクトルデータベースシステムで一般的に必要となる異なる権限を持つ 3 つの組み込みクラスターロールを提供します。組み込みロールは編集や削除ができません。

- **Admin**: クラスター Admin ロールは、クラスターおよびそのすべてのリソース（データベース、コレクション）を管理するための完全な権限を持ちます。

    次の表に、このロールに対応する UI および API の権限を示します。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>クラスタープロパティ（CU サイズ、レプリカ数、自動スケーリング）の管理</p></li><li><p>コレクションとインデックスの管理</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーとロールの管理</p></li><li><p>クラスターバックアップの管理</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**: クラスター Read-Write ロールは、クラスターの参照およびそのすべてのリソース（データベース、コレクション）の管理権限を持ちます。

    次の表に、このロールに対応する UI および API の権限を示します。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスの管理</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーとロールの表示</p></li><li><p>クラスターバックアップの表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**: クラスター Read-Only ロールは、クラスターおよびそのリソース（データベース、コレクション）を参照する権限を持ちます。

    次の表に、このロールに対応する UI および API の権限を示します。

    <table>
       <tr>
         <th><p><strong>UI 権限</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスの表示</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーとロールの表示</p></li><li><p>クラスターバックアップの表示</p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe コレクション</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get コレクション Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get コレクション Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has コレクション</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List コレクション</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe インデックス</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List インデックス</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List Partitions</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe Alias</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List Aliases</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタムクラスターロール\{#custom-cluster-roles}

カスタムロールは、事前定義されたアクセス権を持つ組み込みロールとは異なり、クラスター、データベース、コレクションの各レベルで柔軟に権限を付与できます。

コレクションレベルのアクセス制御を行う場合は、カスタムロールを作成することをお勧めします。

<Admonition type="info" icon="📘" title="Notes">

この機能は Dedicated クラスターでのみ利用できます。

現在、Zilliz Cloud の Web コンソールでは、組み込み権限グループを使用したカスタムロールの作成のみサポートしています。特定の権限やカスタム権限グループを持つカスタムロールを作成する必要がある場合は、まず[サポートチケットを作成](http://support.zilliz.com)してください。機能の有効化後、SDK を使用して[カスタム権限グループを作成](./cluster-privileges#custom-privilege-groups)できるようになります。

</Admonition>

## カスタムクラスターロールの作成\{#create-a-custom-cluster-role}

<Procedures>

1. 対象クラスターの **Roles** タブに移動し、**+ クラスター Role** をクリックします。

    ![add-クラスター-role](https://zdoc-images.s3.us-west-2.amazonaws.com/add-cluster-role.png "add-クラスター-role")

1. ロール名と説明（任意）を入力します。

1. コレクション、データベース、クラスターレベルの権限を設定します。組み込み権限グループを選択し、対象リソースを指定します。

    Zilliz Cloud は、合計 9 つの組み込み権限グループを提供します。

    - コレクション権限グループ: Admin (`COLL_ADMIN`)、Read-Write (`COLL_RW`)、Read-Only (`COLL_RO`)

    - データベース権限グループ: Admin (`DB_Admin`)、Read-Write (`DB_RW`)、Read-Only (`DB_RO`)

    - クラスター権限グループ: Admin (`Cluster_Admin`)、Read-Write (`Cluster_RW`)、Read-Only (`Cluster_RO`)

    <Admonition type="info" icon="📘" title="Notes">

    これら 3 つのレベルの組み込み権限グループの間にはカスケード関係はありません。インスタンスレベルで組み込み権限グループを設定しても、そのインスタンス配下のすべてのデータベースやコレクションに対する権限が自動的に設定されるわけではありません。データベースレベルおよびコレクションレベルの権限は手動で設定する必要があります。

    </Admonition>

    各組み込み権限グループに含まれる具体的な権限の詳細については、[権限と権限グループ](./cluster-privileges#built-in-privilege-groups)を参照してください。

    ![CWALbSrKOo56DPxID45c7Jjgn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/cwalbsrkoo56dpxid45c7jjgn9c.png "CWALbSrKOo56DPxID45c7Jjgn9c")

1. **Create** をクリックします。各クラスターには最大 500 個のカスタムクラスターロールを作成できます。

</Procedures>

## ユーザーへのロールの付与\{#grant-a-role-to-a-user}

クラスターロールの作成後、そのロールをユーザーに付与できます。Users タブで、[新しいクラスターユーザーを作成する](./cluster-users#create-a-cluster-user)際、または[既存のクラスターユーザーのロールを編集する](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user)際にロールを付与します。

![grant-role-to-user](https://zdoc-images.s3.us-west-2.amazonaws.com/grant-role-to-user.png "grant-role-to-user")

## ユーザーからのロールの取り消し\{#revoke-a-role-from-a-user}

クラスターロールがユーザーに適さなくなった場合は、そのロールを取り消せます。Users タブで対象のユーザーを探し、[ロールを編集](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user)をクリックして、ダイアログボックスで別のロールを選択します。

![revoke-role-from-user](https://zdoc-images.s3.us-west-2.amazonaws.com/revoke-role-from-user.png "revoke-role-from-user")

## カスタムクラスターロールの編集\{#edit-a-custom-cluster-role}

カスタムクラスターロールの権限を調整できます。変更内容は、このロールが付与されているすべてのユーザーに適用されます。

![edit-custom-role](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-custom-role.png "edit-custom-role")

## カスタムクラスターロールの削除\{#delete-a-custom-cluster-role}

不要になったカスタムクラスターロールは削除できます。

ユーザーに付与済みのロールは削除できません。まず対象のロールが付与されているユーザーを確認し、それらのユーザーに別のロールを割り当ててください。

![delete-クラスター-role](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-cluster-role.png "delete-クラスター-role")
