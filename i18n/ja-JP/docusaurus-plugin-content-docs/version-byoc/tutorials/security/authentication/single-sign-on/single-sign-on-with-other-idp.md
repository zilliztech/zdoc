---
title: "その他のIdP（SAML 2.0） | BYOC"
slug: /single-sign-on-with-other-idp
sidebar_label: "その他のIdP（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）でZilliz Cloudのシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - sso
  - その他
  - idp
  - 階層的ナビゲーション可能な小さな世界
  - 密結合埋め込み
  - Faissベクトルデータベース
  - Chromaベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# その他のIdP（SAML 2.0）

このトピックでは、SAML 2.0プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）でZilliz Cloudのシングルサインオン（SSO）を構成する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudは、<a href="./single-sign-on-with-okta">Okta</a>、<a href="./single-sign-on-with-google-workspace">Google Workspace</a>、および<a href="./single-sign-on-with-microsoft-entra">Microsoft Entra</a>の専用統合ガイドを提供していますが、標準準拠のSAML 2.0 IdPは<strong>その他のIdP（SAML 2.0）</strong>オプションで使用できます。</p>

</Admonition>

## 事前準備\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（エントープライズ）**クラスターがあります。

- SSOを構成するZilliz Cloud組織の**組織オーナー**です。

- 使用予定のIdPへの管理者アクセス権があります。

- IdP固有のセットアップ詳細については、IdPの公式ドキュメントを参照してください。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz Cloudコンソールでサービスプロバイダーの詳細を取得\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="ステップ1：Zilliz Cloudでサービスプロバイダーの詳細を取得" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**その他のIdP（SAML）**を選択します。

1. **サービスプロバイダーの詳細**カードで、次の値をコピーします：

    - **SPエンティティID**

    - **ACS URL**

これらの値は、IdPでSAMLアプリケーションを作成する際の[ステップ2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console)で必要になります。

### ステップ2：IdPコンソールでSAMLアプリを作成\{#step-2-create-a-saml-app-in-your-idp-console}

正確なプロセスはIdPによって異なります。一般的には：

1. IdPの管理者コンソールにサインインします。

1. 新しいSAML 2.0アプリケーション（SAML接続または統合と呼ばれる場合があります）を作成します。

1. サービスプロバイダー情報を入力するよう求められた際に入力します：

    - [ステップ1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console)で取得した**SPエンティティID**。

    - [ステップ1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console)で取得した**ACS URL**。

1. アプリケーションを保存し、次の形式でIdP構成情報を取得します：

    - **オプション1 – メタURL/ファイル**：ほとんどのIdPは、必要なSAMLメタデータをすべて含むダウンロード可能なXMLファイルまたはパブリックURLを提供します。

    - **オプション2 – 手動**：メタデータが利用できない場合、IdPから以下を収集します：

        - **IdP SSO URL**（Zilliz Cloudが認証要求を送信するエンドポイント）

        - **x.509証明書**（`-----BEGIN CERTIFICATE-----`および`-----END CERTIFICATE-----`の行を含む）

この情報は[ステップ3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console)で使用します。

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）の構成**ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、次のいずれかの方法を選択します：

    **オプション1 – メタURL/ファイル**

    - IdPからコピーした**メタデータURL**を貼り付けるか、ダウンロードしたメタデータXMLファイルをアップロードします。

    - Zilliz Cloudは証明書を含む必要なIdP詳細を自動的にインポートします。

    **オプション2 – 手動**

    - IdPから取得した**IdP SSO URL**を入力します。

    - X.509形式でIdP署名証明書をアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----`および`-----END CERTIFICATE-----`の行を含むことを確認してください。

1. **保存**をクリックします。

## 構成後タスク\{#post-configuration-tasks}

### タスク1：IdPでSAMLアプリをユーザーに割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーがSSO経由でサインインできるようになる前に、IdPでSAMLアプリへのアクセス権をユーザーに付与する必要があります：

- 特定のユーザーまたはグループにアプリを割り当てます。

- 割り当てられた各ユーザーのメールアドレスがZilliz Cloudアカウントのメールアドレスと一致していることを確認してください。

### タスク2：ユーザーをプロジェクトに招待\{#task-2-invite-users-to-your-project}

ユーザーがSSO経由でZilliz Cloudに初めてログインする際、**組織メンバー**として登録されますが、デフォルトでどのプロジェクトにもアクセス権がありません。

- **組織オーナー**は、適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待する手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project)を参照してください。

プロジェクトに招待された後、**組織** **オーナー**は企業ユーザーがSSO経由でサインインできるようにZilliz CloudログインURLを共有できます。

セットアップまたはテストプロセス中に問題が発生した場合は、[Zillizサポート](https://zilliz.com/contact-sales)にお問い合わせください。

## FAQ\{#faq}

### SSOで初めてログインするユーザーに割り当てられるロールは何ですか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既にZilliz Cloudアカウントを持っていない新規ユーザーは、最初のSSOログイン時に自動的に作成されます。これらのユーザーには、デフォルトで**組織メンバー**ロールが割り当てられます。Zilliz Cloudコンソールで後からロールを変更できます。詳細手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role-or-remove-a-collaborator)を参照してください。

### SSOログイン後にユーザーがプロジェクトにアクセスする方法は？\{#how-do-users-access-projects-after-sso-login}

SSO経由でログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが与えられます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がプロジェクトに招待する必要があります。詳細手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### SSOでログインする前にユーザーが既にZilliz Cloudアカウントを持っている場合どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーが既にZilliz Cloud組織に（メールアドレスに基づいて）存在する場合、SSO経由でログインする際に元のロールと権限を保持します。システムはメールアドレスでユーザーをマッチングし、既存のアカウントを上書きしません。

### 同じ組織に複数のSSOプロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各Zilliz Cloud組織は同時に**1つの有効なSAML SSO構成**のみをサポートしています。