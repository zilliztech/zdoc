---
title: "クラスターユーザーの管理（コンソール） | BYOC"
slug: /cluster-users
sidebar_key: cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。 | BYOC"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - アクセス制御
  - rbac
  - users
  - 概要

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理（コンソール）

Zilliz Cloud では、クラスターユーザーを作成し、クラスターロールを割り当てることで権限を定義し、データセキュリティを実現できます。

クラスターの作成時に、デフォルトユーザー `db_admin` が自動的に生成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、よりきめ細かなアクセス制御のために追加のクラスターユーザーを作成できます。

クラスターユーザーを管理するには、**組織オーナー**、**プロジェクト管理者**、または **Cluster_Admin** 権限を持つロールが必要です。

## クラスターユーザーの作成\{#create-a-cluster-user}

クラスターユーザーを作成する際は、以下が必要です：

- ユーザー名を入力する。

- （オプション）ユーザーの説明を入力する。

- このユーザーに組み込みのクラスターロール、または[カスタムクラスターロール](./cluster-roles)を付与する。

- このクラスターユーザーのパスワードを設定する。このパスワードは[認証](./cluster-credentials)に使用されます。

![X8A2bdNuTopfLWxt53Ich1FHntf](https://zdoc-images.s3.us-west-2.amazonaws.com/x8a2bdnutopflwxt53ich1fhntf.png "X8A2bdNuTopfLWxt53Ich1FHntf")

<Admonition type="info" icon="📘" title="Notes">

各クラスターは最大 500 個のクラスターユーザーを持つことができます。

</Admonition>

## クラスターユーザーのロールまたは説明の編集\{#edit-the-role-or-desrciption-of-a-cluster-user}

![V1PkbqpnZoGkmQxu2kbcNIH2neb](https://zdoc-images.s3.us-west-2.amazonaws.com/v1pkbqpnzogkmqxu2kbcnih2neb.png "V1PkbqpnZoGkmQxu2kbcNIH2neb")

## クラスターユーザーの削除\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="Notes">

デフォルトユーザー **db_admin** は削除できません。

</Admonition>

![drop-cluster-user](https://zdoc-images.s3.us-west-2.amazonaws.com/drop-cluster-user.png "drop-cluster-user")
