---
title: "Google Workspace (SAML 2.0) | BYOC"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン（SSO）を設定する方法について説明します。 | BYOC"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Google Workspace (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン（SSO）を設定する方法について説明します。

このガイドでは、Zilliz Cloud が Service Provider（SP）として機能し、Google Workspace が Identity Provider（IdP）として機能します。次の図は、Zilliz Cloud と Google Admin console で必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 開始前の準備\{#before-you-start}

- Zilliz Cloud 組織に少なくとも 1 つの **Dedicated (Enterprise)** クラスターがあること。

- Google Admin console で Admin ロールを持っていること。

- SSO を設定する Zilliz Cloud 組織の Organization Owner であること。

## 設定手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud console で SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Google Admin で SAML アプリを設定する際に必要な **Entity ID** と **ACS URL** を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="ステップ 1: Zilliz Cloud でサービスプロバイダーの詳細にアクセスする" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインし、SSO を設定したい組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけて **Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Google Workspace (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Entity ID** と **ACS URL** をコピーします。これらの値は、Google Admin console で SAML アプリを作成する際の [ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で必要になります。

    <Admonition type="info" icon="📘" title="注">

    代わりに、ここで **SSO URL** と **Certificate** をコピーすることもできます。この場合、[ステップ 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で Manual モードを使用して IdP の詳細を設定する必要があります。

    </Admonition>

1. 完了したら、[ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) に進みます。

</Procedures>

### ステップ 2: Google Admin console でカスタム SAML アプリを作成する\{#step-2-create-a-custom-saml-app-in-google-admin-console}

このステップでは、Zilliz Cloud から取得した SP の詳細を使用して Google Workspace（IdP）を設定します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="ステップ 2: Google Admin で SAML アプリを作成する" />

<Procedures>

1. [Google Admin console](https://admin.google.com/) にログインします。

1. 左側のナビゲーションペインで **Apps** > **Web and mobile apps** を選択します。次に **Add app** > **Add custom SAML app** を選択します。

1. アプリ名（例: **zilliz**）をカスタマイズして **CONTINUE** をクリックします。

1. 表示されるページで、**Option 1: Download IdP metadata** から IdP メタデータをダウンロードします。これは、Zilliz Cloud console で IdP 設定を構成する際の [ステップ 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。その後、**Continue** をクリックします。

    <Admonition type="info" icon="📘" title="注">

    代わりに、**Option 2: Copy the SSO URL, entity ID, and certificate** から、それぞれ **SSO URL**、**Entity ID**、**Certificate** を取得することもできます。これらは、[ステップ 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に Zilliz Cloud console で必要になります。

    </Admonition>

1. **Service provider details** セクションで、次のように設定します。

    - **ACS URL**: [ステップ 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud console からコピーした **ACS URL** を貼り付けます。

    - **Entity ID**: [ステップ 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud console からコピーした **Entity ID** を貼り付けます。

    完了したら、**Continue** をクリックします。

1. **Attributes** セクションで、次のように設定します。

    - **Google Directory attributes**: **ADD MAPPING** をクリックし、**Primary email** を選択します。

    - **App attributes**: 値を **email** に設定します。

1. **Finish** をクリックします。

</Procedures>

### ステップ 3: Zilliz Cloud console で IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

このステップでは、SAML の信頼関係を完成させるために、Google Workspace の IdP の詳細を Zilliz Cloud に戻して提供します。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="ステップ 3: Zilliz Cloud で IdP 設定を構成する" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で Google Admin console からダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="注">

    代わりに、IdP 詳細設定で **Manual** モードを選択する場合は、次のように設定します。
    
    - **SSO URL**: [ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **SSO URL** をここに貼り付けます。
    
    - **Certificate**: [ステップ 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **Certificate** をここに貼り付けます。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 設定後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる（Google Admin console）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="タスク 1: ユーザーに SAML アプリを割り当てる" />

ユーザーが SSO を通じて Zilliz Cloud にアクセスできるようにするには、SAML アプリを有効にします。

<Procedures>

1. 新しく作成したアプリの詳細ページで、**User access** 領域を見つけてクリックし、サービスステータスを編集します。

1. 組織内の全員に対してサービスをオンまたはオフにするには、全員に対して **ON** または **OFF** をクリックしてから **Save** をクリックします。

1. （任意）組織単位に対してサービスをオンまたはオフにするには:

    1. 左側で組織単位を選択します。

    1. **Service status** を変更するには、**ON** または **OFF** を選択します。

    1. 次のいずれかを選択します。

        - **Service status** が **Inherited** に設定されていて、親の設定が変更されても更新後の設定を維持したい場合は、**Override** をクリックします。

        - **Service status** が **Overridden** に設定されている場合は、親と同じ設定に戻すには **Inherit** をクリックするか、親の設定が変更されても新しい設定を維持するには **Save** をクリックします。<br/>
          注: 詳細は [organizational structure](https://support.google.com/a/answer/4352075) を参照してください。

1. （任意）組織単位をまたいで、または組織単位内の特定のユーザーセットに対してサービスを有効にするには、アクセスグループを選択します。詳細は [Use groups to customize service access](https://support.google.com/a/answer/9050643) を参照してください。

1. ユーザーが SAML アプリへのサインインに使用するメールアドレスが、Google ドメインへのサインインに使用するメールアドレスと一致していることを確認してください。

</Procedures>

### タスク 2: プロジェクトにユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどのプロジェクトにもアクセスできません。

- **Organization Owner** が、適切なプロジェクトにそれらのユーザーを招待する必要があります。

- プロジェクトにユーザーを招待する手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

プロジェクトに招待された後、**Organization** **Owner** はエンタープライズユーザーに Zilliz Cloud のログイン URL を共有し、SSO を通じてサインインできるようにできます。

セットアップまたはテスト中に問題が発生した場合は、[Zilliz support](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続の構成とテストが完全に完了した後、必要に応じて **SSO enforcement** を有効にし、すべての組織メンバーが SSO のみを使用してログインするよう要求できます。有効にすると、メンバーはメールアドレス/パスワードまたはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在パスワードでサインインしているすべてのメンバーは即座にログアウトされ、SSO 以外のログイン方法はブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細は、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

既に Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後で Zilliz Cloud console でロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### ユーザーは SSO ログイン後にどのようにプロジェクトにアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定のプロジェクトにアクセスするには、**Organization Owner** または **Project Admin** がそれらのユーザーをプロジェクトに招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### ユーザーが SSO でログインする前から既に Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud 組織内に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても元のロールと権限は維持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ組織に対して複数の SSO プロバイダーを設定できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud 組織では、一度に **1 つの有効な SAML SSO 設定** のみがサポートされています。
