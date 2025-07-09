---
title: "アクセス制御の説明 | Cloud"
slug: /access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するために、Role-Based Access Control（RBAC）を実装しています。RBAC（Role-Based Access Control）は、ユーザーに直接ではなく、ロールに権限を付与するセキュリティ対策です。これらのロールには、リソースに対する特定の権限が含まれており、ユーザーのアクセス制御を効率的に管理することができます。 | Cloud"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するために、Role-Based Access Control（RBAC）を実装しています。RBAC（Role-Based Access Control）は、ユーザーに直接ではなく、ロールに権限を付与するセキュリティ対策です。これらのロールには、リソースに対する特定の権限が含まれており、ユーザーのアクセス制御を効率的に管理することができます。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](/img/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBACアーキテクチャ{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](/img/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloudは、2つのプレーン内でリソースを整理し、両方にRBACを実装しています。

- コントロールプレーン:このプレーンには、組織、プロジェクト、クラスター管理が含まれます。[アカウントユーザー](./email-accounts)には、特定の組織とプロジェクトの役割が付与され、コントロールプレーン上のリソースとやり取りする際に[APIキー](./manage-api-keys)を介して認証されます。

- データプレーン:このプレーンには、データアクセス管理に焦点を当てたクラスタ、データベース、コレクションが含まれます。[クラスタユーザ](./cluster-users)には適切なクラスタロールが付与され、データプレーンリソースとやり取りする際に[APIキー](./manage-api-keys)または[ユーザ名とパスワードのペア](./cluster-credentials)を使用して認証されます。

通常、各アカウントユーザーはクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンにアクセスする必要はありません。Billing Adminのようなコントロールプレーンアカウントユーザーは、請求管理の目的でコントロールプレーンにアクセスする必要があり、データプレーンへのアクセスは必要ない場合があります。逆に、一時的なクラスターユーザーを作成し、カスタマイズされたAPIキーを介してデータプレーンリソースへのアクセスを許可することができ、登録されたアカウントなしでデータにアクセスできます。カスタマイズされたAPIキーの管理の詳細については、[APIキー](./manage-api-keys)を参照してください。

## 役割と特権{#roles-and-privileges}

アカウントユーザーには組織の役割とプロジェクトの役割が与えられ、クラスターユーザーにはクラスター、データベース、コレクションへのアクセスを制御するクラスターの役割が与えられます。次の図は、Zilliz Cloudの役割の階層を示しています。 

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](/img/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **組織レベルで**

    - 組織オーナーの役割には、すべてのプロジェクトとクラスターにわたる包括的な権限が含まれます。

    すべての組織の役割の詳細については、[組織の役割](./organization-users#organization-roles)を参照してください。

- **プロジェクトレベルで**

    - プロジェクト管理者の役割には、特定のプロジェクトのすべての権限と、すべてのクラスター全体の権限が含まれます。

    - プロジェクトの読み書きの役割には、プロジェクトを表示し、そのリソースを管理する権限があります。

    - プロジェクト読み取り専用ロールには、プロジェクトとそのリソースを表示する権限があります。

    プロジェクトの役割の詳細については、[プロジェクトの役割](./project-users#project-roles)を参照してください。

- **クラスターレベルで**

    - クラスター管理者の役割には、特定のクラスターのすべての特権が含まれます。

    - クラスターの読み書きロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - クラスター読み取り専用ロールには、クラスターとそのリソースを表示する権限があります。

    - さらに、このレベルで[カスタムロール](./cluster-roles#custom-cluster-roles)を作成して、[特権について](./cluster-privileges)をクラスターリソース(データベースやコレクションなど)に対して正確に管理できます。

    クラスターロールの詳細については、[クラスタロールの管理(コンソール)](./cluster-roles)を参照してください。 

## Zilliz CloudにRBACを実装する{#implement-rbac-in-zilliz-cloud}

次の図は、Zilliz CloudでRBACを実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](/img/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. ユーザーの作成: Zilliz Cloudのデフォルトユーザー`db_admin`に加えて、[webコンソール](./cluster-users)または[SDK](./cluster-users-sdk)を使用して、新しいユーザーを作成し、パスワードを設定してデータセキュリティを保護できます。

1. ロールの作成: [webコンソール](./cluster-roles)または[SDK](./cluster-roles-sdk)を使用して、カスタマイズされたロールを作成できます。ロールの特定の機能は、その権限によって決定されます。

1. (オプション)特権グループを作成し、特権グループに特権を追加する:複数の[特権について](./cluster-privileges)を1つの特権グループに結合して、役割に特権を付与する過程を効率化します。Zilliz Cloudが提供する組み込み特権グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups)を使用して独自のカスタマイズされた特権グループを作成することもできます。

1. 役割に特権または特権グループを付与する:この役割に特権または特権グループを付与することで、役割の機能を定義します。現在、役割に組み込み特権グループを付与できるのは[webコンソール](./cluster-roles#create-a-custom-cluster-role)のみです。特定の特権またはカスタマイズされた特権グループを役割に付与するには、[サポートチケットを作成する](http://support.zilliz.com)を使用してから、代わりに[SDK](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role)を使用してください。

1. ユーザーに役割を付与する:特定の特権を持つ役割をユーザーに付与し、ユーザーが役割の特権を持つことができるようにします。1つの役割を複数のユーザーに付与することができます。この手順は、[webコンソール](./cluster-users#edit-the-role-of-a-cluster-user)を使用するか、[SDK](./cluster-users-sdk#grant-a-role-to-a-user)を使用して完了できます。

