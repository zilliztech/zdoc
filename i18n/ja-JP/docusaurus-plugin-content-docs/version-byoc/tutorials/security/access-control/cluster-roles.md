---
title: "クラスタロールの管理(コンソール) | BYOC"
slug: /cluster-roles
sidebar_label: "クラスタロールの管理(コンソール)"
beta: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、およびコレクションレベルでクラスターユーザーの権限を制御します。 | BYOC"
type: origin
token: O5fiwpkz9imD7WkyCdYcwuKbnjc
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - roles
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source

---

import Admonition from '@theme/Admonition';


# クラスタロールの管理(コンソール)

クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、およびコレクションレベルでクラスターユーザーの権限を制御します。

Zilliz Cloudには、組み込みロールとカスタムロールの2種類のクラスターロールがあります。

クラスターロールを管理するには、**組織所有者**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールである必要があります。

## 組み込みのクラスターロール{#built-in-cluster-roles}

Zilliz Cloudは、ベクトルデータベースシステムで一般的に必要とされる異なる権限を持つ3つの組み込みクラスターロールを提供します。組み込みロールは編集や削除ができません。

- **管理者**:クラスター管理者の役割には、クラスターとそのすべてのリソース(データベース、コレクション)を管理するための完全な権限があります。

    次の表に、このロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>クラスタのプロパティを管理する（CU体格、レプリカ数、自動スケール）</p></li><li><p>コレクションとインデックスを管理する</p></li><li><p>クラスタメトリクスの表示</p></li><li><p>クラスターのユーザーとロールを管理する</p></li><li><p>クラスタバックアップを管理する</p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/ja-JP/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/ja-JP/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/ja-JP/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/ja-JP/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み書き**:クラスターの読み書きロールには、クラスターを表示し、そのすべてのリソース(データベース、コレクション)を管理する権限があります。

    次の表に、このロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスを管理する</p></li><li><p>クラスタメトリクスの表示</p></li><li><p>クラスタのユーザーとロールを表示する</p></li><li><p>クラスタバックアップを表示する</p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/ja-JP/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/ja-JP/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/ja-JP/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **読み取り専用**:クラスター読み取り専用ロールには、クラスターとそのリソース(データベース、コレクション)を表示する権限があります。

    次の表に、このロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API(V 2)権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>コレクションとインデックスを表示する</p></li><li><p>クラスタメトリクスの表示</p></li><li><p>クラスタのユーザーとロールを表示する</p></li><li><p>クラスタバックアップを表示する</p></li></ul></td>
         <td><ul><li><p>一部の収集業務</p><ul><li><p><a href="/ja-JP/reference/restful/describe-collection-v2">コレクションを説明する</a></p></li><li><p><a href="/ja-JP/reference/restful/get-collection-load-state-v2">コレクションの負荷状態を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/get-collection-stats-v2">コレクションの統計を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/has-collection-v2">HASコレクション</a></p></li><li><p><a href="/ja-JP/reference/restful/list-collections-v2">リストコレクション</a></p></li></ul></li><li><p>インデックス操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/list-indexes-v2">リストインデックス</a></p></li></ul></li><li><p>パーティション操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/get-partition-statistics-v2">パーティションの統計情報を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/has-partition-v2">パーティションがあります</a></p></li><li><p><a href="/ja-JP/reference/restful/list-partitions-v2">リストパーティション</a></p></li></ul></li><li><p>エイリアス操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/list-aliases-v2">リストエイリアス</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## カスタムクラスターロール{#custom-cluster-roles}

カスタムロールは、事前に定義されたアクセスを提供する組み込みロールとは異なり、クラスター、データベース、およびコレクションレベルでカスタマイズされた権限を付与する柔軟性を提供します。

コレクションレベルのアクセス制御については、カスタムロールを作成することをお勧めします。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は専用クラスターでのみ利用可能です。</p>
<p>現在、Zilliz Cloudは権限グループが組み込まれたカスタムロールの作成のみをサポートしています。ユーザー定義の権限と権限グループを持つカスタムロールを作成する必要がある場合は、お<a href="http://support.zilliz.com">問い合わせ</a>ください。</p>

</Admonition>

## カスタムクラスターロールを作成する{#create-a-custom-cluster-role}

1. ターゲットクラスタの[**ロール**]タブに移動します。[**+クラスタロール**]をクリックします。

    ![add-cluster-role](/byoc/ja-JP/add-cluster-role.png)

1. 役割名を入力します。

1. コレクション、データベース、クラスターレベルで権限を設定します。権限グループを選択し、ターゲットリソースを選択します。

    Zilliz Cloudは合計9つの特権グループを提供しています。

    - コレクション権限グループ: Admin(`COLL_ADMIN`)、Read-Write(`COLL_RW`)、Read-Only(`COLL_RO`)

    - データベース権限グループ:管理者(`DB_Admin`)、読み書き可能(`DB_RW`)、読み取り専用(`DB_RO`)

    - クラスタ特権グループ: Admin(`Cluster_Admin`)、読み書き可能(`Cluster_RW`)、読み取り専用(`Cluster_RO`)

    各特権グループの特定の特権の詳細については、「[特権について](./cluster-privileges)」を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>組み込み特権グループの3つのレベルには、カスケード関係はありません。インスタンスレベルで特権グループを設定しても、そのインスタンスのすべてのデータベースとコレクションの権限が自動的に設定されるわけではありません。データベースレベルとコレクションレベルの特権は手動で設定する必要があります。</p>

    </Admonition>

    独自の特権グループを作成する必要がある場合は、[お問い合わせ](http://support.zilliz.com)ください。

    ![add-cluster-role-form](/byoc/ja-JP/add-cluster-role-form.png)

1. [**作成**]をクリックします。各クラスターには、最大20個のカスタムクラスターロールを設定できます。

## ユーザーに役割を付与する{#grant-a-role-to-a-user}

クラスターロールが作成されたら、ユーザーにそのロールを付与できます。[ユーザー]タブに移動し、[新しいクラスターユーザーを作成](./cluster-users#create-a-cluster-user)するとき、または[既存のクラスターユーザーのロールを編集する](./cluster-users#edit-the-role-of-a-cluster-user)ときにロールを付与します。

![grant-role-to-user](/byoc/ja-JP/grant-role-to-user.png)

## ユーザーから役割を取り消す{#revoke-a-role-from-a-user}

クラスターロールがユーザーに適合しなくなった場合、ロールを取り消すことができます。[ユーザー]タブに移動し、対象のユーザーを見つけて、[[ロール編集](./cluster-users#edit-the-role-of-a-cluster-user)]をクリックします。ダイアログボックスで別のロールを選択します。

![revoke-role-from-user](/byoc/ja-JP/revoke-role-from-user.png)

## カスタムクラスターロールを編集する{#edit-a-custom-cluster-role}

カスタムクラスターロールの権限を調整できます。この調整は、このロールを付与されたすべてのユーザーに適用されます。

![edit-custom-role](/byoc/ja-JP/edit-custom-role.png)

## カスタムクラスターロールを削除する{#delete-a-custom-cluster-role}

役割が不要になったら、カスタムクラスターの役割を削除できます。

ユーザーに付与されたロールは削除できません。まず、対象のロールを付与されたユーザーを特定し、別のロールを割り当てる必要があります。

![delete-cluster-role](/byoc/ja-JP/delete-cluster-role.png)

