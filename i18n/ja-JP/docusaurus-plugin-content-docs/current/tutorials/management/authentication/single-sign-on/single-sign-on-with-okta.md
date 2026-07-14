---
title: "Okta (SAML 2.0) | Cloud"
slug: /single-sign-on-with-okta
sidebar_label: "Okta (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。 | Cloud"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Okta (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud は Service Provider (SP) として動作し、Okta は Identity Provider (IdP) として動作します。次の図は、Zilliz Cloud と Okta Admin Console で必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](https://zdoc-images.s3.us-west-2.amazonaws.com/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 開始する前に\{#before-you-start}

- あなたの Zilliz Cloud 組織には、少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあります。

- Okta Admin Console への管理者アクセス権を持っています。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を構成する Zilliz Cloud 組織の Organization Owner です。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Okta で SAML アプリを設定する際に必要となる **Audience URL (SP Entity ID)** と **Single sign-on URL** を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインし、SSO を構成したい組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Okta (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Audience URL (SP Entity ID)** と **Single sign-on URL** をコピーします。これらの値は、Okta Admin Console で SAML アプリを作成する際の [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で必要になります。

1. 完了したら、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) に進みます。

</Procedures>

### 手順 2: Okta Admin Console で SAML アプリを作成する\{#step-2-create-a-saml-app-in-okta-admin-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Okta (IdP) を構成します。

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="Step 1: Create SAML App in Okta Admin Console" />

<Procedures>

1. [Okta Admin console](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで、**Applications** > **Applications** を選択します。

1. **Create App Integration** をクリックします。

1. **Create a new app integration** ダイアログボックスで **SAML 2.0** を選択し、**Next** をクリックします。

1. 簡単のため、**App name** を **zilliz** に設定し、**Next** をクリックします。

1. **Configure SAML** ステップの **General** 領域で、以下のフィールドを構成します。

    - **Single sign-on URL**:

        - ここに、[手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Single sign-on URL** を貼り付けます。

        - SAML リクエスト中の正しいルーティングを確保するため、**"Use this for Recipient URL and Destination URL"** と表示されている **チェックボックスを必ずオンにしてください**。

    - **Audience URI (SP Entity ID)**: ここに、[手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Audience URL (SP Entity ID)** を貼り付けます。

1. **Attribute Statements (optional)** 領域で、以下を指定します。

    - **Name**: 値を **email** に設定します。

    - **Value**: ドロップダウンリストから **user.email** を選択します。

1. **Next** をクリックし、その後 **Finish** をクリックします。アプリページにリダイレクトされます。

1. アプリページの **Sign On** タブで **Metadata URL** を取得し、**Copy** をクリックします。これは [手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに必要になります。

    <Admonition type="info" icon="📘" title="注意">

    または、**More details** をクリックして以下の詳細を取得することもできます。
    
    - **Sign on URL**: URL をコピーします。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、Zilliz Cloud コンソールで必要になります。
    
    - **Signing Certificate**: **Download** をクリックして証明書をローカルコンピューターに保存します。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を完成させるために、Okta の IdP の詳細を Zilliz Cloud に戻して提供します。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードに、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Metadata URL** を貼り付けます。

    <Admonition type="info" icon="📘" title="注意">

    または、IdP 詳細の構成で **Manual** モードを選択した場合は、以下を設定します。
    
    - **Sign On URL**: ここに、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Sign on URL** を貼り付けます。
    
    - **Signing Certificate**: ここに、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からダウンロードした証明書をアップロードします。`-----BEGIN CERTIFICATE-----` で始まり `-----END CERTIFICATE-----` で終わる行を含む、証明書の内容全体が提供されていることを確認してください。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Task 1: Assign SAML App to Users" />

ユーザーが SSO を通じて Zilliz Cloud にアクセスできるようにする前に、Okta アプリケーションをそのユーザーに割り当てる必要があります。

<Procedures>

1. [Okta Admin console](https://login.okta.com/) のアプリ詳細ページで、**Assignments** をクリックします。

1. **Assign** > **Assign to People** を選択します。

1. ユーザーに SAML アプリを割り当て、変更を保存します。

1. **Save** **and** **Go Back** をクリックします。

</Procedures>

必要に応じて、すべてのユーザーに対してこれを繰り返します。詳細については、[Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** は、それらのユーザーを適切なプロジェクトに招待する必要があります。

- プロジェクトにユーザーを招待する手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーに Zilliz Cloud のログイン URL を共有し、SSO を通じてサインインできるようにできます。

セットアップまたはテスト中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了した後、任意で **SSO enforcement** を有効にし、すべての組織メンバーが SSO 経由でのみログインするよう必須にできます。有効にすると、メンバーはメールアドレス/パスワードまたはサードパーティアカウント (Google、GitHub) を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは直ちにログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーには、どのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後から Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにしてプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### ユーザーが SSO でログインする前に、すでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでにあなたの Zilliz Cloud 組織に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限は保持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つのアクティブな SAML SSO 構成** のみサポートされています。
