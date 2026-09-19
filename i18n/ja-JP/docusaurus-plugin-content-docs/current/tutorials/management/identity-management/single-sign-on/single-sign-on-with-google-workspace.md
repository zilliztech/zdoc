---
title: "Google Workspace (SAML 2.0) | Cloud"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace とのシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Workspace (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace とのシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）、Google Workspace がアイデンティティプロバイダー（IdP）として機能します。次の図は、Zilliz Cloud および Google Admin コンソールで必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に、少なくとも 1 つの <strong>Dedicated (Enterprise)</strong> クラスターが存在すること。

- Google Admin コンソールで Admin ロールを持っていること。

- SSO を構成する Zilliz Cloud 組織の Organization Owner であること。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Google Admin で SAML アプリを設定する際に必要な **Entity ID** と **ACS URL** を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Google Workspace (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Entity ID** と **ACS URL** をコピーします。これらの値は、Google Admin コンソールで SAML アプリを作成する際の [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で必要になります。

    <Admonition type="info" title="Notes">

    または、ここで **SSO URL** と **Certificate** をコピーすることもできます。この場合、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で IdP の詳細を **Manual** モードで構成する必要があります。

    </Admonition>

1. 完了したら、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) に進みます。

</Procedures>

### 手順 2: Google Admin コンソールでカスタム SAML アプリを作成する\{#step-2-create-a-custom-saml-app-in-google-admin-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Google Workspace（IdP）を構成します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="Step 2: Create SAML app in Google Admin" />

<Procedures>

1. [Google Admin コンソール](https://admin.google.com/) にログインします。

1. 左側のナビゲーションペインで **Apps** > **Web and mobile apps** を選択します。続いて **Add app** > **Add custom SAML app** を選択します。

1. アプリ名を任意の名前（例: **zilliz**）に設定し、**CONTINUE** をクリックします。

1. 表示されるページで、**Option 1: Download IdP metadata** から IdP メタデータをダウンロードします。これは、Zilliz Cloud コンソールで IdP 設定を構成する際の [手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。その後、**Continue** をクリックします。

    <Admonition type="info" title="Notes">

    または、**Option 2: Copy the SSO URL, entity ID, and certificate** から、それぞれ **SSO URL**、**Entity ID**、**Certificate** を取得します。これらは、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に、Zilliz Cloud コンソールで必要になります。

    </Admonition>

1. **Service provider details** セクションで以下を構成します。

    - **ACS URL**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **ACS URL** を貼り付けます。

    - **Entity ID**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Entity ID** を貼り付けます。

    完了したら、**Continue** をクリックします。

1. **Attributes** セクションで以下を構成します。

    - **Google Directory attributes**: **ADD MAPPING** をクリックし、**Primary email** を選択します。

    - **App attributes**: 値を **email** に設定します。

1. **Finish** をクリックします。

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を確立するために、Google Workspace の IdP 詳細を Zilliz Cloud に提供します。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="Step 3: Configure IdP settings in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で Google Admin コンソールからダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" title="Notes">

    または、IdP 詳細の構成で **Manual** モードを選択する場合は、以下を構成します。
    
    - **SSO URL**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **SSO URL** をここに貼り付けます。
    
    - **Certificate**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **Certificate** をここに貼り付けます。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる（Google Admin コンソール）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="Task 1: Assign SAML app to users" />

ユーザーが SSO 経由で Zilliz Cloud にアクセスできるようにするには、SAML アプリを有効にしてください:

<Procedures>

1. 新しく作成したアプリの詳細ページで **User access** 領域を見つけ、サービスステータスを編集するためにクリックします。

1. 組織内のすべてのユーザーに対してサービスを有効または無効にするには、全員に対して **ON** または **OFF** をクリックし、**Save** をクリックします。

1. （任意）組織単位に対してサービスを有効または無効にする場合:

    1. 左側で組織単位を選択します。

    1. サービスステータスを変更するには、**ON** または **OFF** を選択します。

    1. 次のいずれかを選択します。

        - **Service status** が **Inherited** に設定されていて、親の設定が変更されても更新後の設定を維持する場合は、**Override** をクリックします。

        - **Service status** が **Overridden** に設定されている場合は、**Inherit** をクリックして親と同じ設定に戻すか、**Save** をクリックして、親の設定が変更されても新しい設定を維持します。<br/>
          注: [組織構造](https://support.google.com/a/answer/4352075) の詳細をご覧ください。

1. （任意）組織単位をまたぐ、または組織単位内の一連のユーザーに対してサービスを有効にするには、アクセスグループを選択します。詳細については、[グループを使用してサービスアクセスをカスタマイズする](https://support.google.com/a/answer/9050643) を参照してください。

1. ユーザーが SAML アプリへのサインインに使用するメールアドレスが、Google ドメインへのサインインに使用するメールアドレスと一致していることを確認します。

</Procedures>

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が適切なプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待する手順については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーに対して Zilliz Cloud のログイン URL を共有し、SSO 経由でサインインできるように案内できます。

セットアップやテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3:（任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了したら、オプションで **SSO 強制** を有効にして、組織のすべてのメンバーに SSO 経由でのログインを必須にすることができます。有効にすると、メンバーはメールアドレス/password またはサードパーティーアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" title="Warning">

この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳しい手順については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳しい手順については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがメールアドレスに基づいてすでに Zilliz Cloud 組織に存在する場合、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織で同時にサポートされるのは **1 つの有効な SAML SSO 構成** のみです。
