---
title: "Other IdP (SAML 2.0) | Cloud"
slug: /single-sign-on-with-other-idp
sidebar_label: "Other IdP (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルに対応する任意の ID プロバイダー (IdP) を使用して、Zilliz Cloud でシングルサインオン (SSO) を設定する方法について説明します。 | Cloud"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Other IdP (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみご利用いただけます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルに対応する任意の ID プロバイダー (IdP) を使用して、Zilliz Cloud でシングルサインオン (SSO) を設定する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud では [Okta](./single-sign-on-with-okta)、[Google Workspace](./single-sign-on-with-google-workspace)、[Microsoft Entra](./single-sign-on-with-microsoft-entra) 専用の連携ガイドを用意していますが、標準準拠の SAML 2.0 IdP であれば **Other IdP (SAML 2.0)** オプションから利用できます。

</Admonition>

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に **Dedicated (Enterprise)** クラスターが 1 つ以上存在すること。

- SSO を設定する Zilliz Cloud 組織で **Organization Owner** であること。

- 使用する IdP の管理者権限を持っていること。

- IdP 固有の設定詳細については、各 IdP の公式ドキュメントを参照してください。

## 設定手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールでサービスプロバイダー情報を確認する\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を設定する組織を選択します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページの **Single Sign-On (SSO)** セクションで **Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Other IdP (SAML)** を選択します。

1. **Service Provider Details** カードから以下の値をコピーします。

    - **SP Entity ID**

    - **ACS URL**

</Procedures>

これらの値は、IdP 側で SAML アプリケーションを作成する際の [手順 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) で必要になります。

### 手順 2: IdP コンソールで SAML アプリを作成する\{#step-2-create-a-saml-app-in-your-idp-console}

具体的な操作は IdP によって異なりますが、一般的な流れは以下のとおりです。

<Procedures>

1. IdP の管理者コンソールにサインインします。

1. 新しい SAML 2.0 アプリケーションを作成します（SAML 接続やインテグレーションと呼ばれる場合もあります）。

1. サービスプロバイダー情報の入力を求められたら、以下を入力します。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **SP Entity ID**。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **ACS URL**。

1. アプリケーションを保存し、以下のいずれかの形式で IdP 設定情報を取得します。

    - **オプション 1 – Metadata URL/File**: 多くの IdP は、必要な SAML メタデータをすべて含むダウンロード可能な XML ファイルまたは公開 URL を提供しています。

    - **オプション 2 – 手動**: メタデータを利用できない場合は、IdP から以下の情報を収集します。

        - **IdP SSO URL**（Zilliz Cloud が認証リクエストを送信するエンドポイント）

        - **x.509 Certificate**（`-----BEGIN CERTIFICATE-----` 行と `-----END CERTIFICATE-----` 行を含む）

    これらの情報は [手順 3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console) で使用します。

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を行う\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. Configure Single Sign-On (SSO) ダイアログボックスの **Identity Provider Details** カードで、以下のいずれかの方法を選択します。

    **オプション 1 – Metadata URL/File**

    - IdP からコピーした **Metadata URL** を貼り付けるか、ダウンロードした Metadata XML ファイルをアップロードします。

    - Zilliz Cloud が証明書を含む必要な IdP 情報を自動的にインポートします。

    **オプション 2 – 手動**

    - IdP の **IdP SSO URL** を入力します。

    - IdP の署名証明書を X.509 形式でアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----` 行と `-----END CERTIFICATE-----` 行が含まれていることを確認してください。

1. **Save** をクリックします。

</Procedures>

## 設定後の作業\{#post-configuration-tasks}

### タスク 1: IdP でユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーが SSO でサインインできるようにするには、IdP 側で SAML アプリへのアクセス権を付与する必要があります。

- 特定のユーザーまたはグループにアプリを割り当てます。

- 割り当てた各ユーザーのメールアドレスが、Zilliz Cloud アカウントのメールアドレスと一致していることを確認してください。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が該当ユーザーを適切なプロジェクトに招待する必要があります。

- プロジェクトへのユーザー招待手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトへの招待後、**Organization** **Owner** はエンタープライズ ユーザーに Zilliz Cloud ログイン URL を共有し、SSO 経由でサインインできるようにします。

設定やテスト中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （オプション）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完了したら、オプションで **SSO enforcement** を有効にして、すべての組織メンバーに SSO 経由でのログインを必須にすることができます。有効化すると、メンバーはメール/password やサードパーティー アカウント（Google、GitHub）でサインインできなくなります。

<Admonition type="warning" icon="🚧" title="Warning">

この機能を有効にすると、パスワードでサインイン中のメンバーは即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO でログインしたユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントを持たない新規ユーザーは、最初の SSO ログイン時にアカウントが自動作成されます。これらのユーザーにはデフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更可能です。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### SSO ログイン前にすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在する場合（メールアドレスに基づいて判定）、SSO でログインしても既存のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つのアクティブな SAML SSO 設定** のみがサポートされています。
