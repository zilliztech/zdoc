---
title: "Okta (SAML 2.0) | BYOC"
slug: /single-sign-on-with-okta
sidebar_key: single-sign-on-with-okta
sidebar_label: "Okta (SAML 2.0)"
beta: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。| BYOC"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - sso
  - okta

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Okta (SAML 2.0)

このトピックでは、SAML 2.0 プロトコルを使用して Okta でシングルサインオン (SSO) を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー (SP) として機能し、Okta が ID プロバイダー (IdP) として機能します。以下の図は、Zilliz Cloud と Okta Admin Console で必要な手順を示しています。

![KywHwe7VIhcwsAbecTpcEsL3njb](https://zdoc-images.s3.us-west-2.amazonaws.com/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの**Dedicated (Enterprise)** クラスターがあること。

- Okta Admin Console への管理者アクセス権限があること。詳細については、[Okta 公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm) を参照してください。

- SSO を構成する Zilliz Cloud 組織において、あなたが組織オーナーであること。

## 構成手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールで SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Okta で SAML アプリを設定する際に必要な**対象ユーザー URL (SP エンティティ ID)**および**シングルサインオン URL**を提供します。

<Supademo id="cme6l0vit2298h3pyu26whujs" title="Step 1: Access service provider details in Zilliz Cloud console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成したい組織へ移動します。

1. 左側のナビゲーションペインで、**設定**をクリックします。

1. **設定**ページで、**シングルサインオン (SSO)** セクションを見つけ、**構成**をクリックします。

1. 表示されたダイアログボックスで、IdP およびプロトコルとして**Okta (SAML 2.0)**を選択します。

1. **サービスプロバイダーの詳細**カードで、**対象ユーザー URL (SP エンティティ ID)**および**シングルサインオン URL**をコピーします。これらの値は、Okta Admin Console で SAML アプリを作成する際の [ステップ 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で必要になります。

1. 完了したら、[ステップ 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) に進みます。

</Procedures>

### ステップ 2: Okta Admin Console で SAML アプリを作成する\{#step-2-create-a-saml-app-in-okta-admin-console}

このステップでは、Zilliz Cloud から取得した SP の詳細を使用して Okta (IdP) を構成します。

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="Step 1: Create SAML App in Okta Admin Console" />

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) にログインします。

1. 左側のナビゲーションペインで、**アプリケーション** > **アプリケーション**を選択します。

1. **アプリ統合の作成**をクリックします。

1. **新しいアプリ統合の作成**ダイアログボックスで、**SAML 2.0**を選択し、**次へ**をクリックします。

1. 簡略化のため、**アプリ名**を**zilliz**に設定し、**次へ**をクリックします。

1. **SAML の構成**ステップの**一般**エリアで、以下のフィールドを構成します。

    - **シングルサインオン URL**:

        - [ステップ 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**シングルサインオン URL**をここに貼り付けます。

        - SAML リクエスト中に正しいルーティングを確保するため、**「Recipient URL および 送信先 URL としてこれを使用する」**というラベルの付いた**チェックボックスをオンにする**ようにしてください。

    - **対象ユーザー URI (SP エンティティ ID)**: [ステップ 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud コンソールからコピーした**対象ユーザー URL (SP エンティティ ID)**をここに貼り付けます。

1. **属性ステートメント (オプション)** エリアで、以下を指定します。

    - **名前**: 値を**email**に設定します。

    - **値**: ドロップダウンリストから**user.email**を選択します。

1. **次へ**をクリックし、次に**完了**をクリックします。アプリページにリダイレクトされます。

1. アプリページの**サインオン**タブで、**メタデータ URL**を取得し、**コピー**をクリックします。これは、Zilliz Cloud コンソールの [ステップ 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。

    <Admonition type="info" icon="📘" title="Notes">

    <p>あるいは、<strong>詳細</strong>をクリックして以下の詳細を取得することもできます。</p>
    <ul>
    <li><p><strong>サインオン URL</strong>: URL をコピーします。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ 3</a> で<strong>手動</strong>モードが選択された場合に Zilliz Cloud コンソールで必要になります。</p></li>
    <li><p><strong>署名証明書</strong>: <strong>ダウンロード</strong>をクリックして、証明書をローカルコンピューターに保存します。これは、<a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">ステップ 3</a> で<strong>手動</strong>モードが選択された場合に Zilliz Cloud コンソールで必要になります。</p></li>
    </ul>

    </Admonition>

</Procedures>

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、Okta の IdP 詳細を Zilliz Cloud に提供して、SAML 信頼関係を完了させます。

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻ります。

1. **シングルサインオン (SSO) の構成**ダイアログボックスの**ID プロバイダーの詳細**カードで、[ステップ 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) で Okta Admin Console からコピーした**メタデータ URL**を貼り付けます。

    <Admonition type="info" icon="📘" title="Notes">

    <p>あるいは、IdP 詳細の構成に<strong>手動</strong>モードを選択する場合は、以下を構成します。</p>
    <ul>
    <li><p><strong>サインオン URL</strong>: <a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">ステップ 2</a> で Okta Admin Console からコピーした<strong>サインオン URL</strong>をここに貼り付けます。</p></li>
    <li><p><strong>署名証明書</strong>: <a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">ステップ 2</a> で Okta Admin Console からダウンロードした証明書をここにアップロードします。<code>-----BEGIN CERTIFICATE-----</code> で始まり<code>-----END CERTIFICATE-----</code> で終わる行を含む証明書の内容全体が提供されていることを確認してください。</p></li>
    </ul>

    </Admonition>

1. 完了したら、**保存**をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Task 1: Assign SAML App to Users" />

ユーザーが SSO を介して Zilliz Cloud にアクセスできるようにするには、Okta アプリケーションをユーザーに割り当てる必要があります。

<Procedures>

1. [Okta Admin コンソール](https://login.okta.com/) のアプリ詳細ページで、**割り当て**をクリックします。

1. **割り当て** > **人へ割り当て**を選択します。

1. SAML アプリをユーザーに割り当て、変更を保存します。

1. **保存**をクリックし、**戻る**をクリックします。

</Procedures>

必要に応じて、すべてのユーザーに対してこの操作を繰り返します。詳細については、[Okta ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) を参照してください。

### タスク 2: ユーザーをプロジェクトに招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO を介して Zilliz Cloud にログインすると、**組織メンバー**として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **組織オーナー**は、それらを適切なプロジェクトに招待する必要があります。

- ユーザーをプロジェクトに招待する方法に関する手順については、[プロジェクトユーザーの管理](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**組織オーナー**はエンタープライズユーザーと Zilliz Cloud ログイン URL を共有し、SSO を介してサインインできるようにすることができます。

設定またはテストプロセス中に問題が発生した場合は、[Zilliz サポート](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: (オプション) SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成され、テストされた後、オプションで**SSO 強制**を有効にして、すべての組織メンバーが SSO を介してのみログインすることを必須にすることができます。有効にすると、メンバーはメール/パスワードまたはサードパーティアカウント (Google、GitHub) を使用してサインインできなくなります。

<Admonition type="danger" icon="🚧" title="Warning">

<p>この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーがすぐにログアウトされ、非 SSO ログイン方法がブロックされます。</p>

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## よくある質問\{#faq}

### 初めて SSO でログインするユーザーにはどのような役割が割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

Zilliz Cloud アカウントをまだ持っていない新規ユーザーは、最初の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで**組織メンバー**の役割が割り当てられます。後で Zilliz Cloud コンソールで役割を変更できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO でログインした後、ユーザーにはデフォルトで**組織メンバー**の役割が付与されます。特定のプロジェクトにアクセスするには、**組織オーナー**または**プロジェクト管理者**がそれらをプロジェクトに招待する必要があります。詳細な手順については、[プロジェクトユーザーの管理](./project-users) を参照してください。

### SSO でログインする前にユーザーがすでに Zilliz Cloud アカウントを持っている場合、どうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに (メールアドレスに基づいて) Zilliz Cloud 組織に存在する場合、SSO でログインしても元の役割と権限は維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度にアクティブな SAML SSO 構成を**1 つのみ**サポートしています。