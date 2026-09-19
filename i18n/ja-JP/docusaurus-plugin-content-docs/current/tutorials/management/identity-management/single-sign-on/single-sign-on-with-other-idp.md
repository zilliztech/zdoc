---
title: "Other IdP (SAML 2.0) | Cloud"
slug: /single-sign-on-with-other-idp
sidebar_label: "Other IdP (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloud でシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Other IdP (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloud でシングルサインオン（SSO）を構成する方法について説明します。

<Admonition type="info" title="Notes">

Zilliz Cloud では、[Okta](./single-sign-on-with-okta)、[Google Workspace](./single-sign-on-with-google-workspace)、[Microsoft Entra](./single-sign-on-with-microsoft-entra) の専用連携ガイドを用意していますが、標準に準拠した SAML 2.0 IdP であれば **Other IdP (SAML 2.0)** オプションを使用できます。

</Admonition>

## 事前準備\{#before-you-start}

- Zilliz Cloud 組織に **Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- SSO を構成する Zilliz Cloud 組織の **Organization Owner** であること。

- 使用する予定の IdP への管理者アクセス権を持っていること。

- IdP 固有の設定の詳細については、使用する IdP の公式ドキュメントを参照してください。

## 設定手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールでサービスプロバイダーの詳細を確認する\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP およびプロトコルとして **Other IdP (SAML)** を選択します。

1. **Service Provider Details** カードで、以下の値をコピーします。

    - **SP Entity ID**

    - **ACS URL**

</Procedures>

これらの値は、IdP で SAML アプリケーションを作成する際の [手順 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) で必要になります。

### 手順 2: IdP コンソールで SAML アプリを作成する\{#step-2-create-a-saml-app-in-your-idp-console}

正確なプロセスは IdP によって異なります。一般的には以下のとおりです。

<Procedures>

1. IdP の管理者コンソールにサインインします。

1. 新しい SAML 2.0 アプリケーションを作成します（SAML 接続または連携と呼ばれることもあります）。

1. サービスプロバイダー情報の入力を求められたら、以下を入力します。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **SP Entity ID**。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **ACS URL**。

1. アプリケーションを保存し、以下のいずれかの形式で IdP 構成を取得します。

    - **オプション 1 – Metadata URL/File**: ほとんどの IdP は、必要な SAML メタデータをすべて含むダウンロード可能な XML ファイルまたは公開 URL を提供しています。

    - **オプション 2 – Manual**: メタデータが利用できない場合は、IdP から以下の情報を収集します。

        - **IdP SSO URL**（Zilliz Cloud が認証リクエストを送信するエンドポイント）

        - **x.509 Certificate**（`-----BEGIN CERTIFICATE-----` 行と `-----END CERTIFICATE-----` 行を含む）

    この情報は [手順 3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console) で使用します。

</Procedures>

### 手順 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. Configure Single Sign-On (SSO) ダイアログボックスの **Identity Provider Details** カードで、以下のいずれかの方法を選択します。

    **オプション 1 – Metadata URL/File**

    - IdP からコピーした **Metadata URL** を貼り付けるか、ダウンロードした Metadata XML ファイルをアップロードします。

    - Zilliz Cloud が、証明書を含む必要な IdP の詳細を自動的にインポートします。

    **オプション 2 – Manual**

    - IdP の **IdP SSO URL** を入力します。

    - X.509 形式の IdP 署名証明書をアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----` 行と `-----END CERTIFICATE-----` 行が含まれていることを確認します。

1. **Save** をクリックします。

</Procedures>

## 設定後の作業\{#post-configuration-tasks}

### タスク 1: IdP でユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーが SSO 経由でサインインできるようにするには、IdP で SAML アプリへのアクセス権を付与する必要があります。

- 特定のユーザーまたはグループにアプリを割り当てます。

- 割り当てた各ユーザーのメールアドレスが、そのユーザーの Zilliz Cloud アカウントのメールアドレスと一致していることを確認します。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が該当するユーザーを適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待する手順の詳細については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** は Zilliz Cloud のログイン URL をエンタープライズユーザーと共有し、SSO 経由でサインインできるようにします。

設定またはテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO enforcement を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了したら、任意で **SSO enforcement** を有効にして、すべての組織メンバーに SSO 経由でのログインのみを必須にすることができます。有効にすると、メンバーはメールアドレス/password またはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" title="Warning">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時にアカウントが自動作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。これらのユーザーのロールは、後から Zilliz Cloud コンソールで変更できます。詳細な手順については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在する場合（メールアドレスに基づく）、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合するため、既存のアカウントは上書きされません。

### 同じ組織に複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織でサポートされるのは、同時に **1 つの有効な SAML SSO 構成**のみです。
