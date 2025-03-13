---
title: "メールアカウント | BYOC"
slug: /email-accounts
sidebar_label: "メールアカウント"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudにアカウントを登録すると、アカウント情報の管理、ログイン方法の切り替え、GoogleまたはGitHubアカウントからのリンク解除が可能になります。 | BYOC"
type: origin
token: WiyZwvV6IicSb5kM8HPc0VQAn9b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - email accounts
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';


# メールアカウント

Zilliz Cloudに[アカウントを登録](./register-with-zilliz-cloud)すると、アカウント情報の管理、ログイン方法の切り替え、GoogleまたはGitHubアカウントからのリンク解除が可能になります。

## プロフィール情報を変更する{#modify-your-profile-information}

1. あなたの**プロフィール**に行き、**アカウント設定**をクリックしてください。

1. 以下のアカウント情報を編集できます。

    - お名前

    - 会社名

    - 国

![modify_account_info](/byoc/ja-JP/modify_account_info.png)

## アカウントのメールアドレスを更新{#update-account-email-address}

<Admonition type="info" icon="📘" title="ノート">

<p>メールアドレスを更新しても、請求書やアラートの受信者には影響しません。必要に応じて、これらの情報を手動で更新してください。</p>

</Admonition>

## アカウントのパスワードを変更する{#update-account-email-address}

## MFAの有効化と無効化{#enable-and-disable-mfa}

詳細については、[MFA](./multi-factor-auth)を参照してください。

## ログイン方法を切り替える{#switch-login-method}

初期登録時に一貫したログイン方法を維持する必要がありますが、Zilliz Cloudはログイン方法を切り替える必要がある場合に柔軟性を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>組織のユーザーは、アイデンティティプロバイダー（IdP）のOktaとシングルサインオン（SSO）を設定することができます。これにより、組織のユーザーはOktaで認証し、ビジネスメールを使用してZilliz Cloudにシームレスにアクセスできます。詳細については、<a href="./single-sign-on-with-okta_1">SAML 2.0ダウンロード</a>を参照してください。</p>

</Admonition>

### パスワードログインからサードパーティログインに切り替える{#switch-from-password-login-to-third-party-login}

パスワードからサードパーティ(GoogleまたはGitHub)のログインに切り替えるには、[Zilliz Cloudアカウントをサードパーティサービスにリンク](./register-with-zilliz-cloud#linking-to-google-account)する手順と同じ手順に従い、事前に[MFAが無効](./multi-factor-auth#disable-mfa)になっていることを確認してください。

### サードパーティログインからパスワードログインに切り替える{#switch-from-third-party-login-to-password-login}

Zilliz Cloudアカウントをサードパーティのアカウントにリンクした後、ログインにメールアドレスとパスワードを使用するように戻すには、[Zilliz Cloudアカウントをサードパーティサービスから解除](./email-accounts#unlink-from-third-party-authentication)してください。

### サードパーティのログインを切り替える{#switch-between-third-party-logins}

Zilliz Cloudアカウントを既にサードパーティのアカウントにリンクしており、別のサードパーティのログインに切り替えたい場合は、以下の手順に従ってください。

1. [現在のサードパーティアカウントからリンクを解除します](./email-accounts#unlink-from-third-party-authentication)。

1. [Zilliz Cloudアカウントを新しいサードパーティアカウントにリンクします](./register-with-zilliz-cloud)。

## サードパーティ認証からのリンク解除{#unlink-from-third-party-authentication}

### Googleアカウントからのリンクを解除{#unlink-from-your-google-account}

1. あなたの**プロフィール**に行き、**アカウント設定**をクリックしてください。

1. [**Googleからリンク解除**]をクリックします。

1. [**リンク解除**]をクリックします。

    - すでにパスワードを設定している場合、Googleアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - パスワードをまだ設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法が仕事用のメールと新しいパスワードに変更されます。

![unlink_from_google](/byoc/ja-JP/unlink_from_google.png)

### GitHubアカウントからのリンク解除{#unlink-from-your-github-account}

1. あなたの**プロフィール**に行き、**アカウント設定**をクリックしてください。

1. [**GitHubからUnlink**]をクリックします。

1. [**リンク解除**]をクリックします。

    - すでにパスワードを設定している場合、GitHubアカウントは直接リンク解除され、元のメールアドレスとパスワードでログインできます。

    - パスワードをまだ設定していない場合は、メールに送信されたリンクから新しいパスワードを設定してください。パスワードが設定されると、ログイン方法が仕事用のメールと新しいパスワードに変更されます。

![unlink_from_github](/byoc/ja-JP/unlink_from_github.png)

## アカウントを閉じてください{#close-your-account}

<Admonition type="caution" icon="🚧" title="警告">

<p>アカウントが閉鎖されると、Zilliz Cloudにログインすることはできません。アカウントを再開する必要がある場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポートポータル</a>でサポートチケットを作成してください。30日後、このアカウントのすべてのデータが消去されます。</p>

</Admonition>

### 始める前に{#before-you-start}

次に進む前に、以下の基準を満たしていることを確認してください。

- クラスタがあるプロジェクトで唯一のプロジェクト管理者である場合は、[プロジェクトクラスタを削除](./manage-cluster)します。

- 組織の所有者があなただけの場合は、組織を削除してください。

### 手続き{#procedures}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 右上隅のプロフィールアイコンをクリックします。**アカウント設定**をクリックします。

1. [**アカウント** **設定**]ウィンドウで、[**アカウントを閉じ**る]ボタンをクリックします。

1. アカウントの削除を確認する前に、まずフィードバックフォームに記入してください。ボタンをクリックして削除を続行してください。

1. テキストボックスにアカウントのメールアドレスを再度入力します。[**確認コードを送信**]をクリックし、メール受信トレイに受け取ったコードを入力します。以下の情報を読み、ボックスにチェックを入れます。[**次**へ]をクリックして続行します。

1. アカウントが正常に削除されると、メール通知が届きます。

![delete-account-en](/byoc/ja-JP/delete-account-en.png)