---
title: "Okta (OIDC) | BYOC"
slug: /openid-connect
sidebar_label: "Okta (OIDC)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。 | BYOC"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Okta (OIDC)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイでのみ利用できます。

</FeatureNote>

このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud が Service Provider (SP) として機能し、Okta が Identity Provider (IdP) として機能します。以下の図は、Zilliz Cloud と Okta コンソールで必要となる手順を示しています。

![EfRWwnbKNhcXEwbL7EBcB66inrd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあること。

- Okta コンソールへの Admin アクセス権があること。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を構成する Zilliz Cloud 組織の Organization Owner であること。

## 構成手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールで SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Okta で OIDC アプリをセットアップする際に必要な **Single sign-on URL** を提供します。

<Supademo id="cme89wf1w3eaoh3pytd3723ao" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Okta (OIDC)** を選択します。

1. **Service Provider Details** カードで、**Single sign-on URL** をコピーします。この値は、Okta コンソールで OIDC アプリを作成する際に [ステップ 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で必要になります。

1. 完了したら、[ステップ 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) に進みます。

</Procedures>

### ステップ 2: Okta コンソールで OIDC アプリをセットアップする\{#step-2-set-up-an-oidc-app-in-okta-console}

このステップでは、Zilliz Cloud から取得した SP の詳細を使用して Okta (IdP) を構成します。

<Supademo id="cme8abl5c3ei3h3pywbc9z740" title="Step 1: Create SAML App in Okta Console" />

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで、**Applications** > **Applications** を選択します。

1. **Create App Integration** をクリックします。

1. **Create a new app integration** ダイアログボックスで、サインイン方法として **OIDC - OpenID Connect** を選択し、アプリケーションタイプとして **Web Application** を選択します。次に **Next** をクリックします。

1. 新しい Web App integration を以下の設定でセットアップします。 

    - **App integration name**: App integration 名をカスタマイズします（例: **zilliz**）。

    - **Sign-in redirect URIs**: ここに、[ステップ 1](./openid-connect#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Single sign-on URL** を貼り付けます。

    - **Controlled access**: 特定のグループアクセスをセットアップしたい場合を除き、**Skip group assignment for now** を選択します。

1. **Save** をクリックします。すると、アプリの詳細ページにリダイレクトされます。

1. アプリの詳細ページで、次の情報を取得します。

    - **Client ID**

    - **Client Secret**

    - **Okta domain**

    これらの値は、[ステップ 3](./openid-connect#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに必要になります。

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、OIDC の信頼関係を完成させるために、Okta の IdP 詳細を Zilliz Cloud に提供します。

<Supademo id="cme8af32q3elth3pyaygkdnmo" title="Step 3: Configure Okta settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、以下を構成します。

    - **Okta Domain**: [ステップ 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Okta domain** を貼り付けます。

    - **Client ID**: [ステップ 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Client ID** を貼り付けます。

    - **Client Secret**: [ステップ 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Client Secret** を貼り付けます。

1. 完了したら、**Save** をクリックします。次に、**OK** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: OIDC アプリをユーザーに割り当てる\{#task-1-assign-oidc-app-to-users}

<Supademo id="cme8ahjdm3epjh3pyg6a3k93k" title="Task 1: Assign OIDC app to users" />

ユーザーが SSO を通じて Zilliz Cloud にアクセスできるようにする前に、そのユーザーに OIDC アプリを割り当てる必要があります。

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) のアプリ詳細ページで、**Assignments** をクリックします。

1. **Assign** > **Assign to People** を選択します。

1. ユーザーに OIDC アプリを割り当て、変更を保存します。

1. **Save** **and** **Go Back** をクリックします。次に **Done** をクリックします。

</Procedures>

必要に応じて、すべてのユーザーについてこれを繰り返します。詳細は [Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** は、それらのユーザーを適切なプロジェクトに招待する必要があります。

- プロジェクトにユーザーを招待する手順の詳細については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーに Zilliz Cloud のログイン URL を共有できるため、ユーザーは SSO を通じてサインインできます。

<Admonition type="info" icon="📘" title="Notes">

組織に対して SSO enforcement が有効になっている場合、組織レベルでのメンバーの直接招待は無効になります。代わりに、IdP を通じてユーザーをプロビジョニングする必要があります。プロジェクトレベルでメンバーを招待する場合は、既存の組織メンバーのみを招待できます。

</Admonition>

セットアップまたはテストの過程で問題が発生した場合は、[Zilliz support](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO enforcement を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成されテストされた後、必要に応じて **SSO enforcement** を有効にし、すべての組織メンバーが SSO のみを使用してログインするよう必須化できます。有効にすると、メンバーはメールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインしたユーザーには、どのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既存の Zilliz Cloud アカウントを持たない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後で Zilliz Cloud コンソールでそのロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### ユーザーが SSO でログインする前にすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織内に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限は保持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つのアクティブな SAML SSO 構成** のみがサポートされています。
