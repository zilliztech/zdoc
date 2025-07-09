---
title: "Googleワークスペース | BYOC"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Googleワークスペース"
beta: CONTACT SALES
notebook: FALSE
description: "Googleワークスペースは、Googleが提供する生産性とコラボレーションツールの包括的なスイートです。Zilliz Cloudを使用すると、SAMLプロトコルを介してGoogle Workspaceとのシングルサインオン（SSO）を設定できます。 | BYOC"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - google
  - workspace
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source

---

import Admonition from '@theme/Admonition';


# Googleワークスペース

[Googleワークスペース](https://workspace.google.com/lp/business/)は、Googleが提供する生産性とコラボレーションツールの包括的なスイートです。Zilliz Cloudを使用すると、SAMLプロトコルを介してGoogle Workspaceとのシングルサインオン（SSO）を設定できます。

![LsmAwFbPthojH3bLRtEcogRinwc](/img/LsmAwFbPthojH3bLRtEcogRinwc.png)

<Admonition type="info" icon="📘" title="ノート">

<p>SSO機能は<strong>一般提供</strong>中ですが、アクセスするには<a href="https://zilliz.com/contact-sales">連絡する</a> <a href="https://zilliz.com/contact-sales"> セールス</a>をお願いします。</p>

</Admonition>

## 始める前に{#before-you-start}

- Google管理コンソールで管理者の役割が必要です。

- あなたは、SSOを設定するZilliz Cloud組織の組織オーナーです。

## ステップ1: Google管理コンソールでSAMLアプリを作成する{#step-1-create-saml-app-in-google-admin-console}

1. [Google管理コンソール](https://admin.google.com)にログインしてください。

1. 左側のナビゲーションペインで、「アプリ」>「Webおよびモバイルアプリ」を選択します。次に、「アプリの追加」>「カスタムSAMLアプリの追加」を選択します。

    ![M6xfbozsioV9SdxlLFOcCmRUnch](/img/M6xfbozsioV9SdxlLFOcCmRUnch.png)

1. カスタムSAMLアプリの名前と説明を入力してください。この情報はアプリのユーザーと共有されます。**CONTINUE**をクリックしてください。

    ![sso-google-workspace-1](/img/sso-google-workspace-1.png)

1. 表示されるページには、SSO URL、エンティティID、証明書などの詳細が表示されます。次のステップで必要になるため、これらの詳細をコピーしてください。

    ![sso-google-workspace-2](/img/sso-google-workspace-2.png)

## ステップ2: Zilliz Cloud上でIdPメタデータを提供する{#step-2-provide-idp-metadata-on-zilliz-cloud}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインし、SSOを設定したい組織に移動してください。

1. 左側のナビゲーションペインで、**設定**をクリックしてください。

1. 「設定」ページで、「シングルサインオン（SSO）」セクションを見つけ、「設定」をクリックしてください。

    ![IAf9b7w2KovCaHxCT7Kc1hMdnMe](/img/IAf9b7w2KovCaHxCT7Kc1hMdnMe.png)

1. 「シングルサインオン(SSO)の構成」ダイアログボックスで、「SAML 2.0」を選択してください。

    ![sso-google-workspace-3](/img/sso-google-workspace-3.png)

1. 表示されるダイアログボックスで、デフォルトのIdPメタデータをGoogle管理コンソールからコピーした値に置き換えます。

    1. シングルサインオンURL: GoogleからのSSO URLを貼り付けてください。

    1. **エンティティID**: Googleの**エンティティID**を貼り付けてください。

    1. **証明書**: Googleからの**証明書**を貼り付けてください。

    フィールドが更新されたら、**保存**をクリックしてください。

    ![sso-google-workspace-4](/img/sso-google-workspace-4.png)

1. 「**SSO設定を完了するためのリダイレクトURLの確認**」ダイアログボックスで、Zilliz Cloudが提供するリダイレクトURLをコピーしてください。

    ![sso-google-workspace-5](/img/sso-google-workspace-5.png)

## ステップ3: Google管理コンソールでリダイレクトURLを確認する{#step-3-verify-redirect-url-in-google-admin-console}

1. [Google管理コンソール](https://admin.google.com)でカスタムSAMLアプリを構成していたウィンドウに戻ります。

1. 「サービスプロバイダーの詳細」ステップで、以下を更新してください:

    - **ACS URL**: Zilliz CloudからコピーしたリダイレクトURLを貼り付けてください。

    - **エンティティID**:**zilliz**を入力してください。

    その後、**続行**をクリックしてください。

    ![sso-google-workspace-6](/img/sso-google-workspace-6.png)

1. [属性]セクションで、[マッピングの追加]をクリックして、サービスプロバイダーの要件に基づいてユーザー属性をマッピングします。

    - **基本情報**:**プライマリメール**を選択してください。

    - **アプリの属性**:**email**を入力してください。

    ![sso-google-workspace-7](/img/sso-google-workspace-7.png)

    次に、**完了**をクリックしてください。作成したアプリの詳細ページにリダイレクトされます。

## ステップ4: SAMLアプリをオンにする{#step-4-turn-on-your-saml-app}

1. 新しく作成されたアプリの詳細ページで、**ユーザーアクセス**エリアを見つけ、サービスステータスを編集するためにクリックしてください。

    ![Y4Tjb3r0KoHzwgxpC4ocOfWVnph](/img/Y4Tjb3r0KoHzwgxpC4ocOfWVnph.png)

1. 組織内の全員に対してサービスをオンまたはオフにするには、全員に対して「オン」または「オフ」をクリックし、「保存」をクリックしてください。

1. (オプション)組織単位のサービスをオンまたはオフにするには:

    1. 左側で、組織単位を選択します。

    1. サービスの状態を変更するには、**ON**または**OFF**を選択してください。

    1. 一つ選ぶ:

        - **サービスステータス**が**継承**に設定されており、親の設定が変更されても更新された設定を維持したい場合は、**上書き**をクリックしてください。

        - 「サービスステータス」が「オーバーライド」に設定されている場合は、「継承」をクリックして親と同じ設定に戻すか、「保存」をクリックして親の設定が変更されても新しい設定を維持してください。
注: [組織の構造](https://support.google.com/a/answer/4352075)について詳しく学びましょう。

1. （オプション）組織単位または組織単位内の一連のユーザーのサービスを有効にするには、アクセスグループを選択します。詳細については、[グループを使用してサービスアクセスをカスタマイズする](https://support.google.com/a/answer/9050643)を参照してください。

1. ユーザーがSAMLアプリにサインインする際に使用するメールアドレスが、Googleドメインにサインインする際に使用するメールアドレスと一致していることを確認してください。

## テスト設定{#test-configuration}

SSOの設定が機能するようにするには:

1. 新しいブラウザウィンドウを開き、以前に提供されたZilliz Cloud SSOログインURLに移動してください。

1. Google Workspaceのログインページにリダイレクトされるはずです。

1. Google管理コンソールでアプリへのアクセスを許可されたユーザーの資格情報を使用してログインします。

1. SSOが正しく設定されている場合、認証に成功するとZilliz Cloudコンソールにリダイレクトされます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、SSOを介してログインしたユーザーには、組織メンバーの役割が付与されます。権限を拡張するには、Zilliz Cloudコンソールで役割を変更できます。</p>

</Admonition>

セットアップやテストの過程で問題が発生した場合は、[Zillizサポート](https://support.zilliz.com/hc/en-us)にお問い合わせください。