---
title: "Okta (SAML 2.0) | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "Okta (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Okta とのシングルサインオン（SSO）を設定する方法について説明します。 | BYOC"
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

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Okta とのシングルサインオン（SSO）を設定する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）、Okta がアイデンティティプロバイダー（IdP）として機能します。次の図は、Zilliz Cloud および Okta Admin Console で必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](https://zdoc-images.s3.us-west-2.amazonaws.com/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に、**Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- Okta Admin Console への管理者アクセス権限を持っていること。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を設定する Zilliz Cloud 組織の Organization Owner であること。

## 設定手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Okta で SAML アプリを設定する際に必要な **Audience URL (SP Entity ID)** と **Single sign-on URL** を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を設定する組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Okta (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Audience URL (SP Entity ID)** と **Single sign-on URL** をコピーします。これらの値は、Okta Admin Console で SAML アプリを作成する [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で必要になります。

1. 完了したら、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) に進みます。

</Procedures>

### 手順 2: Okta Admin Console で SAML アプリを作成する\{#step-2-create-a-saml-app-in-okta-admin-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Okta（IdP）を設定します。

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="Step 1: Create SAML App in Okta Admin Console" />

<Procedures>

1. [Okta Admin console](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで **Applications** > **Applications** を選択します。

1. **Create App Integration** をクリックします。

1. **Create a new app integration** ダイアログボックスで **SAML 2.0** を選択し、**Next** をクリックします。

1. 分かりやすくするため、**App name** に **zilliz** を入力して **Next** をクリックします。

1. **Configure SAML** 画面の **General** セクションで、以下のフィールドを設定します。

    - **Single sign-on URL**:

        - [手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Single sign-on URL** を貼り付けます。

        - SAML リクエストの正しいルーティングを確保するため、**"Use this for Recipient URL and Destination URL"** の **チェックボックスをオン** にしてください。

    - **Audience URI (SP Entity ID)**: [手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Audience URL (SP Entity ID)** を貼り付けます。

1. **Attribute Statements (optional)** セクションで、以下を指定します。

    - **Name**: 値に **email** を入力します。

    - **Value**: ドロップダウンリストから **user.email** を選択します。

1. **Next** をクリックし、続いて **Finish** をクリックします。アプリページにリダイレクトされます。

1. アプリページの **Sign On** タブで **Metadata URL** を確認し、**Copy** をクリックします。この値は [手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに入力します。

    <Admonition type="info" icon="📘" title="Notes">

    または、**More details** をクリックして以下の情報を取得することもできます。
    
    - **Sign on URL**: URL をコピーします。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に Zilliz Cloud コンソールで必要になります。
    
    - **Signing Certificate**: **Download** をクリックして証明書をローカルコンピューターに保存します。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP を設定する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を確立するために、Okta の IdP 詳細を Zilliz Cloud に登録します。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードに、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Metadata URL** を貼り付けます。

    <Admonition type="info" icon="📘" title="Notes">

    または、IdP の詳細設定で **Manual** モードを選択する場合は、以下を設定します。
    
    - **Sign On URL**: [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Sign on URL** を貼り付けます。
    
    - **Signing Certificate**: [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からダウンロードした証明書をアップロードします。`-----BEGIN CERTIFICATE-----` で始まる行から `-----END CERTIFICATE-----` で終わる行まで、証明書の内容全体が含まれていることを確認してください。

    </Admonition>

1. 入力が完了したら、**Save** をクリックします。

</Procedures>

## 設定後の作業\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Task 1: Assign SAML App to Users" />

ユーザーが SSO 経由で Zilliz Cloud にアクセスできるようにするには、まず Okta アプリケーションをユーザーに割り当てる必要があります。

<Procedures>

1. [Okta Admin console](https://login.okta.com/) のアプリ詳細ページで、**Assignments** をクリックします。

1. **Assign** > **Assign to People** を選択します。

1. SAML アプリをユーザーに割り当て、変更を保存します。

1. **Save** **and** **Go Back** をクリックします。

</Procedures>

必要に応じて、他のユーザーにも同様の操作を行います。詳細については、[Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が適切なプロジェクトにユーザーを招待する必要があります。

- プロジェクトへのユーザー招待手順の詳細については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトへの招待後、**Organization** **Owner** はエンタープライズユーザーに対して Zilliz Cloud のログイン URL を共有し、SSO 経由でサインインできるように案内できます。

設定やテスト中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3:（任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完了したら、必要に応じて **SSO enforcement** を有効にして、組織のすべてのメンバーに SSO 経由でのログインを必須にできます。有効化すると、メンバーはメール/passwordやサードパーティー アカウント（Google、GitHub）でサインインできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳しい手順は、[プロジェクト ユーザーの管理](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳しい手順は、[プロジェクト ユーザーの管理](./project-users) を参照してください。

### SSO ログイン前にユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがメールアドレスに基づいてすでに Zilliz Cloud 組織に存在する場合、SSO でログインしても既存のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、同時に有効にできる SAML SSO 設定は **1 つのみ** です。
