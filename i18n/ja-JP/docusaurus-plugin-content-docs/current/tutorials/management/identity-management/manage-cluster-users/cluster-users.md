---
title: "クラスターユーザーの管理（コンソール） | Cloud"
slug: /cluster-users
sidebar_label: "クラスターユーザーの管理（コンソール）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成してクラスターロールを割り当て、権限を定義することでデータセキュリティを確保できます。 | Cloud"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラスターユーザーの管理（コンソール）

Zilliz Cloud では、クラスターユーザーを作成してクラスターロールを割り当て、権限を定義することでデータセキュリティを確保できます。

クラスター作成時に、`db_admin` という名前のデフォルトユーザーが自動生成されます。このユーザーは削除できません。デフォルトユーザーに加えて、よりきめ細かいアクセス制御を行うためのクラスターユーザーを追加で作成できます。

クラスターユーザーを管理するには、**Organization Owner** または **Project Admin** であるか、**Cluster_Admin** 権限を持つロールが必要です。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## クラスターユーザーの作成\{#create-a-cluster-user}

クラスターユーザーの作成時には、以下の設定を行います。

- ユーザー名を入力します。

- （任意）ユーザーの説明を入力します。

- ユーザーに組み込みクラスターロールまたは[カスタムクラスターロール](./cluster-roles)のいずれかを付与します。

- クラスターユーザーのパスワードを設定します。このパスワードは[認証](./cluster-credentials)に使用されます。

![X8A2bdNuTopfLWxt53Ich1FHntf](https://zdoc-images.s3.us-west-2.amazonaws.com/x8a2bdnutopflwxt53ich1fhntf.png "X8A2bdNuTopfLWxt53Ich1FHntf")

<Admonition type="info" icon="📘" title="Notes">

各クラスターには最大500のクラスターユーザーを作成できます。

</Admonition>

## クラスターユーザーのロールまたは説明の編集\{#edit-the-role-or-desrciption-of-a-cluster-user}

![V1PkbqpnZoGkmQxu2kbcNIH2neb](https://zdoc-images.s3.us-west-2.amazonaws.com/v1pkbqpnzogkmqxu2kbcnih2neb.png "V1PkbqpnZoGkmQxu2kbcNIH2neb")

## クラスターユーザーの削除\{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="📘 Notes">

デフォルトユーザー **db_admin** は削除できません。

</Admonition>

![drop-クラスター-user](https://zdoc-images.s3.us-west-2.amazonaws.com/drop-cluster-user.png "drop-クラスター-user")
