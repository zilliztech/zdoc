---
title: "Microsoft Entra を使用した SCIM プロビジョニングの構成 | BYOC"
slug: /configure-scim-provisioning-with-microsoft-entra
sidebar_label: "Microsoft Entra を使用した SCIM プロビジョニングの構成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Microsoft Entra から Zilliz Cloud への SCIM プロビジョニングを構成する方法について説明します。SCIM プロビジョニングを使用すると、Microsoft Entra から Zilliz Cloud 組織へユーザーをプロビジョニングできます。 | BYOC"
type: origin
token: TqR1wKJMni2xCkkwNf4c52eKnKd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Microsoft Entra を使用した SCIM プロビジョニングの構成

このガイドでは、Microsoft Entra から Zilliz Cloud への SCIM プロビジョニングを構成する方法について説明します。SCIM プロビジョニングを使用すると、Microsoft Entra から Zilliz Cloud 組織へユーザーをプロビジョニングできます。

組織で既に SSO に Microsoft Entra を使用している場合は、ユーザーサインイン用に既存の SSO アプリケーションをそのまま使用してください。SCIM プロビジョニングは、専用のエンタープライズアプリケーションで個別に構成します。SSO、SCIM、同期グループ、Access Control が連携する仕組みの概要については、[SCIM Provisioning](/docs/scim-provisioning) を参照してください。

次の図は、Zilliz Cloud と Microsoft Entra 間のセットアップフローを示しています。

