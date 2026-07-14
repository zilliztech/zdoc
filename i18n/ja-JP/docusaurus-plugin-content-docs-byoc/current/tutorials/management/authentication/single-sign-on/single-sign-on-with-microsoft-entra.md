---
title: "Microsoft Entra (SAML 2.0) | BYOC"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン（SSO）を設定する方法について説明します。 | BYOC"
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

このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン（SSO）を設定する方法について説明します。

このガイドでは、Zilliz Cloud はサービスプロバイダー（SP）として機能し、Microsoft Entra は ID プロバイダー（IdP）として機能します。以下の図は、Zilliz Cloud と Microsoft Entra 管理センターで必要な手順を示しています。

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.s3.us-west-2.amazonaws.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## 開始前の準備\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあること。

- Microsoft Entra 管理センターにアクセスできること。詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center)を参照してください。

- SSO を設定する Zilliz Cloud 組織の Organization Owner であること。

## 設定手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールで SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Microsoft Entra で SAML アプリケーションを設定する際に必要な **Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** を提供します。

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="ステップ 1: Zilliz Cloud コンソールでサービスプロバイダーの詳細にアクセスする" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインし、SSO を設定したい組織に移動します。

1. 左側のナビゲーションペインで、**Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Microsoft Entra (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** をコピーします。これらの値は、Microsoft Entra 管理センターでアプリケーションを設定する際に [ステップ 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で必要になります。

1. 完了したら、[ステップ 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) に進みます。

</Procedures>

### ステップ 2: Microsoft Entra 管理センターでアプリケーションを設定する\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

このステップでは、Zilliz Cloud から取得した SP の詳細を使用して Microsoft Entra（IdP）を設定します。

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Microsoft Entra 管理センターでアプリケーションを設定する" />

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link)にログインします。

1. 左側のナビゲーションペインで、**Enterprise apps** をクリックします。

1. 表示されたページで、**New application** をクリックします。次に、**Create your own application** をクリックします。

1. **Create your own application** パネルで、アプリケーション名を **zilliz** に設定し、**Integrate any other application you don't find in the gallery (Non-gallery)** オプションを選択します。

1. 次に、**Create** をクリックします。完了するとアプリケーションが作成され、アプリケーションの詳細ページにリダイレクトされます。

1. アプリケーションの詳細ページで、**Single sign-on** > **SAML** を選択します。

1. **Basic SAML Configuration** セクションで、**Edit** をクリックします。

1. **Identifier (Entity ID)** 領域で、**Add identifier** をクリックします。次に、[ステップ 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Identifier (Entity ID)** をテキストボックスに貼り付けます。

1. **Reply URL (Assertion Consumer Service URL)** 領域で、**Add reply URL** をクリックします。次に、[ステップ 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Reply URL (Assertion Consumer Service URL)** をテキストボックスに貼り付けます。

1. **Save** をクリックします。

1. 完了したら、作成したアプリケーションの **Single sign-on** パネルに戻り、**App Federation Metadata Url** をコピーします。これは [ステップ 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに必要になります。

    <Admonition type="info" icon="📘" title="注">

    または、次の詳細を取得してください。
    
    - **SAML Certificates** セクションで、**Download** をクリックして **Certificate (Base64)** を保存します。[ステップ 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、これは Zilliz Cloud コンソールで必要になります。
    
    - **Set up zilliz** セクションで、**Login URL** をコピーします。[ステップ 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合、これは Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、SAML 信頼関係を完了するために、Microsoft Entra の IdP 詳細を Zilliz Cloud に戻して提供します。

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Zilliz Cloud コンソールで IdP 設定を構成する" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[ステップ 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした **App Federation Metadata URL** を貼り付けます。

    <Admonition type="info" icon="📘" title="注">

    または、IdP 詳細設定で **Manual** モードを選択する場合は、以下を設定します。
    
    - **Login URL**: [ステップ 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした Login URL をここに貼り付けます。
    
    - **Certificate (Base64)**: [ステップ 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからダウンロードした証明書をここにアップロードします。`-----BEGIN CERTIFICATE-----` で始まり `-----END CERTIFICATE-----` で終わる行を含め、証明書の内容全体が提供されていることを確認してください。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 設定後のタスク\{#post-configuration-tasks}

### タスク 1: Microsoft Entra アプリケーションをユーザーに割り当てる\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="タスク 1: Microsoft Entra アプリケーションをユーザーに割り当てる" />

ユーザーが SSO を通じて Zilliz Cloud にアクセスできるようにする前に、Microsoft Entra アプリケーションをそれらのユーザーに割り当てる必要があります。

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link)のアプリケーションページで、**Users and groups** > **+ Add user/group** を選択します。

1. ユーザーまたはグループを選択して、アプリケーションへのアクセスを付与します。

</Procedures>

詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal)を参照してください。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** は、適切なプロジェクトにそれらのユーザーを招待する必要があります。

- プロジェクトにユーザーを招待する手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project)を参照してください。

プロジェクトに招待された後、**Organization** **Owner** は Zilliz Cloud のログイン URL を企業ユーザーと共有し、SSO を通じてサインインできるようにできます。

設定またはテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales)にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に設定され、テストされた後、必要に応じて **SSO enforcement** を有効にして、組織のすべてのメンバーが SSO 経由のみでログインするように要求できます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織での SSO の強制](./enforce-sso-in-your-organization)を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既存の Zilliz Cloud アカウントを持たない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後で Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role)を参照してください。

### SSO ログイン後、ユーザーはどのようにしてプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### ユーザーが SSO でログインする前にすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織内に存在する場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限は保持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つの有効な SAML SSO 設定** のみがサポートされています。
