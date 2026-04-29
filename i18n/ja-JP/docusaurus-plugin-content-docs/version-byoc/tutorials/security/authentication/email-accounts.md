---
title: "E メールアカウント | BYOC"
slug: /email-accounts
sidebar_key: email-accounts
sidebar_label: "E メールアカウント"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud にアカウントを登録すると、アカウント情報の管理、ログイン方法の変更、Google または GitHub アカウントとの連携解除が可能になります。| BYOC"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - e メールアカウント

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Eメールアカウント

Zilliz Cloud に [アカウントを登録](./register-with-zilliz-cloud) すると、アカウント情報の管理、ログイン方法の切り替え、Google または GitHub アカウントとのリンク解除が可能になります。

## プロファイル情報の変更\{#modify-your-profile-information}

![modify_account_info](https://zdoc-images.s3.us-west-2.amazonaws.com/modify_account_info.png "modify_account_info")

<Procedures>

1. **プロファイル**に移動し、**アカウント設定**をクリックします。

1. 以下のアカウント情報を編集できます：

    - 名前

    - 会社

    - 国

</Procedures>

## アカウントの E メールアドレスの更新\{#update-account-email-address}

![update_email_address](https://zdoc-images.s3.us-west-2.amazonaws.com/update_email_address.png "update_email_address")

<Admonition type="info" icon="📘" title="Notes">

<p>E メールアドレスを更新しても、請求書やアラートの受信者には影響しません。必要に応じて、これらの情報を手動で更新してください。</p>

</Admonition>

## アカウントパスワードの変更\{#change-account-password}

![change_password](https://zdoc-images.s3.us-west-2.amazonaws.com/change_password.png "change_password")

パスワードは最低 8 文字以上で、以下の文字種のうち少なくとも 3 つを含む必要があります：

- 小文字（a–z）

- 大文字（A–Z）

- 数字（0–9）

- 特殊文字（例：!@#$%^&*）

## MFA の有効化と無効化\{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth) を参照してください。

## ログイン方法の切り替え\{#switch-login-method}

最初の登録時と同じログイン方法を維持する必要がありますが、Zilliz Cloud ではログイン方法を変更する必要がある場合に柔軟に対応しています。

<Admonition type="info" icon="📘" title="Notes">

<p>組織ユーザーの場合、IdP（アイデンティティプロバイダー）である Okta とシングルサインオン（SSO）を設定できます。これにより、組織ユーザーは Okta で認証を行い、別途 Zilliz Cloud アカウントを作成することなく、ビジネス E メールを使用して Zilliz Cloud にシームレスにアクセスできます。詳細については、<a href="./single-sign-on-with-okta">Okta によるシングルサインオン</a> を参照してください。</p>

</Admonition>

### パスワードログインからサードパーティログインへの切り替え\{#switch-from-password-login-to-third-party-login}

パスワードログインからサードパーティ（Google または GitHub）ログインに切り替えるには、[Zilliz Cloud アカウントをサードパーティサービスにリンクする](./register-with-zilliz-cloud#linking-to-google-account) のと同じ手順に従ってください。その前に、[MFA を無効化](./multi-factor-auth#disable-mfa) しておく必要があります。

### サードパーティログインからパスワードログインへの切り替え\{#switch-from-third-party-login-to-password-login}

Zilliz Cloud アカウントをサードパーティアカウントにリンクした後、E メールとパスワードを使用したログインに戻すには、単に [Zilliz Cloud アカウントとサードパーティサービスのリンクを解除](./email-accounts#unlink-from-third-party-authentication) してください。

### サードパーティログイン間の切り替え\{#switch-between-third-party-logins}

すでに Zilliz Cloud アカウントをサードパーティアカウントにリンクしており、別のサードパーティログインに切り替えたい場合は、以下の手順に従ってください。

<Procedures>

1. [現在のサードパーティアカウントとのリンクを解除](./email-accounts#unlink-from-third-party-authentication) します。

1. [Zilliz Cloud アカウントを新しい希望のサードパーティアカウントにリンク](./register-with-zilliz-cloud) します。

</Procedures>

## サードパーティ認証からのリンク解除\{#unlink-from-third-party-authentication}

### Google アカウントとのリンク解除\{#unlink-from-your-google-account}

![unlink_from_google](https://zdoc-images.s3.us-west-2.amazonaws.com/unlink_from_google.png "unlink_from_google")

<Procedures>

1. **プロファイル**に移動し、**アカウント設定**をクリックします。

1. **Google とのリンクを解除**をクリックします。

1. **リンクを解除**をクリックします。

    - すでにパスワードを設定している場合、Google アカウントは直接リンク解除され、元の E メールとパスワードでログインできます。

    - まだパスワードを設定していない場合、E メールに送信されたリンクを通じて新しいパスワードを設定してください。パスワードが設定されると、ログイン方法は勤務先 E メールと新しいパスワードに変更されます。

</Procedures>

### GitHub アカウントとのリンク解除\{#unlink-from-your-github-account}

![unlink_from_github](https://zdoc-images.s3.us-west-2.amazonaws.com/unlink_from_github.png "unlink_from_github")

<Procedures>

1. **プロファイル**に移動し、**アカウント設定**をクリックします。

1. **GitHub とのリンクを解除**をクリックします。

1. **リンクを解除**をクリックします。

    - すでにパスワードを設定している場合、GitHub アカウントは直接リンク解除され、元の E メールとパスワードでログインできます。

    - まだパスワードを設定していない場合、E メールに送信されたリンクを通じて新しいパスワードを設定してください。パスワードが設定されると、ログイン方法は勤務先 E メールと新しいパスワードに変更されます。

</Procedures>

## アカウントの閉鎖\{#close-your-account}

<Admonition type="caution" icon="🚧" title="Warning">

<p>アカウントが閉鎖されると、Zilliz Cloud へのログインに使用できなくなります。気が変わり、アカウントを再開する必要がある場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud サポートポータル</a> でサポートチケットを作成してください。30 日後、このアカウント内のすべてのデータは削除されます。</p>

</Admonition>

### 開始前に\{#before-you-start}

続行する前に、以下の基準を満たしていることを確認してください：

- クラスタを持つプロジェクトで唯一のプロジェクト管理者である場合、[プロジェクトクラスタを削除](./manage-cluster) してください。

- 唯一の組織オーナーである場合、組織を削除してください。

### 手順\{#procedures}

![delete-account-en](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-account-en.png "delete-account-en")

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 右上隅のプロファイルアイコンをクリックします。**アカウント設定**をクリックします。

1. **アカウント** **設定**ウィンドウで、**アカウントを閉鎖**ボタンをクリックします。

1. Zilliz Cloud を離れる理由を伝え、フィードバックを送信します。

1. テキストボックスにアカウントの E メールアドレスを再度入力します。**認証コードを送信**をクリックし、E メール受信トレイで受け取ったコードを入力します。以下の情報を読み、チェックボックスにチェックを入れます。**次へ**をクリックして続行します。

1. アカウントが正常に削除されると、E メール通知が届きます。

</Procedures>