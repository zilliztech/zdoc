---
title: "Other IdP (SAML 2.0) | BYOC"
slug: /single-sign-on-with-other-idp
sidebar_label: "Other IdP (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルに対応する任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloud でシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
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

このトピックでは、SAML 2.0 プロトコルに対応する任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloud でシングルサインオン（SSO）を構成する方法について説明します。

<Admonition type="info" title="Notes">

Zilliz Cloud では、[Okta](./single-sign-on-with-okta)、[Google Workspace](./single-sign-on-with-google-workspace)、[Microsoft Entra](./single-sign-on-with-microsoft-entra) 専用の連携ガイドを用意していますが、標準に準拠した SAML 2.0 IdP であれば **Other IdP (SAML 2.0)** オプションで使用できます。

</Admonition>

## 事前準備\{#before-you-start}

- お使いの Zilliz Cloud 組織に **Dedicated (Enterprise)** クラスターが少なくとも 1 つ存在すること。

- SSO を構成する Zilliz Cloud 組織で **Organization Owner** であること。

- 使用する予定の IdP への管理者アクセス権を持っていること。

- IdP 固有の設定の詳細については、お使いの IdP の公式ドキュメントを参照してください。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud コンソールでサービスプロバイダー情報を確認する\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを探し、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Other IdP (SAML)** を選択します。

1. **Service Provider Details** カードで、以下の値をコピーします。

    - **SP Entity ID**

    - **ACS URL**

</Procedures>

これらの値は、IdP で SAML アプリケーションを作成する際の [手順 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) で必要になります。

### 手順 2: IdP コンソールで SAML アプリを作成する\{#step-2-create-a-saml-app-in-your-idp-console}

正確な手順は IdP によって異なりますが、一般的には次のとおりです。

<Procedures>

1. IdP の管理者コンソールにサインインします。

1. 新しい SAML 2.0 アプリケーション（SAML 接続やインテグレーションと呼ばれることもあります）を作成します。

1. サービスプロバイダー情報の入力を求められたら、以下を入力します。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **SP Entity ID**。

    - [手順 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) で取得した **ACS URL**。

1. アプリケーションを保存し、次のいずれかの形式で IdP の構成情報を取得します。

    - **オプション 1 – Metadata URL/File**: ほとんどの IdP では、必要な SAML メタデータをすべて含む XML ファイルをダウンロードできるほか、公開 URL も提供されています。

    - **オプション 2 – Manual**: メタデータを利用できない場合は、IdP から以下を収集します。

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

    - Zilliz Cloud によって、証明書を含む必要な IdP 情報が自動的にインポートされます。

    **オプション 2 – Manual**

    - IdP の **IdP SSO URL** を入力します。

    - X.509 形式の IdP 署名証明書をアップロードまたは貼り付けます。この証明書に `-----BEGIN CERTIFICATE-----` 行と `-----END CERTIFICATE-----` 行が含まれていることを確認してください。

1. **Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: IdP でユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーが SSO 経由でサインインできるようにするには、IdP でユーザーに SAML アプリへのアクセス権を付与する必要があります。

- 特定のユーザーまたはグループにアプリを割り当てます。

- 割り当てた各ユーザーのメールアドレスが、その Zilliz Cloud アカウントのメールアドレスと一致していることを確認します。

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が、該当するプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待する手順については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーと Zilliz Cloud のログイン URL を共有し、そのユーザーが SSO 経由でサインインできるようにすることができます。

セットアップやテストの過程で問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO の強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完了したら、任意で **SSO enforcement** を有効にして、すべての組織メンバーに SSO 経由のログインを必須にすることができます。有効にすると、メンバーはメール/password やサードパーティーアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" title="Warning">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織での SSO の強制](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### SSO で初めてログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。ロールは後から Zilliz Cloud コンソールで変更できます。詳しい手順については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインしたユーザーには、デフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーをプロジェクトに招待する必要があります。詳しい手順については、[プラットフォームユーザーの管理](./manage-platform-users#project-users) を参照してください。

### SSO でログインする前にすでに Zilliz Cloud アカウントを持っているユーザーはどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

メールアドレスに基づいてユーザーがすでに Zilliz Cloud 組織に存在する場合、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きすることはありません。

### 同じ組織に複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織でサポートされているのは、一度に **1 つの有効な SAML SSO 構成** のみです。
