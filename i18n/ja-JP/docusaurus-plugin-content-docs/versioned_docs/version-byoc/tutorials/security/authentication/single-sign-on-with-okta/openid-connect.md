---
title: "Open IDコネクト | BYOC"
slug: /openid-connect
sidebar_label: "Configure OIDC SSO with Okta"
beta: PUBLIC
notebook: FALSE
description: "このトピックでは、Open ID Connectを構成する方法について説明します。 | BYOC"
type: origin
token: QznPwuawVitqDukBHv9cAWoInqg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial

---

import Admonition from '@theme/Admonition';


# Open IDコネクト

このトピックでは、[Open ID Connect](https://openid.net/developers/how-connect-works/)(OIDC)プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。

OIDCはOAuth 2.0の上に構築された認証プロトコルです。これにより、Zilliz CloudとOktaの間で滑らかで安全な認証が可能になります。Oktaをアイデンティティプロバイダーとして使用し、Okta固有の機能とより簡単なセットアッププロセスを利用したい場合は、このオプションを選択してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/ja-jp/content/topics/apps/apps-about-oidc.htm)を参照してください。

![COSLwuCOfhgfK8bPN9mcLU8Hngc](/byoc/ja-JP/COSLwuCOfhgfK8bPN9mcLU8Hngc.png)

## 始める前に{#before-you-start}{#before-you-start}

SSO設定を開始する前に、次の条件が満たされていることを確認してください。

- SSOを設定する組織の組織オーナーです。

- Oktaコンソールには管理者権限があります。詳細については、[Okta公式ドキュメント](https://help.okta.com/ja-jp/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

## ステップ1: OktaでOIDCアプリの統合を作成する{#step-1-create-oidc-app-integration-in-okta}{#1-oktaoidcstep-1-create-oidc-app-integration-in-okta}

1. Okta[管理コンソール](https://login.okta.com/)にログインします。

1. 左側のナビゲーションウィンドウで、[**アプリケーション**]>[**アプリケーション**]を選択します。

1. [**Create App Integration**]をクリックします。

1. [**新しいアプリ統合を作成**]ダイアログボックスで、サインイン方法として[**OIDC-Open ID Connect**]を選択し、アプリケーションの種類として[**Webアプリケーション**]を選択します。[**次**へ]をクリックします。

1. 以下の設定で新しいWebアプリの統合を設定してください:

    - **アプリ連携名**:連携に使用する名前を入力します(例:**Zilliz Cloud**)。

    - **付与タイプ**:[**承認コード**]が選択されていることを確認します。

    - **サインインリダイレクトURI**:今のところ、任意のプレースホルダー値を使用してください。この設定は後で更新する必要があります。

    - **アクセス制御**:特定のグループアクセスを設定しない限り、**今のところグループ割り当てをスキップ**を選択します。

1. アプリケーションを作成するには「**保存**」をクリックしてください。その後、アプリケーションの設定ページに移動します。

1. [**クライアント資格情報**]セクションを見つけ、**クライアントID**と**シークレット**をコピーします。これらは、Zilliz Cloudの[ステップ2](./openid-connect#2-zilliz-cloudokta-workforcestep-2-configure-okta-workforce-connection-on-zilliz-cloud)で必要になります。

![sso-oidc-2](/byoc/ja-JP/sso-oidc-2.png)

## ステップ2: Zilliz Cloud上でOkta Workforceの接続を設定する{#step-2-configure-okta-workforce-connection-on-zilliz-cloud}{#2-zilliz-cloudokta-workforcestep-2-configure-okta-workforce-connection-on-zilliz-cloud}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションウィンドウで、[**設定**]を選択します。

1. [**設定**]ページで、[**シングルサインオン(SSO)**]セクションを見つけ、[**構成**]をクリックします。

1. [**シングルサインオン（SSO）**の設定]ダイアログには、**SAML 2.0**と**Okta Workforce**の2つのオプションが表示されます。このガイドでは、**Okta Workforce**を選択してOkta Clientの統合を進めてください。

1. [**Okta Domain**]フィールドに、組織に関連するドメイン名（例:**yourdomain.okta.com**）を入力します。ドメイン名の取得方法については、「[Find your Okta domain](https://developer.okta.com/docs/guides/find-your-domain/main/)」を参照してください。

1. ステップ1でコピーした**クライアントID**と**シークレット**を[ステップ1](./openid-connect#1-oktaoidcstep-1-create-oidc-app-integration-in-okta)で[Okta管理コンソール](https://login.okta.com/)から貼り付けます。

1. [**保存]**をクリックします。

![sso-oidc-1](/byoc/ja-JP/sso-oidc-1.png)

## ステップ3: Oktaアプリの統合を更新する{#step-3-update-okta-app-integration}{#3-oktastep-3-update-okta-app-integration}

Zilliz CloudにOktaの統合詳細を保存した後、リダイレクトURLが提供されます。

1. 提供されたリダイレクトURLを[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)からコピーしてください。

1. Okta[管理コンソール](https://login.okta.com/)に戻り、Zilliz Cloud用に設定したアプリケーションに移動します。

1. 「**一般設定**(General Settings)」領域で、アプリケーションの設定を編集します。

    1. [**サインインリダイレクトURI**]フィールドに、Zilliz CloudからコピーしたリダイレクトURLを貼り付けます。

    1. 変更を[Okta管理コンソール](https://login.okta.com/)に保存します。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)に戻り、OktaにリダイレクトURLが追加されていることを確認してください。

Zilliz CloudのログインURLも表示されます。設定が完了すると、SSOログインに使用されるため、このURLを保存してください。

![sso-oidc-3](/byoc/ja-JP/sso-oidc-3.png)

## ステップ4:ユーザーにOktaアプリケーションを割り当てる{#step-4-assign-okta-application-to-users}{#4oktastep-4-assign-okta-application-to-users}

ユーザーがSSOを介してZilliz Cloudをアクセス可能にする前に、Oktaアプリケーションをユーザーに割り当てる必要があります。

1. Okta[管理コンソール](https://login.okta.com/)で、**ディレクトリ**>**人**に移動してください。

1. ユーザーを選択し、[**アプリケーション**]タブに移動します。

1. [**アプリケーションの割り当て**]をクリックして、Zilliz Cloudアプリケーションを見つけます。

1. アプリケーションをユーザーに割り当て、変更を保存します。

Zilliz CloudへのSSOアクセスが必要なすべてのユーザーに対して、このプロセスを繰り返してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/oie/ja-jp/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

![sso-4](/byoc/ja-JP/sso-4.png)

## テスト設定{#test-configuration}{#test-configuration}

SSOの設定が機能するようにするには:

1. 新しいブラウザウィンドウを開き、以前に提供されたZilliz Cloud SSOログインURLに移動してください。

1. Oktaのログインページにリダイレクトされるはずです。

1. OktaでZilliz Cloudアプリケーションを割り当てられたユーザーの資格情報を使用してログインしてください。

1. SSOが正しく設定されている場合、認証に成功すると[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを使用してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、Zillizサポートにお問い合わせください。