---
title: "アクセス制御の説明 | Cloud"
slug: /access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するためにロールベースアクセス制御（RBAC）を実装しています。RBAC（ロールベースアクセス制御）は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。これらのロールにはリソースへの特定の権限が含まれており、ユーザーに付与されることで、ユーザーアクセス制御の効率的な管理が可能になります。 | Cloud"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - 階層的ナビgableスモールワールド
  - 密埋め込み
  - Faissベクターデータベース
  - Chromaベクターデータベース

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するためにロールベースアクセス制御（RBAC）を実装しています。RBAC（ロールベースアクセス制御）は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。これらのロールにはリソースへの特定の権限が含まれており、ユーザーに付与されることで、ユーザーアクセス制御の効率的な管理が可能になります。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](/img/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBACアーキテクチャ\{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](/img/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloudは、2つのプレーン内でリソースを整理し、両方にわたってRBACを実装しています：

- **コントロールプレーン：** このプレーンには、組織、プロジェクト、およびクラスターマネジメントが含まれます。[アカウントユーザー](./email-accounts)には特定の組織およびプロジェクトロールが付与され、コントロールプレーンのリソースとやり取りする際は[APIキー](./manage-api-keys)を介して認証されます。

- **データプレーン：** このプレーンには、クラスター、データベース、およびコレクションが含まれ、データアクセス管理に焦点を当てています。[クラスターユーザー](./cluster-users)には適切なクラスターロールが付与され、データプレーンリソースとやり取りする際は[APIキー](./manage-api-keys)または[ユーザー名パスワードペア](./cluster-credentials)を使用して認証されます。

通常、各アカウントユーザーはクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンへのアクセスを必要とするわけではありません。場合によっては、請求管理者のようなコントロールプレーンアカウントユーザーが、請求管理目的だけでコントロールプレーンへのアクセスを必要とし、データプレーンへのアクセスを必要としないことがあります。逆に、一時的なクラスターユーザーを作成し、カスタマイズされたAPIキーを通じてデータプレーンリソースへのアクセスを許可することは、登録されたアカウントなしにデータアクセスを可能にすることができます。カスタマイズされたAPIキーの管理の詳細については、[APIキー](./manage-api-keys)を参照してください。

## ロールと権限\{#roles-and-privileges}

アカウントユーザーには組織ロールおよびプロジェクトロールが付与され、クラスターユーザーにはクラスター、データベース、およびコレクションへのアクセスを制御するクラスターロールが付与されます。以下の図は、Zilliz Cloudのロール階層を示しています。

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](/img/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **組織レベルで**

    - 組織オーナーロールには、すべてのプロジェクトおよびクラスターにわたる包括的な権限が含まれます。

    すべての組織ロールの詳細については、[組織ロール](./organization-users#organization-roles)を参照してください。

- **プロジェクトレベルで**

    - プロジェクト管理者ロールには、特定のプロジェクトのすべての権限およびすべてのクラスターにわたる権限が含まれます。

    - プロジェクト読み書きロールには、プロジェクトを表示し、そのリソースを管理する権限があります。

    - プロジェクト読み取り専用ロールには、プロジェクトを表示し、そのリソースを表示する権限があります。

    プロジェクトロールの詳細については、[プロジェクトロール](./project-users#project-roles)を参照してください。

- **クラスターレベルで**

    - クラスターアドミンロールには、特定のクラスターのすべての権限が含まれます。

    - クラスター読み書きロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - クラスター読み取り専用ロールには、クラスターを表示し、そのリソースを表示する権限があります。

    - さらに、[カスタムロール](./cluster-roles#custom-cluster-roles)は、データベースおよびコレクションなどのクラスターリソースへの[権限](./cluster-privileges)を正確に管理するために、このレベルで作成できます。

    クラスターロールの詳細については、[クラスターロールの管理（コンソール）](./cluster-roles)を参照してください。

## Zilliz CloudでRBACを実装\{#implement-rbac-in-zilliz-cloud}

以下の図は、Zilliz CloudでRBACを実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](/img/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. **ユーザーを作成：** Zilliz Cloudのデフォルトユーザー`db_admin`に加えて、新しいユーザーを作成し、[ウェブコンソール](./cluster-users)または[SDK](./cluster-users-sdk)を介してパスワードを設定してデータセキュリティを保護できます。

1. **ロールを作成：** [ウェブコンソール](./cluster-roles)または[SDK](./cluster-roles-sdk)を使用して、カスタマイズされたロールを作成できます。ロールの特定の機能は、その権限によって決定されます。

1. **（オプション）権限グループを作成し、権限グループに権限を追加：** 複数の[権限](./cluster-privileges)を1つの権限グループに組み合わせて、ロールに権限を付与するプロセスを合理化します。Zilliz Cloudが提供する組み込み権限グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups)を使用して独自のカスタム権限グループを作成することもできます。

1. **ロールに権限または権限グループを付与：** 権限または権限グループをこのロールに付与することで、ロールの機能を定義します。現在、[ウェブコンソール](./cluster-roles#create-a-custom-cluster-role)では組み込み権限グループのみをロールに付与できます。特定の権限またはカスタム権限グループをロールに付与するには、[サポートチケットを作成](http://support.zilliz.com)してから[SDK](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role)を使用してください。

1. **ユーザーにロールを付与：** 特定の権限を持つロールをユーザーに付与して、ユーザーがロールの権限を持つようにします。1つのロールは複数のユーザーに付与できます。この手順は、[ウェブコンソール](./cluster-users#edit-the-role-of-a-cluster-user)または[SDK](./cluster-users-sdk#grant-a-role-to-a-user)を使用して完了できます。