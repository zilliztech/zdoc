---
title: "Okta を使用した SCIM プロビジョニングの設定 | BYOC"
slug: /configure-scim-provisioning-with-okta
sidebar_label: "Okta を使用した SCIM プロビジョニングの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Okta から Zilliz Cloud への SCIM プロビジョニングの設定方法について説明します。SCIM プロビジョニングを使用すると、Okta から Zilliz Cloud 組織へユーザー、グループ、およびグループメンバーシップをプッシュできます。 | BYOC"
type: origin
token: DBrAwCfu3ids0Okxhlbcz12KnPc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Okta を使用した SCIM プロビジョニングの設定

このガイドでは、Okta から Zilliz Cloud への SCIM プロビジョニングの設定方法について説明します。SCIM プロビジョニングを使用すると、Okta から Zilliz Cloud 組織へユーザー、グループ、およびグループメンバーシップをプッシュできます。

組織で既に Okta を SSO に使用している場合は、ユーザーサインイン用に既存の Okta SSO アプリを引き続き使用してください。プロビジョニング用には、別途 Okta SCIM アプリを作成します。SSO、SCIM、同期グループ、Access Control の連携についての概要は、「[SCIM Provisioning](/docs/scim-provisioning)」を参照してください。

次の図に、Zilliz Cloud と Okta 間の設定フローを示します。

