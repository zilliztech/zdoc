---
title: "SAML 2.0ダウンロード | BYOC"
slug: /saml-2-0
sidebar_label: "Configure SAML SSO with Okta"
beta: PUBLIC
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。 | BYOC"
type: origin
token: B7MUwxwWLi4KBLkNVC7cwJtVn8b
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# SAML 2.0ダウンロード

このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。

SAML 2.0は、多くのIDプロバイダで使用されている標準プロトコルであり、幅広い互換性を提供します。コンプライアンス上の理由から組織がSAML 2.0を必要とする場合は、このオプションを選択してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/ja-jp/content/topics/apps/apps-about-saml.htm)を参照してください。

![AeT1wzWGeh44b1bb4qwci5dnnzJ](/byoc/ja-JP/AeT1wzWGeh44b1bb4qwci5dnnzJ.png)

## 始める前に{#before-you-start}

SSO設定を開始する前に、次の条件が満たされていることを確認してください。

- SSOを設定する組織の組織オーナーです。

- Oktaコンソールには管理者権限があります。詳細については、[Okta公式ドキュメント](https://help.okta.com/ja-jp/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

## ステップ1: OktaでSAMLアプリの統合を作成する{#step-1-create-saml-app-integration-in-okta}

1. Okta[管理コンソール](https://login.okta.com/)にログインします。

1. 左側のナビゲーションウィンドウで、[**アプリケーション**]>[**アプリケーション**]を選択します。

1. [**Create App Integration**]をクリックします。

1. 「**新しいアプリ統合を作成**」ダイアログボックスで、「**SAML 2.0**」を選択し、「**次**へ」をクリックしてください。

1. カスタムアプリ名を設定し、[**次**へ]をクリックします。

1. 「**SAMLの設定**」ステップでは、いくつかの情報を提供する必要があります。今のところ、任意のプレースホルダ値を使用してください。例:

    - **シングルサインオンURL**:**https://cloud.zilliz.com/sso/saml/acs**（後で更新します）

    - **オーディエンス制限**:**https://cloud.zilliz.com**（後で更新します）

1. 「**次**へ」をクリックして設定を確認し、「**完了**」をクリックします。アプリケーションページにリダイレクトされます。

    ![sso-2-1](/byoc/ja-JP/sso-2-1.png)

1. [**SAML 2.0**]カードの[**Sign On**]タブで[**詳細**]をクリックします。次に、次の認証情報と証明書をコピーします:**Sign on URL**、**Issuer**、**Signing Certificate**。これは、Zilliz CloudコンソールでIdPを設定するために必要です。

    Oktaの設定の詳細については、[Okta公式ドキュメント](https://help.okta.com/ja-jp/content/topics/apps/apps_app_integration_wizard_saml.htm)を参照してください。

    ![sso-2-2](/byoc/ja-JP/sso-2-2.png)

## ステップ2: Zilliz CloudでSAML SSOを設定する{#step-2-configure-saml-sso-on-zilliz-cloud}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションウィンドウで、[**設定**]を選択します。

1. [**設定**]ページで、[**シングルサインオン(SSO)**]セクションを見つけ、[**構成**]をクリックします。

1. [**シングルサインオン（SSO）**の設定]ダイアログには、**SAML 2.0**と**Okta Workforce**の2つのオプションが表示されます。このガイドでは、**SAML 2.0**を選択してSAML 2.0の統合を進めてください。

1. [**シングルサインオン(SSO)の構成**]ステップで、[ステップ1](./saml-2-0#1-oktasamlstep-1-create-saml-app-integration-in-okta)でOktaから取得した資格情報と証明書を使用してIdP設定を入力します。

    - **シングルサインオンURL**: Oktaから取得した**サインオンURL**値をこのフィールドに貼り付けます。このURLはOktaからSAML認証要求を受け取ります。

    - **エンティティID**: Oktaから取得した**発行者**値をこのフィールドに貼り付けます。この識別子は、SAMLリクエスト、レスポンス、またはアサーションの発行者を区別するために使用され、OktaからのメッセージがZilliz Cloudによって正しく認識され、受け入れられるようにします。

    - **証明書**: Oktaから取得した**署名証明書**の値をこのフィールドに貼り付けます。この公開鍵証明書は、SAMLアサーションのデジタル署名を検証するために使用され、Zilliz CloudがSAMLデータのソースを安全に認証できるようにします。

1. [**保存]**をクリックします。

![sso-saml-1](/byoc/ja-JP/sso-saml-1.png)

## ステップ3: Oktaアプリの統合を更新する{#step-3-update-okta-app-integration}

Zilliz CloudにOktaの統合詳細を保存した後、リダイレクトURLが提供されます。

1. Zilliz Cloudコンソールから提供されたリダイレクトURLをコピーしてください。

1. Okta管理コンソールに戻り、作成したZilliz Cloudアプリケーションに移動してください。

1. SAML設定を編集し、Zilliz CloudからコピーしたリダイレクトURLで以下のフィールドを更新してください。

    - **シングルサインオンURL**

    - **オーディエンスの制限**

1. Okta Admin Consoleで変更を保存します。

1. Zilliz Cloudコンソールに戻り、OktaにリダイレクトURLを追加したことを確認してください。

Zilliz CloudのログインURLも表示されます。設定が完了すると、SSOログインに使用されるため、このURLを保存してください。

![sso-3](/byoc/ja-JP/sso-3.png)

## ステップ4:ユーザーにOktaアプリケーションを割り当てる{#step-4-assign-okta-application-to-users}

ユーザーがSSOを介してZilliz Cloudをアクセス可能にする前に、Oktaアプリケーションをユーザーに割り当てる必要があります。

1. Okta[管理コンソール](https://login.okta.com/)で、**ディレクトリ**>**人**に移動してください。

1. ユーザーを選択し、[**アプリケーション**]タブに移動します。

1. [**アプリケーションの割り当て**]をクリックして、Zilliz Cloudアプリケーションを見つけます。

1. アプリケーションをユーザーに割り当て、変更を保存します。

Zilliz CloudへのSSOアクセスが必要なすべてのユーザーに対して、このプロセスを繰り返してください。詳細については、[Okta公式ドキュメント](https://help.okta.com/oie/ja-jp/content/topics/provisioning/lcm/lcm-assign-app-groups.htm)を参照してください。

![sso-4](/byoc/ja-JP/sso-4.png)

## テスト設定{#test-configuration}

SSOの設定が機能するようにするには:

1. 新しいブラウザウィンドウを開き、以前に提供されたZilliz Cloud SSOログインURLに移動してください。

1. Oktaのログインページにリダイレクトされるはずです。

1. OktaでZilliz Cloudアプリケーションを割り当てられたユーザーの資格情報を使用してログインしてください。

1. SSOが正しく設定されている場合、認証に成功するとZilliz Cloudコンソールにリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを使用してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、Zillizサポートにお問い合わせください。