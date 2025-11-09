---
title: "クラスターロールの管理（コンソール） | Cloud"
slug: /cluster-roles
sidebar_label: "クラスターロールの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターロールは、クラスター内でユーザーが持つ権限を定義します。具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルの権限を制御します。 | Cloud"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 4
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - ロール
  - 異常検知
  - センテンストランスフォーマス
  - レコメンデーションシステム
  - 情報検索

---

import Admonition from '@theme/Admonition';


# クラスターロールの管理（コンソール）

クラスターロールは、クラスター内でユーザーが持つ権限を定義します。具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルの権限を制御します。

Zilliz Cloudは、2つのタイプのクラスターロールを提供します：組み込みロールとカスタムロール。

クラスターロールを管理するには、**組織オーナー**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールが必要です。

## 組み込みクラスターロール\{#built-in-cluster-roles}

Zilliz Cloudは、ベクターデータベースシステムで一般的に必要とされる異なる権限を持つ3つの組み込みクラスターロールを提供します。組み込みロールは編集または削除できません。

- **管理者**: クラスターアドミンロールは、クラスターとそのすべてのリソース（データベース、コレクション）を管理するための完全な権限を持っています。

    以下の表は、このロールに対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>クラスターのプロパティを管理（CUサイズ、レプリカ数、オートスケール）</p></li><li><p>コレクションとインデックスを管理</p></li><li><p>クラスターメトリクスを表示</p></li><li><p>クラスターユーザーとロールを管理</p></li><li><p>クラスターバックアップを管理</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザ操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み書き**: クラスター読み書きロールは、クラスターを表示し、そのすべてのリソース（データベース、コレクション）を管理する権限を持っています。

    以下の表は、このロールに対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスを管理</p></li><li><p>クラスターメトリクスを表示</p></li><li><p>クラスターユーザーとロールを表示</p></li><li><p>クラスターバックアップを表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み取り専用**: クラスター読み取り専用ロールは、クラスターとそのリソース（データベース、コレクション）を表示する権限を持っています。

    以下の表は、このロールに対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスを表示</p></li><li><p>クラスターメトリクスを表示</p></li><li><p>クラスターユーザーとロールを表示</p></li><li><p>クラスターバックアップを表示</p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">コレクションの説明</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">コレクションロード状態の取得</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">コレクション統計の取得</a></p></li><li><p><a href="/reference/restful/has-collection-v2">コレクションの有無</a></p></li><li><p><a href="/reference/restful/list-collections-v2">コレクションのリスト</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">インデックスのリスト</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">パーティション統計の取得</a></p></li><li><p><a href="/reference/restful/has-partition-v2">パーティションの有無</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">パーティションのリスト</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">エイリアスのリスト</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタムクラスターロール\{#custom-cluster-roles}

カスタムロールは、事前定義されたアクセスを提供する組み込みロールとは異なり、クラスター、データベース、およびコレクションレベルでカスタマイズされた権限を付与する柔軟性を提供します。

コレクションレベルのアクセス制御については、カスタムロールを作成することをお勧めします。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、専用クラスターでのみ利用可能です。</p>
<p>現在、Zilliz Cloudは、ウェブコンソールでの組み込み権限グループを持つカスタムロールの作成のみをサポートしています。特定の権限またはカスタム権限グループを持つカスタムロールを作成する必要がある場合は、最初に<a href="http://support.zilliz.com">サポートチケットを作成</a>して、この機能を有効にしてください。機能が有効になると、SDKを使用して<a href="./cluster-privileges#custom-privilege-groups">カスタム権限グループを作成</a>できます。</p>

</Admonition>

## カスタムクラスターロールを作成\{#create-a-custom-cluster-role}

1. 対象クラスターの**ロール**タブに移動します。**+ クラスターロール**をクリックします。

    ![add-cluster-role](/img/add-cluster-role.png)

1. ロール名を入力します。

1. コレクション、データベース、およびクラスターレベルの権限を構成します。組み込み権限グループを選択し、ターゲットリソースを選択します。

    Zilliz Cloudは、合計9つの組み込み権限グループを提供します：

    - コレクション権限グループ：管理者（`COLL_ADMIN`）、読み書き（`COLL_RW`）、読み取り専用（`COLL_RO`）

    - データベース権限グループ：管理者（`DB_Admin`）、読み書き（`DB_RW`）、読み取り専用（`DB_RO`）

    - クラスタ権限グループ：管理者（`Cluster_Admin`）、読み書き（`Cluster_RW`）、読み取り専用（`Cluster_RO`）

    <Admonition type="info" icon="📘" title="ノート">

    <p>組み込み権限グループの3つのレベルにはカスケード関係はありません。インスタンスレベルで組み込み権限グループを設定しても、そのインスタンス以下のすべてのデータベースおよびコレクションに自動的に権限が設定されるわけではありません。データベースおよびコレクションレベルの権限は手動で設定する必要があります。</p>

    </Admonition>

    各み込み権限グループごとの特定の権限の詳細については、[権限と権限グループ](./cluster-privileges#built-in-privilege-groups)を参照してください。

    ![add-cluster-role-form](/img/add-cluster-role-form.png)

1. **作成**をクリックします。各クラスターには最大20個のカスタムクラスターロールを設定できます。

## ユーザーにロールを付与\{#grant-a-role-to-a-user}

クラスターロールが作成されたら、ユーザーに付与できます。ユーザー タブに移動し、[新しいクラスターユーザーを作成](./cluster-users#create-a-cluster-user)するとき、または[既存のクラスターユーザーのロールを編集](./cluster-users#edit-the-role-of-a-cluster-user)するときにロールを付与します。

![grant-role-to-user](/img/grant-role-to-user.png)

## ユーザーからロールを取り消し\{#revoke-a-role-from-a-user}

クラスターロールがユーザーに適さなくなった場合、ロールを取り消すことができます。ユーザー タブに移動し、対象のユーザーを見つけ、[ロールを編集](./cluster-users#edit-the-role-of-a-cluster-user)をクリックします。ダイアログボックスで別のロールを選択します。

![revoke-role-from-user](/img/revoke-role-from-user.png)

## カスタムクラスターロールを編集\{#edit-a-custom-cluster-role}

カスタムクラスターロールの権限を調整できます。調整は、このロールが付与されているすべてのユーザーに適用されます。

![edit-custom-role](/img/edit-custom-role.png)

## カスタムクラスターロールを削除\{#delete-a-custom-cluster-role}

ロールが不要になった場合、カスタムクラスターロールを削除できます。

ユーザーに付与されているロールは削除できません。まず、対象のロールが付与されているユーザーを特定し、別のロールを割り当てる必要があります。

![delete-cluster-role](/img/delete-cluster-role.png)