![BBAQwwUhEhlqlSbaHaMc03binef](https://zdoc-images.s3.us-west-2.amazonaws.com/BBAQwwUhEhlqlSbaHaMc03binef.png)

## 前提条件\{#before-you-start}

- Zilliz Cloud 組織の SSO が構成され、検証済みであること。

- SCIM プロビジョニングを構成する Zilliz Cloud 組織の **Organization Owner** であること。

- Microsoft Entra でエンタープライズアプリケーションとそのプロビジョニング設定を作成または管理できる権限があること。

## ステップ 1: Zilliz Cloud で SCIM Base URL と API トークンを取得する\{#step-1-get-the-scim-base-url-and-api-token-in-zilliz-cloud}

Zilliz Cloud の SCIM プロビジョニング設定には、Microsoft Entra が Zilliz Cloud SCIM API を呼び出すために必要な接続情報が含まれています。

<Supademo id="cmryemjll4vptqmblonpseggo" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System for Cross-domain Identity Management (SCIM)** までスクロールし、**Enable** をクリックします。

1. **Enable SCIM** ダイアログで **Enable** をクリックします。

1. **SCIM Base URL** と **SCIM API Token** をコピーします。

</Procedures>

これらの値は、Microsoft Entra でプロビジョニングを構成する際に使用します。SCIM API Token はシークレットとして厳重に管理してください。

## ステップ 2: Microsoft Entra で SCIM アプリを作成する\{#step-2-create-a-scim-app-in-microsoft-entra}

SCIM プロビジョニング用に非ギャラリーのエンタープライズアプリケーションを作成します。組織に専用の Zilliz Cloud SCIM エンタープライズアプリケーションが既に存在する場合は、新規作成せずにそのアプリケーションを選択してください。Microsoft の一般的な非ギャラリー SCIM ワークフローについては、[Develop and plan provisioning for a SCIM endpoint](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups) を参照してください。

<Supademo id="cms5susfa2kc0qmqq7cotjnk4" title=""  />

<Procedures>

1. Microsoft Entra 管理センターで、**Entra ID** > **Enterprise apps** に移動します。

1. **+ New application** をクリックし、**+ Create your own application** をクリックします。

1. アプリケーションの名前を入力します。

1. **Integrate any other application you don't find in the gallery** を選択し、**Create** をクリックします。

</Procedures>

## ステップ 3: Microsoft Entra で SCIM プロビジョニングを構成する\{#step-3-configure-scim-provisioning-in-microsoft-entra}

Zilliz Cloud の SCIM 認証情報を使用してエンタープライズアプリケーションを構成します。Microsoft のドキュメントでは、非ギャラリー SCIM プロビジョニングにおける **Tenant URL**、**Secret Token**、**Test Connection** の設定方法が説明されています。ワークフロー全体の概要については、[Configure automatic user provisioning](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/configure-automatic-user-provisioning-portal) を参照してください。

<Supademo id="cms5sxpdo2kf0qmqqll9p00kk" title=""  />

<Procedures>

1. エンタープライズアプリケーションで **Provisioning** を開き、**+ New configuration** をクリックします。

1. **Tenant URL** に、Zilliz Cloud の **SCIM Base URL** を入力します。

1. **Secret Token** に、Zilliz Cloud の **SCIM API Token** を入力します。

1. **Test Connection** をクリックします。

1. 接続テストが成功したら、**Create** をクリックします。

</Procedures>

SCIM API Token はベアラートークンとして使用されます。プロビジョニングを開始する前に、デフォルトのマッピングとプロビジョニングスコープを確認してください。他の SCIM 統合との類似性のみを根拠に属性を追加または再マッピングしないでください。マッピングの概念については、[Customize application attributes](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/customize-application-attributes) を参照してください。

## ステップ 4: Microsoft Entra からユーザーとグループをプロビジョニングする\{#step-4-provision-users-and-groups-from-microsoft-entra}

プロビジョニング対象のユーザーまたはグループを割り当て、プロビジョニングを有効にします。以下の手順ではグループを例に説明しますが、プロビジョニングの要件に応じて対象グループまたは個別のユーザーを選択してください。Microsoft の割り当てワークフローとライセンス要件については、[Assign users and groups to an application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal) を参照してください。

<Supademo id="cms5vvryb2nzjqmqqfkrz8sp1" title=""  />

<Procedures>

1. エンタープライズアプリケーションで **Users and groups** を開きます。

1. **Add user/group**, をクリックし、メンバーセレクターを開きます。

1. **Groups** タブを開いて対象グループを選択し、**Select** をクリックしてから **Assign** をクリックします。

1. **Provisioning** に戻り、**Provisioning Status** を **On** に設定します。

1. **Save** をクリックします。

</Procedures>

プロビジョニングを有効にした後、必要に応じて **Provisioning logs** を開き、操作の監視やエラーのトラブルシューティングを行ってください。グループベースのアプリケーション割り当てには Microsoft Entra ID P1 または P2 が必要です。プロビジョニングサイクル、スコープ、ログの詳細については、[Understand how application provisioning works](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works) を参照してください。

## ステップ 5: Zilliz Cloud でプロビジョニングを確認する\{#step-5-verify-provisioning-in-zilliz-cloud}

Microsoft Entra でプロビジョニングジョブが実行された後、Zilliz Cloud で期待通りのユーザーまたは同期グループが反映されているか確認します。以下の手順では同期グループを例に説明します。

<Supademo id="cms5wi4fy2ozgqmqqcqcsf5w9" title=""  />

<Procedures>

1. Zilliz Cloud 組織で **Access Control** をクリックし、**Groups** タブを開きます。

1. 同期されたグループを選択し、詳細を確認します。

</Procedures>

SCIM が同期するのは ID データのみです。組織ロールとプロジェクトロールは Zilliz Cloud で別途割り当ててください。グループではなく個別のユーザーを割り当てた場合は、組織メンバービューで確認してください。ここに記載の例はプロビジョニングされたグループが Zilliz Cloud に表示されることを示すものであり、その後のすべてのグループライフサイクル操作を保証するものではありません。

## トラブルシューティング\{#troubleshooting}

| 問題 | 確認事項 |
| --- | --- |
| 接続テストが失敗する | **Tenant URL** に完全な Zilliz **SCIM Base URL** が含まれているか、**Secret Token** に最新の **SCIM API Token** が含まれているかを確認してください。両方の値を Zilliz Cloud から再度コピーしてください。 |
| 割り当てたユーザーまたは同期グループが Zilliz Cloud に表示されない | 割り当て内容、プロビジョニングスコープ、マッピング、ジョブステータス、および **Provisioning logs** 内の該当ユーザーまたはグループに対する操作結果を確認してください。 |
| プロビジョニングでマッピング、スコープ、またはステータスのエラーが報告される | デフォルトのマッピング、一致プロパティ、選択されたスコープ、ジョブステータスを確認してください。設定を変更する前に、Microsoft のプロビジョニングおよび属性マッピングに関するドキュメントをご確認ください。 |
| グループを割り当てられない | テナントが Microsoft Entra ID P1 または P2 ライセンスを保有しているか確認してください。個別ユーザーの割り当ては引き続きテスト可能です。 |
| グループ割り当ては成功するが同期グループが表示されない | グループおよびメンバーシップ操作に関する **Provisioning logs** を確認し、割り当て内容とプロビジョニングスコープを検証した上で、**Provisioning Status** が **On** になっているか確認してください。 |
