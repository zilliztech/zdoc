---
title: "メールアカウント | Cloud"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでアカウントを登録しましたを取得すると、アカウント情報の管理、ログイン方法の切り替え、GoogleまたはGitHubアカウントからのリンク解除が可能になります。 | Cloud"
type: origin
token: GMdhwQQCRi2QaLkimNOcc3qNnbh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - email accounts
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# メールアカウント

Zilliz Cloudで[アカウントを登録しました](./register-with-zilliz-cloud)を取得すると、アカウント情報の管理、ログイン方法の切り替え、GoogleまたはGitHubアカウントからのリンク解除が可能になります。

## プロフィール情報を変更する{#modify-your-profile-information}

1. あなたの**プロフィール**に移動し、**アカウント設定**をクリックしてください。

1. 以下のアカウント情報を編集できます。

    - お名前

    - 会社名

    - 国

![modify_account_info](/img/modify_account_info.png)

## アカウントのメールアドレスを更新{#update-account-email-address}

![update_email_address](/img/update_email_address.png)

<Admonition type="info" icon="📘" title="ノート">

<p>メールアドレスを更新しても、請求書やアラートの受信者には影響しません。必要に応じて、これらの情報を手動で更新してください。</p>

</Admonition>

## アカウントのパスワードを変更する{#change-account-password}

![change_password](/img/change_password.png)

パスワードは少なくとも8文字で、以下の文字タイプのうち少なくとも3つを含める必要があります。

- 小文字のアルファベット(a-z)

- 大文字のアルファベット(A-Z)

- 0から9までの数字

- 特殊文字（例:!@#$%^&*）

## MFAの有効化と無効化{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth)を参照してください。

## ログイン方法を切り替える{#switch-login-method}

初期登録時に一貫したログイン方法を維持する必要がありますが、Zilliz Cloudはログイン方法を切り替える必要がある場合に柔軟性を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>組織のユーザーは、アイデンティティプロバイダー（IdP）Oktaとシングルサインオン（SSO）を設定することができます。これにより、組織のユーザーはOktaで認証し、ビジネスメールを使用してZilliz Cloudにシームレスにアクセスできます。詳細については、<a href="./single-sign-on-with-okta">Oktaによるシングルサインオン</a>を参照してください。</p>

</Admonition>

### パスワードログインからサードパーティログインに切り替える{#switch-from-password-login-to-third-party-login}

パスワードからサードパーティ（GoogleまたはGitHub）のログインに切り替えるには、[Zilliz Cloudアカウントをサードパーティサービスにリンクする](./register-with-zilliz-cloud#linking-to-google-account)と同じ手順に従い、事前に[MFAは無効です。](./multi-factor-auth#disable-mfa)を確認してください。

### サードパーティログインからパスワードログインに切り替える{#switch-from-third-party-login-to-password-login}

Zilliz Cloudアカウントをサードパーティアカウントにリンクした後、ログインにメールアドレスとパスワードを使用するように戻すには、単に[サードパーティサービスからZilliz Cloudアカウントのリンクを解除してください](./email-accounts#unlink-from-third-party-authentication)を使用してください。

### サードパーティのログインを切り替える{#switch-between-third-party-logins}

Zilliz Cloudアカウントを既にサードパーティのアカウントにリンクしており、別のサードパーティのログインに切り替えたい場合は、以下の手順に従ってください。

1. リンク_PLACEHOLDER_0.

1. リンク_PLACEHOLDER_0.

## サードパーティ認証からのリンク解除{#unlink-from-third-party-authentication}

### Googleアカウントからのリンクを解除してください。{#unlink-from-your-google-account}

1. あなたの**プロフィール**に移動し、**アカウント設定**をクリックしてください。

1. 「Googleからのリンク解除」をクリックしてください。

1. 「リンク解除」をクリックしてください。 

    - すでにパスワードを設定している場合、Googleアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - パスワードをまだ設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法が仕事用のメールと新しいパスワードに変更されます。

![unlink_from_google](/img/unlink_from_google.png)

### GitHubアカウントからのリンク解除{#unlink-from-your-github-account}

1. あなたの**プロフィール**に移動し、**アカウント設定**をクリックしてください。

1. 「GitHubからのリンク解除」をクリックしてください。

1. 「リンク解除」をクリックしてください。 

    - すでにパスワードを設定している場合、GitHubアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - パスワードをまだ設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法が仕事用のメールと新しいパスワードに変更されます。

![unlink_from_github](/img/unlink_from_github.png)

## アカウントを閉じてください{#close-your-account}

<Admonition type="caution" icon="🚧" title="警告">

<p>アカウントが閉鎖されると、Zilliz Cloudにログインすることはできません。アカウントを再開する必要がある場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポートポータル</a>でサポートチケットを作成してください。30日後、このアカウントのすべてのデータが消去されます。</p>

</Admonition>

### 始める前に{#before-you-start}

次に進む前に、以下の基準を満たしていることを確認してください。

- クラスタを持つプロジェクトで唯一のプロジェクト管理者である場合、[プロジェクトクラスタを削除する](./manage-cluster).

- 組織の所有者があなただけの場合は、組織を削除してください。

### 手続き{#procedures}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. 右上隅のプロフィールアイコンをクリックしてください。**アカウント設定**をクリックしてください。

1. 「アカウント設定」ウィンドウで、「アカウントを閉じる」ボタンをクリックしてください。

1. Zilliz Cloudを離れる理由を教えて、フィードバックを送信してください。

1. テキストボックスにアカウントのメールアドレスを再度入力してください。「確認コードを送信」をクリックし、メールの受信トレイに受け取ったコードを入力してください。以下の情報を読んで、ボックスにチェックを入れてください。「次へ」をクリックして続行してください。

1. アカウントが正常に削除されると、メール通知が届きます。

![delete-account-en](/img/delete-account-en.png)