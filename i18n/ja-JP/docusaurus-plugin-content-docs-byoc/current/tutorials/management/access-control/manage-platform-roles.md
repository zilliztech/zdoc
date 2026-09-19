---
title: "プラットフォームロールの管理 | BYOC"
slug: /manage-platform-roles
sidebar_label: "プラットフォームロールの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における 2 種類のプラットフォームロール（組織ロールとプロジェクトロール）を紹介し、その管理方法を説明します。 | BYOC"
type: origin
token: MyKpwdBxUizDsukJm5Kc8orenbT
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォームロールの管理

このガイドでは、Zilliz Cloud における 2 種類のプラットフォームロール（組織ロールとプロジェクトロール）を紹介し、その管理方法を説明します。

## 組織ロールの管理\{#manage-organization-roles}

組織ロールは、組織レベルのアクセスを制御します。組織ロールを使用すると、メンバー、グループ、組織設定、課金とサブスクリプション、セキュリティ設定、組織アラート、プラットフォーム監査ログの表示、API キー、プロジェクト管理、ごみ箱操作に関する権限を管理できます。

<Admonition type="info" title="Note">

組織ロールは組織レベルのリソースのみを対象とします。クラスター、データベース、コレクションの権限は定義しません。

</Admonition>

### 事前定義された組織ロール\{#predefined-organization-roles}

次の表に、3つの事前定義された組織ロールについて説明します。

| ロール | 説明 | 編集可否 |
| --- | --- | --- |
| Organization Owner | アクセス制御、設定、課金、セキュリティ、サービスプリンシパル、プロジェクトロールの割り当てを含む、組織レベルの完全な管理 | 不可 |
| Billing Admin | 関連する組織およびプロジェクトのコンテキストへの読み取り専用アクセスを使用した、課金とサブスクリプションの管理 | 不可 |
| Public | すべての組織メンバーに自動的に付与される、ログインのみの基本ロール | 不可 |

## プロジェクトロールの管理\{#manage-project-roles}

プロジェクトロールは、特定のプロジェクト内のアクセスを制御します。プロジェクトロールを使用すると、プロジェクトメンバー、クラスターのライフサイクル操作、オンデマンドコンピュートへのアクセス、統合、バックアップ、移行、アラート、ボリューム、プロジェクトスコープのデータアクセスを管理できます。

<Admonition type="info" title="Note">

プロジェクトロールは特定のプロジェクトに属します。プロジェクトロールを割り当てると、その割り当ては選択したプロジェクトにのみ適用されます。

</Admonition>

### 事前定義されたプロジェクトロール\{#predefined-project-roles}

次の表に、4つの事前定義されたプロジェクトロールについて説明します。

| ロール | 推奨対象 | 主な権限 |
| --- | --- | --- |
| Project Admin | プロジェクトオーナーおよびプラットフォーム管理者 | コラボレーター、ロール、クラスターのライフサイクル、コンピュート、データアクセスを含む、プロジェクトの完全な管理 |
| Data Admin | データベース管理者およびプラットフォームエンジニア | スケーリング、バックアップ、クラスター操作、データアクセスなどのデータ管理 |
| Data Operator | アプリケーションチームおよびデータエンジニア | 限定的なプロジェクト管理を含む、データの読み取りおよび書き込み操作 |
| Data Viewer | アナリスト、開発者、読み取り専用アプリケーション | 表示、クエリ、検索のワークフロー向けの読み取り専用アクセス |

### カスタムプロジェクトロール\{#custom-project-roles}

事前定義されたロールがチームの責務に合わない場合は、カスタムプロジェクトロールを作成します。カスタムプロジェクトロールでは、プロジェクト内のプラットフォーム権限、コンピュート権限、データアクセス権限を組み合わせることができます。

#### カスタムプロジェクトロールの作成\{#create-a-custom-project-role}

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Project Roles** タブを開きます。

1. **+ Project Role** をクリックします。

    ![IlOjwjvJwhqzu4bUqodcngrtnCg](https://zdoc-images.s3.us-west-2.amazonaws.com/IlOjwjvJwhqzu4bUqodcngrtnCg.png)

1. ロールテンプレートを選択し、**Next** をクリックします。

    ![ReCmbb1xmoBkZJxbzFScSkewnLb](https://zdoc-images.s3.us-west-2.amazonaws.com/recmbb1xmobkzjxbzfscskewnlb.png "ReCmbb1xmoBkZJxbzFScSkewnLb")

1. カスタムロールの名前と説明を入力します。

    ![MQf2wvFB2hzZ36bqtqlc8gLqnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/MQf2wvFB2hzZ36bqtqlc8gLqnWg.png)

1. ロールのアクセス権を設定し、**Create** をクリックします。カスタムプロジェクトロールに追加できる権限の全一覧については、[Resource Privilege Reference](./platform-privileges) を参照してください。

    ![Q7qSb7glyojMIfxjpLrcBrX5naf](https://zdoc-images.s3.us-west-2.amazonaws.com/q7qsb7glyojmifxjplrcbrx5naf.png "Q7qSb7glyojMIfxjpLrcBrX5naf")

</Procedures>

#### カスタムプロジェクトロールの編集\{#edit-a-custom-project-role}

権限セットを変更する必要がある場合は、カスタムプロジェクトロールを編集します。変更内容は、そのロールが付与されているすべてのユーザー、グループ、またはカスタマイズされた API キーに適用されます。

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Project Roles** タブを開きます。

1. 対象のカスタムロールを探し、**Actions** メニューから **Edit** を選択します。

    ![HMbXwwXMvhE92KbOheUcaxIGnud](https://zdoc-images.s3.us-west-2.amazonaws.com/HMbXwwXMvhE92KbOheUcaxIGnud.png)

1. ロールの詳細または権限を更新し、**Save** をクリックします。

    ![JoE9bvCe8ofqBPxIqo9cP1lPnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/joe9bvce8ofqbpxiqo9cp1lpnzf.png "JoE9bvCe8ofqBPxIqo9cP1lPnZf")

</Procedures>

#### カスタムプロジェクトロールの削除\{#delete-a-custom-project-role}

<Admonition type="info" title="Note">

ユーザー、グループ、またはサービスプリンシパルに割り当てられているプロジェクトロールは削除できません。ロールを削除する前に、既存の割り当てを解除してください。

</Admonition>

![L4qGwxOVch3VRRbDLdRczHiZnBc](https://zdoc-images.s3.us-west-2.amazonaws.com/L4qGwxOVch3VRRbDLdRczHiZnBc.png)

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Project Roles** タブを開きます。

1. 対象のカスタムロールを探し、**Actions** メニューから **Delete** を選択します。

1. 削除を確認します。

</Procedures>
