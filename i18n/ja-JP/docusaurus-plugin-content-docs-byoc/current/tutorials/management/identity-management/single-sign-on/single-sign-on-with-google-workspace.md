---
title: "Google Workspace (SAML 2.0) | BYOC"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace とのシングルサインオン（SSO）を設定する方法について説明します。 | BYOC"
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

このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace とのシングルサインオン（SSO）を設定する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）、Google Workspace がアイデンティティプロバイダー（IdP）として機能します。次の図は、Zilliz Cloud および Google 管理コンソールで必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に、**Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- Google 管理コンソールで Admin ロールを保有している必要があります。

- SSO を設定する Zilliz Cloud 組織の Organization Owner である必要があります。

## 設定手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP 情報を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Google Admin で SAML アプリを設定する際に必要な **Entity ID** と **ACS URL** を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を設定する組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Google Workspace (SAML 2.0)** を選択します。

1. **Service Provider Details** カードから **Entity ID** と **ACS URL** をコピーします。これらの値は、Google 管理コンソールで SAML アプリを作成する際の [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で必要になります。

    <Admonition type="info" icon="📘" title="Notes">

    または、ここで **SSO URL** と **Certificate** をコピーすることもできます。この場合、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で IdP 情報を手動モードで設定する必要があります。

    </Admonition>

1. 完了したら、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) に進みます。

</Procedures>

### 手順 2: Google 管理コンソールでカスタム SAML アプリを作成する\{#step-2-create-a-custom-saml-app-in-google-admin-console}

この手順では、Zilliz Cloud から取得した SP 情報を使用して Google Workspace（IdP）を設定します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="Step 2: Create SAML app in Google Admin" />

<Procedures>

1. [Google 管理コンソール](https://admin.google.com/) にログインします。

1. 左側のナビゲーションペインで **Apps** > **Web and mobile apps** を選択し、**Add app** > **Add custom SAML app** を選択します。

1. アプリ名を任意の名前（例: **zilliz**）に設定し、**CONTINUE** をクリックします。

1. 表示されるページで、**Option 1: Download IdP metadata** から IdP メタデータをダウンロードします。これは、Zilliz Cloud コンソールで IdP 設定を行う際の [手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。その後、**Continue** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    または、**Option 2: Copy the SSO URL, entity ID, and certificate** から **SSO URL**、**Entity ID**、**Certificate** をそれぞれ取得します。これらは、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に Zilliz Cloud コンソールで必要になります。

    </Admonition>

1. **Service provider details** セクションで以下を設定します。

    - **ACS URL**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **ACS URL** を貼り付けます。

    - **Entity ID**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Entity ID** を貼り付けます。

    設定後、**Continue** をクリックします。

1. **Attributes** セクションで以下を設定します。

    - **Google Directory attributes**: **ADD MAPPING** をクリックし、**Primary email** を選択します。

    - **App attributes**: 値に **email** を入力します。

1. **Finish** をクリックします。

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を行う\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を確立するため、Google Workspace の IdP 情報を Zilliz Cloud に登録します。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="Step 3: Configure IdP settings in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で Google 管理コンソールからダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="Notes">

    または、IdP 情報の設定で **Manual** モードを選択した場合は、以下を設定します。
    
    - **SSO URL**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **SSO URL** を貼り付けます。
    
    - **Certificate**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **Certificate** を貼り付けます。

    </Admonition>

1. 設定後、**Save** をクリックします。

</Procedures>

## 設定後の作業\{#post-configuration-tasks}

### タスク 1: ユーザーへの SAML アプリの割り当て（Google 管理コンソール）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="Task 1: Assign SAML app to users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、SAML アプリを有効にする必要があります。

<Procedures>

1. 作成したアプリの詳細ページにある **User access** セクションで、サービスステータスを編集します。

1. 組織全体のサービスをオンまたはオフにするには、全員に対して **ON** または **OFF** を選択し、**Save** をクリックします。

1. （オプション）特定の組織単位のサービスをオンまたはオフにする場合:

    1. 左側で対象の組織単位を選択します。

    1. サービスステータスを変更するには、**ON** または **OFF** を選択します。

    1. 以下のいずれかを選択します。

        - **Service status** が **Inherited** で、親の設定が変更されても現在の設定を維持したい場合は、**Override** をクリックします。

        - **Service status** が **Overridden** の場合、**Inherit** をクリックして親と同じ設定に戻すか、**Save** をクリックして親の設定変更に関わらず新しい設定を維持します。<br/>
          注: 詳しくは [組織構造](https://support.google.com/a/answer/4352075) をご覧ください。

1. （オプション）組織単位全体または特定のユーザーグループに対してサービスを有効にするには、アクセスグループを選択します。詳細については、[グループを使用したサービスアクセスのカスタマイズ](https://support.google.com/a/answer/9050643) をご覧ください。

1. ユーザーが SAML アプリへのサインインに使用するメールアドレスと、Google ドメインへのサインインに使用するメールアドレスが一致していることを確認してください。

</Procedures>

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが SSO を使用して Zilliz Cloud に初めてログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が適切なプロジェクトにユーザーを招待する必要があります。

- プロジェクトへのユーザー招待手順については、[Manage Platform Users](./manage-platform-users#invite-project-users) を参照してください。

ユーザーをプロジェクトに招待した後、**Organization** **Owner** は Zilliz Cloud のログイン URL をエンタープライズ ユーザーに共有し、SSO 経由でサインインできるようにします。

設定やテスト中に問題が発生した場合は、[Zilliz support](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: (オプション) SSO enforcement を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完了したら、オプションで **SSO enforcement** を有効にして、すべての組織メンバーに SSO 経由でのログインを必須にすることができます。この機能を有効にすると、メンバーはメール/passwordやサードパーティー アカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時にアカウントが自動作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳しい手順については、[Manage Platform Users](./manage-platform-users#invite-project-users) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳しい手順については、[Manage Platform Users](./manage-platform-users#invite-project-users) を参照してください。

### SSO ログイン前にすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがメールアドレスに基づいてすでに Zilliz Cloud 組織に存在する場合、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織で同時にサポートされるのは **1 つのアクティブな SAML SSO 設定**のみです。
