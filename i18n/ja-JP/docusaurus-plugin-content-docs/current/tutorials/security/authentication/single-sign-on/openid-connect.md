---
title: "Okta (OIDC) | Cloud"
slug: /openid-connect
sidebar_key: openid-connect
sidebar_label: "Okta (OIDC)"
beta: FALSE
notebook: FALSE
description: "このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。| Cloud"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sso

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Okta (OIDC)

このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー (SP) として機能し、Okta が ID プロバイダー (IdP) として機能します。以下の図は、Zilliz Cloud および Okta コンソールで必要な手順を示しています。

![EfRWwnbKNhcXEwbL7EBcB66inrd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

## Before you start\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの**Dedicated (Enterprise)** クラスターがあること。

- Okta コンソールへの Admin アクセス権限があること。詳細については、[Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を構成する Zilliz Cloud 組織において、組織オーナー であること。

## 設定 steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Okta で OIDC アプリを設定する際に必要な**シングルサインオンURL**を提供します。

<Supademo id="cme89wf1w3eaoh3pytd3723ao" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織へ移動します。

1. 左側のナビゲーションペインで、**Settings**をクリックします。

1. **Settings**ページで、**Single Sign-On (SSO)** セクションを見つけ、**Configure**をクリックします。

1. 表示されたダイアログボックスで、IdP およびプロトコルとして**Okta (OIDC)**を選択します。

1. **サービスプロバイダーの詳細**カードで、**シングルサインオンURL**をコピーします。この値は、Okta コンソールで OIDC アプリを作成する際の [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で必要になります。

1. これが完了したら、[Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) に進みます。

</Procedures>

### Step 2: Set up an OIDC app in Okta console\{#step-2-set-up-an-oidc-app-in-okta-console}

このステップでは、Zilliz Cloud から取得した SP 詳細を使用して Okta (IdP) を構成します。

<Supademo id="cme8abl5c3ei3h3pywbc9z740" title="Step 1: Create SAML App in Okta Console" />

<Procedures>

1. [Okta Admin console](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで、**アプリケーション** > **アプリケーション**を選択します。

1. **Create App Integration**をクリックします。

1. **Create a new app integration**ダイアログボックスで、サインイン方法として**OIDC - OpenID Connect**を選択し、アプリケーションタイプとして**Webアプリケーション**を選択します。**Next**をクリックします。

1. 新しい Web アプリ連携を以下の設定で構成します：

    - **アプリ連携名**: アプリ連携名をカスタマイズします（例：**zilliz**）。

    - **サインインリダイレクトURI**: [Step 1](./openid-connect#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**シングルサインオンURL**をここに貼り付けます。

    - **制御されたアクセス**: 特定のグループアクセスを設定しない限り、**Skip group assignment for now**を選択します。

1. **Save**をクリックします。その後、アプリ詳細ページへリダイレクトされます。

1. アプリ詳細ページで、以下の情報を取得します：

    - **クライアントID**

    - **クライアントシークレット**

    - **Oktaドメイン**

    これらの値は、[Step 3](./openid-connect#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソール内で必要になります。

</Procedures>

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、Okta の IdP 詳細を Zilliz Cloud に提供して、OIDC 信頼関係を完了させます。

<Supademo id="cme8af32q3elth3pyaygkdnmo" title="Step 3: Configure Okta settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの**IDプロバイダーの詳細**カードで、以下を構成します：

    - **Okta Domain**: [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした**Oktaドメイン**を貼り付けます。

    - **クライアントID**: [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした**クライアントID**を貼り付けます。

    - **クライアントシークレット**: [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした**クライアントシークレット**を貼り付けます。

1. これが完了したら、**Save**をクリックします。次に、**OK**をクリックします。

</Procedures>

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign OIDC app to users\{#task-1-assign-oidc-app-to-users}

<Supademo id="cme8ahjdm3epjh3pyg6a3k93k" title="Task 1: Assign OIDC app to users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、OIDC アプリをユーザーに割り当てる必要があります：

<Procedures>

1. [Okta Admin console](https://login.okta.com/) のアプリ詳細ページで、**割り当て**をクリックします。

1. **Assign** > **Assign to People**を選択します。

1. OIDC アプリをユーザーに割り当て、変更を保存します。

1. **Save**をクリック**をクリック****戻る**します。次に、**Done**をクリックします。

</Procedures>

必要に応じてすべてのユーザーに対してこの操作を繰り返します。詳細については、[Okta documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO を介して Zilliz Cloud にログインすると、**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー**は、適切なプロジェクトへそれらを招待する必要があります。

- ユーザーをプロジェクトへ招待する方法の手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトへ招待された後、**Organization** **オーナー**はエンタープライズユーザーと Zilliz Cloud ログイン URL を共有でき、それによりユーザーは SSO を介してサインインできます。

<Admonition type="info" icon="📘" title="Notes">

<p>組織で SSO 強制が有効になっている場合、組織レベルでのメンバーの直接招待は無効になります。代わりに IdP を介してユーザーをプロビジョニングする必要があります。プロジェクトレベルでメンバーを招待する場合、既存の組織メンバーのみを招待できます。</p>

</Admonition>

設定またはテストプロセス中に問題が発生した場合は、[Zilliz support](https://zilliz.com/contact-sales) にお問い合わせください。

### Task 3: (Optional) Enable SSO enforcement\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成およびテストされた後、オプションで**SSO enforcement**を有効にして、すべての組織メンバーが SSO を介してのみログインすることを必須にできます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="danger" icon="🚧" title="Warning">

<p>この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーがすぐにログアウトされ、非 SSO ログイン方法がブロックされます。</p>

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

すでに Zilliz Cloud アカウントを持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで**組織メンバー**ロールが割り当てられます。後で Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

SSO を介してログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がそれらをプロジェクトへ招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在する場合（メールアドレスに基づき）、SSO を介してログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度にアクティブな**SAML SSO configuration**を 1 つのみサポートしています。