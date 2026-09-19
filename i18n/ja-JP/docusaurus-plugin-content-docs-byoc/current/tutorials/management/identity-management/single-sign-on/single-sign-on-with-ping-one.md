---
title: "PingOne (SAML 2.0) | BYOC"
slug: /single-sign-on-with-ping-one
sidebar_label: "PingOne (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "このトピックでは、SAML 2.0 プロトコルを使用して Ping Identity（PingOne）とのシングルサインオン（SSO）を構成する方法について説明します。 | BYOC"
type: origin
token: KIPiw0RqSieKkjkACwGcvgfLnSe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# PingOne (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このトピックでは、SAML 2.0 プロトコルを使用して Ping Identity（PingOne）とのシングルサインオン（SSO）を構成する方法について説明します。

このガイドでは、Zilliz Cloud がサービスプロバイダー（SP）として、PingOne がアイデンティティプロバイダー（IdP）として機能します。Zilliz Cloud から PingOne の SAML アプリケーションに SP の詳細をコピーし、その後、アプリケーションの IdP の詳細を Zilliz Cloud に提供します。

## 事前準備\{#before-you-start}

- SSO を構成する Zilliz Cloud 組織の **Organization Owner** であること。

- PingOne で SAML アプリケーションを作成および構成し、ユーザーアクセスを管理するための管理者権限を持っていること。環境を作成するには、**Organization Admin** ロールまたは同等の権限も必要です。

## 構成手順\{#configuration-steps}

### ステップ 1: Zilliz Cloud コンソールで SP の詳細を確認する\{#step-1-access-sp-details-in-zilliz-cloud-console}

Zilliz Cloud は、PingOne で SAML アプリケーションを作成する際に必要な **Entity ID** とアサーションコンシューマーサービス（**ACS URL**）を提供します。

<Supademo id="cmu4vnhpi254fqm3bxz83ierb" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Single Sign-On (SSO)** セクションを見つけ、**Configure** をクリックします。

1. 表示されるダイアログボックスで、**Ping Identity (SAML 2.0)** を選択します。

1. **Service Provider Details** カードで、**Entity ID** と **ACS URL** をコピーします。別のブラウザータブで PingOne を構成する間は、このページを開いたままにしてください。

    <Admonition type="info" title="Notes">

    両方の値は、対象組織のコンソールからコピーしてください。別の組織または環境の値で代用しないでください。

    </Admonition>

</Procedures>

### ステップ 2: PingOne で SAML アプリを作成する\{#step-2-create-a-saml-app-in-pingone}

[ステップ 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console) の SP の詳細を使用して PingOne を構成し、続いて Zilliz Cloud がユーザーの識別に使用するメール属性を構成します。

<Supademo id="cmu4wguf625pmqm3bbuwhimr4" title=""  />

<Procedures>

