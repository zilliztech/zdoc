---
title: "アクセス制御の説明 | BYOC"
slug: /access-control-overview
sidebar_label: "アクセス制御の説明"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するために、Role-Based Access Control（RBAC）を実装しています。RBAC（Role-Based Access Control）は、ユーザーに直接ではなく、ロールに権限を付与するセキュリティ対策です。これらのロールには、リソースに対する特定の権限が含まれており、ユーザーのアクセス制御を効率的に管理することができます。 | BYOC"
type: origin
token: WFmRwd6Abi2tdUkEJs8cVPounGf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';


# アクセス制御の説明

Zilliz Cloudは、Zilliz Cloud内のリソースへのアクセスを細かく制御するために、Role-Based Access Control（RBAC）を実装しています。RBAC（Role-Based Access Control）は、ユーザーに直接ではなく、ロールに権限を付与するセキュリティ対策です。これらのロールには、リソースに対する特定の権限が含まれており、ユーザーのアクセス制御を効率的に管理することができます。

![LZPEwzB9XhRIFebkvVic1dTInWh](/img/LZPEwzB9XhRIFebkvVic1dTInWh.png)

## Zilliz Cloud RBACアーキテクチャ{#zilliz-cloud-rbac-architecture}

![XXLqwF2z7hdImMblotsc40vinKb](/img/XXLqwF2z7hdImMblotsc40vinKb.png)

Zilliz Cloudは、2つのプレーン内でリソースを整理し、両方にRBACを実装しています。

- **コントロールプレーン:**このプレーンには、組織、プロジェクト、クラスター管理が含まれます。[アカウントユーザー](./email-accounts)には、特定の組織とプロジェクトの役割が付与され、コントロールプレーン上のリソースとやり取りする際に[APIキー](./manage-api-keys)を使用して認証されます。

- **データプレーン:**このプレーンには、データアクセス管理に焦点を当てたクラスター、データベース、コレクションが含まれます。[クラスターユーザー](./cluster-users)には適切なクラスターロールが付与され、データプレーンリソースとやり取りする際に[APIキー](./manage-api-keys)または[ユーザー名-パスワードペア](null)を使用して認証されます。

通常、各アカウントユーザーはクラスターユーザーに対応します。ただし、すべてのユーザーが両方のプレーンにアクセスする必要はありません。Billing Adminのようなコントロールプレーンアカウントユーザーは、請求管理の目的でコントロールプレーンにアクセスするだけで、データプレーンにアクセスする必要がない場合があります。逆に、一時的なクラスターユーザーを作成し、カスタマイズされたAPIキーを介してデータプレーンリソースにアクセスできるようにすることができます。カスタマイズされたAPIキーの管理の詳細については、[APIキー](./manage-api-keys)を参照してください。

## 役割と特権{#roles-and-privileges}

アカウントユーザーには組織ロールとプロジェクトロールが付与され、クラスターユーザーにはクラスター、データベース、コレクションへのアクセスを制御するクラスターロールが付与されます。次の図は、Zilliz Cloudのロールの階層を示しています。

![H5TewEwdhhNCwNbcTYkcM2ganbg](/img/H5TewEwdhhNCwNbcTYkcM2ganbg.png)

- **組織レベルで**

    - 組織オーナーの役割には、すべてのプロジェクトとクラスターにわたる包括的な権限が含まれます。

    すべての組織の役割の詳細については、[組織の役割](./organization-users#organization-roles)を参照してください。

- **プロジェクトレベルで**

    - プロジェクト管理者の役割には、特定のプロジェクトのすべての権限と、すべてのクラスター全体の権限が含まれます。

    - プロジェクトの読み書きの役割には、プロジェクトを表示し、そのリソースを管理する権限があります。

    - プロジェクト読み取り専用の役割には、プロジェクトとそのリソースを表示する権限があります。

    プロジェクトの役割の詳細については、「[プロジェクトの役割](./project-users#project-roles)」を参照してください。

- **クラスタレベルで**

    - クラスター管理者の役割には、特定のクラスターのすべての特権が含まれます。

    - クラスターの読み書きロールには、クラスターを表示し、そのすべてのリソースを管理する権限があります。

    - クラスター読み取り専用ロールには、クラスターとそのリソースを表示する権限があります。

    - さらに、このレベルで[カスタムロール](./cluster-roles)を作成して、データベースやコレクションなどのクラスターリソースへの[特権](./cluster-privileges)を正確に管理できます。

    クラスターロールの詳細については、「[クラスタロールの管理(コンソール)](./cluster-roles)」を参照してください。

