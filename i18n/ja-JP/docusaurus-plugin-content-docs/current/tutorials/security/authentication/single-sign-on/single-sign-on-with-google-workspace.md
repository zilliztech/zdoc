---
title: "Google Workspace (SAML 2.0) | Cloud"
slug: /single-sign-on-with-google-workspace
sidebar_key: single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン (SSO) を構成する方法について説明します。 | Cloud"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sso
  - google
  - workspace

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Workspace (SAML 2.0)

このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー (SP) として機能し、Google Workspace が ID プロバイダー (IdP) として機能します。以下の図は、Zilliz Cloud と Google Admin コンソールで必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 開始前に\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの**Dedicated (Enterprise)** クラスターがあること。

- Google Admin コンソールで管理者ロールを持っていること。

- SSO を構成する Zilliz Cloud 組織の組織オーナーであること。

## 構成手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールで SP 詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Google Admin で SAML アプリを設定する際に必要な**エンティティID**と**ACS URL**を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織へ移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン (SSO)** セクションを見つけ、**構成**をクリックします。

1. 表示されたダイアログボックスで、IdP およびプロトコルとして**Google Workspace (SAML 2.0)** を選択します。

1. **サービスプロバイダーの詳細**カードで、**エンティティID**と**ACS URL**をコピーします。これらの値は、Google Admin コンソールで SAML アプリを作成する際の[ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で必要になります。

    <Admonition type="info" icon="📘" title="Notes">

    <p>あるいは、ここで<strong>SSO URL</strong>と<strong>証明書</strong>をコピーすることもできます。その場合、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ 3</a> で IdP 詳細を手動モードで構成する必要があります。</p>

    </Admonition>

1. 完了したら、[ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) に進みます。

</Procedures>

### ステップ 2: Google Admin コンソールでカスタム SAML アプリを作成する\{#step-2-create-a-custom-saml-app-in-google-admin-console}

このステップでは、Zilliz Cloud から取得した SP 詳細を使用して Google Workspace (IdP) を構成します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="Step 2: Create SAML app in Google Admin" />

<Procedures>

1. [Google Admin コンソール](https://admin.google.com/) にログインします。

1. 左側のナビゲーションペインで、**アプリ** > **Webおよびモバイルアプリ**を選択します。次に、**アプリを追加** > **カスタム SAML アプリを追加**を選択します。

1. アプリ名（例：**zilliz**）をカスタマイズし、**続行**をクリックします。

1. 表示されたページで、**オプション 1: IdP メタデータをダウンロード**から IdP メタデータをダウンロードします。これは、Zilliz Cloud コンソールで IdP 設定を構成する際の[ステップ 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。その後、**続行**をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    <p>あるいは、<strong>オプション 2: SSO URL、エンティティ ID、証明書をコピー</strong>からそれぞれ<strong>SSO URL</strong>、<strong>エンティティID</strong>、<strong>証明書</strong>を取得することもできます。これらは、<a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ 3</a> で<strong>手動</strong>モードが選択された場合に Zilliz Cloud コンソールで必要になります。</p>

    </Admonition>

1. **サービスプロバイダーの詳細**セクションで、以下を構成します：

    - **ACS URL**: [ステップ 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**ACS URL**を貼り付けます。

    - **エンティティID**: [ステップ 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**エンティティID**を貼り付けます。

    完了したら、**続行**をクリックします。

1. **属性**セクションで、以下を構成します：

    - **Googleディレクトリ属性**: **マッピングを追加**をクリックし、**プライマリメール**を選択します。

    - **アプリ属性**: 値を**email**に設定します。

1. **完了**をクリックします。

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、Google Workspace の IdP 詳細を Zilliz Cloud に提供して、SAML 信頼関係を完了させます。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="Step 3: Configure IdP settings in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **シングルサインオン (SSO) の構成**ダイアログボックスの**ID プロバイダーの詳細**カードで、[ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で Google Admin コンソールからダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="Notes">

    <p>あるいは、IdP 詳細の構成に<strong>手動</strong>モードを選択する場合、以下を構成します：</p>
    <ul>
    <li><p><strong>SSO URL</strong>: <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ 2</a> でコピーした<strong>SSO URL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>証明書</strong>: <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">ステップ 2</a> でコピーした<strong>証明書</strong>をここに貼り付けます。</p></li>
    </ul>

    </Admonition>

1. 完了したら、**保存**をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる (Google Admin コンソール)\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="Task 1: Assign SAML app to users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、SAML アプリを有効にする必要があります：

<Procedures>

1.  newly created アプリの詳細ページで、**ユーザーアクセス**エリアを見つけ、サービスステータスを編集するためにクリックします。

1. 組織内のすべてのユーザーに対してサービスをオンまたはオフにするには、すべてのユーザーに対して**オン**または**オフ**をクリックし、その後**保存**をクリックします。

1. (オプション) 組織単位に対してサービスをオンまたはオフにするには：

    1. 左側で組織単位を選択します。

    1. サービスステータスを変更するには、**オン**または**オフ**を選択します。

    1. 以下から 1 つを選択します：

        - **サービスステータス**が**継承済み**に設定されており、親設定が変更されても更新された設定を維持したい場合は、**上書き**をクリックします。

        - **サービスステータス**が**上書き済み**に設定されている場合は、親設定と同じ設定に戻すために**継承する**をクリックするか、親設定が変更されても新しい設定を維持するために**保存**をクリックします。
注：[組織構造](https://support.google.com/a/answer/4352075) について詳しくはこちらをご覧ください。

1. (オプション) 組織単位全体または組織単位内の特定のユーザーセットに対してサービスを有効にするには、アクセスグループを選択します。詳細については、[グループを使用してサービスアクセスをカスタマイズする](https://support.google.com/a/answer/9050643) をご覧ください。

1. ユーザーが SAML アプリにサインインするために使用するメールアドレスが、Google ドメインにサインインするために使用するメールアドレスと一致していることを確認します。

</Procedures>

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO を介して Zilliz Cloud にログインすると、**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー**は、適切なプロジェクトにユーザーを招待する必要があります。

- ユーザーをプロジェクトに招待する方法の手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**組織** **オーナー**は、企業ユーザーが SSO を介してサインインできるように Zilliz Cloud ログイン URL を共有できます。

設定またはテストプロセス中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: (オプション) SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成され、テストされた後、オプションで**SSO 強制**を有効にして、すべての組織メンバーが SSO を介してのみログインすることを必須にできます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント (Google、GitHub) を使用してサインインできなくなります。

<Admonition type="danger" icon="🚧" title="Warning">

<p>この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーがすぐにログアウトされ、非 SSO ログイン方法がブロックされます。</p>

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## よくある質問\{#faq}

### 初めて SSO でログインするユーザーにはどのようなロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

すでに Zilliz Cloud アカウントを持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーにはデフォルトで**組織メンバー**ロールが割り当てられます。Zilliz Cloud コンソールで後からロールを変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がユーザーをプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合、どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織に存在する場合（メールアドレスに基づきます）、SSO でログインしても元のロールと権限が維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に**1 つの有効な SAML SSO 構成**のみをサポートしています。