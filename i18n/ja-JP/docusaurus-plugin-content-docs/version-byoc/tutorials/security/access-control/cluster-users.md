---
title: "クラスタユーザの管理(コンソール) | BYOC"
slug: /cluster-users
sidebar_label: "クラスタユーザの管理(コンソール)"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、クラスターユーザーを作成し、クラスターロールを割り当てて特権を定義し、データセキュリティを実現できます。 | BYOC"
type: origin
token: CWT2wh5YriZfPZkGlgCcWxVnnAf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - users
  - overview
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database

---

import Admonition from '@theme/Admonition';


# クラスタユーザの管理(コンソール)

Zilliz Cloudでは、クラスターユーザーを作成し、クラスターロールを割り当てて特権を定義し、データセキュリティを実現できます。

クラスタを作成すると、`db_admin`という名前のデフォルトユーザが自動的に生成されます。このユーザは削除できません。このデフォルトユーザに加えて、より細かいアクセス制御のためのクラスタユーザを作成することができます。

クラスターユーザーを管理するには、**組織オーナー**または**プロジェクト管理者**であるか、**Cluster_Admin**権限を持つロールを持っている必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は専用クラスターでのみ利用可能です。</p>

</Admonition>

## クラスタユーザの作成{#create-a-cluster-user}

クラスターユーザーを作成する場合、次のことが必要です:

- ユーザーの名前を入力します。

- このユーザーに組み込みのクラスターロールまたは[カスタムクラスターロール](./cluster-roles)を付与します。

- このクラスターユーザーのパスワードを設定します。このパスワードは[認証について](./cluster-credentials)に使用されます。

![add-cluster-user](/img/add-cluster-user.png)

<Admonition type="info" icon="📘" title="ノート">

<p>各クラスターには最大100人のクラスターユーザーを持つことができます。</p>

</Admonition>

## クラスターユーザーの役割を編集する{#edit-the-role-of-a-cluster-user}

![edit-cluster-user-role](/img/edit-cluster-user-role.png)

## クラスタユーザを削除する{#drop-a-cluster-user}

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトのユーザー<strong>db_admin</strong>は削除できません。</p>

</Admonition>

![drop-cluster-user](/img/drop-cluster-user.png)

