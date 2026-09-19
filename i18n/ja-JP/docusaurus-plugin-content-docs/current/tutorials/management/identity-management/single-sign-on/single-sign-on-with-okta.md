---
title: "Okta (SAML 2.0) | Cloud"
slug: /single-sign-on-with-okta
sidebar_label: "Okta (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Okta とのシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
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

このトピックでは、SAML 2.0 プロトコルを使用して Okta とのシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）として、Okta がアイデンティティプロバイダー（IdP）として機能します。次の図は、Zilliz Cloud と Okta Admin Console で必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](https://zdoc-images.s3.us-west-2.amazonaws.com/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に <strong>Dedicated (Enterprise)</strong> クラスターが少なくとも 1 つあること。

- Okta Admin Console への管理者アクセス権を持っていること。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を構成する Zilliz Cloud 組織の Organization Owner であること。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Okta で SAML アプリを設定する際に必要な **Audience URL (SP Entity ID)** と **Single sign-on URL** を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Okta (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Audience URL (SP Entity ID)** と **Single sign-on URL** をコピーします。これらの値は、Okta Admin Console で SAML アプリを作成する際に [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で必要になります。

1. 完了したら、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) に進みます。

</Procedures>

### 手順 2: Okta Admin Console で SAML アプリを作成する\{#step-2-create-a-saml-app-in-okta-admin-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Okta（IdP）を構成します。

<Supademo id="cmu6born30iqzqmctmmy8ynp6" title=""  />

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで **Applications and Resources** をクリックします。

1. **Create App Integration** をクリックします。

1. 表示されるダイアログボックスで **SAML 2.0** を選択し、**Next** をクリックします。

1. 簡略化のため、**App name** に **zilliz** を設定し、**Next** をクリックします。

1. **Configure SAML** ステップの **General** エリアで、以下のフィールドを構成します。

    - **Single sign-on URL**:

        - [手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Single sign-on URL** をここに貼り付けます。

        - SAML リクエスト時に正しくルーティングされるように、**"Use this for Recipient URL and Destination URL"** というラベルの **チェックボックスをオン** にしてください。

    - **Audience URI (SP Entity ID)**: [手順 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Audience URL (SP Entity ID)** をここに貼り付けます。

1. **Next** をクリックし、続いて **Finish** をクリックします。アプリページにリダイレクトされます。

1. アプリページの **Sign On** タブに戻り、

    1. **Attribute statements** エリアに移動し、**Show legacy configuration** を展開し、**Profile attribute statements** の横にある **Edit** をクリックして、以下の設定で属性ステートメントを追加します。

        - **Name**: 値を **email** に設定します。

        - **Name format**: デフォルト値の **Unspecified** を維持します。

        - **Value**: ドロップダウンリストから **user.email** を選択します。

    1. その後、**SAML 2.0** カードに移動して **Metadata URL** を取得し、**Copy** をクリックします。これは、Zilliz Cloud コンソールの [手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。

    <Admonition type="info" title="Notes">

    または、**More details** をクリックすると、以下の詳細を取得できます。

    - **Sign on URL**: URL をコピーします。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、Zilliz Cloud コンソールで必要になります。

    - **Signing Certificate**: **Download** をクリックして証明書をローカルコンピューターに保存します。[手順 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、Okta の IdP の詳細を Zilliz Cloud に提供し、SAML の信頼関係を完了します。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Metadata URL** を貼り付けます。

    <Admonition type="info" title="Notes">

    または、IdP の詳細構成で **Manual** モードを選択した場合は、以下を構成します。

    - **Sign On URL**: [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした **Sign on URL** をここに貼り付けます。

    - **Signing Certificate**: [手順 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からダウンロードした証明書をここにアップロードします。`-----BEGIN CERTIFICATE-----` で始まる行から `-----END CERTIFICATE-----` で終わる行まで、証明書の内容全体が提供されていることを確認してください。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: SAML アプリをユーザーに割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Task 1: Assign SAML App to Users" />

ユーザーが SSO 経由で Zilliz Cloud にアクセスできるようにするには、Okta アプリケーションをユーザーに割り当てる必要があります。

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) のアプリ詳細ページで、**Assignments** をクリックします。

1. **Assign** > **Assign to People** を選択します。

1. SAML アプリをユーザーに割り当て、変更を保存します。

1. **Save** **and** **Go Back** をクリックします。

</Procedures>

必要に応じて、すべてのユーザーに対してこの操作を繰り返します。詳細については、[Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が、適切なプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待する手順の詳細については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** は、エンタープライズユーザーと Zilliz Cloud のログイン URL を共有し、ユーザーが SSO 経由でサインインできるようにすることができます。

セットアップまたはテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了したら、オプションで **SSO 強制** を有効にして、組織のすべてのメンバーに SSO 経由でのログインを必須にすることができます。有効にすると、メンバーはメールアドレス/password またはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" title="Warning">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳細な手順については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

### SSO ログイン後、ユーザーはプロジェクトにどのようにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がユーザーをプロジェクトに招待する必要があります。詳細な手順については、[プラットフォームユーザーの管理](./manage-platform-users#invite-project-members) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在する場合（メールアドレスに基づく）、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織で同時にサポートされるのは **1 つの有効な SAML SSO 構成** のみです。
