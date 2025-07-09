---
title: "マイクロソフトエントラ | BYOC"
slug: /single-sign-on-with-microsoft-entra
sidebar_label: "マイクロソフトエントラ"
beta: CONTACT SALES
notebook: FALSE
description: "マイクロソフトエントラは、ハイブリッドおよびマルチクラウド環境でセキュリティ、コンプライアンス、およびユーザーエクスペリエンスを向上させる統合IDおよびアクセス管理ソリューションです。Zilliz Cloudを使用すると、SAMLプロトコルを介してMicrosoft Entraとシングルサインオン（SSO）を構成できます。 | BYOC"
type: origin
token: Qkm3wPF9Titu1MkQ0fgcENs4nZc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - microsoft
  - entra
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# マイクロソフトエントラ

[マイクロソフトエントラ](https://www.microsoft.com/en-us/security/business/microsoft-entra)は、ハイブリッドおよびマルチクラウド環境でセキュリティ、コンプライアンス、およびユーザーエクスペリエンスを向上させる統合IDおよびアクセス管理ソリューションです。Zilliz Cloudを使用すると、SAMLプロトコルを介してMicrosoft Entraとシングルサインオン（SSO）を構成できます。

![M3UywWSZHhlwTHbkjI8c6jTinGh](/img/M3UywWSZHhlwTHbkjI8c6jTinGh.png)

<Admonition type="info" icon="📘" title="ノート">

<p>SSO機能は<strong>一般提供</strong>中ですが、アクセスするには<a href="https://zilliz.com/contact-sales">連絡する</a> <a href="https://zilliz.com/contact-sales"> セールス</a>をお願いします。</p>

</Admonition>

## 始める前に{#before-you-start}

SSO設定を開始する前に、次の条件が満たされていることを確認してください。

- あなたは、SSOを設定する組織の組織オーナーです。

- Microsoft Entra管理センターにアクセスできます。詳細については、[Microsoft Entraドキュメント](https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center)を参照してください。

## ステップ1: Microsoft Entraでアプリケーションを作成する{#step-1-create-an-application-on-microsoft-entra}

![sso-ms-entra-1](/img/sso-ms-entra-1.png)

1. [Microsoft管理センター](https://aad.portal.azure.com/?ad=in-text-link)にログインしてください。

1. 左側のナビゲーションペインで、「アプリケーション」>「エンタープライズアプリケーション」を選択してください。

1. 表示されたページで、**すべてのアプリケーション**>**+新しいアプリケーション**を選択します。次に、**+独自のアプリケーションを作成**をクリックします。

1. 「独自のアプリケーションを作成する」ペインで、アプリケーション名を入力し、「ギャラリーにない他のアプリケーションを統合する(ギャラリー以外)」を選択します。その後、アプリケーションが作成されます。

## ステップ2: SAMLベースのSSOを設定する{#step-2-set-up-saml-based-sso}

![sso-ms-entra-2](/img/sso-ms-entra-2.png)

1. アプリケーションページで、**シングルサインオン**>**SAML**を選択してください。

1. 「基本SAML構成」セクションで、「編集」をクリックしてください。

1. 「識別子(エンティティID)」と「返信URL」を設定し、「保存」をクリックしてください

    - **識別子**: Microsoft Entra IDに対してアプリケーションを識別する一意のIDです。この値は、Microsoft Entraテナント内のすべてのアプリケーションで一意である必要があります。この例では、**zilliz**と入力してください。

    - **返信URL（Assertion Consumer Service URL）**:アプリケーションが認証トークンを受け取る予定のURLです。現在のプレースホルダー値を入力し、Zilliz Cloudコンソールで設定を行った後に更新してください。

1. 証明書をダウンロードし、**ログインURL**をコピーしてください。

1. その後、さらに設定するためにZilliz Cloudコンソールに切り替えてください。

## ステップ3: Zilliz CloudでSSOを設定する{#step-3-configure-sso-on-zilliz-cloud}

![sso-saml-1](/img/sso-saml-1.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションペインで、**設定**を選択してください。

1. 「設定」ページで、「シングルサインオン（SSO）」セクションを見つけ、「設定」をクリックしてください。

1. 「シングルサインオン(SSO)の設定」ダイアログには、「SAML 2.0」と「Okta Workforce」の2つのオプションが表示されます。このガイドでは、「SAML 2.0」を選択してSAML 2.0の統合を進めてください。

1. 「シングルサインオン(SSO)の構成」ステップで、証明書とMicrosoft Entraから取得した「ログインURL」を使用して、[ステップ2](./single-sign-on-with-microsoft-entra)にIdP設定を入力してください。

    - **シングルサインオンURL**: Microsoft Entraから取得した**ログインURL**値をこのフィールドに貼り付けます。このURLは、Microsoft EntraからのSAML認証要求を受信します。

    - 「エンティティID」:「zilliz」と入力してください。この識別子は、SAMLリクエスト、レスポンス、またはアサーションの発行者を区別するために使用され、Microsoft EntraからのメッセージがZilliz Cloudによって正しく認識され、受け入れられるようにします。

    - 証明書: Microsoft Entraからダウンロードした証明書を開き、証明書の詳細をこのフィールドに貼り付けます。この公開鍵証明書は、SAMLアサーションのデジタル署名を検証するために使用され、Zilliz CloudがSAMLデータのソースを安全に認証できるようにします。

1. 続行するには、**保存**をクリックしてください。

## ステップ4: Microsoft Entraの統合を更新する{#step-4-update-microsoft-entra-integration}

![sso-ms-entra-3](/img/sso-ms-entra-3.png)

Zilliz Cloudに統合の詳細を保存した後、リダイレクトURLが提供されます。

1. 提供されたリダイレクトURLを[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)からコピーしてください。

1. [Microsoft管理センター](https://aad.portal.azure.com/?ad=in-text-link)に戻り、作成したアプリケーションに移動してください。

1. SAML設定を編集して、**返信URL**をZilliz CloudからコピーしたリダイレクトURLに置き換え、変更を保存してください。

## ステップ5: Microsoft Entraアプリケーションをユーザーに割り当てる{#step-5-assign-microsoft-entra-application-to-users}

![sso-ms-entra-4](/img/sso-ms-entra-4.png)

ユーザーがSSOを介してZilliz Cloudをアクセス可能にする前に、Microsoft Entraアプリケーションをユーザーに割り当てる必要があります。

1. [Microsoft管理センター](https://aad.portal.azure.com/?ad=in-text-link)のアプリケーションページで、**ユーザーとグループ**>**+ユーザー/グループの追加**を選択してください。

1. アプリケーションへのアクセスを許可するユーザーまたはグループを選択してください。

詳細については、[Microsoft Entraドキュメント](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal?pivots=portal)を参照してください。

## テスト設定{#test-configuration}

SSOの設定が機能するようにするには:

1. 新しいブラウザウィンドウを開き、以前に提供されたZilliz Cloud SSOログインURLに移動してください。

1. Microsoft Entra管理センターのログインページにリダイレクトされるはずです。

1. アプリケーションが割り当てられたユーザーの資格情報を使用してログインしてください。

1. SSOが正しく設定されている場合、認証に成功するとZilliz Cloudコンソールにリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを介してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、Zillizサポートにお問い合わせください。