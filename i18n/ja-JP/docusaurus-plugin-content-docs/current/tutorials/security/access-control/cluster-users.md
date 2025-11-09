---
title: "クラスターユーザーの管理（コンソール） | Cloud"
slug: /cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、クラスターユーザーを作成し、権限を定義するためにクラスターロールを割り当てることで、データセキュリティを実現できます。 | Cloud"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - ユーザー
  - 概要
  - Annoyベクトル検索
  - ミルヴス
  - Zilliz
  - ミルヴスベクターデータベース

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理（コンソール）

Zilliz Cloudでは、クラスターユーザーを作成し、権限を定義するためにクラスターロールを割り当てることで、データセキュリティを実現できます。

クラスターの作成時に、`db_admin`という名前のデフォルトユーザーが自動的に生成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、きめ細かなアクセス制御のためにより多くのクラスターユーザーを作成できます。

クラスターユーザーを管理するには、**組織オーナー**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールが必要です。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## クラスターユーザーを作成\{#create-a-cluster-user}

クラスターユーザーを作成する際には、以下を行う必要があります：

- ユーザー名を入力します。

- このユーザーに組み込みクラスターロールまたは[カスタムクラスターロール](./cluster-roles)を付与します。

- このクラスターユーザーのパスワードを設定します。このパスワードは[認証](./cluster-credentials)に使用されます。

![add-cluster-user](/img/add-cluster-user.png)

<Admonition type="info" icon="📘" title="ノート">

<p>各クラスターには最大100人のクラスターユーザーを設定できます。</p>

</Admonition>

## クラスターユーザーのロールを編集\{#edit-the-role-of-a-cluster-user}

![edit-cluster-user-role](/img/edit-cluster-user-role.png)

## クラスターユーザーを削除\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトユーザー<strong>db_admin</strong>は削除できません。</p>

</Admonition>

![drop-cluster-user](/img/drop-cluster-user.png)