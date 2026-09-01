---
title: "Microsoft Entra (SAML 2.0) | BYOC"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Microsoft Entra (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）、Microsoft Entra がアイデンティティプロバイダー（IdP）として機能します。次の図は、Zilliz Cloud および Microsoft Entra 管理センターで必要な手順を示しています。

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.s3.us-west-2.amazonaws.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## はじめに\{#before-you-start}

- Zilliz Cloud 組織に、**Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- Microsoft Entra 管理センターにアクセスできること。詳細については、[Microsoft Entra のドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center) を参照してください。

- SSO を構成する Zilliz Cloud 組織の Organization Owner であること。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Microsoft Entra で SAML アプリケーションを設定する際に必要な **Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** を提供します。

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで **Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Microsoft Entra (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** をコピーします。これらの値は、Microsoft Entra 管理センターでアプリケーションを設定する際、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で必要になります。

1. 完了したら、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) に進みます。

</Procedures>

### 手順 2: Microsoft Entra 管理センターでアプリケーションを設定する\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して、Microsoft Entra（IdP）を構成します。

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Set up an application in Microsoft Entra admin center" />

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) にログインします。

1. 左側のナビゲーションペインで **Enterprise apps** をクリックします。

1. 表示されるページで **New application** をクリックし、続いて **Create your own application** をクリックします。

1. **Create your own application** パネルで、アプリケーション名に **zilliz** を入力し、**Integrate any other application you don't find in the gallery (Non-gallery)** オプションを選択します。

1. **Create** をクリックします。アプリケーションが作成されると、アプリケーションの詳細ページにリダイレクトされます。

1. アプリケーションの詳細ページで、**Single sign-on** > **SAML** を選択します。

1. **Basic SAML Configuration** セクションで **Edit** をクリックします。

1. **Identifier (Entity ID)** 欄で **Add identifier** をクリックし、[手順 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Identifier (Entity ID)** をテキストボックスに貼り付けます。

1. **Reply URL (Assertion Consumer Service URL)** 欄で **Add reply URL** をクリックし、[手順 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Reply URL (Assertion Consumer Service URL)** をテキストボックスに貼り付けます。

1. **Save** をクリックします。

1. 完了したら、作成したアプリケーションの **Single sign-on** パネルに戻り、**App Federation Metadata Url** をコピーします。この値は、[手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに入力する必要があります。

    <Admonition type="info" icon="📘" title="Notes">

    または、以下の情報を取得します。

    - **SAML Certificates** セクションで **Download** をクリックし、**Certificate (Base64)** を保存します。[手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、この証明書が Zilliz Cloud コンソールで必要になります。

    - **Set up zilliz** セクションで **Login URL** をコピーします。[手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、この URL が Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を確立するため、Microsoft Entra の IdP 詳細を Zilliz Cloud に登録します。

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Configure IdP settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードに、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした **App Federation Metadata URL** を貼り付けます。

    <Admonition type="info" icon="📘" title="Notes">

    IdP 詳細の構成で **Manual** モードを選択する場合は、以下を設定します。

    - **Login URL**: [手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした Login URL を貼り付けます。

    - **Certificate (Base64)**: [手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからダウンロードした証明書をアップロードします。`-----BEGIN CERTIFICATE-----` で始まり `-----END CERTIFICATE-----` で終わる行を含め、証明書の内容全体が含まれていることを確認してください。

    </Admonition>

1. 設定が完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: Microsoft Entra アプリケーションをユーザーに割り当てる\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="Task 1: Assign Microsoft Entra application to users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、Microsoft Entra アプリケーションをユーザーに割り当てる必要があります。

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) のアプリケーションページで、**Users and groups** > **+ Add user/group**. を選択します。

1. アプリケーションへのアクセスを許可するユーザーまたはグループを選択します。

</Procedures>

詳細については、[Microsoft Entra のドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal) を参照してください。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが SSO で初めて Zilliz Cloud にログインすると、**組織メンバー** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー** がユーザーを適切なプロジェクトに招待する必要があります。

- プロジェクトへのユーザー招待手順については、[Manage Platform Users](./manage-platform-users#invite-project-members) を参照してください。

ユーザーをプロジェクトに招待した後、**組織オーナー** は企業ユーザーに対して Zilliz Cloud のログイン URL を共有し、SSO 経由でサインインできるようにできます。

設定やテスト中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3:（任意）SSO の強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完了したら、オプションで **SSO の強制** を有効にして、すべての組織メンバーに SSO 経由でのログインを必須にすることができます。この機能を有効にすると、メンバーはメール/passwordやサードパーティー アカウント（Google、GitHub）を使ってサインインできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインしたユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時にアカウントが自動作成されます。これらのユーザーには、デフォルトで **組織メンバー** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳しい手順については、[Manage Platform Users](./manage-platform-users#invite-project-members) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **組織メンバー** ロールが割り当てられます。特定のプロジェクトにアクセスするには、**組織オーナー** または **プロジェクト管理者** がユーザーをプロジェクトに招待する必要があります。詳しい手順については、[Manage Platform Users](./manage-platform-users#invite-project-members) を参照してください。

### SSO ログイン前にユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーのメールアドレスに基づき、すでに Zilliz Cloud 組織にアカウントが存在する場合は、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織で同時にサポートされるのは **1 つのアクティブな SAML SSO 構成** のみです。
