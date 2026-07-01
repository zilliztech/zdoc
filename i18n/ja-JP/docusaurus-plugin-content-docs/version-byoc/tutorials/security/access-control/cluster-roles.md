---
title: "クラスターロールの管理（コンソール） | BYOC"
slug: /cluster-roles
sidebar_key: cluster-roles
sidebar_label: "クラスターロールの管理（コンソール）"
beta: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの権限を制御します。 | BYOC"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - アクセス制御
  - rbac
  - ロール

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クラスターロールの管理（コンソール）

クラスターロールは、ユーザーがクラスター内で持つ特権を定義します。より具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの特権を制御します。

Zilliz Cloud は、組み込みロールとカスタムロールの2種類のクラスターロールを提供します。

クラスターロールを管理するには、**組織オーナー**、**プロジェクト管理者**、または **Cluster_Admin** 特権を持つロールである必要があります。

## 組み込みクラスターロール\{#built-in-cluster-roles}

Zilliz Cloud は、ベクトルデータベースシステムで一般的に必要とされる異なる特権を持つ3つの組み込みクラスターロールを提供します。組み込みロールは編集または削除できません。

- **Admin**: クラスター管理者ロールは、クラスターとそのすべてのリソース（データベース、コレクション）を管理する完全な特権を持ちます。

    以下の表に、このロールの対応するUIおよびAPI特権を示します。

    <table>
       <tr>
         <th><p><strong>UI 特権</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>クラスター プロパティの管理（CU サイズ、レプリカ数、自動スケーリング）</p></li><li><p>コレクションとインデックスの管理</p></li><li><p>クラスター メトリクスの表示</p></li><li><p>クラスター ユーザーとロールの管理</p></li><li><p>クラスター バックアップの管理</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み書き**: クラスター読み書きロールは、クラスターを表示し、そのすべてのリソース（データベース、コレクション）を管理する特権を持ちます。

    以下の表に、このロールの対応するUIおよびAPI特権を示します。

    <table>
       <tr>
         <th><p><strong>UI 特権</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスの管理</p></li><li><p>クラスター メトリクスの表示</p></li><li><p>クラスター ユーザーとロールの表示</p></li><li><p>クラスター バックアップの表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み取り専用**: クラスター読み取り専用ロールは、クラスターとそのリソース（データベース、コレクション）を表示する特権を持ちます。

    以下の表に、このロールの対応するUIおよびAPI特権を示します。

    <table>
       <tr>
         <th><p><strong>UI 特権</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスの表示</p></li><li><p>クラスター メトリクスの表示</p></li><li><p>クラスター ユーザーとロールの表示</p></li><li><p>クラスター バックアップの表示</p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe Collection</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get Collection Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get Collection Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has Collection</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List Collections</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe Index</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List Indexes</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List パーティション</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe エイリアス</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List エイリアスes</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタムクラスターロール\{#custom-cluster-roles}

カスタムロールは、組み込みロールが事前定義されたアクセスを提供するのに対し、クラスター、データベース、およびコレクションレベルで調整された特権を付与する柔軟性を提供します。

コレクションレベルのアクセス制御には、カスタムロールの作成を推奨します。

<Admonition type="info" icon="📘" title="Notes">

この機能は Dedicated クラスター専用です。

現在、Zilliz Cloud は Web コンソール上で組み込み特権グループを持つカスタムロールの作成のみをサポートしています。特定の特権またはカスタム特権グループを持つカスタムロールを作成する必要がある場合は、まず [サポートチケットを作成](http://support.zilliz.com) して、この機能を有効化していただく必要があります。機能が有効化されたら、SDK を使用して [カスタム特権グループを作成](./cluster-privileges#custom-privilege-groups-or-private) できます。

</Admonition>

## カスタムクラスターロールの作成\{#create-a-custom-cluster-role}

<Procedures>

1. 対象クラスターの **ロール** タブに移動します。**+ クラスターロール** をクリックします。

    ![add-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/add-cluster-role.png "add-cluster-role")

1. ロール名と説明（オプション）を入力します。

1. コレクション、データベース、およびクラスターレベルで特権を設定します。組み込み特権グループを選択し、対象のリソースを選択します。

    Zilliz Cloud は合計9つの組み込み特権グループを提供します：

    - コレクション特権グループ: Admin (`COLL_ADMIN`)、読み書き (`COLL_RW`)、読み取り専用 (`COLL_RO`)

    - データベース特権グループ: Admin (`DB_Admin`)、読み書き (`DB_RW`)、読み取り専用 (`DB_RO`)

    - クラスター特権グループ: Admin (`Cluster_Admin`)、読み書き (`Cluster_RW`)、読み取り専用 (`Cluster_RO`)

    <Admonition type="info" icon="📘" title="Notes">

    3つのレベルの組み込み特権グループにはカスケード関係はありません。インスタンスレベルで組み込み特権グループを設定しても、そのインスタンス配下のすべてのデータベースとコレクションに対する権限が自動的に設定されるわけではありません。データベースおよびコレクションレベルの特権は手動で設定する必要があります。

    </Admonition>

    各組み込み特権グループに含まれる具体的な特権の詳細については、[特権と特権グループ](./cluster-privileges#built-in-privilege-groups) を参照してください。

    ![CWALbSrKOo56DPxID45c7Jjgn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/cwalbsrkoo56dpxid45c7jjgn9c.png "CWALbSrKOo56DPxID45c7Jjgn9c")

1. **作成** をクリックします。各クラスターは最大500個のカスタムクラスターロールを持つことができます。

</Procedures>

## ユーザーへのロール付与\{#grant-a-role-to-a-user}

クラスターロールが作成されたら、ユーザーに付与できます。ユーザー タブに移動し、[新しいクラスター ユーザーの作成](./cluster-users#create-a-cluster-user) 時または [既存のクラスター ユーザーのロール編集](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) 時にロールを付与します。

![grant-role-to-user](https://zdoc-images.s3.us-west-2.amazonaws.com/grant-role-to-user.png "grant-role-to-user")

## ユーザーからのロール取り消し\{#revoke-a-role-from-a-user}

クラスターロールがユーザーに適合しなくなった場合、ロールを取り消すことができます。ユーザー タブに移動し、対象のユーザーを見つけて [ロールを編集](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) をクリックします。ダイアログボックスで別のロールを選択します。

![revoke-role-from-user](https://zdoc-images.s3.us-west-2.amazonaws.com/revoke-role-from-user.png "revoke-role-from-user")

## カスタムクラスターロールの編集\{#edit-a-custom-cluster-role}

カスタムクラスターロールの特権を調整できます。この調整は、このロールが付与されているすべてのユーザーに適用されます。

![edit-custom-role](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-custom-role.png "edit-custom-role")

## カスタムクラスターロールの削除\{#delete-a-custom-cluster-role}

ロールが不要になった場合、カスタムクラスターロールを削除できます。

ユーザーに付与されているロールは削除できません。まず、対象のロールが付与されているユーザーを特定し、別のロールを割り当てる必要があります。

![delete-cluster-role](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-cluster-role.png "delete-cluster-role")
