---
title: "Google Workspace (SAML 2.0) | Cloud"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン（SSO）を構成する方法について説明します。 | Cloud"
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

このトピックでは、SAML 2.0 プロトコルを使用して Google Workspace でシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloud が Service Provider（SP）として機能し、Google Workspace が Identity Provider（IdP）として機能します。以下の図は、Zilliz Cloud と Google Admin console で必要な手順を示しています。

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## 開始する前に\{#before-you-start}

- お使いの Zilliz Cloud organization には、少なくとも 1 つの **Dedicated (Enterprise)** cluster が必要です。

- Google Admin console で Admin ロールを持っている必要があります。

- SSO を構成する Zilliz Cloud organization の Organization Owner である必要があります。

## 構成手順\{#configuration-steps}

### 手順 1: Zilliz Cloud console で SP の詳細にアクセスする\{#step-1-access-sp-details-in-zilliz-cloud-console}

SP として、Zilliz Cloud は Google Admin で SAML アプリを設定する際に必要な **Entity ID** と **ACS URL** を提供します。

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="手順 1: Zilliz Cloud で service provider の詳細にアクセスする" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインし、SSO を構成したい organization に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Settings** ページで **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、IdP とプロトコルとして **Google Workspace (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Entity ID** と **ACS URL** をコピーします。これらの値は、Google Admin console で SAML アプリを作成する際の [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で必要になります。

    <Admonition type="info" icon="📘" title="注意">

    別の方法として、ここで **SSO URL** と **Certificate** をコピーすることもできます。この場合、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で Manual モードを使用して IdP の詳細を構成する必要があります。

    </Admonition>

1. 完了したら、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) に進みます。

</Procedures>

### 手順 2: Google Admin console でカスタム SAML アプリを作成する\{#step-2-create-a-custom-saml-app-in-google-admin-console}

この手順では、Zilliz Cloud から取得した SP の詳細を使って Google Workspace（IdP）を構成します。

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="手順 2: Google Admin で SAML アプリを作成する" />

<Procedures>

1. [Google Admin console](https://admin.google.com/) にログインします。

1. 左側のナビゲーションペインで、**Apps** > **Web and mobile apps** を選択します。次に、**Add app** > **Add custom SAML app** を選択します。

1. アプリ名（例: **zilliz**）をカスタマイズして、**CONTINUE** をクリックします。

1. 表示されるページで、**Option 1: Download IdP metadata** から IdP メタデータをダウンロードします。これは、Zilliz Cloud console で IdP 設定を構成する際の [手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で必要になります。次に、**Continue** をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    別の方法として、**Option 2: Copy the SSO URL, entity ID, and certificate** から、それぞれ **SSO URL**、**Entity ID**、**Certificate** を取得します。これらは、[手順 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) で **Manual** モードを選択した場合に、Zilliz Cloud console で必要になります。

    </Admonition>

1. **Service provider details** セクションで、以下を構成します。

    - **ACS URL**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud console からコピーした **ACS URL** を貼り付けます。

    - **Entity ID**: [手順 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console) で Zilliz Cloud console からコピーした **Entity ID** を貼り付けます。

    完了したら、**Continue** をクリックします。

1. **Attributes** セクションで、以下を構成します。

    - **Google Directory attributes**: **ADD MAPPING** をクリックし、**Primary email** を選択します。

    - **App attributes**: 値を **email** に設定します。

1. **Finish** をクリックします。

</Procedures>

### 手順 3: Zilliz Cloud console で IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

この手順では、Google Workspace の IdP 詳細を Zilliz Cloud に戻して提供し、SAML 信頼関係を完成させます。

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="手順 3: Zilliz Cloud で IdP 設定を構成する" />

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) に戻ります。

1. **Configure Single Sign-On (SSO)** ダイアログボックスの **Identity Provider Details** カードで、[手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) で Google Admin console からダウンロードしたメタデータファイルをアップロードします。

    <Admonition type="info" icon="📘" title="注意">

    別の方法として、IdP 詳細の構成に **Manual** モードを選択する場合は、以下を構成します。
    
    - **SSO URL**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **SSO URL** をここに貼り付けます。
    
    - **Certificate**: [手順 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) でコピーした **Certificate** をここに貼り付けます。

    </Admonition>

1. 完了したら、**Save** をクリックします。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: ユーザーに SAML アプリを割り当てる（Google Admin console）\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="タスク 1: ユーザーに SAML アプリを割り当てる" />

ユーザーが SSO 経由で Zilliz Cloud にアクセスできるようにする前に、SAML アプリを有効化してください。

<Procedures>

1. 新しく作成したアプリの詳細ページで、**User access** 領域を見つけ、サービスステータスを編集するためにクリックします。

1. organization 内の全員に対してサービスをオンまたはオフにするには、全員に対して **ON** または **OFF** をクリックし、次に **Save** をクリックします。

1. （任意）organizational unit に対してサービスをオンまたはオフにするには:

    1. 左側で organizational unit を選択します。

    1. Service status を変更するには、**ON** または **OFF** を選択します。

    1. 次のいずれかを選択します。

        - **Service status** が **Inherited** に設定されていて、親の設定が変更されても更新後の設定を保持したい場合は、**Override** をクリックします。

        - **Service status** が **Overridden** に設定されている場合は、**Inherit** をクリックして親と同じ設定に戻すか、**Save** をクリックして、親の設定が変更されても新しい設定を保持します。
Note: 詳細については、[organizational structure](https://support.google.com/a/answer/4352075) を参照してください。

1. （任意）organizational unit をまたいで、またはその内部の一連のユーザーに対してサービスを有効にするには、access group を選択します。詳細については、[Use groups to customize service access](https://support.google.com/a/answer/9050643) を参照してください。

1. ユーザーが SAML アプリへのサインインに使用するメールアドレスが、Google domain へのサインインに使用するメールアドレスと一致していることを確認してください。

</Procedures>

### タスク 2: project にユーザーを招待する\{#task-2-invite-users-to-your-project}

ユーザーが初めて SSO 経由で Zilliz Cloud にログインすると、**Organization Member** として登録されますが、デフォルトではどの project にもアクセスできません。

- **Organization Owner** は、適切な project にそのユーザーを招待する必要があります。

- project にユーザーを招待する手順については、[Manage Project Users](./project-users#invite-a-user-to-a-project) を参照してください。

project に招待された後、**Organization** **Owner** は Zilliz Cloud のログイン URL を enterprise ユーザーと共有し、SSO 経由でサインインできるようにします。

セットアップまたはテストの過程で問題が発生した場合は、[Zilliz support](https://zilliz.com/contact-sales) にお問い合わせください。

### タスク 3: （任意）SSO 強制を有効にする\{#task-3-optional-enable-sso-enforcement}

SSO 接続が完全に構成され、テストされた後、必要に応じて **SSO enforcement** を有効にして、organization メンバー全員に SSO 経由のみでのログインを必須にできます。有効にすると、メンバーは email/password またはサードパーティアカウント（Google、GitHub）を使用してサインインできなくなります。

<Admonition type="warning" icon="🚧" title="警告">

この機能を有効にすると、現在 password でサインインしているすべてのメンバーが即座にログアウトされ、非 SSO のログイン方法がブロックされます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

詳細については、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### 初めて SSO 経由でログインするユーザーにはどのロールが割り当てられますか？\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

まだ Zilliz Cloud アカウントを持っていない新規ユーザーは、初回の SSO ログイン時に自動的に作成されます。これらのユーザーには、デフォルトで **Organization Member** ロールが割り当てられます。後で Zilliz Cloud console でロールを変更できます。詳細な手順については、[Manage Project Users](./project-users#edit-a-collaborators-role) を参照してください。

### SSO ログイン後、ユーザーはどのようにして project にアクセスしますか？\{#how-do-users-access-projects-after-sso-login}

SSO 経由でログインした後、ユーザーにはデフォルトで **Organization Member** ロールが付与されます。特定の project にアクセスするには、**Organization Owner** または **Project Admin** がそのユーザーを project に招待する必要があります。詳細な手順については、[Manage Project Users](./project-users) を参照してください。

### ユーザーが SSO でログインする前に、すでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

ユーザーがすでに Zilliz Cloud organization に存在している場合（メールアドレスに基づく）、SSO 経由でログインしても、元のロールと権限は保持されます。システムはメールアドレスでユーザーを照合し、既存のアカウントを上書きしません。

### 同じ organization に複数の SSO provider を構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

現在、各 Zilliz Cloud organization では、一度に **1 つの有効な SAML SSO 構成** のみをサポートしています。
