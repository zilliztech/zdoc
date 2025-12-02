---
title: "その他のIdP（SAML 2.0） | Cloud"
slug: /single-sign-on-with-other-idp
sidebar_label: "その他のIdP（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloudでシングルサインオン（SSO）を設定する方法について説明します。 | Cloud"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - sso
  - その他
  - idp
  - ベクターデータベース
  - IVF
  - knn
  - 画像検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# その他のIdP（SAML 2.0）

このトピックでは、SAML 2.0プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）を使用して、Zilliz Cloudでシングルサインオン（SSO）を設定する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、<a href="./single-sign-on-with-okta">Okta</a>、<a href="./single-sign-on-with-google-workspace">Google Workspace</a>、および<a href="./single-sign-on-with-microsoft-entra">Microsoft Entra</a>向けに専用の統合ガイドを提供していますが、<strong>その他のIdP（SAML）</strong>オプションを使用して、SAML 2.0準拠の任意のIdPを使用できます。</p>

</Admonition>

## 始める前に\{#before-you-start}

- Zilliz Cloudの組織に少なくとも1つの<strong>専用（エンタープライズ）</strong>クラスターがある。

- SSOを設定するZilliz Cloudの組織において、<strong>組織オーナー</strong>である。

- 使用予定のIdPに対して管理者アクセス権を持っている。

- IdP固有のセットアップ手順については、IdPの公式ドキュメントを参照してください。

## 設定手順\{#configuration-steps}

### ステップ1：Zilliz Cloudコンソールでサービスプロバイダーの詳細を確認\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="ステップ1：Zilliz Cloudでサービスプロバイダーの詳細にアクセス" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけて、**設定**をクリックします。

1. 表示されるダイアログボックスで、IdPとして**その他のIdP（SAML）**を選択します。

1. **サービスプロバイラードetails**カードで、以下の値をコピーします：

    - **SPエンティティID**

    - **ACS URL**

これらの値は、IdPでSAMLアプリケーションを作成する際に[ステップ2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console)で必要になります。

### ステップ2：IdPコンソールでSAMLアプリを作成\{#step-2-create-a-saml-app-in-your-idp-console}

正確なプロセスはIdPによって異なります。一般的には：

1. IdPの管理者コンソールにサインインします。

1. 新しいSAML 2.0アプリケーション（SAMLコネクションまたは統合と呼ばれる場合もあります）を作成します。

1. サービスプロバイダー情報の入力を求められたら、以下を入力します：

    - [ステップ1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console)で取得した**SPエンティティID**

    - [ステップ1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console)で取得した**ACS URL**

1. アプリケーションを保存し、以下のいずれかの形式でIdP構成情報を取得します：

    - **オプション1 - メタデータURL/ファイル**：多くのIdPは、必要なSAMLメタデータをすべて含むダウンロード可能なXMLファイルまたはパブリックURLを提供します。

    - **オプション2 - 手動**：メタデータが利用できない場合は、IdPから以下を収集してください：

        - **IdP SSO URL**（Zilliz Cloudが認証要求を送信するエンドポイント）

        - **x.509証明書**（`-----BEGIN CERTIFICATE-----`と`-----END CERTIFICATE-----`の両行を含む）

[ステップ3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console)でこの情報を使用します。

### ステップ3: Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. シングルサインオン（SSO）設定ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、以下のいずれかの方法を選択します：

    **オプション1 – メタデータURL/ファイル**

    - IdPからコピーした**メタデータURL**を貼り付けるか、ダウンロードしたメタデータXMLファイルをアップロードします。

    - Zilliz Cloudは証明書を含む必要なIdP詳細を自動的にインポートします。

    **オプション2 – 手動**

    - IdPから取得した**IdP SSO URL**を入力します。

    - X.509形式のIdP署名証明書をアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----`および`-----END CERTIFICATE-----`行が含まれていることを確認してください。

1. **保存**をクリックします。

## 事後設定タスク\{#post-configuration-tasks}

### タスク1：IdPでSAMLアプリをユーザーに割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

SSO経由でユーザーがサインインできるようになる前に、IdPでSAMLアプリへのアクセスをユーザーに付与する必要があります：

- 特定のユーザーまたはグループにアプリを割り当てます。

- 各ユーザーのメールアドレスがZilliz Cloudアカウントのメールアドレスと一致していることを確認します。

### タスク2：プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーがSSO経由でZilliz Cloudに初めてログインすると、自動的に**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー**がユーザーを適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待する手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project)を参照してください。

プロジェクトに招待された後、**組織オーナー**は企業ユーザーにSSO経由でサインインできるZilliz CloudのログインURLを知らせることができます。

セットアップまたはテストプロセスで問題が発生した場合は、[Zillizサポート](https://zilliz.com/contact-sales)にお問い合わせください。

## FAQ\{#faq}

### SSOで初めてログインするユーザーにはどのようなロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

SSOで初めてログインした新しいユーザーは自動的に作成されます。これらのユーザーにはデフォルトで**組織メンバー**ロールが割り当てられます。Zilliz Cloudコンソールで後からロールを変更できます。詳細手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role-or-remove-a-collaborator)を参照してください。

### SSOログイン後にユーザーはプロジェクトにどのようにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSOでログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がプロジェクトに招待する必要があります。詳細手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### Zilliz Cloudアカウントが既に存在するユーザーがSSOでログインした場合どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

Zilliz Cloud組織に既にユーザーが存在する場合（メールアドレスベース）、SSO経由でログインしても元のロールと権限を保持します。システムはメールアドレスでユーザーを一致させ、既存のアカウントを上書きしません。

### 同じ組織に複数のSSOプロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各Zilliz Cloud組織は同時に<strong>1つのアクティブなSAML SSO構成</strong>のみをサポートしています。