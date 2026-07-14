---
title: "Access Control の解説 | Cloud"
slug: /access-control-overview
sidebar_label: "Access Control の解説"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Zilliz Cloud 内のリソースへのアクセスをきめ細かく制御するために Role-Based Access Control (RBAC) を実装しています。RBAC (Role-Based Access Control) は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。リソースに対する特定の権限を含むこれらのロールがその後ユーザーに付与されることで、ユーザーアクセス制御を効率的に管理できます。 | Cloud"
type: origin
token: UDjcwWISuixYjqkQy3GcmBpsnmV
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Access Control の解説

Zilliz Cloud は、Zilliz Cloud 内のリソースへのアクセスをきめ細かく制御するために Role-Based Access Control (RBAC) を実装しています。RBAC (Role-Based Access Control) は、ユーザーに直接ではなくロールに権限を付与するセキュリティ対策です。リソースに対する特定の権限を含むこれらのロールがその後ユーザーに付与されることで、ユーザーアクセス制御を効率的に管理できます。

![L1WGwjF2NhxLRXbcyl6cSroNnoc](https://zdoc-images.s3.us-west-2.amazonaws.com/L1WGwjF2NhxLRXbcyl6cSroNnoc.png)

## Zilliz Cloud RBAC アーキテクチャ\{#zilliz-cloud-rbac-architecture}

![WVIgwWtMYhhTBIbgAdAcegDRnle](https://zdoc-images.s3.us-west-2.amazonaws.com/WVIgwWtMYhhTBIbgAdAcegDRnle.png)

Zilliz Cloud は、そのリソースを 2 つのプレーン内で構成し、両方にわたって RBAC を実装しています。

- **Control plane:** このプレーンには、organization、project、および cluster 管理が含まれます。[アカウントユーザー](./email-accounts) には特定の organization ロールおよび project ロールが付与され、control plane 上のリソースを操作する際には [API key](./manage-api-keys) で認証します。

- **Data plane:** このプレーンには、cluster、database、および collection が含まれ、データアクセス管理に重点を置いています。[cluster ユーザー](./cluster-users) には適切な cluster ロールが付与され、data plane のリソースを操作する際には [API key](./manage-api-keys) または [ユーザー名とパスワードの組み合わせ](./cluster-credentials) を使用して認証します。

通常、各アカウントユーザーは 1 人の cluster ユーザーに対応します。ただし、すべてのユーザーが両方のプレーンへのアクセスを必要とするわけではありません。場合によっては、Billing Admin のような control plane のアカウントユーザーは、課金管理の目的で control plane のみにアクセスできれば十分で、data plane へのアクセスは不要です。逆に、一時的な cluster ユーザーを作成し、カスタマイズされた API key を通じて data plane リソースへのアクセスを付与することで、登録済みアカウントがなくてもデータアクセスを可能にできます。カスタマイズされた API key の管理の詳細については、[API Keys](./manage-api-keys) を参照してください。

## ロールと権限\{#roles-and-privileges}

アカウントユーザーには organization ロールと project ロールが付与され、cluster ユーザーには cluster、database、および collection へのアクセスを制御する cluster ロールが付与されます。次の図は、Zilliz Cloud におけるロールの階層を示しています。

![TnkCwHx6jhk7UmbvYT7cVGlIn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/TnkCwHx6jhk7UmbvYT7cVGlIn7b.png)

- **organization レベル**

    - Organization Owner ロールは、すべての project と cluster にわたる包括的な権限を持ちます。

    すべての organization ロールの詳細については、[Organization roles](./organization-users) を参照してください。

- **project レベル**

    - Project Admin ロールには、特定の project のすべての権限と、その project 内のすべてのリソースに対する権限が含まれます。

    - Project Read-Write ロールには、project を表示し、そのリソースを管理する権限があります。

    - Project Read-Only ロールには、project とそのリソースを表示する権限があります。

    project ロールの詳細については、[Project roles](./project-users) を参照してください。

- **cluster レベル**

    - Cluster Admin ロールには、特定の cluster のすべての権限が含まれます。

    - Cluster Read-Write ロールには、cluster を表示し、そのすべてのリソースを管理する権限があります。

    - Cluster Read-Only ロールには、cluster とそのリソースを表示する権限があります。

    - さらに、このレベルでは、database や collection などの cluster リソースに対する [権限](./cluster-privileges) を正確に管理するために、[カスタムロール](./cluster-roles#custom-cluster-roles) を作成できます。

    cluster ロールの詳細については、[Manage Cluster Roles (Console)](./cluster-roles) を参照してください。

## Zilliz Cloud で RBAC を実装する\{#implement-rbac-in-zilliz-cloud}

次の図は、Zilliz Cloud で RBAC を実装するための完全なワークフローを示しています。

![B8sbwgywghYn1tbMTOwcjg65nne](https://zdoc-images.s3.us-west-2.amazonaws.com/B8sbwgywghYn1tbMTOwcjg65nne.png)

1. **ユーザーを作成する:** Zilliz Cloud のデフォルトユーザー `db_admin` に加えて、[web console](./cluster-users) または [SDK](./cluster-users-sdk) を使用して、新しいユーザーを作成し、データセキュリティを保護するためのパスワードを設定できます。

1. **ロールを作成する:** [web console](./cluster-roles) または [SDK](./cluster-roles-sdk) を使用して、カスタマイズされたロールを作成できます。ロールの具体的な機能は、その権限によって決まります。

1. **（任意）権限グループを作成し、権限を権限グループに追加する:** 複数の [権限](./cluster-privileges) を 1 つの権限グループにまとめることで、ロールに権限を付与するプロセスを簡素化できます。Zilliz Cloud が提供する組み込みの権限グループに加えて、[SDK](./cluster-privileges#custom-privilege-groups) を使用して独自のカスタマイズされた権限グループを作成することもできます。

1. **ロールに権限または権限グループを付与する:** このロールに権限または権限グループを付与することで、ロールの機能を定義します。現在、[web console](./cluster-roles#create-a-custom-cluster-role) ではロールに組み込みの権限グループのみ付与できます。特定の権限またはカスタマイズされた権限グループをロールに付与するには、[support ticket を作成](http://support.zilliz.com) してから、代わりに [SDK](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を使用してください。

1. **ユーザーにロールを付与する:** 特定の権限を持つロールをユーザーに付与することで、ユーザーがそのロールの権限を持てるようにします。1 つのロールを複数のユーザーに付与できます。この手順は、[web console](./cluster-users#edit-the-role-or-desrciption-of-a-cluster-user) または [SDK](./cluster-users-sdk#grant-a-role-to-a-user) を使用して実行できます。

