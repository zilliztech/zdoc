---
title: "その他の IdP（SAML 2.0） | Cloud"
slug: /single-sign-on-with-other-idp
sidebar_key: single-sign-on-with-other-idp
sidebar_label: "その他の IdP（SAML 2.0）"
beta: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルをサポートする任意のアイデンティティプロバイダー（IdP）を使用して Zilliz Cloud でシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
type: origin
token: WDOJwtKkAijW4gkUpQhcAL0Rn1d
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sso
  - その他
  - idp

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# その他の IdP (SAML 2.0)

このトピックでは、SAML 2.0 プロトコルをサポートする任意のアイデンティティプロバイダー (IdP) を使用して Zilliz Cloud でシングルサインオン (SSO) を構成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は、<a href="./single-sign-on-with-okta">Okta</a>、<a href="./single-sign-on-with-google-workspace">Google Workspace</a>、および <a href="./single-sign-on-with-microsoft-entra">Microsoft Entra</a> 向けの専用統合ガイドを提供していますが、標準に準拠した SAML 2.0 IdP であれば、**その他の IdP (SAML 2.0)** オプションで使用できます。</p>

</Admonition>

## 開始前に\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあること。

- SSO を構成する Zilliz Cloud 組織において、あなたが**組織オーナー**であること。

- 使用する予定の IdP に対して管理者アクセス権を持っていること。

- IdP 固有の設定詳細については、お使いの IdP の公式ドキュメントを参照してください。

## 構成手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールでサービスプロバイダーの詳細にアクセスする\{#step-1-access-service-provider-details-in-zilliz-cloud-console}

<Supademo id="cme6sledl274yh3py7hf96vo1" title="Step 1: Access service provider details in Zilliz Cloud" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成したい組織へ移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン (SSO)** セクションを見つけ、**構成**をクリックします。

1. 表示されたダイアログボックスで、IdP およびプロトコルとして**その他の IdP (SAML)** を選択します。

1. **サービスプロバイダーの詳細**カードで、以下の値をコピーします：

    - **SP エンティティ ID**

    - **ACS URL**

</Procedures>

これらの値は、IdP で SAML アプリケーションを作成する際の [ステップ 2](./single-sign-on-with-other-idp#step-2-create-a-saml-app-in-your-idp-console) で必要になります。

### ステップ 2: IdP コンソールで SAML アプリを作成する\{#step-2-create-a-saml-app-in-your-idp-console}

正確なプロセスは IdP によって異なります。一般的には以下の通りです：

<Procedures>

1. IdP の管理者コンソールにサインインします。

1. 新しい SAML 2.0 アプリケーション（SAML 接続または統合と呼ばれる場合もあります）を作成します。

1. サービスプロバイダー情報の入力を求められたら、以下を入力します：

    - [ステップ 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) から取得した **SP エンティティ ID**。

    - [ステップ 1](./single-sign-on-with-other-idp#step-1-access-service-provider-details-in-zilliz-cloud-console) から取得した **ACS URL**。

1. アプリケーションを保存し、以下のいずれかの形式で IdP 構成を取得します：

    - **オプション 1 – メタデータ URL/ファイル**: ほとんどの IdP は、必要なすべての SAML メタデータを含むダウンロード可能な XML ファイルまたは公開 URL を提供します。

    - **オプション 2 – 手動**: メタデータが利用できない場合は、IdP から以下を収集します：

        - **IdP SSO URL**（Zilliz Cloud が認証リクエストを送信するエンドポイント）

        - **x.509 証明書**（`-----BEGIN CERTIFICATE-----` および `-----END CERTIFICATE-----` の行を含む）

    この情報は [ステップ 3](./single-sign-on-with-other-idp#step-3-configure-idp-settings-in-zilliz-cloud-console) で使用します。

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. シングルサインオン (SSO) の構成ダイアログボックス内の**ID プロバイダーの詳細**カードで、以下のいずれかの方法を選択します：

    **オプション 1 – メタデータ URL/ファイル**

    - IdP からコピーした**メタデータ URL**を貼り付けるか、ダウンロードしたメタデータ XML ファイルをアップロードします。

    - Zilliz Cloud は、証明書を含む必要な IdP 詳細を自動的にインポートします。

    **オプション 2 – 手動**

    - IdP から取得した**IdP SSO URL**を入力します。

    - X.509 形式の IdP 署名証明書をアップロードまたは貼り付けます。`-----BEGIN CERTIFICATE-----` および `-----END CERTIFICATE-----` の行が含まれていることを確認してください。

1. **保存**をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: IdP でユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users-in-your-idp}

ユーザーが SSO を介してサインインできるようにする前に、IdP で SAML アプリへのアクセス権限を付与する必要があります：

- 特定のユーザーまたはグループにアプリを割り当てます。

- 割り当てられた各ユーザーのメールアドレスが、そのユーザーの Zilliz Cloud アカウントのメールアドレスと一致していることを確認します。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO を介して Zilliz Cloud にログインすると、**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー**は、それらを適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待する手順の詳細については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**組織** **オーナー**は、エンタープライズユーザーが SSO を介してサインインできるよう、Zilliz Cloud ログイン URL を共有できます。

設定またはテストプロセス中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) までお問い合わせください。

### タスク 3: （オプション）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成され、テストが完了した後、オプションで**SSO 強制**を有効にして、組織メンバー全員に SSO を介したみのログインを必須にすることができます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="danger" icon="🚧" title="Warning">

<p>この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーが直ちにログアウトされ、非 SSO ログイン方法がブロックされます。</p>

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織での SSO 強制](./enforce-sso-in-your-organization) を参照してください。

## よくある質問\{#faq}

### 初めて SSO を介してログインするユーザーにはどのような役割が割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで**組織メンバー**ロールが割り当てられます。後で Zilliz Cloud コンソールでロールを変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO を介してログインした後、ユーザーにはデフォルトで**組織メンバー**ロールが付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がそれらをプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合、どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに（メールアドレスに基づいて）Zilliz Cloud 組織に存在する場合、SSO を介してログインしても元のロールと権限は維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度にアクティブな SAML SSO 構成を**1 つのみ**サポートしています。