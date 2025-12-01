---
title: "Google Workspace（SAML 2.0） | Cloud"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してGoogle Workspaceとのシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - sso
  - google
  - workspace
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Google Workspace（SAML 2.0）

このトピックでは、SAML 2.0プロトコルを使用してGoogle Workspaceとのシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として機能し、Google Workspaceがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudとGoogle管理コンソールで必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](/img/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（Enterprise）**クラスターがあります。

- Google管理コンソールで管理者ロールを持っている必要があります。

- SSOを構成するZilliz Cloud組織の組織所有者です。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細にアクセス\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz Cloudは、Google管理でSAMLアプリを設定するときに必要な**エンティティID**と**ACS URL**を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="ステップ1：Zilliz Cloudでサービスプロバイダーの詳細にアクセス" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**Google Workspace（SAML 2.0）**を選択します。

1. **サービスプロバイダーの詳細**カードで、**エンティティID**と**ACS URL**をコピーします。これらの値は、Google管理コンソールでSAMLアプリを作成するときに[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)で必要になります。

    <Admonition type="info" icon="📘" title="ノート">

    <p>かわりに、<strong>SSO URL</strong>と<strong>証明書</strong>をここでコピーすることもできます。この場合、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>でZilliz CloudコンソールでIdP詳細を手動モードで構成する必要があります。</p>

    </Admonition>

1. 作業が完了したら、[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)に進みます。

### ステップ2：Google管理コンソールでカスタムSAMLアプリを作成\{#step-2-create-a-custom-saml-app-in-google-admin-console}

この手順では、Zilliz Cloudから取得したSPの詳細でGoogle Workspace（IdP）を構成します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="ステップ2：Google管理でSAMLアプリを作成" />

1. [Google管理コンソール](https://admin.google.com/)にログインします。

1. 左側のナビゲーションペインで、**アプリ** > **ウェブおよびモバイルアプリ**を選択します。次に、**アプリを追加** > **カスタムSAMLアプリを追加**を選択します。

1. アプリ名をカスタマイズ（例：**zilliz**）し、**続行**をクリックします。

1. 表示されるページで、**オプション1：IdPメタデータのダウンロード**からIdPメタデータをダウンロードします。これは、[ステップ3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console)でZilliz CloudコンソールでIdP設定を構成する際に必要になります。次に、**続行**をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>かわりに、<strong>オプション2：SSO URL、エンティティID、証明書をコピー</strong>からそれぞれ<strong>SSO URL</strong>、<strong>エンティティID</strong>、<strong>証明書</strong>を取得します。これらは、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p>

    </Admonition>

1. **サービスプロバイダーの詳細**セクションで、構成します：

    - **ACS URL**： [ステップ1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**ACS URL**を貼り付けます。

    - **エンティティID**： [ステップ1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**エンティティID**を貼り付けます。

    作業が完了したら、**続行**をクリックします。

1. **属性**セクションで、構成します：

    - **Googleディレクトリ属性**： **マッピングを追加**をクリックし、**主要メール**を選択します。

    - **アプリ属性**： 値を**email**に設定します。

1. **完了**をクリックします。

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、SAMLの信頼関係を完了するためにGoogle WorkspaceのIdP詳細をZilliz Cloudに戻して提供します。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="ステップ3：Zilliz CloudでIdP設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）を構成**ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)でGoogle管理コンソールからダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>かわりに、IdP詳細構成の<strong>手動</strong>モードを選択した場合、以下を構成します：</p>
    <ul>
    <li><p><strong>SSO URL</strong>： <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ2</a>でコピーした<strong>SSO URL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>証明書</strong>： <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ2</a>でコピーした<strong>証明書</strong>をここに貼り付けます。</p></li>
    </ul>

    </Admonition>

1. 作業が完了したら、**保存**をクリックします。

## 構成後のタスク\{#post-configuration-tasks}

### タスク1：SAMLアプリをユーザーに割り当てる（Google管理コンソール）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="タスク1：SAMLアプリをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスする前に、SAMLアプリを有効化します：

1. 新しく作成したアプリの詳細ページで、**ユーザーのアクセス**領域を見つけ、サービスステータスを編集するためにクリックします。

1. 組織内の全員に対してサービスを有効化または無効化するには、全員に対して**ON**または全員に対して**OFF**をクリックし、**保存**をクリックします。

1. （オプション）組織単位に対してサービスを有効化または無効化するには：

    1. 左側で組織単位を選択します。

    1. サ비스ステータスを変更するには、**ON**または**OFF**を選択します。

    1. 以下から1つ選択：

        - **サービステータス**が**継承**に設定されていて、親の設定が変更された場合でも更新された設定を維持したい場合は、**上書き**をクリックします。

        - **サービステータス**が**上書き**に設定されている場合、親と同じ設定に戻すには**継承**をクリックし、親の設定が変更された場合でも新しい設定を維持するには**保存**をクリックします。
注意： [組織構造](https://support.google.com/a/answer/4352075)について詳しく学んでください。

1. （オプション）組織単位をまたいでまたは内部のユーザーのセットに対してサービスを有効化するには、アクセスグループを選択します。詳細については、[グループを使用してサービスアクセスをカスタマイズ](https://support.google.com/a/answer/9050643)を参照してください。

1. ユーザーがSAMLアプリにサインインするために使用するメールアドレスが、Googleドメインにサインインするために使用するメールアドレスと一致していることを確認します。

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