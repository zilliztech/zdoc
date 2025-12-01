---
title: "Okta (OIDC) | Cloud"
slug: /openid-connect
sidebar_label: "Okta（OIDC）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、OpenID Connect（OIDC）プロトコルを使用してOktaとのシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - sso
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta（OIDC）

このトピックでは、OpenID Connect（OIDC）プロトコルを使用してOktaとのシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として機能し、Oktaがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudとOktaコンソールで必要な手順を示しています。

![EfRWwnbKNhcXEwbL7EBcB66inrd](/img/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（Enterprise）**クラスターがあります。

- Oktaコンソールへの管理者アクセス権があります。詳しくは、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

- SSOを構成するZilliz Cloud組織の組織所有者です。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細にアクセス\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz Cloudは、OktaでOIDCアプリを設定する際に必要な**シングルサインオンURL**を提供します。

<Supademo id="cme89wf1w3eaoh3pytd3723ao" title="ステップ1：Zilliz Cloudコンソールでサービスプロバイターの詳細にアクセス" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**Okta（OIDC）**を選択します。

1. **サービスプロバイターの詳細**カードで、**シングルサインオンURL**をコピーします。これは、OktaコンソールでOIDCアプリを作成するときに[ステップ2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console)で必要になります。

1. 作業が完了したら、[ステップ2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console)に進みます。

### ステップ2：OktaコンソールでOIDCアプリを設定\{#step-2-set-up-an-oidc-app-in-okta-console}

この手順では、Zilliz Cloudから取得したSPの詳細でOkta（IdP）を構成します。

<Supademo id="cme8abl5c3ei3h3pywbc9z740" title="ステップ1：OktaコンソールでSAMLアプリを作成" />

1. [Okta管理者コンソール](https://login.okta.com/)にログインします。

1. 左側のナビゲーションペインで、**アプリケーション** > **アプリケーション**を選択します。

1. **アプリ統合を作成**をクリックします。

1. **新しいアプリ統合を作成**ダイアログボックスで、サインインメソッドとして**OIDC - OpenID Connect**を選択し、アプリケーションタイプとして**Webアプリケーション**を選択します。**次へ**をクリックします。

1. 以下の設定で新しいWebアプリ統合を設定します：

    - **アプリ統合名**： アプリ統合名をカスタマイズします（例：**zilliz**）。

    - **サインインリダイレクトURI**： [ステップ1](./openid-connect#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**シングルサインオンURL**をここに貼り付けます。

    - **制御されたアクセス**： 特定のグループアクセスを設定しない場合は、**現時点ではグループ割り当てをスキップ**を選択します。

1. **保存**をクリックします。すると、アプリ詳細ページにリダイレクトされます。

1. アプリ詳細ページで、以下の情報を取得します：

    - **クライアントID**

    - **クライアントシークレット**

    - **Oktaドメイン**

    これらの値は、[ステップ3](./openid-connect#step-3-configure-idp-settings-in-zilliz-cloud-console)でZilliz CloudコンソールでIdP設定を行う際に必要になります。

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、OIDCの信頼関係を完了するために、OktaのIdP詳細をZilliz Cloudに戻して提供します。

<Supademo id="cme8af32q3elth3pyaygkdnmo" title="ステップ3：Zilliz CloudコンソールでOkta設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）を構成**ダイアログボックスの**アイデンティティプロバイターの詳細**カードで、以下を構成します：

    - **Oktaドメイン**： [ステップ2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console)でOktaコンソールからコピーした**Oktaドメイン**を貼り付けます。

    - **クライアントID**： [ステップ2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console)でOktaコンソールからコピーした**クライアントID**を貼り付けます。

    - **クライアントシークレット**： [ステップ2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console)でOktaコンソールからコピーした**クライアントシークレット**を貼り付けます。

1. 作業が完了したら、**保存**をクリックします。次に、**OK**をクリックします。

## 構成後のタスク\{#post-configuration-tasks}

### タスク1：OIDCアプリをユーザーに割り当てる\{#task-1-assign-oidc-app-to-users}

<Supademo id="cme8ahjdm3epjh3pyg6a3k93k" title="タスク1：OIDCアプリをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスする前に、OIDCアプリをユーザーに割り当てる必要があります：

1. [Okta管理者コンソール](https://login.okta.com/)のアプリ詳細ページで、**割り当て**をクリックします。

1. **割り当て** > **人に割り当て**を選択します。

1. OIDCアプリをユーザーに割り当て、変更を保存します。

1. **保存して戻る**をクリックします。次に、**完了**をクリックします。

必要に応じてすべてのユーザーに対して繰り返します。詳細については、[Oktaドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

### タスク2：プロジェクトにユーザーを招待\{#task-2-invite-users-to-your-project}

ユーザーがSSO経由でZilliz Cloudに初めてログインする際、ユーザーは**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織所有者**が適切なプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待するためのステップバイステップの説明については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project)を参照してください。

プロジェクトに招待された後、**組織所有者**はZilliz CloudログインURLをエンタープライズユーザーと共有して、SSO経由でサインインできるようにできます。

セットアップまたはテストプロセス中に問題が発生した場合は、[Zillizサポート](https://zilliz.com/contact-sales)に連絡してください。

## FAQ\{#faq}

### 初回SSOでログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既存のZilliz Cloudアカウントを持たない新規ユーザーは、最初のSSOログイン時に自動的に作成されます。これらのユーザーにはデフォルトで**組織メンバー**ロールが割り当てられます。Zilliz Cloudコンソールで後からロールを変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role-or-remove-a-collaborator)を参照してください。

### ユーザーはSSOログイン後にプロジェクトにどのようにアクセスできますか？\{#how-do-users-access-projects-after-sso-login}

SSO経由でログイン後、ユーザーにはデフォルトで**組織メンバー**ロールがあります。特定のプロジェクトにアクセスするには、**組織所有者**または**プロジェクト管理者**がプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### ユーザーがSSOでログインする前にZilliz Cloudアカウントを既に持っている場合どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがZilliz Cloud組織に既に存在する場合（メールアドレスに基づく）、SSO経由でログインしても元のロールと権限を保持します。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数のSSOプロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各Zilliz Cloud組織は同時に**1つの有効なSAML SSO構成**のみをサポートしています。