---
title: "その他の IdP (SAML 2.0) | Cloud"
slug: /single-sign-on-with-other-idp
sidebar_label: "その他の IdP (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルをサポートする任意の ID プロバイダー (IdP) を使用して、Zilliz Cloud でシングルサインオン (SSO) を設定する方法について説明します。 | Cloud"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# その他の IdP (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルをサポートする任意の ID プロバイダー (IdP) を使用して、Zilliz Cloud でシングルサインオン (SSO) を設定する方法について説明します。

<Admonition type="info" icon="📘" title="注記">

Zilliz Cloud では、[Okta](./single-sign-on-with-okta)、[Google Workspace](./single-sign-on-with-google-workspace)、および [Microsoft Entra](./single-sign-on-with-microsoft-entra) 向けの専用統合ガイドを提供していますが、標準に準拠した任意の SAML 2.0 IdP を **Other IdP (SAML 2.0)** オプションで使用できます。

</Admonition>

## 始める前に\{#before-you-start}

- お使いの Zilliz Cloud 組織には、少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあります。

- SSO を設定する Zilliz Cloud 組織の **Organization Owner** です。

- 使用予定の IdP に対する管理者アクセス権を持っています。

- IdP 固有の設定詳細については、使用する IdP の公式ドキュメントを参照してください。

## 設定手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールでサービスプロバイダーの詳細にアクセスする\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="ステップ 1: Zilliz Cloud でサービスプロバイダーの詳細にアクセスする" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインし、SSO を設定したい組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Other IdP (SAML)** を選択します。

1. **Service Provider Details** カードで、次の値をコピーします。

    - **SP Entity ID**

    - **ACS URL**

</Procedures>

これらの値は、IdP で SAML アプリケーションを作成する際に、[ステップ 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) で必要になります。

### ステップ 2: IdP コンソールで SAML アプリを作成する\{#step-2-create-a-saml-app-in-your-idp-console}

正確な手順は IdP によって異なります。一般的には次のとおりです。

<Procedures>

1. IdP の管理者コンソールにサインインします。

1. 新しい SAML 2.0 アプリケーションを作成します（SAML 接続や統合と呼ばれることもあります）。

1. サービスプロバイダー情報の入力を求められたら、次を入力します。

    - [ステップ 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) の **SP Entity ID**

    - [ステップ 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) の **ACS URL**

1. アプリケーションを保存し、次のいずれかの形式で IdP 設定を取得します。

    - **Option 1 – Metadata URL/File**: 多くの IdP は、必要なすべての SAML メタデータを含むダウンロード可能な XML ファイルまたは公開 URL を提供します。

    - **Option 2 – Manual**: メタデータが利用できない場合は、IdP から次の情報を収集します。

        - **IdP SSO URL**（Zilliz Cloud が認証リクエストを送信するエンドポイント）

        - **x.509 Certificate**（`-----BEGIN CERTIFICATE-----` および `-----END CERTIFICATE-----` 行を含む）

    この情報は [ステップ 3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console) で使用します。

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)に戻ります。

1. Configure Single Sign-On (SSO) ダイアログボックスの **Identity Provider Details** カードで、次のいずれかの方法を選択します。

    **Option 1 – Metadata URL/File**

    - IdP からコピーした **Metadata URL** を貼り付けるか、ダウンロードした Metadata XML ファイルをアップロードします。

    - Zilliz Cloud は、証明書を含む必要な IdP 詳細を自動的にインポートします。

    **Option 2 – Manual**

    - IdP の **IdP SSO URL** を入力します。

    - X.509 形式の IdP 署名証明書をアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----` および `-----END CERTIFICATE-----` 行が含まれていることを確認してください。

1. **Save** をクリックします。

</Procedures>

## 設定後のタスク\{#post-configuration-tasks}

### タスク 1: IdP でユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーが SSO 経由でサインインできるようにする前に、IdP でそのユーザーに SAML アプリへのアクセス権を付与する必要があります。

- アプリを特定のユーザーまたはグループに割り当てます。

- 割り当てられた各ユーザーのメールアドレスが、そのユーザーの Zilliz Cloud アカウントのメールアドレスと一致していることを確認します。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** は、それらのユーザーを適切なプロジェクトに招待する必要があります。

- プロジェクトにユーザーを招待する手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** は Zilliz Cloud のログイン URL をエンタープライズユーザーと共有し、SSO を通じてサインインできるようにできます。

設定またはテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の設定とテストが完全に完了した後、必要に応じて **SSO enforcement** を有効にし、組織のすべてのメンバーに SSO 経由のみでのログインを必須にできます。有効にすると、メンバーはメールアドレス/パスワードやサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは直ちにログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーには、どのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後で Zilliz Cloud コンソールで変更できます。詳しい手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにしてプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳しい手順については、[Manage Project Users](./project-users) を参照してください。

### ユーザーが SSO でログインする前からすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限が保持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に対して複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つのアクティブな SAML SSO 設定** のみがサポートされています。
