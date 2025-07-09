---
title: "Open IDコネクト | Cloud"
slug: /openid-connect
sidebar_label: "Configure OIDC SSO"
beta: CONTACT SALES
notebook: FALSE
description: "このトピックでは、Open IDコネクトを構成する方法について説明します。 | Cloud"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination

---

import Admonition from '@theme/Admonition';


# Open IDコネクト

このトピックでは、[Open IDコネクト](https://openid.net/developers/how-connect-works/)(OIDC)プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。

OIDCはOAuth 2.0の上に構築された認証プロトコルです。これにより、Zilliz CloudとOktaの間で滑らかで安全な認証が可能になります。Oktaをアイデンティティプロバイダーとして使用し、Okta固有の機能とより簡単なセットアッププロセスを利用したい場合は、このオプションを選択してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/Content/Topics/Apps/apps-about-oidc.htm)を参照してください。

![EfRWwnbKNhcXEwbL7EBcB66inrd](/img/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

<Admonition type="info" icon="📘" title="ノート">

<p>SSO機能は<strong>一般提供</strong>中ですが、アクセスするには<a href="https://zilliz.com/contact-sales">連絡する</a> <a href="https://zilliz.com/contact-sales"> セールス</a>をお願いします。</p>

</Admonition>

## 始める前に{#before-you-start}

SSO設定を開始する前に、次の条件が満たされていることを確認してください。

- あなたは、SSOを設定する組織の組織オーナーです。

- Oktaコンソールには管理者権限があります。詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

## ステップ1: OktaでOIDCアプリの統合を作成する{#step-1-create-oidc-app-integration-in-okta}

1. [Okta管理コンソール](https://login.okta.com/)にログインしてください。

1. 左側のナビゲーションペインで、**アプリケーション**>**アプリケーション**を選択してください。

1. 「Create App Integration」をクリックしてください。

1. 「新しいアプリ統合を作成する」ダイアログボックスで、サインイン方法として「OIDC-Open ID Connect」を選択し、アプリケーションタイプとして「Webアプリケーション」を選択します。「次へ」をクリックしてください。

1. 以下の設定で新しいWebアプリの統合を設定してください: 

    - アプリ統合名:統合の名前を入力してください(例: Zilliz Cloud)。

    - **グラントタイプ**:**認証コード**が選択されていることを確認してください。

    - **サインインリダイレクトURI**:今のところ、任意のプレースホルダー値を使用してください。後でこの設定を更新する必要があります。

    - 「制御されたアクセス」:特定のグループアクセスを設定したい場合を除き、「今のところグループ割り当てをスキップ」を選択してください。

1. アプリケーションを作成するには**保存**をクリックしてください。その後、アプリケーションの設定ページに移動します。

1. クライアント資格情報のセクションを見つけ、クライアントIDとシークレットをコピーしてください。これらはZilliz Cloudの[ステップ2](./openid-connect)に必要です。

![sso-oidc-2](/img/sso-oidc-2.png)

## ステップ2: Zilliz Cloud上でOkta Workforceの接続を設定する{#step-2-configure-okta-workforce-connection-on-zilliz-cloud}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションペインで、**設定**を選択してください。

1. 「設定」ページで、「シングルサインオン（SSO）」セクションを見つけ、「設定」をクリックしてください。

1. 「シングルサインオン(SSO)の設定」ダイアログには、「SAML 2.0」と「Okta Workforce」の2つのオプションが表示されます。このガイドでは、「Okta Workforce」を選択してOktaクライアントの統合を進めてください。

1. 「Okta Domain」フィールドに、組織に関連するドメイン名（例:yourdomain.okta.com）を入力してください。ドメイン名の取得方法については、[Oktaドメインを探す](https://developer.okta.com/docs/guides/find-your-domain/main/)を参照してください。

1. [Okta管理コンソール](https://login.okta.com/)からコピーしたクライアントIDとシークレットを[ステップ1](./openid-connect)に貼り付けてください。

1. 続行するには、**保存**をクリックしてください。

![sso-oidc-1](/img/sso-oidc-1.png)

## ステップ3: Oktaアプリの統合を更新する{#step-3-update-okta-app-integration}

Zilliz CloudにOktaの統合詳細を保存した後、リダイレクトURLが提供されます。

1. 提供されたリダイレクトURLを[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)からコピーしてください。

1. [Okta管理コンソール](https://login.okta.com/)に戻り、Zilliz Cloud用に設定したアプリケーションに移動してください。

1. 「一般設定」エリアで、アプリケーションの設定を編集してください。

    1. 「サインインリダイレクトURI」フィールドに、Zilliz CloudからコピーしたリダイレクトURLを貼り付けてください。

    1. [Okta管理コンソール](https://login.okta.com/)に変更を保存します。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、OktaにリダイレクトURLを追加したことを確認してください。

Zilliz CloudのログインURLも表示されます。設定が完了すると、SSOログインに使用されるため、このURLを保存してください。

![sso-oidc-3](/img/sso-oidc-3.png)

## ステップ4:ユーザーにOktaアプリケーションを割り当てる{#step-4-assign-okta-application-to-users}

ユーザーがSSOを介してZilliz Cloudをアクセス可能にする前に、Oktaアプリケーションをユーザーに割り当てる必要があります。

1. [Okta管理コンソール](https://login.okta.com/)で、**ディレクトリ**>**人々**に移動してください。

1. ユーザーを選択し、**アプリケーション**タブに移動してください。

1. 「アプリケーションの割り当て」をクリックして、Zilliz Cloudアプリケーションを見つけてください。

1. アプリケーションをユーザーに割り当て、変更を保存します。

Zilliz CloudへのSSOアクセスが必要なすべてのユーザーに対して、この過程を繰り返してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

![sso-4](/img/sso-4.png)

## テスト設定{#test-configuration}

SSOの設定が機能するようにするには:

1. 新しいブラウザウィンドウを開き、以前に提供されたZilliz Cloud SSOログインURLに移動してください。

1. Oktaのログインページにリダイレクトされるはずです。

1. OktaでZilliz Cloudアプリケーションを割り当てられたユーザーの資格情報を使用してログインしてください。

1. SSOが正しく構成されている場合、認証に成功した後、[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを介してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、Zillizサポートにお問い合わせください。