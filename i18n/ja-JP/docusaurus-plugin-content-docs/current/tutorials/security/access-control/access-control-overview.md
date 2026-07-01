---
title: "アクセス制御の説明 | Cloud"
slug: /access-control-overview
sidebar_key: access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ロールベースアクセス制御（RBAC）を実装し、Zilliz Cloud 内のリソースへのアクセスを細かく制御します。RBAC（ロールベースアクセス制御）は、ユーザーに直接権限を付与するのではなく、ロールに権限を付与するセキュリティ対策です。リソースに対する特定の権限を含むこれらのロールをユーザーに割り当てることで、ユーザーのアクセス制御を効率的に管理できます。 | Cloud"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - アクセス制御
  - rbac

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloud は、Zilliz Cloud 内のリソースへのアクセスを細かく制御するために、ロールベースアクセス制御（RBAC）を実装しています。RBAC（ロール-Based Access Control）は、ユーザーに直接権限を付与するのではなく、ロールに権限を付与するセキュリティ対策です。これらのロールにはリソースに対する特定の権限が含まれており、ユーザーに付与されることで、ユーザーのアクセス制御を効率的に管理できます。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](https://zdoc-images.s3.us-west-2.amazonaws.com/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBAC アーキテクチャ\{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](https://zdoc-images.s3.us-west-2.amazonaws.com/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloud は、2 つのプレーン内でリソースを整理し、両方で RBAC を実装しています。

- **コントロールプレーン:** このプレーンには、組織、プロジェクト、クラスター管理が含まれます。[アカウントユーザー](./email-accounts) には特定の組織ロールとプロジェクトロールが付与され、コントロールプレーンのリソースと対話する際に [API キー](./manage-api-keys) を使用して認証を行います。

- **データプレーン:** このプレーンには、クラスター、データベース、コレクションが含まれ、データアクセス管理に焦点を当てています。[クラスターユーザー](./cluster-users) には適切なクラスターロールが付与され、データプレーンのリソースと対話する際に [API キー](./manage-api-keys) または [ユーザー名とパスワードのペア](./cluster-credentials) を使用して認証を行います。

通常、各アカウントユーザーはクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンへのアクセスを必要とするわけではありません。場合によっては、請求管理者 のようなコントロールプレーンのアカウントユーザーは、請求管理の目的でコントロールプレーンのみにアクセスできればよく、データプレーンへのアクセスは不要です。逆に、一時的なクラスターユーザーを作成し、カスタマイズされた API キーを通じてデータプレーンのリソースへのアクセスを付与することで、登録済みアカウントがなくてもデータにアクセスできるようにできます。カスタマイズされた API キーの管理の詳細については、[API キー](./manage-api-keys) を参照してください。

## ロールと権限\{#roles-and-privileges}

アカウントユーザーには組織ロールとプロジェクトロールが付与され、クラスターユーザーにはクラスター、データベース、コレクションへのアクセスを制御するクラスターロールが付与されます。以下の図は、Zilliz Cloud におけるロールの階層を示しています。

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **組織レベルで**

    - 組織オーナーロールは、すべてのプロジェクトとクラスターにわたる包括的な権限を含みます。

    すべての組織ロールの詳細については、[組織ロール](./organization-users) を参照してください。

- **プロジェクトレベルで**

    - プロジェクト管理者ロールには、特定のプロジェクトのすべての権限と、すべてのクラスターにわたる権限が含まれます。

    - プロジェクト読み書きロールには、プロジェクトを表示し、そのリソースを管理する権限があります。

    - プロジェクト読み取り専用ロールには、プロジェクトとそのリソースを表示する権限があります。

    プロジェクトロールの詳細については、[プロジェクトロール](./project-users) を参照してください。

- **クラスターレベルで**

    - クラスター管理者ロールには、特定のクラスターのすべての権限が含まれます。

    - クラスター読み書きロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - クラスター読み取り専用ロールには、クラスターとそのリソースを表示する権限があります。

    - さらに、このレベルでは [カスタムロール](./cluster-roles#custom-cluster-roles) を作成でき、データベースやコレクションなどのクラスターリソースに対する [権限](./cluster-privileges) を正確に管理できます。

    クラスターロールの詳細については、[クラスターロールの管理（コンソール）](./cluster-roles) を参照してください。

## Zilliz Cloud での RBAC の実装\{#implement-rbac-in-zilliz-cloud}

以下の図は、Zilliz Cloud で RBAC を実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](https://zdoc-images.s3.us-west-2.amazonaws.com/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. **ユーザーの作成:** Zilliz Cloud のデフォルトユーザー `db_admin` に加えて、[Web コンソール](./cluster-users) を使用するか、[SDK](./cluster-users-sdk) を使用して新しいユーザーを作成し、データセキュリティを保護するためのパスワードを設定できます。

1. **ロールの作成:** [Web コンソール](./cluster-roles) を使用するか、[SDK](./cluster-roles-sdk) を使用してカスタマイズされたロールを作成できます。ロールの具体的な機能は、その権限によって決定されます。

1. **（オプション）特権グループの作成と権限の追加:** 複数の [権限](./cluster-privileges) を 1 つの特権グループに結合して、ロールへの権限付与プロセスを簡素化できます。Zilliz Cloud が提供する組み込みの特権グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups) を使用して独自のカスタマイズされた特権グループを作成することもできます。

1. **権限または特権グループをロールに付与:** 権限または特権グループをロールに付与することで、ロールの機能を定義します。現在、[Web コンソール](./cluster-roles#create-a-custom-cluster-role) では、組み込みの特権グループのみをロールに付与できます。特定の権限またはカスタマイズされた特権グループをロールに付与するには、[サポートチケットを作成](http://support.zilliz.com) し、代わりに [SDK](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を使用してください。

1. **ユーザーにロールを付与:** 特定の権限を持つロールをユーザーに付与することで、ユーザーはそのロールの権限を得られます。単一のロールを複数のユーザーに付与できます。このステップは、[Web コンソール](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) を使用するか、[SDK](./cluster-users-sdk#grant-a-role-to-a-user) を使用して完了できます。

