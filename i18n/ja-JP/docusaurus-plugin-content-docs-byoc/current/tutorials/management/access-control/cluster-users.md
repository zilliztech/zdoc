---
title: "クラスターユーザーの管理（コンソール） | BYOC"
slug: /cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成し、それらにクラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。 | BYOC"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理（コンソール）

Zilliz Cloud では、クラスターユーザーを作成し、それらにクラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。

クラスターの作成時に、`db_admin` という名前のデフォルトユーザーが自動的に生成されます。このユーザーは削除できません。このデフォルトユーザーに加えて、よりきめ細かなアクセス制御のために、さらにクラスターユーザーを作成できます。

クラスターユーザーを管理するには、**Organization Owner** または **Project Admin** であるか、**Cluster_Admin** 権限を持つロールが必要です。

## クラスターユーザーを作成する\{#create-a-cluster-user}

クラスターユーザーを作成する際には、次の操作が必要です。

- ユーザーの名前を入力します。

- （任意）ユーザーの説明を入力します。

- このユーザーに、組み込みクラスターロールまたは[カスタムクラスターロール](./cluster-roles) を付与します。

- このクラスターユーザーのパスワードを設定します。このパスワードは[認証](./cluster-credentials)に使用されます。

![X8A2bdNuTopfLWxt53Ich1FHntf](https://zdoc-images.s3.us-west-2.amazonaws.com/x8a2bdnutopflwxt53ich1fhntf.png "X8A2bdNuTopfLWxt53Ich1FHntf")

<Admonition type="info" icon="📘" title="注記">

各クラスターには最大 500 個のクラスターユーザーを作成できます。

</Admonition>

## クラスターユーザーのロールまたは説明を編集する\{#edit-the-role-or-desrciption-of-a-cluster-user}

![V1PkbqpnZoGkmQxu2kbcNIH2neb](https://zdoc-images.s3.us-west-2.amazonaws.com/v1pkbqpnzogkmqxu2kbcnih2neb.png "V1PkbqpnZoGkmQxu2kbcNIH2neb")

## クラスターユーザーを削除する\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="📘 注記">

デフォルトユーザー **db_admin** は削除できません。

</Admonition>

![drop-cluster-user](https://zdoc-images.s3.us-west-2.amazonaws.com/drop-cluster-user.png "drop-cluster-user")

