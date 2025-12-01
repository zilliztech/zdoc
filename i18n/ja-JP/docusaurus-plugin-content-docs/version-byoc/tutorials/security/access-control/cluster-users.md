---
title: "クラスターユーザーの管理（コンソール） | BYOC"
slug: /cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、クラスターユーザーを作成し、権限を定義するためにクラスターロールを割り当てることで、データセキュリティを実現できます。 | BYOC"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - ユーザー
  - 概要
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理（コンソール）

Zilliz Cloudでは、クラスターユーザーを作成し、権限を定義するためにクラスターロールを割り当てることで、データセキュリティを実現できます。

クラスター作成時に、`db_admin`という名前のデフォルトユーザーが自動生成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、きめ細かいアクセス制御のためにさらにクラスターユーザーを作成できます。

クラスターユーザーを管理するには、**組織オーナー**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールが必要です。

## クラスターユーザーの作成\{#create-a-cluster-user}

クラスターユーザーを作成する際には、以下を行う必要があります：

- ユーザー名を入力する。

- このユーザーに組み込みクラスターロールまたは[カスタムクラスターロール](./cluster-roles)を付与する。

- このクラスターユーザーのパスワードを設定する。このパスワードは[認証](./cluster-credentials)に使用されます。

![add-cluster-user](/img/add-cluster-user.png)

<Admonition type="info" icon="📘" title="注意">

<p>各クラスターには最大100人のクラスターユーザーを作成できます。</p>

</Admonition>

## クラスターユーザーのロール編集\{#edit-the-role-of-a-cluster-user}

![edit-cluster-user-role](/img/edit-cluster-user-role.png)

## クラスターユーザーの削除\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="注意">

<p>デフォルトユーザー<strong>db_admin</strong>は削除できません。</p>

</Admonition>

![drop-cluster-user](/img/drop-cluster-user.png)