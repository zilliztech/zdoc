---
title: "Zilliz Cloud に登録 | Cloud"
slug: /register-with-zilliz-cloud
sidebar_key: register-with-zilliz-cloud
sidebar_label: "Zilliz Cloud に登録"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud のサービスにアクセスするためのアカウント作成方法について詳しく説明します。 | Cloud"
type: origin
token: HriHwEU3qiQrgskz3a0cdkcpnyf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - 登録
  - cloud
  - milvus

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Zilliz Cloud に登録する

このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウント作成方法を詳しく説明します。

## 開始前の準備\{#before-you-start}

Zilliz Cloud にアクセスして、[サインアップ](https://cloud.zilliz.com/signup)してください。

![sign_up](https://zdoc-images.s3.us-west-2.amazonaws.com/sign_up.png "sign_up")

## 登録オプション\{#registration-options}

Zilliz Cloud への登録およびログインには、以下のいずれか 1 つの方法のみを使用できます。

- [仕事用メールアドレスとパスワード](./register-with-zilliz-cloud#with-work-email-and-password)

- [Google アカウント](./register-with-zilliz-cloud#linking-to-google-account)

- [GitHub アカウント](./register-with-zilliz-cloud#linking-to-github-account)

ログイン時には、登録時に選択した方法を一貫して使用してください。必要に応じて、後からログイン方法を変更することも可能です。詳細については、[アカウントの管理](./email-accounts#switch-login-method)を参照してください。

### 仕事用メールとパスワードでの登録\{#with-work-email-and-password}

仕事用メールアドレスとパスワードを使用して Zilliz Cloud アカウントを作成するには、以下の手順に従ってください。

<Procedures>

1. **仕事用メール** フィールドに仕事用メールアドレスを入力します。

1. **パスワード** フィールドにパスワードを入力します。

    パスワードは最低 8 文字以上で、以下の文字種のうち少なくとも 3 種類を含める必要があります：

    - 小文字（a–z）

    - 大文字（A–Z）

    - 数字（0–9）

    - 特殊文字（例：!@#$%^&*）

1. **[利用規約](https://zilliz.com/terms-and-conditions)および[プライバシーポリシー](https://zilliz.com/privacy-policy)に同意します** のチェックボックスをオンにします。

1. **Continue** をクリックします。確認コードが入力されたメールアドレスに送信されます。

1. ダイアログボックスに受信した確認コードを入力し、**Verify** をクリックします。

    確認コードが届かない場合は、**コードを再送信** をクリックして再送信してください。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>初回ログイン時には、お客様のニーズに合わせてサービスを最適化するために、追加情報をご提供いただきます。</p>

</Admonition>

### Google アカウントとの連携\{#linking-to-google-account}

Google アカウントを Zilliz Cloud と連携させるには、以下の手順に従ってください。

<Procedures>

1. Google ロゴのボタンをクリックします。

1. **[利用規約](https://zilliz.com/terms-and-conditions)および[プライバシーポリシー](https://zilliz.com/privacy-policy)に同意します** のチェックボックスをオンにして、**Submit** をクリックします。

1. [Google アカウントのログインページ](https://accounts.google.com/)にリダイレクトされます。Google アカウントに関連付けられたメールアドレスまたは電話番号と、対応するパスワードを入力します。

1. 認証が成功すると、Zilliz Cloud に戻り、成功通知が表示されます。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>スムーズな登録のために、連携前に<a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">Google 管理の MFA を無効化</a>してください。</p>

</Admonition>

### GitHub アカウントとの連携\{#linking-to-github-account}

#### 前提条件\{#prerequisites}

GitHub を使って登録する場合、GitHub アカウントに公開メールアドレスが関連付けられている必要があります。GitHub 上でメールアドレスを公開にするには、以下の手順に従ってください。

<Procedures>

1. GitHub にログインし、プロファイルメニューから **Settings** をクリックします。

1. 左側のナビゲーションから **メール** をクリックします。

1. **Keep my email addresses private** のチェックボックスをオフにします。

1. 左側のナビゲーションから **公開プロフィール** をクリックし、**公開メール** ドロップダウンから先ほど公開設定したメールアドレスを選択します。

1. **Update profile** をクリックして変更を保存します。

</Procedures>

#### 手順\{#procedures}

GitHub アカウントを当社と連携させるには、以下の手順に従ってください。

<Procedures>

1. GitHub ロゴのボタンをクリックします。

1. **[利用規約](https://zilliz.com/terms-and-conditions)および[プライバシーポリシー](https://zilliz.com/privacy-policy)に同意します** のチェックボックスをオンにして、**Submit** をクリックします。

1. [GitHub サインインページ](https://github.com/login)にリダイレクトされます。GitHub アカウントに関連付けられたユーザー名またはメールアドレスと、対応するパスワードを入力します。

1. 認証が成功すると、Zilliz Cloud に戻り、成功通知が表示されます。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>スムーズな登録のために、連携前に<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">GitHub 管理の MFA を無効化</a>してください。</p>

</Admonition>

### Zilliz Cloud アカウントへのログイン\{#log-in-to-your-zilliz-cloud-account}

Zilliz Cloud アカウントにログインする際は、常に登録時に選択した方法を使用してください。

## FAQ\{#faq}

**登録が失敗するのはなぜですか？**
このメールアドレスですでにアカウントを登録済みの可能性があります。直接ログインを試してみてください。問題が解決しない場合は、[サポートチケットを作成](http://support.zilliz.com)してください。