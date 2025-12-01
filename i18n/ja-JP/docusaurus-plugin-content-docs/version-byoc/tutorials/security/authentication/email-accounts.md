---
title: "メールアカウント | BYOC"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudにアカウントを登録した後、アカウント情報を管理し、ログイン方法を切り替え、GoogleまたはGitHubアカウントとのリンクを解除できます。 | BYOC"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - メールアカウント
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 回答システム
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# メールアカウント

Zilliz Cloudに[アカウントを登録](./register-with-zilliz-cloud)した後、アカウント情報を管理し、ログイン方法を切り替え、GoogleまたはGitHubアカウントとのリンクを解除できます。

## プロフィール情報の変更\{#modify-your-profile-information}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. 以下のアカウント情報を編集できます：

    - 名前

    - 会社

    - 国

![modify_account_info](/img/modify_account_info.png)

## アカウントのメールアドレスの更新\{#update-account-email-address}

![update_email_address](/img/update_email_address.png)

<Admonition type="info" icon="📘" title="注意">

<p>メールアドレスの更新は、請求書やアラートの受信者には影響しません。必要に応じてこれらの情報を手動で更新してください。</p>

</Admonition>

## アカウントパスワードの変更\{#change-account-password}

![change_password](/img/change_password.png)

パスワードは少なくとも8文字以上で、以下の文字タイプのうち少なくとも3つを含む必要があります：

- 小文字（a-z）

- 大文字（A-Z）

- 数字（0-9）

- 特殊文字（例：!@#$%^&*）

## MFAの有効化と無効化\{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth)を参照してください。

## ログイン方法の切り替え\{#switch-login-method}

初期登録時と同じログイン方法を維持することが求められますが、Zilliz Cloudはログイン方法の切り替えが必要な場合にも柔軟に対応しています。

<Admonition type="info" icon="📘" title="注意">

<p>組織ユーザーの場合、IdPであるOktaでシングルサインオン（SSO）を設定できます。これにより、組織ユーザーはOktaで認証し、別のZilliz Cloudアカウントを作成することなく、ビジネスメールでZilliz Cloudにシームレスにアクセスできます。詳細については、<a href="./single-sign-on-with-okta">Oktaとのシングルサインオン</a>を参照してください。</p>

</Admonition>

### パスワードログインからサードパーティログインへの切り替え\{#switch-from-password-login-to-third-party-login}

パスワードからサードパーティ（GoogleまたはGitHub）ログインに切り替えるには、[Zilliz Cloudアカウントをサードパーティサービスにリンク](./register-with-zilliz-cloud#linking-to-google-account)するのと同じ手順に従い、事前に[MFAが無効になっている](./multi-factor-auth#disable-mfa)ことを確認してください。

### サードパーティログインからパスワードログインへの切り替え\{#switch-from-third-party-login-to-password-login}

Zilliz Cloudアカウントをサードパーティアカウントにリンクした後で、メールアドレスとパスワードを使用してログインに戻すには、[Zilliz Cloudアカウントをサードパーティサービスからリンク解除](./email-accounts#unlink-from-third-party-authentication)してください。

### サードパーティログイン間の切り替え\{#switch-between-third-party-logins}

既にZilliz Cloudアカウントをサードパーティアカウントにリンクしており、別のサードパーティログインに切り替えたい場合は、以下の手順に従ってください。

1. [現在のサードパーティアカウントからのリンクを解除](./email-accounts#unlink-from-third-party-authentication)。

2. [Zilliz Cloudアカウントを新しい希望するサードパーティアカウントにリンク](./register-with-zilliz-cloud)。

## サードパーティ認証からのリンク解除\{#unlink-from-third-party-authentication}

### Googleアカウントからのリンク解除\{#unlink-from-your-google-account}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **Googleからリンク解除**をクリックします。

1. **リンク解除**をクリックします。

    - 既にパスワードを設定している場合、Googleアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法は職場のメールアドレスと新しいパスワードに変更されます。

![unlink_from_google](/img/unlink_from_google.png)

### GitHubアカウントからのリンク解除\{#unlink-from-your-github-account}

1. **プロフィール**に移動し、**アカウント設定**をクリックします。

1. **GitHubからリンク解除**をクリックします。

1. **リンク解除**をクリックします。

    - 既にパスワードを設定している場合、GitHubアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - まだパスワードを設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法は職場のメールアドレスと新しいパスワードに変更されます。

![unlink_from_github](/img/unlink_from_github.png)

## アカウントを閉鎖する\{#close-your-account}

<Admonition type="caution" icon="🚧" title="警告">

<p>アカウントを閉鎖すると、Zilliz Cloudにログインするために使用できなくなります。考えが変わった場合やアカウントを再開したい場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポートポータル</a>でサポートチケットを作成してください。30日後、このアカウントのすべてのデータが削除されます。</p>

</Admonition>

### 事前準備\{#before-you-start}

先に進む前に、以下の条件を満たしていることを確認してください：

- プロジェクトでクラスターがあり、プロジェクト管理者が自分だけの場合は、[プロジェクトクラスターを削除](./manage-cluster)してください。

- 組織オーナーが自分だけの場合は、組織を削除してください。

### 手順\{#procedures}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 右上隅のプロフィールアイコンをクリックし、**アカウント設定**をクリックします。

1. **アカウント** **設定**ウィンドウで、**アカウントを閉鎖**ボタンをクリックします。

1. Zilliz Cloudを離れたい理由を教えていただき、フィードバックを送信してください。

1. テキストボックスにもう一度アカウントのメールアドレスを入力します。**認証コードを送信**をクリックし、メールボックスで受信したコードを入力します。以下の情報を読み、チェックボックスにチェックを入れます。**次へ**をクリックして続行します。

1. アカウントが正常に削除されると、メール通知が届きます。

![delete-account-en](/img/delete-account-en.png)