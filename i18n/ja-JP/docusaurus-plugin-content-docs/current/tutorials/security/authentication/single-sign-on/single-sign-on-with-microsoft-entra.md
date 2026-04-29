---
title: "Microsoft Entra (SAML 2.0) | Cloud"
slug: /single-sign-on-with-microsoft-entra
sidebar_key: single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra (SAML 2.0)"
beta: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン (SSO) を構成する方法について説明します。 | Cloud"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sso
  - microsoft
  - entra

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Microsoft Entra (SAML 2.0)

このトピックでは、SAML 2.0 プロトコルを使用して Microsoft Entra でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー (SP) として機能し、Microsoft Entra が ID プロバイダー (IdP) として機能します。次の図は、Zilliz Cloud と Microsoft Entra 管理センターで必要な手順を示しています。

![M3UywWSZHhlwTHbkjI8c6jTinGh](https://zdoc-images.s3.us-west-2.amazonaws.com/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## Before you start\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの**Dedicated (Enterprise)** クラスターがあること。

- Microsoft Entra 管理センターにアクセスできること。詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center) を参照してください。

- SSO を構成する Zilliz Cloud 組織において、組織オーナーであること。

## 設定 steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Microsoft Entra で SAML アプリケーションを設定する際に必要な**Identifier (エンティティID)** および**Reply URL (Assertion Consumer Service URL)** を提供します。

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで、**Settings** をクリックします。

1. **Settings** ページで、**Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されたダイアログボックスで、IdP およびプロトコルとして**Microsoft Entra (SAML 2.0)** を選択します。

1. **サービスプロバイダーの詳細** カードで、**Identifier (エンティティID)** および**Reply URL (Assertion Consumer Service URL)** をコピーします。これらの値は、Microsoft Entra 管理センターでアプリケーションを設定する際の [Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で必要になります。

1. 完了したら、[Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) に進みます。

</Procedures>

### Step 2: Set up an application in Microsoft Entra admin center\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

このステップでは、Zilliz Cloud から取得した SP 詳細を使用して Microsoft Entra (IdP) を構成します。

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Set up an application in Microsoft Entra admin center" />

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) にログインします。

1. 左側のナビゲーションペインで、**エンタープライズアプリ** をクリックします。

1. 表示されたページで、**新しいアプリケーション** をクリックします。次に、**Create your own application** をクリックします。

1. **Create your own application** パネルで、アプリケーション名を**zilliz** に設定し、**Integrate any other application you don't find in the gallery (Non-gallery)** オプションを選択します。

1. 次に、**Create** をクリックします。完了すると、アプリケーションが作成され、アプリケーション詳細ページにリダイレクトされます。

1. アプリケーション詳細ページで、**シングルサインオン** > **SAML** を選択します。

1. **基本SAML構成** セクションで、**Edit** をクリックします。

1. **Identifier (エンティティID)** エリアで、**Add identifier** をクリックします。次に、[Step 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**Identifier (エンティティID)** をテキストボックスに貼り付けます。

1. **Reply URL (Assertion Consumer Service URL)** エリアで、**Add reply URL** をクリックします。次に、[Step 1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**Reply URL (Assertion Consumer Service URL)** をテキストボックスに貼り付けます。

1. **Save** をクリックします。

1. 完了したら、作成したアプリケーションの**シングルサインオン** パネルに戻り、**App Federation Metadata Url** をコピーします。これは、[Step 3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールで使用するために必要になります。

    <Admonition type="info" icon="📘" title="Notes">

    <p>または、以下の詳細を取得します:</p>
    <ul>
    <li><p><strong>SAML Certificates</strong> セクションで、<strong>ダウンロード</strong> をクリックして<strong>Certificate (Base64)</strong> を保存します。これは、<a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a> で<strong>Manual</strong> モードが選択された場合に Zilliz Cloud コンソールで必要になります。</p></li>
    <li><p><strong>Set up zilliz</strong> セクションで、<strong>Login URL</strong> をコピーします。これは、<a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a> で<strong>Manual</strong> モードが選択された場合に Zilliz Cloud コンソールで必要になります。</p></li>
    </ul>

    </Admonition>

</Procedures>

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、Microsoft Entra の IdP 詳細を Zilliz Cloud に提供して、SAML 信頼関係を完了させます。

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Configure IdP settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの**IDプロバイダーの詳細** カードで、[Step 2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center) で Microsoft Entra 管理センターからコピーした**App Federation メタデータURL** を貼り付けます。

    <Admonition type="info" icon="📘" title="Notes">

    <p>または、IdP 詳細の構成に<strong>Manual</strong> モードを選択する場合、以下を構成します:</p>
    <ul>
    <li><p><strong>Login URL</strong>: <a href="./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center">Step 2</a> で Microsoft Entra 管理センターからコピーした Login URL をここに貼り付けます。</p></li>
    <li><p><strong>Certificate (Base64)</strong>: <a href="./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center">Step 2</a> で Microsoft Entra 管理センターからダウンロードした証明書をここにアップロードします。<code>-----BEGIN CERTIFICATE-----</code> で始まり<code>-----END CERTIFICATE-----</code> で終わる行を含む証明書コンテンツ全体が提供されていることを確認してください。</p></li>
    </ul>

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign Microsoft Entra application to users\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="Task 1: Assign Microsoft Entra application to users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、Microsoft Entra アプリケーションをユーザーに割り当てる必要があります:

<Procedures>

1. [Microsoft Entra 管理センター](https://aad.portal.azure.com/?ad=in-text-link) のアプリケーションページで、**ユーザーとグループ** > **+ Add user/group** を選択します。

1. アプリケーションへのアクセスを付与するユーザーまたはグループを選択します。

</Procedures>

詳細については、[Microsoft Entra ドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal) を参照してください。

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO を介して Zilliz Cloud にログインすると、**組織メンバー** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー** は、適切なプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待する方法の手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **オーナー** は、企業ユーザーが SSO を介してサインインできるように Zilliz Cloud ログイン URL を共有できます。

セットアップまたはテストプロセス中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### Task 3: (Optional) Enable SSO enforcement\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成およびテストされた後、オプションで**SSO enforcement** を有効にして、すべての組織メンバーが SSO を介してのみログインすることを必須にできます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント (Google、GitHub) を使用してサインインできなくなります。

<Admonition type="danger" icon="🚧" title="Warning">

<p>この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーがすぐにログアウトされ、非 SSO ログイン方法がブロックされます。</p>

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで**組織メンバー** ロールが割り当てられます。後で Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

SSO を介してログインした後、ユーザーにはデフォルトで**組織メンバー** ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー** または**プロジェクト管理者** がユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーが既に (メールアドレスに基づいて) Zilliz Cloud 組織に存在する場合、SSO を介してログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度にアクティブな SAML SSO 構成を**1 つのみ**サポートしています。