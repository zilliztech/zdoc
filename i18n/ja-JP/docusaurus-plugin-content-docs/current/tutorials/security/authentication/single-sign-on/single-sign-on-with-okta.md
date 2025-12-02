---
title: "Okta（SAML 2.0） | Cloud"
slug: /single-sign-on-with-okta
sidebar_label: "Okta（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン（SSO）を設定する方法について説明します。 | Cloud"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - sso
  - okta
  - 安価なベクターデータベース
  - マネージドベクターデータベース
  - Pineconeベクターデータベース
  - 音声検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta（SAML 2.0）

このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン（SSO）を設定する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として、Oktaがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudとOkta管理コンソールで必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](/img/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 始める前に\{#before-you-start}

- あなたのZilliz Cloud組織には少なくとも1つの**専用（エンタープライズ）**クラスターがあります。

- Okta管理コンソールに管理者としてアクセスできます。詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

- SSOを設定するZilliz Cloud組織では**組織オーナー**である必要があります。

## 設定手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細を確認\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz CloudはOktaでSAMLアプリを設定する際に必要な**対象URL（SPエンティティID）**と**シングルサインオンURL**を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="ステップ1：Zilliz Cloudコンソールでサービスプロバイダーの詳細にアクセス" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**設定**をクリックします。

1. 表示されるダイアログボックスで、IdPとプロトコルとして**Okta（SAML 2.0）**を選択します。

1. **サービスプロバイラードetails**カードで、**オーディエンスURL（SPエンティティID）**および**シングルサインオンURL**をコピーします。これらの値は、[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)でOkta管理コンソールにSAMLアプリを作成する際に必要になります。

1. 完了したら、[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)に進みます。

### ステップ2：Okta管理コンソールでSAMLアプリを作成\{#step-2-create-a-saml-app-in-okta-admin-console}

このステップでは、Zilliz Cloudから取得したSPの詳細を使用してOkta（IdP）を設定します。

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="ステップ1：Okta管理コンソールでSAMLアプリを作成" />

1. [Okta管理コンソール](https://login.okta.com/)にログインします。

1. 左側のナビゲーションペインで、**アプリケーション** > **アプリケーション**を選択します。

1. **アプリ統合の作成**をクリックします。

1. **新しいアプリ統合の作成**ダイアログボックスで、**SAML 2.0**を選択して**次へ**をクリックします。

1. 簡単にするために、**アプリ名**を**zilliz**に設定し、**次へ**をクリックします。

1. **SAMLを設定**ステップの**全般**エリアで、以下のフィールドを設定します：

    - **シングルサインオンURL**：

        - [ステップ1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**シングルサインオンURL**をここに貼り付けます。

        - SAML要求時におけるルーティングを確実にするために、**受信者URLと宛先URLにこれを使用**のチェックボックスを必ず**オン**にしてください。

    - **オーディエンスURI（SPエンティティID）**：[ステップ1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**オーディエンスURL（SPエンティティID）**をここに貼り付けます。

1. **属性ステートメント（オプション）**領域で、以下を指定します：

    - **名前**：値を**email**に設定します。

    - **値**：ドロップダウンリストから**user.email**を選択します。

1. **次へ**をクリックし、**終了**をクリックします。アプリページにリダイレクトされます。

1. アプリページの**サインオン**タブで、**メタデータURL**を取得し、**コピー**をクリックします。これは、Zilliz Cloudコンソールの[ステップ3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console)で必要になります。

    <Admonition type="info" icon="📘" title="ノート">

    <p>または、<strong>詳細を表示</strong>をクリックして、以下の詳細を取得できます：</p>
    <ul>
    <li><p><strong>サインオンURL</strong>：URLをコピーします。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードを選択した場合にZilliz Cloudコンソールで必要になります。</p></li>
    <li><p><strong>署名証明書</strong>：<strong>ダウンロード</strong>をクリックして、証明書をローカルコンピューターに保存します。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードを選択した場合にZilliz Cloudコンソールで必要になります。</p></li>
    </ul>

    </Admonition>

### ステップ3：Zilliz CloudコンソールでIdPの設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、Zilliz Cloudに戻してSAML信頼関係を完了するためにOktaのIdPの詳細を提供します。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="ステップ2：Zilliz CloudコンソールでOkta設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）の設定**ダイアログボックスの**アイデンティティプロバイダ詳細**カードに、[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)でOkta管理コンソールからコピーした**メタデータURL**を貼り付けます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>または、IdP詳細構成で<strong>手動</strong>モードを選択した場合は、以下を構成します：</p>
    <ul>
    <li><p><strong>サインオンURL</strong>：[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)でOkta管理コンソールからコピーした<strong>サインオンURL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>署名証明書</strong>：[ステップ2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console)でOkta管理コンソールからダウンロードした証明書をここにアップロードします。<code>-----BEGIN CERTIFICATE-----</code>で始まり<code>-----END CERTIFICATE-----</code>で終わる証明書の全文が提供されていることを確認してください。</p></li>
    </ul>

    </Admonition>

1. 完了したら、**保存**をクリックします。

## 事後設定タスク\{#post-configuration-tasks}

### タスク1：SAMLアプリをユーザーに割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="タスク1：SAMLアプリをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスできるようになる前に、Oktaアプリケーションをユーザーに割り当てる必要があります：

1. [Okta管理コンソール](https://login.okta.com/)のアプリの詳細ページで、**割り当て**をクリックします。

1. **割り当て** > **人に割り当て**を選択します。

1. SAMLアプリをユーザーに割り当て、変更を保存します。

1. **保存して戻る**をクリックします。

必要に応じてすべてのユーザーに対して繰り返します。詳細については、[Oktaドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

### タスク2：プロジェクトにユーザーを招待\{#task-2-invite-users-to-your-project}

ユーザーがSSO経由でZilliz Cloudに初めてログインすると、**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセス権がありません。

- **組織オーナー**が適切なプロジェクトに招待する必要があります。
- ユーザーをプロジェクトに招待する手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project)を参照してください。

プロジェクトに招待された後、**組織オーナー**は企業ユーザーにSSO経由でサインインできるZilliz CloudのログインURLを知らせることができます。

セットアップまたはテストプロセスで問題が発生した場合は、[Zillizサポート](https://zilliz.com/contact-sales)にお問い合わせください。

## FAQ\{#faq}

### SSOで初めてログインするユーザーにはどのようなロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既にZilliz Cloudアカウントがない新規ユーザーは、最初のSSOログイン時に自動的に作成されます。これらのユーザーにはデフォルトで**組織メンバー**ロールが割り当てられます。Zilliz Cloudコンソールで後からロールを変更できます。詳細手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role-or-remove-a-collaborator)を参照してください。

### SSOログイン後にユーザーはプロジェクトにどのようにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSOでログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がプロジェクトに招待する必要があります。詳細手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### Zilliz Cloudアカウントが既に存在するユーザーがSSOでログインした場合どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーが既にZilliz Cloud組織に存在する場合（メールアドレスベース）、SSOでログインする際に元のロールと権限を保持します。システムはメールアドレスでユーザーを一致させ、既存のアカウントを上書きしません。

### 同じ組織に複数のSSOプロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各Zilliz Cloud組織は同時に<strong>1つのアクティブなSAML SSO構成</strong>のみをサポートしています。