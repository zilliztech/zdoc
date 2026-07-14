---
title: "アクセス制御の説明 | BYOC"
slug: /access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Zilliz Cloud 内のリソースへのアクセスをきめ細かく制御するために Role-Based Access Control (RBAC) を実装しています。RBAC (Role-Based Access Control) は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。リソースに対する特定の権限を含むこれらのロールがユーザーに付与されることで、ユーザーアクセス制御を効率的に管理できます。 | BYOC"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloud は、Zilliz Cloud 内のリソースへのアクセスをきめ細かく制御するために Role-Based Access Control (RBAC) を実装しています。RBAC (Role-Based Access Control) は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。リソースに対する特定の権限を含むこれらのロールがユーザーに付与されることで、ユーザーアクセス制御を効率的に管理できます。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](https://zdoc-images.s3.us-west-2.amazonaws.com/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBAC アーキテクチャ\{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](https://zdoc-images.s3.us-west-2.amazonaws.com/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloud はリソースを 2 つのプレーン内で整理し、その両方で RBAC を実装しています。

- **コントロールプレーン:** このプレーンには、組織、プロジェクト、およびクラスター管理が含まれます。[アカウントユーザー](./email-accounts) には特定の組織ロールおよびプロジェクトロールが付与され、コントロールプレーン上のリソースとやり取りする際には [API キー](./manage-api-keys) を使用して認証します。

- **データプレーン:** このプレーンには、クラスター、データベース、およびコレクションが含まれ、データアクセス管理に重点を置いています。[クラスターユーザー](./cluster-users) には適切なクラスターロールが付与され、データプレーンのリソースとやり取りする際には [API キー](./manage-api-keys) または [ユーザー名とパスワードの組み合わせ](./cluster-credentials) を使用して認証します。

通常、各アカウントユーザーは 1 人のクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンへのアクセスを必要とするわけではありません。たとえば、Billing Admin のようなコントロールプレーンのアカウントユーザーは、請求管理の目的でコントロールプレーンへのアクセスのみが必要で、データプレーンへのアクセスは不要な場合があります。逆に、一時的なクラスターユーザーを作成し、カスタマイズされた API キーを通じてデータプレーンのリソースへのアクセスを付与することで、登録済みアカウントがなくてもデータにアクセスできるようにすることもできます。カスタマイズされた API キーの管理の詳細については、[API キー](./manage-api-keys) を参照してください。

## ロールと権限\{#roles-and-privileges}

アカウントユーザーには組織ロールとプロジェクトロールが付与され、クラスターユーザーにはクラスター、データベース、およびコレクションへのアクセスを制御するクラスターロールが付与されます。次の図は、Zilliz Cloud におけるロールの階層を示しています。 

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **組織レベル**

    - Organization Owner ロールは、すべてのプロジェクトとクラスターにわたる包括的な権限を持ちます。

    すべての組織ロールの詳細については、[組織ロール](./organization-users) を参照してください。

- **プロジェクトレベル**

    - Project Admin ロールには、特定のプロジェクトのすべての権限と、そのプロジェクト内のすべてのリソースに対する権限が含まれます。

    - Project Read-Write ロールには、プロジェクトを表示し、そのリソースを管理する権限があります。

    - Project Read-Only ロールには、プロジェクトとそのリソースを表示する権限があります。

    プロジェクトロールの詳細については、[プロジェクトロール](./project-users) を参照してください。

- **クラスターレベル**

    - Cluster Admin ロールには、特定のクラスターのすべての権限が含まれます。

    - Cluster Read-Write ロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - Cluster Read-Only ロールには、クラスターとそのリソースを表示する権限があります。

    - さらに、このレベルでは [カスタムロール](./cluster-roles#custom-cluster-roles) を作成して、データベースやコレクションなどのクラスターリソースに対する [権限](./cluster-privileges) を正確に管理できます。

    クラスターロールの詳細については、[クラスターロールの管理（コンソール）](./cluster-roles) を参照してください。 

## Zilliz Cloud で RBAC を実装する\{#implement-rbac-in-zilliz-cloud}

次の図は、Zilliz Cloud で RBAC を実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](https://zdoc-images.s3.us-west-2.amazonaws.com/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. **ユーザーを作成する:** Zilliz Cloud のデフォルトユーザー `db_admin` に加えて、[Web コンソール](./cluster-users) または [SDK](./cluster-users-sdk) を使用して新しいユーザーを作成し、データセキュリティを保護するためのパスワードを設定できます。

1. **ロールを作成する:** [Web コンソール](./cluster-roles) または [SDK](./cluster-roles-sdk) を使用して、カスタマイズされたロールを作成できます。ロールの具体的な機能は、そのロールに付与された権限によって決まります。

1. **（任意）権限グループを作成し、その権限グループに権限を追加する:** 複数の [権限](./cluster-privileges) を 1 つの権限グループにまとめることで、ロールに権限を付与するプロセスを簡素化できます。Zilliz Cloud が提供する組み込みの権限グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups) を使用して独自のカスタマイズされた権限グループを作成することもできます。

1. **ロールに権限または権限グループを付与する:** このロールに権限または権限グループを付与することで、ロールの機能を定義します。現在、[Web コンソール](./cluster-roles#create-a-custom-cluster-role) では、ロールに付与できるのは組み込みの権限グループのみです。特定の権限またはカスタマイズされた権限グループをロールに付与するには、[サポートチケットを作成](http://support.zilliz.com) したうえで、代わりに [SDK](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を使用してください。

1. **ユーザーにロールを付与する:** 特定の権限を持つロールをユーザーに付与することで、ユーザーがそのロールの権限を持てるようにします。1 つのロールを複数のユーザーに付与できます。この手順は、[Web コンソール](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) または [SDK](./cluster-users-sdk#grant-a-role-to-a-user) のいずれかを使用して完了できます。

