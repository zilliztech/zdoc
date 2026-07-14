---
title: "Microsoft Entra (SAML 2.0) | Cloud"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra とのシングルサインオン (SSO) を構成する方法について説明します。 | Cloud"
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

この機能は、Enterprise プラン以上、および BYOC デプロイでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra とのシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud が Service Provider (SP) として機能し、Microsoft Entra が Identity Provider (IdP) として機能します。次の図は、Zilliz Cloud と Microsoft Entra 管理センターで必要な手順を示しています。

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.s3.us-west-2.amazonaws.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## 開始する前に\{#before-you-start}

- お使いの Zilliz Cloud 組織には、少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあります。

- Microsoft Entra 管理センターにアクセスできる必要があります。詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center) を参照してください。

- SSO を構成する Zilliz Cloud 組織の Organization Owner である必要があります。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は、Microsoft Entra で SAML アプリケーションを設定する際に必要な **Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** を提供します。

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで、**Settings** をクリックします。

1. **Settings** ページで、**Single Sign-On (SSO)** セクションを見つけて **Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Microsoft Entra (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Identifier (Entity ID)** と **Reply URL (Assertion Consumer Service URL)** をコピーします。これらの値は、Microsoft Entra 管理センターでアプリケーションを設定する際に、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で必要になります。

1. 完了したら、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) に進みます。

</Procedures>

### 手順 2: Microsoft Entra 管理センターでアプリケーションを設定する\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Microsoft Entra (IdP) を構成します。

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Set up an application in Microsoft Entra admin center" />

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) にログインします。

1. 左側のナビゲーションペインで、**Enterprise apps** をクリックします。

1. 表示されたページで、**New application** をクリックします。次に、**Create your own application** をクリックします。

1. **Create your own application** パネルで、アプリケーション名を **zilliz** に設定し、**Integrate any other application you don't find in the gallery (Non-gallery)** オプションを選択します。

1. 次に、**Create** をクリックします。完了すると、アプリケーションが作成され、アプリケーション詳細ページにリダイレクトされます。

1. アプリケーション詳細ページで、**Single sign-on** > **SAML** を選択します。

1. **Basic SAML Configuration** セクションで、**Edit** をクリックします。

1. **Identifier (Entity ID)** エリアで、**Add identifier** をクリックします。次に、[手順 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Identifier (Entity ID)** をテキストボックスに貼り付けます。

1. **Reply URL (Assertion Consumer Service URL)** エリアで、**Add reply URL** をクリックします。次に、[手順 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Reply URL (Assertion Consumer Service URL)** をテキストボックスに貼り付けます。

1. **Save** をクリックします。

1. 完了したら、作成したアプリケーションの **Single sign-on** パネルに戻り、**App Federation Metadata Url** をコピーします。これは [手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに必要です。

    <Admonition type="info" icon="📘" title="注記">

    あるいは、次の詳細を取得してください。
    
    - **SAML Certificates** セクションで、**Download** をクリックして **Certificate (Base64)** を保存します。これは、[手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードが選択されている場合に Zilliz Cloud コンソールで必要になります。
    
    - **Set up zilliz** セクションで、**Login URL** をコピーします。これは、[手順 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードが選択されている場合に Zilliz Cloud コンソールで必要になります。

    </Admonition>

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAML の信頼関係を完了するために、Microsoft Entra の IdP 詳細を Zilliz Cloud に入力します。

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Configure IdP settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードに、[手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした **App Federation Metadata URL** を貼り付けます。

    <Admonition type="info" icon="📘" title="注記">

    あるいは、IdP 詳細構成に **Manual** モードを選択した場合は、以下を構成します。
    
    - **Login URL**: [手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした Login URL をここに貼り付けます。
    
    - **Certificate (Base64)**: [手順 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからダウンロードした証明書をここにアップロードします。`-----BEGIN CERTIFICATE-----` で始まり `-----END CERTIFICATE-----` で終わる行を含め、証明書の内容全体が提供されていることを確認してください。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: Microsoft Entra アプリケーションをユーザーに割り当てる\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="Task 1: Assign Microsoft Entra application to users" />

ユーザーが SSO を通じて Zilliz Cloud にアクセスできるようになる前に、Microsoft Entra アプリケーションをそのユーザーに割り当てる必要があります。

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) のアプリケーションページで、**Users and groups** > **+ Add user/group** を選択します。

1. ユーザーまたはグループを選択して、アプリケーションへのアクセス権を付与します。

</Procedures>

詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal) を参照してください。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** は、そのユーザーを適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待するための手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーに Zilliz Cloud のログイン URL を共有し、SSO 経由でサインインできるようにします。

セットアップまたはテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了したら、必要に応じて **SSO enforcement** を有効にして、組織のすべてのメンバーが SSO 経由でのみログインするように要求できます。有効にすると、メンバーはメールアドレス/パスワードやサードパーティアカウント (Google、GitHub) を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後で Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにしてプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users) を参照してください。

### ユーザーが SSO でログインする前にすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでにお使いの Zilliz Cloud 組織に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つのアクティブな SAML SSO 構成** のみがサポートされています。
