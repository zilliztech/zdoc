---
title: "メールアカウント | Cloud"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud でアカウントを登録すると、アカウント情報の管理、ログイン方法の切り替え、Google アカウントや GitHub アカウントとの連携解除を行えます。 | Cloud"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# メールアカウント

Zilliz Cloud で[アカウントを登録](./register-with-zilliz-cloud)すると、アカウント情報の管理、ログイン方法の切り替え、Google アカウントや GitHub アカウントとの連携解除を行えます。

## プロフィール情報の変更\{#modify-your-profile-information}

![modify_account_info](https://zdoc-images.s3.us-west-2.amazonaws.com/modifyaccountinfo.png "modify_account_info")

<Procedures>

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. 以下のアカウント情報を編集できます。

    - 名前

    - 会社名

    - 国/地域

</Procedures>

## アカウントのメールアドレスを更新する\{#update-account-email-address}

![update_email_address](https://zdoc-images.s3.us-west-2.amazonaws.com/updateemailaddress.png "update_email_address")

<Admonition type="info" icon="📘" title="📘 Notes">

メールアドレスを更新しても、請求書やアラートの送信先は変更されません。必要な場合は、これらの情報を手動で更新してください。

</Admonition>

## アカウントのパスワードを変更する\{#change-account-password}

![change_password](https://zdoc-images.s3.us-west-2.amazonaws.com/changepassword.png "change_password")

パスワードは 8 文字以上で、以下の文字種のうち少なくとも 3 種類を含む必要があります。

- 小文字 (a–z)

- 大文字 (A–Z)

- 数字 (0–9)

- 特殊文字 (例: !@#$%^&*)

## MFA の有効化と無効化\{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth) を参照してください。

## ログイン方法を切り替える\{#switch-login-method}

基本的には初回登録時と同じログイン方法を使用しますが、必要に応じて Zilliz Cloud でログイン方法を切り替えることも可能です。

<Admonition type="info" icon="📘" title="Notes">

組織ユーザーの場合は、ID プロバイダー (IdP) の Okta を使用してシングルサインオン (SSO) を設定できます。これにより、組織のユーザーは Okta で認証した後、個別に Zilliz Cloud アカウントを作成することなく、業務用メールアドレスで Zilliz Cloud にシームレスにアクセスできます。詳細については、[Okta を使用したシングルサインオン](./single-sign-on-with-okta) を参照してください。

</Admonition>

### パスワードログインからサードパーティログインへの切り替え\{#switch-from-password-login-to-third-party-login}

パスワードログインからサードパーティ (Google または GitHub) ログインへ切り替えるには、事前に [MFA を無効化](./multi-factor-auth#disable-mfa)した上で、[Zilliz Cloud アカウントをサードパーティサービスに連携する](./register-with-zilliz-cloud#linking-to-google-account)場合と同じ手順を実行します。

### サードパーティログインからパスワードログインへの切り替え\{#switch-from-third-party-login-to-password-login}

Zilliz Cloud アカウントをサードパーティアカウントに連携した後、メールアドレスとパスワードによるログインに戻すには、[Zilliz Cloud アカウントとサードパーティサービスの連携を解除](./email-accounts#unlink-from-third-party-authentication)します。

### サードパーティログイン間の切り替え\{#switch-between-third-party-logins}

Zilliz Cloud アカウントがすでにサードパーティアカウントと連携されており、別のサードパーティログインに切り替えたい場合は、以下の手順に従います。

<Procedures>

1. [現在のサードパーティアカウントとの連携を解除](./email-accounts#unlink-from-third-party-authentication)します。

1. [Zilliz Cloud アカウントを新しいサードパーティアカウントに連携](./register-with-zilliz-cloud)します。

</Procedures>

## サードパーティ認証との連携を解除する\{#unlink-from-third-party-authentication}

### Google アカウントとの連携を解除する\{#unlink-from-your-google-account}

![unlink_from_google](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgoogle.png "unlink_from_google")

<Procedures>

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **Google との連携を解除**をクリックします。

1. **連携を解除**をクリックします。

    - パスワードを設定済みの場合は、Google アカウントとの連携がすぐに解除され、元のメールアドレスとパスワードでログインできるようになります。

    - パスワードを未設定の場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードの設定が完了すると、ログイン方法が業務用メールアドレスと新しいパスワードに切り替わります。

</Procedures>

### GitHub アカウントとの連携を解除する\{#unlink-from-your-github-account}

![unlink_from_github](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgithub.png "unlink_from_github")

<Procedures>

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **GitHub との連携を解除**をクリックします。

1. **連携を解除**をクリックします。

    - パスワードを設定済みの場合は、GitHub アカウントとの連携がすぐに解除され、元のメールアドレスとパスワードでログインできるようになります。

    - パスワードを未設定の場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードの設定が完了すると、ログイン方法が業務用メールアドレスと新しいパスワードに切り替わります。

</Procedures>

## アカウントを閉じる\{#close-your-account}

<Admonition type="info" icon="📘" title="🚧 Warning">

アカウントを閉じると、そのアカウントで Zilliz Cloud にログインできなくなります。後でアカウントを再開する必要が生じた場合は、[Zilliz Cloud サポートポータル](https://support.zilliz.com/hc/en-us) からサポートチケットを作成してください。30 日後に当該アカウントのすべてのデータが消去されます。

</Admonition>

### 事前確認事項\{#before-you-start}

続行する前に、以下の条件を満たしていることを確認してください。

- クラスターが存在するプロジェクトで唯一のプロジェクト管理者である場合は、[プロジェクト内のクラスターを削除](./manage-cluster)してください。

- 唯一の組織オーナーである場合は、組織を削除してください。

### 操作手順\{#procedures}

![delete-account-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-account-en.png "delete-account-en")

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 右上のプロフィールアイコンをクリックし、**アカウント設定**を選択します。

1. **アカウント設定**ウィンドウで、**アカウントを閉じる**ボタンをクリックします。

1. Zilliz Cloud を利用しなくなる理由を入力し、フィードバックを送信します。

1. テキストボックスにアカウントのメールアドレスを再入力します。**確認コードを送信**をクリックし、メール受信トレイに届いたコードを入力してください。以下の内容を確認してチェックボックスにチェックを入れ、**次へ**をクリックして進みます。

1. アカウントが正常に削除されると、メールで通知が届きます。

</Procedures>