![Em1LwlYx9hETaKbeEU7c4SgSn0b](https://zdoc-images.s3.us-west-2.amazonaws.com/Em1LwlYx9hETaKbeEU7c4SgSn0b.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織の SSO が設定済みであり、検証が完了していること。

- SCIM プロビジョニングを設定する Zilliz Cloud 組織の **Organization Owner** であること。

- [Okta Admin Console](https://login.okta.com/) への管理者アクセス権限を持っていること。

## ステップ 1: Zilliz Cloud で SCIM Base URL と API トークンを取得する\{#step-1-get-the-scim-base-url-and-api-token-in-zilliz-cloud}

Zilliz Cloud の SCIM プロビジョニング設定には、Okta が Zilliz Cloud SCIM API を呼び出すために必要な接続情報が含まれています。

次のスクリーンショットは、Zilliz Cloud の SCIM プロビジョニング設定画面です。

<Supademo id="cmryemjll4vptqmblonpseggo" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **System for Cross-domain Identity Management (SCIM)** までスクロールし、**Enable** をクリックします。

1. **Enable SCIM** ダイアログで **Enable** をクリックします。

1. **SCIM Base URL** と **SCIM API Token** をコピーします。これらの値は、Okta 側で API 統合を設定する際に使用します。

</Procedures>

## ステップ 2: Okta Admin で SCIM アプリを作成する\{#step-2-create-a-scim-app-in-okta-admin}

Okta Admin で専用の SCIM アプリを作成し、Zilliz Cloud へ ID をプロビジョニングします。このステップでは、Okta の **SCIM 2.0 Test App (OAuth Bearer Token)** 統合を追加し、アプリケーションのユーザー名形式をメールに設定します。これにより、プロビジョニングされたユーザーを Zilliz Cloud 上でメールアドレスによって照合できるようになります。Okta における一般的な SCIM アプリ作成手順については、[Okta documentation](https://help.okta.com/oie/en-us/content/topics/apps/aiw_scim_entitlements.htm) を参照してください。

<Supademo id="cmqyl1i0z1x69qmecc4ph3mte" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Applications** をクリックし、**Applications** を選択します。

1. **Browse App Catalog** をクリックして `SCIM 2.0 Test App (OAuth Bearer Token)` を検索し、**SCIM 2.0 Test App** を開きます。

1. **Add Integration** をクリックします。

1. アプリケーション名（例: `Zilliz Cloud SCIM`）を入力し、**Next** をクリックします。

1. **Application username format** までスクロールし、**Email** を選択します。

1. **Done** をクリックします。

</Procedures>

## ステップ 3: Okta Admin で SCIM プロビジョニングを設定する\{#step-3-configure-scim-provisioning-in-okta-admin}

Zilliz Cloud で取得した SCIM Base URL と SCIM API Token を使用して、Okta SCIM アプリを設定します。続いて、Okta が Zilliz Cloud に対して実行するプロビジョニングアクションを設定します。

<Supademo id="cmryffitn4wvtqmblv6htmug5" title=""  />

<Procedures>

1. Okta SCIM アプリの **Provisioning** タブを開き、**Configure API Integration** をクリックします。

1. **Enable API integration** を選択します。

1. **SCIM 2.0 Base Url** と **OAuth Bearer Token** に、Zilliz Cloud からコピーした **SCIM Base URL** と **SCIM API Token** をそれぞれ貼り付けます。

1. **Import Groups** のチェックを外します。**Disable Import Groups** ダイアログが表示されたら、**Continue** をクリックします。

1. **Save** をクリックします。

1. **Provisioning** > **To App** を開き、**Edit** をクリックします。

1. Okta が Zilliz Cloud へ送信するプロビジョニングアクションを設定します。

1. **Save** をクリックします。

</Procedures>

**Import Groups** は有効にしないでください。Zilliz Cloud はグループ定義のソースではありません。グループは Okta で管理し、Push Groups を使用して Zilliz Cloud へプロビジョニングしてください。

## ステップ 4: Okta からユーザーとグループをプロビジョニングする\{#step-4-provision-users-and-groups-from-okta}

SCIM アプリの設定が完了したら、Okta から Zilliz Cloud へプロビジョニングするユーザーとグループを選択します。

### 4.1 Okta SCIM アプリにユーザーまたはグループを割り当てる\{#41-assign-users-or-groups-to-the-okta-scim-app}

割り当て機能を使用して、Zilliz Cloud にユーザーをプロビジョニングします。

<Supademo id="cmryfjdqu4x5pqmbld4zspdzh" title=""  />

<Procedures>

1. Okta SCIM アプリの **Assignments** タブを開きます。

1. **Assign** をクリックし、**Assign to People** を選択します。

1. 割り当てたいユーザーを検索し、**Assign** をクリックします。

1. ユーザー属性を確認し、**Save and Go Back** をクリックします。

1. ステータスが **Assigned** になっていることを確認し、**Done** をクリックします。

</Procedures>

割り当てにより、SCIM `/Users` エンドポイントを通じてユーザーがプロビジョニングされます。Okta グループをアプリに割り当てると、そのグループ内のユーザーはプロビジョニングされますが、グループオブジェクト自体は Zilliz Cloud の同期グループとしてはプロビジョニングされません。

### 4.2 Zilliz Cloud へグループをプッシュする\{#42-push-groups-to-zilliz-cloud}

Push Groups を使用して、Okta のグループオブジェクトとグループメンバーシップを Zilliz Cloud にプロビジョニングします。Okta における一般的な Group Push の手順については、[Okta documentation](https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-enable-group-push.htm) を参照してください。

<Supademo id="cmryls4dy537tqmblismw3az5" title=""  />

<Procedures>

1. Okta SCIM アプリの **Push Groups** タブを開きます。

1. **Push Groups** をクリックし、**Find groups by name** を選択します。

1. Zilliz Cloud へプッシュするグループを選択します。

1. **Save** をクリックします。

1. **All** をクリックし、グループのプッシュステータスを確認します。

</Procedures>

Push Groups により、SCIM `/Groups` エンドポイントを通じてグループオブジェクトとグループメンバーシップがプロビジョニングされます。グループの同期後は、Okta でグループ名とメンバーシップを管理してください。

## ステップ 5: Zilliz Cloud でプロビジョニングを確認する\{#step-5-verify-provisioning-in-zilliz-cloud}

Okta によるグループのプロビジョニング後、それらが Zilliz Cloud に正しく表示されるか確認します。

<Supademo id="cmrylxo0y53gyqmblv1m72a7d" title=""  />

<Procedures>

1. Zilliz Cloud 組織の画面で **Access Control** をクリックします。

1. **Groups** タブを開きます。

1. Okta からプッシュされたグループが同期グループとして表示されていることを確認します。

</Procedures>

ユーザーとグループの同期後、Zilliz Cloud の Access Control でアクセス権限を割り当てます。SCIM は ID データのみを同期するため、組織ロールやプロジェクトロールは自動的には付与されません。

## トラブルシューティング\{#troubleshooting}

| 問題 | 確認事項 |
| --- | --- |
| Okta API 資格情報のテストが失敗する | **SCIM connector base URL** が Zilliz Cloud の SCIM Base URL と一致しているか確認してください。また、**OAuth Bearer Token** に Zilliz Cloud の SCIM API Token が正しく設定されているか確認してください。 |
| Okta ではユーザーが割り当てられているが、Zilliz Cloud に表示されない | 対象のユーザーが Okta SCIM アプリに割り当てられているか確認してください。また、Okta の **Provisioning > To App** 設定を確認してください。 |
| ユーザーは表示されるが、グループが Zilliz Cloud に表示されない | 割り当て機能は `/Users` を通じてユーザーのみをプロビジョニングします。グループオブジェクトとグループメンバーシップをプロビジョニングするには、**Push Groups** を設定してください。 |
| グループメンバーシップが Okta と一致しない | Okta 側でグループメンバーシップを管理し、該当グループが **Push Groups** で正しく設定されているか確認してください。 |
| ユーザーが期待どおりに照合されない | Okta のユーザー名形式およびマッピングされたメール値が、Zilliz Cloud で使用されているユーザーのメールアドレスと一致しているか確認してください。 |
