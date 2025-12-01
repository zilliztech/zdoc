---
title: "電子メールアカウント | Cloud"
slug: /email-accounts
sidebar_label: "電子メールアカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudにアカウントを登録すると、アカウント情報を管理し、ログイン方法を切り替え、GoogleアカウントまたはGitHubアカウントとの連携を解除できます。 | Cloud"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - 電子メールアカウント
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# 電子メールアカウント

Zilliz Cloudに[アカウントを登録](./register-with-zilliz-cloud)した後、アカウント情報を管理し、ログイン方法を切り替え、GoogleアカウントまたはGitHubアカウントとの連携を解除できます。

## プロファイル情報を変更\{#modify-your-profile-information}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. 以下のアカウント情報を編集できます：

    - 名前

    - 会社

    - 国

![modify_account_info](/img/modify_account_info.png "modify_account_info")

## アカウントのメールアドレスを更新\{#update-account-email-address}

![update_email_address](/img/update_email_address.png "update_email_address")

<Admonition type="info" icon="📘" title="ノート">

<p>メールアドレスを更新しても、請求書やアラートの受信者は変わりません。必要に応じてこれらの情報を手動で更新してください。</p>

</Admonition>

## アカウントパスワードを変更\{#change-account-password}

![change_password](/img/change_password.png "change_password")

パスワードは少なくとも8文字以上で、以下の文字タイプの中から少なくとも3つを含める必要があります：

- 小文字（a-z）

- 大文字（A-Z）

- 数字（0-9）

- 特殊文字（例：!@#$%^&*）

## MFAの有効化と無効化\{#enable-and-disable-mfa}

詳しくは[MFA](./multi-factor-auth)を参照してください。

## ロギン方法の切り替え\{#switch-login-method}

初期登録時のログイン方法を維持することが推奨されますが、Zilliz Cloudではログイン方法を切り替える必要がある場合に柔軟に対応できます。

<Admonition type="info" icon="📘" title="ノート">

<p>組織ユーザーの場合、Oktaなどのアイデンティティプロバイダー（IdP）によるシングルサインオン（SSO）を設定できます。これにより、組織ユーザーはOktaで認証し、個別のZilliz Cloudアカウントを作成することなく、業務用メールアドレスでZilliz Cloudにシームレスにアクセスできます。詳細については、<a href="./single-sign-on-with-okta">Oktaによるシングルサインオン</a>を参照してください。</p>

</Admonition>

### パスワードログインからサードパーティログインに切り替える\{#switch-from-password-login-to-third-party-login}

パスワードからサードパーティ（GoogleまたはGitHub）ログインに切り替えるには、[Zilliz Cloudアカウントをサードパーティサービスに連携](./register-with-zilliz-cloud#linking-to-google-account)するのと同じ手順に従い、事前に[MFAが無効化](./multi-factor-auth#disable-mfa)されていることを確認してください。

### サードパーティログインからパスワードログインに切り替える\{#switch-from-third-party-login-to-password-login}

Zilliz Cloudアカウントをサードパーティアカウントに連携した後に電子メールとパスワードでのログインに戻すには、[Zilliz Cloudアカウントをサードパーティサービスから連携解除](./email-accounts#unlink-from-third-party-authentication)してください。

### サードパーティログイン間で切り替える\{#switch-between-third-party-logins}

すでにZilliz Cloudアカウントをサードパーティアカウントに連携しており、別のサードパーティログインに切り替えたい場合は、以下の手順に従ってください。

1. [現在のサードパーティアカウントから連携解除](./email-accounts#unlink-from-third-party-authentication)します。

1. [Zilliz Cloudアカウントを新しい希望するサードパーティアカウントに連携](./register-with-zilliz-cloud)します。

## サードパーティ認証から連携解除\{#unlink-from-third-party-authentication}

### Googleアカウントから連携解除\{#unlink-from-your-google-account}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **Googleから連携解除**をクリックします。

1. **連携解除**をクリックします。

    - すでにパスワードを設定している場合、Googleアカウントは直接連携解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールに送信されたリンクから新しいパスワードを設定します。パスワードが設定されると、ログイン方法は業務用メールと新しいパスワードに変更されます。

![unlink_from_google](/img/unlink_from_google.png "unlink_from_google")

### GitHubアカウントから連携解除\{#unlink-from-your-github-account}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **GitHubから連携解除**をクリックします。

1. **連携解除**をクリックします。

    - すでにパスワードを設定している場合、GitHubアカウントは直接連携解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールに送信されたリンクから新しいパスワードを設定します。パスワードが設定されると、ログイン方法は業務用メールと新しいパスワードに変更されます。

![unlink_from_github](/img/unlink_from_github.png "unlink_from_github")

## アカウントを閉鎖\{#close-your-account}

<Admonition type="caution" icon="🚧" title="警告">

<p>一度アカウントを閉鎖すると、Zilliz Cloudへのログインに使用できなくなります。考えが変わってアカウントを開き直す必要がある場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポートポータル</a>でサポートチケットを作成してください。30日後に、このアカウントのすべてのデータが削除されます。</p>

</Admonition>

### 始める前に\{#before-you-start}

先に進む前に以下の基準を満たしていることを確認してください：

- プロジェクトでクラスターを持つ唯一のプロジェクト管理者である場合は、[プロジェクトクラスターを削除](./manage-cluster)してください。

- 組織の唯一の所有者である場合は、組織を削除してください。

### 手順\{#procedures}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 右上隅のプロフィールアイコンをクリックします。**アカウント設定**をクリックします。

1. **アカウント設定**ウィンドウで、**アカウントを閉鎖**ボタンをクリックします。

1. Zilliz Cloudを離れようとした理由を教えていただいき、フィードバックを送信してください。

1. 再度アカウントのメールアドレスをテキストボックスに入力してください。**認証コードを送信**をクリックし、メールボックスで受け取ったコードを入力してください。以下の情報を読み、ボックスにチェックを入れて**次へ**をクリックして続行します。

1. アカウントが正常に削除されると、メール通知が届きます。

![delete-account-en](/img/delete-account-en.png "delete-account-en")