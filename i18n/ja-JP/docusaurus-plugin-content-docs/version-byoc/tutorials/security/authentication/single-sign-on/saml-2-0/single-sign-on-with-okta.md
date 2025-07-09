---
title: "オクタ | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "オクタ"
beta: CONTACT SALES
notebook: FALSE
description: "このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。 | BYOC"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - okta
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# オクタ

このトピックでは、SAML 2.0プロトコルを使用してOktaでシングルサインオン(SSO)を構成する方法について説明します。

![KywHwe7VIhcwsAbecTpcEsL3njb](/img/KywHwe7VIhcwsAbecTpcEsL3njb.png)

<Admonition type="info" icon="📘" title="ノート">

<p>SSO機能は<strong>一般提供</strong>中ですが、アクセスするには<a href="https://zilliz.com/contact-sales">連絡する</a> <a href="https://zilliz.com/contact-sales"> セールス</a>をお願いします。</p>

</Admonition>

## 始める前に{#before-you-start}

SSO設定を開始する前に、次の条件が満たされていることを確認してください。

- あなたは、SSOを設定する組織の組織オーナーです。

- Oktaコンソールには管理者権限があります。詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm)を参照してください。

## ステップ1: OktaでSAMLアプリの統合を作成する{#step-1-create-saml-app-integration-in-okta}

1. [Okta管理コンソール](https://login.okta.com/)にログインしてください。

1. 左側のナビゲーションペインで、**アプリケーション**>**アプリケーション**を選択してください。

1. 「Create App Integration」をクリックしてください。

1. 「新しいアプリ統合を作成する」ダイアログボックスで、「SAML 2.0」を選択し、「次へ」をクリックしてください。

1. カスタムアプリ名を設定し、**次へ**をクリックします。

1. 「SAMLの設定」ステップでは、いくつかの情報を提供する必要があります。

    - **シングルサインオンURL**:**https://cloud.zilliz.com/sso/saml/acs**(今のところ、プレースホルダー値を使用してください。後で更新します。)

    - オーディエンス制限:値を「zilliz」に設定してください。

1. 「次へ」をクリックして設定を確認し、「完了」をクリックしてください。そうすると、アプリケーションページにリダイレクトされます。

    ![sso-2-1](/img/sso-2-1.png)

1. 「サインオン」タブの「SAML 2.0」カードで、「詳細」をクリックしてください。次に、以下の資格情報と証明書をコピーしてください:「サインオンURL」、「発行者」、「署名証明書」。これは、Zilliz CloudコンソールでIdPを設定するために必要です。

    Oktaの設定の詳細については、[Okta公式ドキュメント](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm)を参照してください。

    ![sso-2-2](/img/sso-2-2.png)

## ステップ2: Zilliz CloudでSAML SSOを設定する{#step-2-configure-saml-sso-on-zilliz-cloud}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションペインで、**設定**を選択してください。

1. 「設定」ページで、「シングルサインオン（SSO）」セクションを見つけ、「設定」をクリックしてください。

1. 「シングルサインオン(SSO)の設定」ダイアログには、「SAML 2.0」と「Okta Workforce」の2つのオプションが表示されます。このガイドでは、「SAML 2.0」を選択してSAML 2.0の統合を進めてください。

1. 「シングルサインオン（SSO）の構成」ステップで、[ステップ1](./single-sign-on-with-okta)でOktaから取得した資格情報と証明書を使用してIdP設定を入力してください。

    - **シングルサインオンURL**: Oktaから取得した**サインオンURL**値をこのフィールドに貼り付けます。このURLはOktaからSAML認証要求を受信します。

    - エンティティID: Oktaから取得したIssuer値をこのフィールドに貼り付けます。この識別子は、SAMLリクエスト、レスポンス、またはアサーションの発行者を区別するために使用され、OktaからのメッセージがZilliz Cloudによって正しく認識され、受け入れられるようにします。

    - 証明書: Oktaから取得した署名証明書の値をこのフィールドに貼り付けます。この公開鍵証明書は、SAMLアサーションのデジタル署名を検証するために使用され、Zilliz CloudがSAMLデータのソースを安全に認証できるようにします。

1. 続行するには、**保存**をクリックしてください。

![sso-saml-1](/img/sso-saml-1.png)

## ステップ3: Oktaアプリの統合を更新する{#step-3-update-okta-app-integration}

Zilliz CloudにOktaの統合詳細を保存した後、リダイレクトURLが提供されます。

1. Zilliz Cloudコンソールから提供されたリダイレクトURLをコピーしてください。

1. Okta管理コンソールに戻り、作成したZilliz Cloudアプリケーションに移動してください。

1. SAML設定を編集し、Zilliz CloudからコピーしたリダイレクトURLで以下のフィールドを更新してください。 

    - **シングルサインオンURL**

    - **リンク先URL**

1. Okta Admin Consoleで変更を保存します。

1. Zilliz Cloudコンソールに戻り、OktaにリダイレクトURLを追加したことを確認してください。

Zilliz CloudのログインURLも表示されます。設定が完了すると、SSOログインに使用されるため、このURLを保存してください。

![sso-3](/img/sso-3.png)

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

1. SSOが正しく設定されている場合、認証に成功するとZilliz Cloudコンソールにリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを介してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、Zillizサポートにお問い合わせください。