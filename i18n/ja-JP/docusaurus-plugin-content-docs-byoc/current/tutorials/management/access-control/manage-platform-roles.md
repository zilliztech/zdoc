---
title: "プラットフォームロールの管理 | BYOC"
slug: /manage-platform-roles
sidebar_label: "プラットフォームロールの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud の2種類のプラットフォームロール（組織ロールとプロジェクトロール）について紹介し、その管理方法を説明します。 | BYOC"
type: origin
token: MyKpwdBxUizDsukJm5Kc8orenbT
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォームロールの管理

このガイドでは、Zilliz Cloud の2種類のプラットフォームロール（組織ロールとプロジェクトロール）について紹介し、その管理方法を説明します。

## 組織ロールの管理\{#manage-organization-roles}

組織ロールは、組織レベルのアクセスを制御します。組織ロールを使用すると、メンバー、グループ、組織設定、請求とサブスクリプション、セキュリティ設定、組織アラート、プラットフォーム監査ログの表示、APIキー、プロジェクト管理、ごみ箱操作の権限を管理できます。

<Admonition type="info" icon="📘" title="Note">

組織ロールは組織レベルのリソースのみを対象とします。クラスター、データベース、コレクションの権限は定義しません。

</Admonition>

### 既定の組織ロール\{#predefined-organization-roles}

次の表に、3つの既定の組織ロールについて説明します。

| ロール | 説明 | 編集可否 |
| --- | --- | --- |
| Organization Owner | アクセス制御、設定、請求、セキュリティ、サービスプリンシパル、プロジェクトロールの割り当てなど、組織レベルの完全な管理権限。 | 不可 |
| Billing Admin | 関連する組織およびプロジェクトのコンテキストへの読み取り専用アクセスを持ち、請求とサブスクリプションを管理します。 | 不可 |
| Public | すべての組織メンバーに自動的に付与される、ログインのみの基本ロールです。 | 不可 |

## プロジェクトロールの管理\{#manage-project-roles}

プロジェクトロールは、特定のプロジェクト内のアクセスを制御します。プロジェクトロールを使用すると、プロジェクトメンバー、クラスターのライフサイクル操作、オンデマンドコンピューティングへのアクセス、インテグレーション、バックアップ、移行、アラート、ボリューム、およびプロジェクトスコープのデータアクセスを管理できます。

<Admonition type="info" icon="📘" title="Note">

プロジェクトロールは特定のプロジェクトに属します。プロジェクトロールを割り当てると、その割り当ては選択したプロジェクトにのみ適用されます。

</Admonition>

### 既定のプロジェクトロール\{#predefined-project-roles}

次の表に、4つの既定のプロジェクトロールについて説明します。

| ロール | 推奨対象 | 主な権限 |
| --- | --- | --- |
| Project Admin | プロジェクトオーナーおよびプラットフォーム管理者。 | 共同作業者、ロール、クラスターのライフサイクル、コンピューティング、データアクセスを含む、プロジェクトの完全な管理権限。 |
| クラスター Admin | データベース管理者およびプラットフォームエンジニア。 | スケーリング、バックアップ、クラスター操作、データアクセスなどのクラスター管理。 |
| Data Operator | アプリケーションチームおよびデータエンジニア。 | 限定的なプロジェクト管理権限を持つ、データの読み書き操作。 |
| Data Viewer | アナリスト、開発者、および読み取り専用アプリケーション。 | 表示、クエリ、検索ワークフローのための読み取り専用アクセス。 |

### カスタムプロジェクトロール\{#custom-project-roles}

既定のロールがチームの責務に合わない場合は、カスタムプロジェクトロールを作成してください。カスタムプロジェクトロールでは、プロジェクト内のプラットフォーム権限、コンピューティング権限、データアクセス権限を組み合わせることができます。

#### カスタムプロジェクトロールの作成\{#create-a-custom-project-role}

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Contro**l に移動します。

1. **Project Roles** タブを開きます。

1. **+ Project Role** をクリックします。

    ![IlOjwjvJwhqzu4bUqodcngrtnCg](https://zdoc-images.s3.us-west-2.amazonaws.com/IlOjwjvJwhqzu4bUqodcngrtnCg.png)

1. カスタムロールの作成方法を選択し、**Next** をクリックします。

    - **Start from scratch**: 柔軟性を最大限に高めるため、完全にカスタマイズされたロールを作成します。

    - **Select an existing project role as a template**: 既定のロールを出発点として使用し、その権限を微調整して効率化を図ります。

    ![GmXybbNiooO6UOxmFbecv5honGh](https://zdoc-images.s3.us-west-2.amazonaws.com/gmxybbniooo6uoxmfbecv5hongh.png "GmXybbNiooO6UOxmFbecv5honGh")

1. カスタムロールの名前と説明を入力します。

    ![MQf2wvFB2hzZ36bqtqlc8gLqnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/MQf2wvFB2hzZ36bqtqlc8gLqnWg.png)

1. ロールのアクセス権限を設定し、**Create** をクリックします。カスタムプロジェクトロールに追加できる権限の全一覧については、[Resource Privilege Reference](./platform-privileges) を参照してください。

    ![Q7qSb7glyojMIfxjpLrcBrX5naf](https://zdoc-images.s3.us-west-2.amazonaws.com/q7qsb7glyojmifxjplrcbrx5naf.png "Q7qSb7glyojMIfxjpLrcBrX5naf")

</Procedures>

#### カスタムプロジェクトロールの編集\{#edit-a-custom-project-role}

権限セットを変更する必要がある場合は、カスタムプロジェクトロールを編集します。変更内容は、そのロールが付与されているすべてのユーザー、グループ、またはカスタマイズされたAPIキーに適用されます。

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Contro**l に移動します。

1. **Project Roles** タブを開きます。

1. 対象のカスタムロールを見つけ、**Actions** メニューから **Edit** を選択します。

    ![HMbXwwXMvhE92KbOheUcaxIGnud](https://zdoc-images.s3.us-west-2.amazonaws.com/HMbXwwXMvhE92KbOheUcaxIGnud.png)

1. ロールの詳細または権限を更新し、**Save** をクリックします。

    ![JoE9bvCe8ofqBPxIqo9cP1lPnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/joe9bvce8ofqbpxiqo9cp1lpnzf.png "JoE9bvCe8ofqBPxIqo9cP1lPnZf")

</Procedures>

#### カスタムプロジェクトロールの削除\{#delete-a-custom-project-role}

<Admonition type="info" icon="📘" title="Note">

ユーザー、グループ、またはサービスプリンシパルに割り当てられているプロジェクトロールは削除できません。ロールを削除する前に、既存の割り当てを解除してください。

</Admonition>

![L4qGwxOVch3VRRbDLdRczHiZnBc](https://zdoc-images.s3.us-west-2.amazonaws.com/L4qGwxOVch3VRRbDLdRczHiZnBc.png)

<Procedures>

1. 対象のプロジェクトを開きます。

1. **Access Contro**l に移動します。

1. **Project Roles** タブを開きます。

1. 対象のカスタムロールを見つけ、**Actions** メニューから **Delete** を選択します。

1. 削除を確認します。

</Procedures>
