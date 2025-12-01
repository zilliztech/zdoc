---
title: "クラスターロールの管理（コンソール） | BYOC"
slug: /cluster-roles
sidebar_label: "クラスターロールの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの権限を制御します。 | BYOC"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - ロール
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pineconeベクトルデータベース
  - 音声検索

---

import Admonition from '@theme/Admonition';


# クラスターロールの管理（コンソール）

クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの権限を制御します。

Zilliz Cloudは、組み込みロールとカスタムロールの2種類のクラスターロールを提供します。

クラスターロールを管理するには、**組織オーナー**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールが必要です。

## 組み込みクラスターロール\{#built-in-cluster-roles}

Zilliz Cloudは、ベクトルデータベースシステムで一般的に必要とされる異なる権限を持つ3つの組み込みクラスターロールを提供します。組み込みロールは編集または削除できません。

- **Admin**: クラスターアドミンロールは、クラスターおよびそのすべてのリソース（データベース、コレクション）を管理するための完全な権限を持ちます。

    以下の表は、このロールに対応するUIおよびAPI権限をリストしています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>クラスターのプロパティ（CUサイズ、レプリカ数、オートスケール）の管理</p></li><li><p>コレクションおよびインデックスの管理</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーおよびロールの管理</p></li><li><p>クラスターバックアップの管理</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**: クラスター読込・書込ロールは、クラスターを表示し、そのすべてのリソース（データベース、コレクション）を管理する権限を持ちます。

    以下の表は、このロールに対応するUIおよびAPI権限をリストしています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションおよびインデックスの管理</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーおよびロールの表示</p></li><li><p>クラスターバックアップの表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**: クラスター読取専用ロールは、クラスターおよびそのリソース（データベース、コレクション）を表示する権限を持ちます。

    以下の表は、このロールに対応するUIおよびAPI権限をリストしています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションおよびインデックスの表示</p></li><li><p>クラスターメトリクスの表示</p></li><li><p>クラスターユーザーおよびロールの表示</p></li><li><p>クラスターバックアップの表示</p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">コレクションの説明</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">コレクション読み込み状態の取得</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">コレクション統計の取得</a></p></li><li><p><a href="/reference/restful/has-collection-v2">コレクションの存在確認</a></p></li><li><p><a href="/reference/restful/list-collections-v2">コレクション一覧</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">インデックス一覧</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">パーティション統計の取得</a></p></li><li><p><a href="/reference/restful/has-partition-v2">パーティションの存在確認</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">パーティション一覧</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">エイリアス一覧</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタムクラスターロール\{#custom-cluster-roles}

カスタムロールは、あらかじめ定義されたアクセスとは異なり、クラスター、データベース、およびコレクションレベルでカスタマイズされた権限を付与する柔軟性を提供します。

コレクションレベルのアクセス制御には、カスタムロールを作成することをお勧めします。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は専用クラスターでのみ利用できます。</p>
<p>現在、Zilliz CloudはWebコンソール上で組み込み権限グループを持つカスタムロールの作成のみをサポートしています。特定の権限またはカスタム権限グループを持つカスタムロールを作成する必要がある場合は、まず<a href="http://support.zilliz.com">サポートチケットを作成</a>して、当社がこの機能を有効にできるようにしてください。機能が有効になると、SDKを使用して<a href="./cluster-privileges#custom-privilege-groups">カスタム権限グループを作成</a>できます。</p>

</Admonition>

## カスタムクラスターロールの作成\{#create-a-custom-cluster-role}

1. 対象クラスターの**ロール**タブに移動します。**+ クラスターロール**をクリックします。

    ![add-cluster-role](/img/add-cluster-role.png)

1. ロール名を入力します。

1. コレクション、データベース、クラスターの各レベルで権限を構成します。組み込み権限グループを選択し、対象リソースを選択します。

    Zilliz Cloudは合計9つの組み込み権限グループを提供します：

    - コレクション権限グループ：Admin（`COLL_ADMIN`）、読込・書込（`COLL_RW`）、読取専用（`COLL_RO`）

    - データベース権限グループ：Admin（`DB_Admin`）、読込・書込（`DB_RW`）、読取専用（`DB_RO`）

    - クラスターレベル権限グループ：Admin（`Cluster_Admin`）、読込・書込（`Cluster_RW`）、読取専用（`Cluster_RO`）

    <Admonition type="info" icon="📘" title="注意">

    <p>組み込み権限グループの3つのレベルにはカスケード関係がありません。インスタンスレベルで組み込み権限グループを設定しても、そのインスタンス配下のすべてのデータベースおよびコレクションに自動的に権限が設定されるわけではありません。データベースおよびコレクションレベルの権限は手動で設定する必要があります。</p>

    </Admonition>

    各組み込み権限グループに含まれる特定の権限の詳細については、[権限と権限グループ](./cluster-privileges#built-in-privilege-groups)を参照してください。

    ![add-cluster-role-form](/img/add-cluster-role-form.png)

1. **作成**をクリックします。各クラスターには最大20個のカスタムクラスターロールを作成できます。

## ユーザーへのロールの付与\{#grant-a-role-to-a-user}

クラスターロールが作成されたら、ユーザーに付与できます。ユーザー タブに移動し、[新しいクラスターユーザーを作成](./cluster-users#create-a-cluster-user)するときまたは[既存のクラスターユーザーのロールを編集](./cluster-users#edit-the-role-of-a-cluster-user)するときにロールを付与します。

![grant-role-to-user](/img/grant-role-to-user.png)

## ユーザーからのロールの取り消し\{#revoke-a-role-from-a-user}

クラスターロールがユーザーに合わなくなった場合、ロールを取り消すことができます。ユーザー タブに移動し、対象ユーザーを見つけ、[ロールの編集](./cluster-users#edit-the-role-of-a-cluster-user)をクリックします。ダイアログボックスで別のロールを選択します。

![revoke-role-from-user](/img/revoke-role-from-user.png)

## カスタムクラスターロールの編集\{#edit-a-custom-cluster-role}

カスタムクラスターロールの権限を調整できます。調整は、このロールが付与されたすべてのユーザーに適用されます。

![edit-custom-role](/img/edit-custom-role.png)

## カスタムクラスターロールの削除\{#delete-a-custom-cluster-role}

ロールが不要になった場合、カスタムクラスターロールを削除できます。

ユーザーに付与されたロールは削除できません。まず、対象ロールが付与されたユーザーを特定し、別のロールを割り当てる必要があります。

![delete-cluster-role](/img/delete-cluster-role.png)