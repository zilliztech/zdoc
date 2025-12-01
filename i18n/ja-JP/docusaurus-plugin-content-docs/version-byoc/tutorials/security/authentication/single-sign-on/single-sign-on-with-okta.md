---
title: "Okta（SAML 2.0） | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "Okta（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - sso
  - okta
  - ベクトル検索アルゴリズム
  - 回答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta（SAML 2.0）

このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として機能し、Oktaがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudおよびOkta管理コンソールで必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](/img/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（エンタープライズ）**クラスターがあります。

- Okta管理コンソールへの管理者アクセス権があります。詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

- SSOを構成するZilliz Cloud組織の組織オーナーです。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細を取得\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz CloudはOktaでSAMLアプリを設定する際に必要な**オーディエンスURL（SPエンティティID）**および**シングルサインオンURL**を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="ステップ1：Zilliz Cloudコンソールでサービスプロバイダーの詳細を取得" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**Okta（SAML 2.0）**を選択します。

1. **サービスプロバイダーの詳細**カードで、**オーディエンスURL（SPエンティティID）**および**シングルサインオンURL**をコピーします。これらの値は、Okta管理コンソールでSAMLアプリを作成する際の[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)で必要になります。

1. それが完了したら、[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)に進みます。

### ステップ2：Okta管理コンソールでSAMLアプリを作成\{#step-2-create-a-saml-app-in-okta-admin-console}

このステップでは、Zilliz Cloudから取得したSPの詳細を使用してOkta（IdP）を構成します。

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="ステップ1：Okta管理コンソールでSAMLアプリを作成" />

1. [Okta管理コンソール](https://login.okta.com/)にログインします。

1. 左側のナビゲーションペインで、**アプリケーション** > **アプリケーション**を選択します。

1. **アプリ統合の作成**をクリックします。

1. **新しいアプリ統合を作成**ダイアログボックスで、**SAML 2.0**を選択し、**次へ**をクリックします。

1. 簡単にするために、**アプリ名**を**zilliz**に設定し、**次へ**をクリックします。

1. **SAMLの構成**ステップの**一般**領域で、以下のフィールドを構成します：

    - **シングルサインオンURL**：

        - [ステップ1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**シングルサインオンURL**をここに貼り付けます。

        - SAML要求中の正しいルーティングを確保するために、**"受信者URLおよび宛先URLとして使用"**と表示されたボックスを**必ずチェック**してください。

    - **オーディエンスURI（SPエンティティID）**：[ステップ1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**オーディエンスURL（SPエンティティID）**をここに貼り付けます。

1. **属性ステートメント（オプション）**領域で、以下を指定します：

    - **名前**：値を**email**に設定します。

    - **値**：ドロップダウンリストから**user.email**を選択します。

1. **次へ**をクリックし、**完了**をクリックします。アプリページにリダイレクトされます。

1. アプリページの**サインオン**タブで、**メタデータURL**を取得し、**コピー**をクリックします。これは、[ステップ3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console)でZilliz Cloudコンソールで必要になります。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、<strong>詳細情報を表示</strong>をクリックして以下の詳細情報を取得します：</p>
    <ul>
    <li><p><strong>サインオンURL</strong>：URLをコピーします。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p></li>
    <li><p><strong>署名証明書</strong>：<strong>ダウンロード</strong>をクリックして証明書をローカルコンピューターに保存します。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p></li>
    </ul>

    </Admonition>

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、SAML信頼関係を完了するために、OktaのIdP詳細をZilliz Cloudに戻して提供します。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="ステップ2：Zilliz CloudコンソールでOkta設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）の構成**ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)でOkta管理コンソールからコピーした**メタデータURL**を貼り付けます。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、IdP詳細構成で<strong>手動</strong>モードを選択した場合、以下を構成します：</p>
    <ul>
    <li><p><strong>サインオンURL</strong>：<a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">ステップ2</a>でOkta管理コンソールからコピーした<strong>サインオンURL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>署名証明書</strong>：<a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">ステップ2</a>でOkta管理コンソールからダウンロードした証明書をここにアップロードします。<code>-----BEGIN CERTIFICATE-----</code>で始まり、<code>-----END CERTIFICATE-----</code>で終わる行を含む証明書全体の内容が提供されていることを確認してください。</p></li>
    </ul>

    </Admonition>

1. それが完了したら、**保存**をクリックします。

## 構成後タスク\{#post-configuration-tasks}

### タスク1：SAMLアプリをユーザーに割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="タスク1：SAMLアプリをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスできるようになる前に、Oktaアプリケーションをユーザーに割り当てる必要があります：

1. [Okta管理コンソール](https://login.okta.com/)のアプリ詳細ページで、**割り当て**をクリックします。

1. **割り当て** > **人に割り当て**を選択します。

1. SAMLアプリをユーザーに割り当て、変更を保存します。

1. **保存** **および** **戻る**をクリックします。

必要に応じて、すべてのユーザーに対して繰り返します。詳細については、[Oktaドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

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