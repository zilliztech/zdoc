---
title: "Okta (OIDC) | BYOC"
slug: /openid-connect
sidebar_label: "Okta (OIDC)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta とのシングルサインオン (SSO) を設定する方法について説明します。 | BYOC"
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

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、OpenID Connect (OIDC) プロトコルを使用して Okta とのシングルサインオン (SSO) を設定する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー (SP)、Okta がアイデンティティプロバイダー (IdP) として機能します。次の図は、Zilliz Cloud および Okta コンソールでの必要な手順を示しています。

![EfRWwnbKNhcXEwbL7EBcB66inrd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に、**Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- Okta コンソールへの管理者アクセス権限を持っていること。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を設定する Zilliz Cloud 組織の Organization Owner であること。

## 設定手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP である Zilliz Cloud は、Okta で OIDC アプリを設定する際に必要な **Single sign-on URL** を提供します。

<Supademo id="cme89wf1w3eaoh3pytd3723ao" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を設定する組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Okta (OIDC)** を選択します。

1. **Service Provider Details** カードから **Single sign-on URL** をコピーします。この URL は、Okta コンソールで OIDC アプリを作成する [手順 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で必要になります。

1. 完了したら、[手順 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) に進みます。

</Procedures>

### 手順 2: Okta コンソールで OIDC アプリを設定する\{#step-2-set-up-an-oidc-app-in-okta-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使用して Okta (IdP) を設定します。

<Supademo id="cme8abl5c3ei3h3pywbc9z740" title="Step 1: Create SAML App in Okta Console" />

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで **Applications** > **Applications** を選択します。

1. **Create App Integration** をクリックします。

1. **Create a new app integration** ダイアログボックスで、サインイン方法として **OIDC - OpenID Connect** を選択し、アプリケーションタイプとして **Web Application** を選択して **Next** をクリックします。

1. 新しい Web App インテグレーションを以下の設定で作成します。

    - **App integration name**: アプリ統合名を指定します（例: **zilliz**）。

    - **Sign-in redirect URIs**: [手順 1](./openid-connect#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした **Single sign-on URL** を貼り付けます。

    - **Controlled access**: 特定のグループアクセスを設定しない限り、**Skip group assignment for now** を選択します。

1. **Save** をクリックすると、アプリ詳細ページにリダイレクトされます。

1. アプリ詳細ページで、以下の情報を確認します。

    - **Client ID**

    - **Client Secret**

    - **Okta domain**

    これらの値は、[手順 3](./openid-connect#step-3-configure-idp-settings-in-zilliz-cloud-console) で Zilliz Cloud コンソールに入力する必要があります。

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を行う\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、OIDC の信頼関係を確立するために、Okta の IdP 詳細を Zilliz Cloud に登録します。

<Supademo id="cme8af32q3elth3pyaygkdnmo" title="Step 3: Configure Okta settings in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、以下を設定します。

    - **Okta Domain**: [手順 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Okta domain** を貼り付けます。

    - **Client ID**: [手順 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Client ID** を貼り付けます。

    - **Client Secret**: [手順 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) で Okta コンソールからコピーした **Client Secret** を貼り付けます。

1. 入力が完了したら **Save** をクリックし、続いて **OK** をクリックします。

</Procedures>

## 設定後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに OIDC アプリを割り当てる\{#task-1-assign-oidc-app-to-users}

<Supademo id="cme8ahjdm3epjh3pyg6a3k93k" title="Task 1: Assign OIDC app to users" />

ユーザーが SSO 経由で Zilliz Cloud にアクセスできるようにするには、事前に OIDC アプリを割り当てる必要があります。

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) のアプリ詳細ページで、**Assignments** をクリックします。

1. **Assign** > **Assign to People** を選択します。

1. 対象ユーザーに OIDC アプリを割り当て、変更を保存します。

1. **Save** **and** **Go Back** をクリックし、**Done** をクリックします。

</Procedures>

必要に応じて、他のユーザーにも同様の操作を行います。詳細については、[Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が適切なプロジェクトにユーザーを招待する必要があります。

- プロジェクトへのユーザー招待手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトへの招待後、**Organization** **Owner** はエンタープライズユーザーに対して Zilliz Cloud のログイン URL を共有し、SSO 経由でサインインできるように案内できます。

<Admonition type="info" icon="📘" title="Notes">

組織レベルで SSO 強制が有効になっている場合、組織レベルでのメンバー直接招待は無効になります。代わりに IdP を通じてユーザーをプロビジョニングしてください。プロジェクトレベルでメンバーを招待する場合は、既存の組織メンバーのみが対象となります。

</Admonition>

設定やテスト中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （オプション）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完了したら、オプションで **SSO enforcement** を有効にして、すべての組織メンバーに SSO 経由でのログインを必須にすることができます。有効化すると、メール/passwordやサードパーティアカウント（Google、GitHub）を使用したサインインはできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO 経由で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントを持っていない新規ユーザーは、最初の SSO ログイン時にアカウントが自動作成されます。これらのユーザーにはデフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更可能です。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### SSO ログイン前にユーザーが既に Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーのメールアドレスが既に Zilliz Cloud 組織に登録されている場合、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスに基づいてユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織でサポートされるのは、**有効な SAML SSO 設定 1 つ**のみです。
