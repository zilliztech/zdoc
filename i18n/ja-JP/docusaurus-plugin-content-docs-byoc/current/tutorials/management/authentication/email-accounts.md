---
title: "メールアカウント | BYOC"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud にアカウントを登録すると、アカウント情報の管理、ログイン方法の切り替え、Google アカウントまたは GitHub アカウントとの連携解除を行えます。 | BYOC"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# メールアカウント

Zilliz Cloud で[アカウントを登録](./register-with-zilliz-cloud)すると、アカウント情報の管理、ログイン方法の切り替え、Google アカウントまたは GitHub アカウントとの連携解除を行えます。

## コンソールセッション\{#console-session}

Zilliz Cloud コンソールにサインインした後、コンソールを使い続けている間はログインセッションが有効なまま維持されます。6 時間操作がないとセッションが失効し、再度サインインする必要があります。

この非アクティブタイムアウトは Zilliz Cloud コンソールのセッションに適用されます。API キー、クラスターの認証情報、既存の Zilliz Cloud クラスターへの接続には影響しません。

## プロフィール情報の変更\{#modify-your-profile-information}

![modify_account_info](https://zdoc-images.s3.us-west-2.amazonaws.com/modifyaccountinfo.png "modify_account_info")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. 以下のアカウント情報を編集できます。

    - 名前

    - 会社名

    - 国/地域

</Procedures>

## アカウントのメールアドレスを更新\{#update-account-email-address}

![update_email_address](https://zdoc-images.s3.us-west-2.amazonaws.com/updateemailaddress.png "update_email_address")

<Admonition type="info" title="Notes">

メールアドレスを更新しても、請求書やアラートの受信者は変更されません。必要に応じて、これらの情報を手動で更新してください。

</Admonition>

## アカウントのパスワードを変更\{#change-account-password}

![change_password](https://zdoc-images.s3.us-west-2.amazonaws.com/changepassword.png "change_password")

パスワードは 8 文字以上で、以下の文字種のうち 3 種類以上を含む必要があります。

- 小文字（a–z）

- 大文字（A–Z）

- 数字（0–9）

- 特殊文字（例: !@#&#36;%^&&ast;）

## MFA の有効化と無効化\{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth) を参照してください。

## ログイン方法を切り替える\{#switch-login-method}

初回登録時と同じログイン方法を維持する必要がありますが、ログイン方法を切り替える必要がある場合は、Zilliz Cloud が柔軟に対応します。

<Admonition type="info" title="Notes">

組織のユーザーは、ID プロバイダー（IdP）である Okta を使用してシングルサインオン（SSO）を設定できます。これにより、組織のユーザーは Okta で認証した後、個別に Zilliz Cloud アカウントを作成することなく、業務用メールアドレスを使用して Zilliz Cloud にシームレスにアクセスできます。詳細については、[Okta を使用したシングルサインオン](./single-sign-on-with-okta) を参照してください。

</Admonition>

### パスワードログインからサードパーティログインへ切り替える\{#switch-from-password-login-to-third-party-login}

パスワードログインからサードパーティ（Google または GitHub）ログインへ切り替えるには、事前に [MFA を無効化](./multi-factor-auth#disable-mfa)した上で、[Zilliz Cloud アカウントをサードパーティサービスにリンクする](./register-with-zilliz-cloud#linking-to-google-account)場合と同じ手順を実行します。

### サードパーティログインからパスワードログインへ切り替える\{#switch-from-third-party-login-to-password-login}

Zilliz Cloud アカウントをサードパーティアカウントにリンクした後、メールアドレスとパスワードによるログインに戻すには、[Zilliz Cloud アカウントとサードパーティサービスの連携を解除](./email-accounts#unlink-from-third-party-authentication)するだけです。

### サードパーティログイン間での切り替え\{#switch-between-third-party-logins}

Zilliz Cloud アカウントをサードパーティアカウントにすでにリンクしていて、別のサードパーティログインに切り替えたい場合は、以下の手順に従います。

<Procedures>

1. [現在のサードパーティアカウントとの連携を解除](./email-accounts#unlink-from-third-party-authentication)します。

1. [Zilliz Cloud アカウントを新しいサードパーティアカウントにリンク](./register-with-zilliz-cloud)します。

</Procedures>

## サードパーティ認証との連携を解除する\{#unlink-from-third-party-authentication}

### Google アカウントとの連携を解除する\{#unlink-from-your-google-account}

![unlink_from_google](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgoogle.png "unlink_from_google")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. **Unlink from Google** をクリックします。

1. **Unlink** をクリックします。

    - パスワードをすでに設定している場合は、Google アカウントとの連携が直接解除され、元のメールアドレスとパスワードでログインできるようになります。

    - パスワードをまだ設定していない場合は、メールで送信されたリンクから新しいパスワードを設定してください。パスワードを設定すると、ログイン方法が業務用メールアドレスと新しいパスワードに変更されます。

</Procedures>

### GitHub アカウントとの連携を解除する\{#unlink-from-your-github-account}

![unlink_from_github](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgithub.png "unlink_from_github")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. **Unlink from GitHub** をクリックします。

1. **Unlink** をクリックします。

    - パスワードをすでに設定している場合は、GitHub アカウントとの連携が直接解除され、元のメールアドレスとパスワードでログインできるようになります。

    - パスワードをまだ設定していない場合は、メールで送信されたリンクから新しいパスワードを設定してください。パスワードを設定すると、ログイン方法が業務用メールアドレスと新しいパスワードに変更されます。

</Procedures>

## アカウントを閉じる\{#close-your-account}

<Admonition type="warning" title="Warning">

アカウントを閉じると、そのアカウントを使用して Zilliz Cloud にログインできなくなります。気が変わってアカウントを再開する必要がある場合は、[Zilliz Cloud サポートポータル](https://support.zilliz.com/hc/en-us) でサポートチケットを作成してください。30 日後、このアカウント内のすべてのデータは消去されます。

</Admonition>

### 事前準備\{#before-you-start}

続行する前に、以下の条件を満たしていることを確認してください。

- クラスターがあるプロジェクトで唯一のプロジェクト管理者である場合は、[プロジェクトのクラスターを削除](./manage-cluster)してください。

- 唯一の組織オーナーである場合は、組織を削除してください。

### 手順\{#procedures}

![delete-account-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-account-en.png "delete-account-en")

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 右上隅のプロフィールアイコンをクリックし、**Account Settings** をクリックします。

1. **Account** **Settings** ウィンドウで、**Close Account** ボタンをクリックします。

1. Zilliz Cloud を利用しなくなる理由を入力し、フィードバックを送信します。

1. テキストボックスにアカウントのメールアドレスを再入力します。**Send Verification Code** をクリックし、メールの受信トレイに届いたコードを入力します。以下の情報を読み、チェックボックスにチェックを入れます。**Next** をクリックして続行します。

1. アカウントが正常に削除されると、メール通知を受け取ります。

</Procedures>