1. [PingOne 管理コンソール](https://www.pingidentity.com/bin/ping/signOnLink) にログインします。**PingOne SSO** サービスを持つ既存の環境を選択するか、**Workforce solution** を指定して[新しい環境を作成](https://docs.pingidentity.com/pingone/settings/p1_addenvironment.html)します。

1. **Applications > Applications** に移動し、**+** アイコンをクリックします。

1. **Application Name** に `zilliz-sso` などの名前を入力します。**SAML Application** を選択し、**Configure** をクリックします。

1. **Manually Enter** を選択し、以下の SP の詳細を入力します。

    | PingOne のフィールド | Zilliz Cloud から取得する値 |
    | --- | --- |
    | **ACS URLs** | [ステップ 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console) でコピーした **ACS URL** |
    | **Entity ID** | [ステップ 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console) でコピーした **Entity ID** |

1. **Save** をクリックしてアプリケーションを作成します。

1. アプリケーションの **Configuration** タブで鉛筆アイコンをクリックします。**Subject NameID Format** を `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` に設定し、**Save** をクリックします。

1. **Attribute Mappings** タブで鉛筆アイコンをクリックします。既存の `saml_subject` マッピングを変更し、**Add** をクリックして以下に示す `email` マッピングを作成します。

    | アプリケーション属性 | PingOne のマッピング | 目的 |
    | --- | --- | --- |
    | `saml_subject` | **Email Address** | SAML NameID の値をユーザーのメールアドレスに設定します。 |
    | `email` | **Email Address** | Zilliz Cloud がユーザーアカウントの照合に使用するメール属性を提供します。 |

1. `email` マッピングで **Required** を選択します。`saml_subject` マッピングはすでに必須であり、そのチェックボックスは変更できません。**Save** をクリックします。

1. アプリケーションの詳細パネルの上部にあるトグルをオンにして、アプリケーションを有効にします。

1. **Overview** タブで **Connection Details** を確認します。**IDP Metadata URL** をコピーし、[ステップ 3](./single-sign-on-with-ping-one#step-3-configure-idp-settings-in-zilliz-cloud-console) で使用します。

    <Admonition type="info" title="Notes">

    両方のメールマッピングを構成してください。NameID 形式を設定するだけでは、`email` 属性は設定されません。

    Zilliz Cloud にメタデータをインポートする前に、PingOne アプリケーションを有効にしてください。無効なアプリケーションのメタデータ URL は `404` を返し、インポートが失敗する可能性があります。

    </Admonition>

    ファイルを使用する場合は、**Download Metadata** をクリックしてメタデータ XML をダウンロードします。手動で構成する場合は、**Connection Details** から **Single Signon Service** をコピーし、**Signing Certificate** をダウンロードします。証明書の形式には **X509 PEM (.crt)** を選択します。

</Procedures>

PingOne のアプリケーション設定の詳細については、[Adding an application](https://docs.pingidentity.com/pingone/applications/p1_applications_add_applications.html) および [Editing an application - SAML](https://docs.pingidentity.com/pingone/applications/p1_edit_application_saml.html) を参照してください。

### ステップ 3: Zilliz Cloud コンソールで IdP 設定を構成する\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Supademo id="cmu4wrh3q264fqm3bnanweoky" title=""  />

<Procedures>

1. Zilliz Cloud の **Configure Single Sign-On (SSO)** ダイアログボックスに戻ります。**Identity Provider Details** カードで、以下のいずれかの方法を使用します。

    | 方法 | Zilliz Cloud での入力内容 |
    | --- | --- |
    | **Metadata URL/File**: URL | PingOne からコピーした **IDP Metadata URL** を **IDP Metadata URL** に貼り付けます。 |
    | **Metadata URL/File**: XML ファイル | **Upload file** をクリックし、**Download Metadata** で取得した XML をアップロードします。 |
    | **Manual** | PingOne の **Single Signon Service** URL を **Single Signon Service** に貼り付けます。PingOne の署名証明書を **Signing Certificate** に貼り付けるかアップロードします。 |

    セットアップを最短で完了するにはメタデータ URL を使用します。メタデータをアップロードする場合は XML ファイルを選択し、ログイン URL と証明書を個別に指定する場合は **Manual** を使用します。

    <Admonition type="info" title="Notes">

    手動で構成する場合は、`-----BEGIN CERTIFICATE-----` と `-----END CERTIFICATE-----` を含む完全な PEM 証明書を指定してください。

    Zilliz Cloud では、拡張子が `.pem`、`.cer`、または `.cert` の証明書をアップロードできます。PingOne が X509 PEM 証明書を `.crt` としてダウンロードする場合は、その内容を貼り付けるか、アップロード前に拡張子を `.pem` に変更してください。バイナリ証明書の拡張子を変更しても、PEM に変換されるわけではありません。

    </Admonition>

1. IdP の詳細を入力したら、**Save** をクリックします。**SSO Configured Successfully** ダイアログボックスが表示されたら、**OK** をクリックします。

1. 組織の **Single Sign-On (SSO)** セクションで、SSO が有効になっていることを確認します。

    構成を保存しても、ユーザーがサインインできることは検証されません。SSO の強制を有効にする前に、以下のタスクを完了してください。

</Procedures>

## 構成後のタスク\{#post-configuration-tasks}

### タスク 1: PingOne でユーザーアクセスを構成する\{#task-1-configure-user-access-in-pingone}

ユーザーに SSO のログイン情報を共有する前に、誰がアプリケーションにアクセスできるかを確認します。

<Supademo id="cmu4xe96v26tcqm3blkn6wj78" title=""  />

<Procedures>

1. PingOne で **Applications > Applications** に移動し、対象の Zilliz Cloud アプリケーションを開きます。

1. **Access** タブで鉛筆アイコンをクリックします。

1. **Group Membership Policy** で、Zilliz Cloud にアクセスするグループを選択します。複数のグループを選択する場合は、ユーザーが適用されたグループのいずれかに属する必要があるか、すべてに属する必要があるかを選択します。

1. **Admin Only Access** 設定を確認します。管理者以外のユーザーがアクセスする必要がある場合は、**Must have admin role** をオフのままにします。

1. **Save** をクリックし、テストユーザーが必要なグループに属していることを確認します。

    グループが適用されていない場合、アプリケーションへのアクセスにグループメンバーシップは必要ありません。詳細については、PingOne の [Application access control](https://docs.pingidentity.com/pingone/applications/p1_application_access_control.html) を参照してください。

</Procedures>

### タスク 2: SSO をテストしてプロジェクトへのアクセスを付与する\{#task-2-test-sso-and-grant-project-access}

<Procedures>

1. Zilliz Cloud コンソールで、組織の **Settings** ページに移動します。**Single Sign-On (SSO)** カードで **Login URL** をコピーし、プライベートブラウザーウィンドウで開きます。

    ![I3wHbrMdooQQs8xKgfycVs2dnXc](https://zdoc-images.s3.us-west-2.amazonaws.com/i3whbrmdooqqs8xkgfycvs2dnxc.png "I3wHbrMdooQQs8xKgfycVs2dnXc")

1. テストユーザーとして PingOne で認証します。Zilliz Cloud に戻り、目的の組織にアクセスできることを確認します。

1. **Organization Owner** または **Project Admin** に依頼して、ユーザーに必要なプロジェクトへのアクセス権を付与してもらいます。手順については、[Manage Platform Users](./manage-platform-users) を参照してください。

1. ユーザーがプロジェクトを開き、割り当てられたロールで許可されている操作を実行できることを確認します。

</Procedures>

新規ユーザーは、初めて SSO でサインインしたときに作成されます。組織のメンバーシップだけでは、プロジェクトへのアクセス権は自動的に付与されません。メールアドレスが一致する既存のユーザーは、既存のロールと権限を保持します。

テストが成功したら、PingOne アプリケーションにアクセスできるユーザーに、組織の Zilliz Cloud SSO ログイン URL を共有します。

### タスク 3:（任意）SSO の強制を有効にする\{#task-3-optional-enable-sso-enforcement}

接続が構成され、対象のユーザーが正常にサインインできるようになったら、**SSO の強制** を有効にして、免除対象外の組織メンバーに SSO を必須にすることができます。

<Admonition type="warning" title="Warning">

SSO の強制を有効にすると、免除対象外のメンバーのアクティブなセッションが無効になり、そのメンバーの SSO 以外のログイン方法がブロックされます。有効にする前に、Organization Owner の免除ルールとその他の影響を確認してください。

</Admonition>

手順と免除ルールについては、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

## FAQ\{#faq}

### メタデータ URL のインポートが失敗するのはなぜですか？\{#why-does-importing-the-metadata-url-fail}

まず、PingOne アプリケーションが有効になっていることを確認します。無効なアプリケーションのメタデータ URL は `404` を返す可能性があります。そのアプリケーションの **Overview > Connection Details** から **IDP Metadata URL** をもう一度コピーして、再試行します。それでも URL のインポートが失敗する場合は、メタデータ XML をダウンロードし、ファイルアップロードのオプションを使用します。

### ユーザーがサインインできない場合は何を確認すればよいですか？\{#what-should-i-check-if-a-user-cannot-sign-in}

- PingOne アプリケーションと Zilliz Cloud SSO の両方が有効になっていることを確認します。

- PingOne の **ACS URLs** と **Entity ID** を、対象の Zilliz Cloud 組織に表示されている値と比較します。

- **Subject NameID Format** が `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` であり、`saml_subject` と `email` の両方が **Email Address** にマッピングされていることを確認します。

- PingOne のユーザーにメールアドレスがあることを確認します。既存の Zilliz Cloud アカウントの場合は、メールアドレスが一致している必要があります。

- アプリケーションの **Access** 設定と、ユーザーのグループメンバーシップを確認します。

- 手動で構成する場合は、URL が **Single Signon Service** であり、完全な署名証明書が同じ PingOne アプリケーションのものであることを確認します。

### ユーザーはサインインできるのにプロジェクトにアクセスできないのはなぜですか？\{#why-can-a-user-sign-in-but-not-access-a-project}

SSO 認証とプロジェクトの認可は別々のものです。[Manage Platform Users](./manage-platform-users) の説明に従って、ユーザーに適切なプロジェクトロールを付与してください。

### ユーザーがすでに Zilliz Cloud アカウントを持っている場合はどうなりますか？\{#what-happens-if-the-user-already-has-a-zilliz-cloud-account}

Zilliz Cloud はメールアドレスでユーザーを照合します。そのメールアドレスでユーザーがすでに組織に属している場合は、既存のロールと権限が保持されます。

### 同じ組織に複数の SSO プロバイダーを構成できますか？\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

各 Zilliz Cloud 組織で同時にサポートされるのは、**1 つのアクティブな SAML SSO 構成** のみです。
