---
title: "Microsoft Entra（SAML 2.0） | BYOC"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "Microsoft Entra（SAML 2.0）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してMicrosoft Entraでシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - sso
  - microsoft
  - entra
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルDB比較

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Microsoft Entra（SAML 2.0）

このトピックでは、SAML 2.0プロトコルを使用してMicrosoft Entraでシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloudがサービスプロバイダー（SP）として機能し、Microsoft Entraがアイデンティティプロバイダー（IdP）として機能します。以下の図は、Zilliz CloudおよびMicrosoft Entra管理センターでの必要な手順を示しています。

![M3UywWSZHhlwTHbkjI8c6jTinGh](/img/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud組織に少なくとも1つの**専用（エンタープライズ）**クラスターがあります。

- Microsoft Entra管理センターにアクセスできます。詳細については、[Microsoft Entraドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center)を参照してください。

- SSOを構成するZilliz Cloud組織の組織オーナーです。

## 構成手順\{#configuration-steps}

### ステップ1：Zilliz CloudコンソールでSPの詳細を取得\{#step-1-access-sp-details-in-zilliz-cloud-console}

SPとして、Zilliz CloudはMicrosoft EntraでSAMLアプリケーションを設定する際に必要な**識別子（エンティティID）**および**返信URL（アサーションコンシューマサービスURL）**を提供します。

 <Supademo id="cme7yk5zy38k0h3pyor6ovyvh" title="ステップ1：Zilliz Cloudコンソールでサービスプロバイダーの詳細を取得" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを構成する組織に移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン（SSO）**セクションを見つけ、**構成**をクリックします。

1. 表示されるダイアログボックスで、IdPおよびプロトコルとして**Microsoft Entra（SAML 2.0）**を選択します。

1. **サービスプロバイダーの詳細**カードで、**識別子（エンティティID）**および**返信URL（アサーションコンシューマサービスURL）**をコピーします。これらの値は、Microsoft Entra管理センターでアプリケーションを設定する際の[ステップ2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center)で必要になります。

1. それが完了したら、[ステップ2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center)に進みます。

### ステップ2：Microsoft Entra管理センターでアプリケーションを設定\{#step-2-set-up-an-application-in-microsoft-entra-admin-center}

このステップでは、Zilliz Cloudから取得したSPの詳細を使用してMicrosoft Entra（IdP）を構成します。

<Supademo id="cme7ynp8r38ksh3pyaghg664m" title="Microsoft Entra管理センターでアプリケーションを設定" />

1. [Microsoft Entra管理センター](https://aad.portal.azure.com/?ad=in-text-link)にログインします。

1. 左側のナビゲーションペインで、**エンタープライズアプリ**をクリックします。

1. 表示されるページで、**新しいアプリケーション**をクリックします。その後、**独自のアプリケーションを作成**をクリックします。

1. **独自のアプリケーションを作成**パネルで、アプリケーション名を**zilliz**に設定し、**ギャラリーにない他のアプリケーションを統合（非ギャラリー）**オプションを選択します。

1. その後、**作成**をクリックします。それが完了すると、アプリケーションが作成され、アプリケーションの詳細ページにリダイレクトされます。

1. アプリケーションの詳細ページで、**シングルサインオン** > **SAML**を選択します。

1. **基本SAML構成**セクションで、**編集**をクリックします。

1. **識別子（エンティティID）**領域で、**識別子を追加**をクリックします。その後、[ステップ1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**識別子（エンティティID）**をテキストボックスに貼り付けます。

1. **返信URL（アサーションコンシューマサービスURL）**領域で、**返信URLを追加**をクリックします。その後、[ステップ1](./single-sign-on-with-microsoft-entra#step-1-access-sp-details-in-zilliz-cloud-console)でZilliz Cloudコンソールからコピーした**返信URL（アサーションコンシューマサービスURL）**をテキストボックスに貼り付けます。

1. **保存**をクリックします。

1. それが完了したら、作成されたアプリケーションの**シングルサインオン**パネルに戻り、**App Federation Metadata Url**をコピーします。これは、[ステップ3](./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console)でZilliz Cloudコンソールで必要になります。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、以下の詳細を取得します：</p>
    <ul>
    <li><p><strong>SAML証明書</strong>セクションで、**ダウンロード**をクリックして<strong>証明書（Base64）</strong>を保存します。これは、<a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p></li>
    <li><p><strong>zillizのセットアップ</strong>セクションで、<strong>ログインURL</strong>をコピーします。これは、<a href="./single-sign-on-with-microsoft-entra#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ3</a>で<strong>手動</strong>モードが選択されている場合にZilliz Cloudコンソールで必要になります。</p></li>
    </ul>

    </Admonition>

### ステップ3：Zilliz CloudコンソールでIdP設定を構成\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、SAML信頼関係を完了するために、Microsoft EntraのIdP詳細をZilliz Cloudに戻して提供します。

 <Supademo id="cme7yxwoh38qih3pycwf88tzi" title="Zilliz CloudコンソールでIdP設定を構成" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。

1. **シングルサインオン（SSO）の構成**ダイアログボックスの**アイデンティティプロバイダーの詳細**カードで、[ステップ2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center)でMicrosoft Entra管理センターからコピーした**App Federation Metadata URL**を貼り付けます。

    <Admonition type="info" icon="📘" title="注意">

    <p>代わりに、IdP詳細構成で<strong>手動</strong>モードを選択した場合、以下を構成します：</p>
    <ul>
    <li><p><strong>ログインURL</strong>：[ステップ2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center)でMicrosoft Entra管理センターからコピーしたログインURLをここに貼り付けます。</p></li>
    <li><p><strong>証明書（Base64）</strong>：[ステップ2](./single-sign-on-with-microsoft-entra#step-2-set-up-an-application-in-microsoft-entra-admin-center)でMicrosoft Entra管理センターからダウンロードした証明書をここにアップロードします。<code>-----BEGIN CERTIFICATE-----</code>で始まり、<code>-----END CERTIFICATE-----</code>で終わる行を含む証明書全体の内容が提供されていることを確認してください。</p></li>
    </ul>

    </Admonition>

1. それが完了したら、**保存**をクリックします。

## 構成後タスク\{#post-configuration-tasks}

### タスク1：Microsoft Entraアプリケーションをユーザーに割り当てる\{#task-1-assign-microsoft-entra-application-to-users}

 <Supademo id="cme7z3h7r38s8h3py95vf8g4m" title="タスク1：Microsoft Entraアプリケーションをユーザーに割り当てる" />

ユーザーがSSO経由でZilliz Cloudにアクセスできるようになる前に、Microsoft Entraアプリケーションをユーザーに割り当てる必要があります：

1. [Microsoft Entra管理センター](https://aad.portal.azure.com/?ad=in-text-link)のアプリケーションページで、**ユーザーとグループ** > **+ ユー/グループを追加**を選択します。

1. アプリケーションへのアクセス権を付与するユーザーまたはグループを選択します。

詳細については、[Microsoft Entraドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal)を参照してください。

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