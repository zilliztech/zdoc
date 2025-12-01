---
title: "アクセス制御の説明 | BYOC"
slug: /access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するためにロールベースアクセス制御（RBAC）を実装しています。RBAC（ロールベースアクセス制御）は、権限をユーザーに直接ではなくロールに付与するセキュリティ対策です。これらの特定のリソースに対する権限を含むロールは、後にユーザーに付与され、ユーザーのアクセス制御の効率的な管理を可能にします。 | BYOC"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - AIの幻覚
  - AIエージェント
  - セマンティック検索
  - 異常検知

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するためにロールベースアクセス制御（RBAC）を実装しています。RBAC（ロールベースアクセス制御）は、権限をユーザーに直接ではなくロールに付与するセキュリティ対策です。これらの特定のリソースに対する権限を含むロールは、後にユーザーに付与され、ユーザーのアクセス制御の効率的な管理を可能にします。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](/img/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBACアーキテクチャ\{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](/img/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloudは、2つのプレーン内でリソースを整理し、両方にわたってRBACを実装しています：

- **コントロールプレーン**：このプレーンは組織、プロジェクト、およびクラスターマネジメントを含みます。[アカウントユーザー](./email-accounts)には特定の組織およびプロジェクトロールが付与され、コントロールプレーン上のリソースとやり取りする際に[APIキー](./manage-api-keys)で認証されます。

- **データプレーン**：このプレーンにはクラスター、データベース、コレクションが含まれ、データアクセス管理に焦点を当てています。[クラスターユーザー](./cluster-users)には適切なクラスターロールが付与され、データプレーンリソースとやり取りする際に[APIキー](./manage-api-keys)または[ユーザー名-パスワードペア](./cluster-credentials)を使用して認証されます。

通常、各アカウントユーザーはクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンにアクセスする必要があるわけではありません。場合によっては、請求管理者などのコントロールプレーンのアカウントユーザーが請求管理目的だけでコントロールプレーンにアクセスする必要があり、データプレーンへのアクセスを必要としないことがあります。逆に、一時的なクラスターユーザーを作成してカスタマイズされたAPIキーを通じてデータプレーンリソースにアクセスを許可することで、登録アカウントなしにデータアクセスを可能にできます。カスタマイズされたAPIキーの管理の詳細については、[APIキー](./manage-api-keys)を参照してください。

## ロールと権限\{#roles-and-privileges}

アカウントユーザーには組織ロールおよびプロジェクトロールが、クラスターユーザーにはクラスターロールが付与され、クラスター、データベース、およびコレクションへのアクセスを制御します。以下の図は、Zilliz Cloudのロール階層を示しています。

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](/img/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **組織レベルで**

    - 組織オーナーロールは、すべてのプロジェクトおよびクラスターにわたる包括的な権限を含みます。

    すべての組織ロールの詳細については、[組織ロール](./organization-users#organization-roles)を参照してください。

- **プロジェクトレベルで**

    - プロジェクト管理者ロールには、特定のプロジェクトのすべての権限とすべてのクラスターにわたる権限が含まれます。

    - プロジェクト読込・書込ロールには、プロジェクトを表示し、そのリソースを管理する権限があります。

    - プロジェクト読取専用ロールには、プロジェクトを表示し、そのリソースを表示する権限があります。

    プロジェクトロールの詳細については、[プロジェクトロール](./project-users#project-roles)を参照してください。

- **クラスターレベルで**

    - クラスターアドミンロールには、特定のクラスターのすべての権限が含まれます。

    - クラスター読込・書込ロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - クラスター読取専用ロールには、クラスターを表示し、そのリソースを表示する権限があります。

    - さらに、[カスタムロール](./cluster-roles#custom-cluster-roles)をこのレベルで作成し、データベースやコレクションなどのクラスターリソースへの[権限](./cluster-privileges)を正確に管理できます。

    クラスターロールの詳細については、[クラスターロールの管理（コンソール）](./cluster-roles)を参照してください。

## Zilliz CloudでRBACを実装\{#implement-rbac-in-zilliz-cloud}

以下の図は、Zilliz CloudでRBACを実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](/img/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. **ユーザーを作成**：Zilliz Cloudのデフォルトユーザー`db_admin`に加えて、新しいユーザーを作成し、[Webコンソール](./cluster-users)または[SDK](./cluster-users-sdk)を使用してパスワードを設定してデータセキュリティを保護できます。

2. **ロールを作成**：[Webコンソール](./cluster-roles)または[SDK](./cluster-roles-sdk)を使用してカスタマイズされたロールを作成できます。ロールの特定の機能は、その権限によって決定されます。

3. **（任意）権限グループを作成して権限を権限グループに追加**：複数の[権限](./cluster-privileges)を1つの権限グループに組み合わせて、ロールに権限を付与するプロセスを簡略化します。Zilliz Cloudが提供する組み込み権限グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups)を使用して独自のカスタマイズされた権限グループを作成することもできます。

4. **ロールに権限または権限グループを付与**：権限または権限グループをロールに付与して、ロールの機能を定義します。現在、[Webコンソール](./cluster-roles#create-a-custom-cluster-role)では組み込み権限グループのみをロールに付与できます。特定の権限またはカスタマイズされた権限グループをロールに付与するには、[サポートチケットを作成](http://support.zilliz.com)し、代わりに[SDK](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role)を使用してください。

5. **ユーザーにロールを付与**：特定の権限を持つロールをユーザーに付与して、ユーザーがロールの権限を持てるようにします。1つのロールを複数のユーザーに付与できます。このステップは、[Webコンソール](./cluster-users#edit-the-role-of-a-cluster-user)を介してまたは[SDK](./cluster-users-sdk#grant-a-role-to-a-user)を使用して完了できます。