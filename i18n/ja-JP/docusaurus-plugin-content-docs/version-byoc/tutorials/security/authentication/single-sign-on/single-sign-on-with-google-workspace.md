---
title: "Google Workspace（SAML 2.0） | BYOC"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してGoogle Workspaceでシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - sso
  - google
  - workspace
  - ベクトルデータベース例
  - RAGベクトルデータベース
  - ベクトルDBとは
  - ベクトルデータベースとは

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Google Workspace（SAML 2.0）

このトピックでは、SAML 2.0プロトコルを使用してGoogle Workspaceでシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として機能し、Google Workspaceがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudおよびGoogle管理コンソールで必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](/img/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（エンタープライズ）**クラスターがあります。

- Google管理コンソールで管理者ロールを持っている必要があります。

- SSOを構成するZilliz Cloud組織の組織オーナーです。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細を取得\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz CloudはGoogle管理でSAMLアプリを設定する際に必要な**エンティティID**および**ACS URL**を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="ステップ1：Zilliz Cloudでサービスプロバイダーの詳細を取得" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**Google Workspace（SAML 2.0）**を選択します。

1. **サービスプロバイダーの詳細**カードで、**エンティティID**および**ACS URL**をコピーします。これらの値は、Google管理コンソールでSAMLアプリを作成する際の[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)で必要になります。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、ここで<strong>SSO URL</strong>および<strong>証明書</strong>をコピーできます。この場合、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>でIdP詳細を手動モードで構成する必要があります。</p>

    </Admonition>

1. それが完了したら、[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)に進みます。

### ステップ2：Google管理コンソールでカスタムSAMLアプリを作成\{#step-2-create-a-custom-saml-app-in-google-admin-console}

このステップでは、Zilliz Cloudから取得したSPの詳細を使用してGoogle Workspace（IdP）を構成します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="ステップ2：Google管理でSAMLアプリを作成" />

1. [Google管理コンソール](https://admin.google.com/)にログインします。

1. 左側のナビゲーションペインで、**アプリ** > **Webおよびモバイルアプリ**を選択します。その後、**アプリを追加** > **カスタムSAMLアプリを追加**を選択します。

1. アプリ名をカスタマイズ（例：**zilliz**）し、**続行**をクリックします。

1. 表示されるページで、**オプション1：IdPメタデータのダウンロード**からIdPメタデータをダウンロードします。これは、Zilliz CloudコンソールでIdP設定を構成する際の[ステップ3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console)で必要になります。その後、**続行**をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、<strong>オプション2：SSO URL、エンティティID、および証明書をコピー</strong>からそれぞれ<strong>SSO URL</strong>、<strong>エンティティID</strong>、<strong>証明書</strong>を取得します。これらは、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p>

    </Admonition>

1. **サービスプロバイダー詳細**セクションで、以下を構成します：

    - **ACS URL**：[ステップ1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**ACS URL**を貼り付けます。

    - **エンティティID**：[ステップ1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**エンティティID**を貼り付けます。

    それが完了したら、**続行**をクリックします。

1. **属性**セクションで、以下を構成します：

    - **Googleディレクトリ属性**：**マッピングを追加**をクリックし、**主メール**を選択します。

    - **アプリ属性**：値を**email**に設定します。

1. **完了**をクリックします。

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、SAML信頼関係を完了するために、Google WorkspaceのIdP詳細をZilliz Cloudに戻して提供します。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="ステップ3：Zilliz CloudでIdP設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）の構成**ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、[ステップ2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console)でGoogle管理コンソールからダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、IdP詳細構成で<strong>手動</strong>モードを選択した場合、以下を構成します：</p>
    <ul>
    <li><p><strong>SSO URL</strong>：<a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ2</a>でコピーした<strong>SSO URL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>証明書</strong>：<a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ2</a>でコピーした<strong>証明書</strong>をここに貼り付けます。</p></li>
    </ul>

    </Admonition>

1. それが完了したら、**保存**をクリックします。

## 構成後タスク\{#post-configuration-tasks}

### タスク1：SAMLアプリをユーザーに割り当てる（Google管理コンソール）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="タスク1：SAMLアプリをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスできるようになる前に、SAMLアプリを有効にしてください：

1. 新しく作成したアプリの詳細ページで、**ユーザーアクセス**領域を検索し、サービスステータスを編集するようにクリックします。

1. 組織内の全員に対してサービスをオンまたはオフにするには、全員に対して**ON**または**OFF**をクリックし、**保存**をクリックします。

1. （オプション）組織単位に対してサービスをオンまたはオフにするには：

    1. 左側で組織単位を選択します。

    1. サービスステータスを変更するには、**ON**または**OFF**を選択します。

    1. 以下を選択します：

        - **サービスステータス**が**継承**に設定されており、親の設定が変更された場合でも更新された設定を維持したい場合は、**上書き**をクリックします。

        - **サービスステータス**が**上書き**に設定されている場合は、**継承**をクリックして親と同じ設定に戻すか、**保存**をクリックして親の設定が変更されても新しい設定を維持します。
    注：[組織構造](https://support.google.com/a/answer/4352075)について詳しくは。

1. （オプション）組織単位全体または単位内で一連のユーザーに対してサービスを有効にするには、アクセスグループを選択します。詳細については、[グループを使用してサービスアクセスをカスタマイズ](https://support.google.com/a/answer/9050643)を参照してください。

1. SAMLアプリにサインインするためにユーザーが使用するメールアドレスが、Googleドメインにサインインするために使用するメールアドレスと一致していることを確認してください。

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