---
title: "メールアカウント | BYOC"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud でアカウントを登録すると、アカウント情報の管理、ログイン方法の切り替え、Google または GitHub アカウントとの連携解除ができます。 | BYOC"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# メールアカウント

Zilliz Cloud で[アカウントを登録](./register-with-zilliz-cloud)すると、アカウント情報の管理、ログイン方法の切り替え、Google または GitHub アカウントとの連携解除ができます。

## プロフィール情報を変更する\{#modify-your-profile-information}

![modify_account_info](https://zdoc-images.s3.us-west-2.amazonaws.com/modifyaccountinfo.png "modify_account_info")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. 次のアカウント情報を編集できます。

    - 名前

    - 会社

    - 国

</Procedures>

## アカウントのメールアドレスを更新する\{#update-account-email-address}

![update_email_address](https://zdoc-images.s3.us-west-2.amazonaws.com/updateemailaddress.png "update_email_address")

<Admonition type="info" icon="📘" title="📘 注意">

メールアドレスを更新しても、請求書およびアラートの受信者には影響しません。必要に応じて、これらの情報は手動で更新してください。

</Admonition>

## アカウントのパスワードを変更する\{#change-account-password}

![change_password](https://zdoc-images.s3.us-west-2.amazonaws.com/changepassword.png "change_password")

パスワードは 8 文字以上で、次の文字種のうち少なくとも 3 種類を含める必要があります。

- 小文字（a–z）

- 大文字（A–Z）

- 数字（0–9）

- 特殊文字（例: !@#$%^&*）

## MFA を有効化および無効化する\{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth) を参照してください。

## ログイン方法を切り替える\{#switch-login-method}

初回登録時と同じログイン方法を維持する必要がありますが、ログイン方法を切り替える必要がある場合に備えて、Zilliz Cloud は柔軟性を提供しています。

<Admonition type="info" icon="📘" title="Notes">

組織ユーザーの場合、IdP である Okta を使用して Single Sign-on (SSO) を設定できます。これにより、組織ユーザーは Okta で認証し、別途 Zilliz Cloud アカウントを作成することなく、業務用メールアドレスを使ってシームレスに Zilliz Cloud にアクセスできます。詳細については、[Single Sign-on with Okta](./single-sign-on-with-okta) を参照してください。

</Admonition>

### パスワードログインからサードパーティログインに切り替える\{#switch-from-password-login-to-third-party-login}

パスワードログインからサードパーティ（Google または GitHub）ログインに切り替えるには、事前に [MFA を無効化](./multi-factor-auth#disable-mfa) したうえで、[Zilliz Cloud アカウントをサードパーティサービスに連携する](./register-with-zilliz-cloud#linking-to-google-account) 場合と同じ手順に従ってください。

### サードパーティログインからパスワードログインに切り替える\{#switch-from-third-party-login-to-password-login}

Zilliz Cloud アカウントをサードパーティアカウントに連携した後、メールアドレスとパスワードを使ったログインに戻すには、[Zilliz Cloud アカウントとサードパーティサービスとの連携を解除](./email-accounts#unlink-from-third-party-authentication) してください。

### サードパーティログイン間で切り替える\{#switch-between-third-party-logins}

すでに Zilliz Cloud アカウントをサードパーティアカウントに連携しており、別のサードパーティログインに切り替えたい場合は、以下の手順に従ってください。

<Procedures>

1. [現在のサードパーティアカウントとの連携を解除](./email-accounts#unlink-from-third-party-authentication) します。

1. [Zilliz Cloud アカウントを新しく使用したいサードパーティアカウントに連携](./register-with-zilliz-cloud) します。

</Procedures>

## サードパーティ認証との連携を解除する\{#unlink-from-third-party-authentication}

### Google アカウントとの連携を解除する\{#unlink-from-your-google-account}

![unlink_from_google](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgoogle.png "unlink_from_google")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. **Unlink from Google** をクリックします。

1. **Unlink** をクリックします。 

    - すでにパスワードを設定している場合、Google アカウントとの連携は直接解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールで送信されたリンクから新しいパスワードを設定してください。パスワードを設定すると、ログイン方法は業務用メールアドレスと新しいパスワードに変更されます。

</Procedures>

### GitHub アカウントとの連携を解除する\{#unlink-from-your-github-account}

![unlink_from_github](https://zdoc-images.s3.us-west-2.amazonaws.com/unlinkfromgithub.png "unlink_from_github")

<Procedures>

1. **Profile** に移動し、**Account Settings** をクリックします。

1. **Unlink from GitHub** をクリックします。

1. **Unlink** をクリックします。 

    - すでにパスワードを設定している場合、GitHub アカウントとの連携は直接解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールで送信されたリンクから新しいパスワードを設定してください。パスワードを設定すると、ログイン方法は業務用メールアドレスと新しいパスワードに変更されます。

</Procedures>

## アカウントを閉鎖する\{#close-your-account}

<Admonition type="info" icon="📘" title="🚧 Warning">

アカウントを閉鎖すると、そのアカウントを使って Zilliz Cloud にログインできなくなります。考えが変わってアカウントを再開する必要がある場合は、[Zilliz Cloud Support Portal](https://support.zilliz.com/hc/en-us) でサポートチケットを作成してください。30 日後、このアカウント内のすべてのデータは削除されます。

</Admonition>

### 始める前に\{#before-you-start}

先に進む前に、次の条件を満たしていることを確認してください。

- クラスターを含むプロジェクトで自分が唯一のプロジェクト管理者である場合は、[プロジェクトのクラスターを削除](./manage-cluster) してください。

- 自分が唯一の組織所有者である場合は、その組織を削除してください。

### 手順\{#procedures}

![delete-account-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-account-en.png "delete-account-en")

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. 右上のプロフィールアイコンをクリックし、**Account Settings** をクリックします。

1. **Account** **Settings** ウィンドウで、**Close Account** ボタンをクリックします。

1. Zilliz Cloud を離れる理由をお知らせいただき、フィードバックを送信してください。

1. テキストボックスにアカウントのメールアドレスを再入力します。**Send Verification Code** をクリックし、メールの受信トレイで受け取ったコードを入力します。以下の情報を読み、チェックボックスにチェックを入れます。続行するには **Next** をクリックします。

1. アカウントの削除が正常に完了すると、メール通知が送信されます。

</Procedures>
