---
title: "クラスターユーザーの管理（コンソール） | BYOC"
slug: /cluster-users
sidebar_key: cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てることで権限を定義し、データセキュリティを実現できます。 | BYOC"
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

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理 (コンソール)

Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てることで権限を定義し、データセキュリティを実現できます。

クラスターが作成されると、`db_admin` という名前のデフォルトユーザーが自動的に生成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、きめ細かいアクセス制御のために追加のクラスターユーザーを作成できます。

クラスターユーザーを管理するには、**組織オーナー** または **プロジェクト管理者** であるか、**Cluster_Admin** 権限を持つロールを持っている必要があります。

## クラスターユーザーの作成\{#create-a-cluster-user}

クラスターユーザーを作成する際は、以下の操作が必要です：

- ユーザー名を入力します。

- このユーザーに、組み込みのクラスターロールまたは [カスタムクラスターロール](./cluster-roles) のいずれかを付与します。

- このクラスターユーザーのパスワードを設定します。このパスワードは [認証](./cluster-credentials) に使用されます。

![add-cluster-user](https://zdoc-images.s3.us-west-2.amazonaws.com/add-cluster-user.png "add-cluster-user")

<Admonition type="info" icon="📘" title="Notes">

<p>各クラスターには、最大 100 人のクラスターユーザーを設定できます。</p>

</Admonition>

## クラスターユーザーのロールの編集\{#edit-the-role-of-a-cluster-user}

![edit-cluster-user-role](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-cluster-user-role.png "edit-cluster-user-role")

## クラスターユーザーの削除\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="Notes">

<p>デフォルトユーザー <strong>db_admin</strong> は削除できません。</p>

</Admonition>

![drop-cluster-user](https://zdoc-images.s3.us-west-2.amazonaws.com/drop-cluster-user.png "drop-cluster-user")

