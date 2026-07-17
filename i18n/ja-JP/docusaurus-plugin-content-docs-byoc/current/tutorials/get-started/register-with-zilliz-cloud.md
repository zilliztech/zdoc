---
title: "Zilliz Cloud への登録 | BYOC"
slug: /register-with-zilliz-cloud
sidebar_label: "Zilliz Cloud への登録"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウント作成方法を包括的に説明します。 | BYOC"
type: origin
token: HriHwEU3qiQrgskz3a0cdkcpnyf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Zilliz Cloud への登録

このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウント作成方法を包括的に説明します。

## 始める前に\{#before-you-start}

Zilliz Cloud にアクセスして、[サインアップ](https://cloud.zilliz.com/signup)できます。

![sign_up](https://zdoc-images.s3.us-west-2.amazonaws.com/signup.png "sign_up")

## 登録オプション\{#registration-options}

Zilliz Cloud への登録およびログインには、以下のいずれか1つのみを使用できます。

- [メールアドレスとパスワード](./register-with-zilliz-cloud#with-work-email-and-password)

- [Google アカウント](./register-with-zilliz-cloud#linking-to-google-account)

- [GitHub アカウント](./register-with-zilliz-cloud#linking-to-github-account)

ログイン時には、選択した登録方法と同じ方法を継続して使用してください。必要に応じて、後でログイン方法を変更することもできます。詳細については、[アカウントの管理](./email-accounts#switch-login-method)を参照してください。

### 会社のメールアドレスとパスワードを使用する\{#with-work-email-and-password}

会社のメールアドレスとパスワードを使用して Zilliz Cloud アカウントを作成するには、以下の手順に従ってください。

<Procedures>

1. **Work Email** フィールドに会社のメールアドレスを入力します。

1. **Password** フィールドにパスワードを入力します。

    パスワードは8文字以上で、以下の文字種のうち少なくとも3種類を含める必要があります。

    - 小文字 (a–z)

    - 大文字 (A–Z)

    - 数字 (0–9)

    - 特殊文字 (例: !@#$%^&*)

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** の横にあるチェックボックスをオンにします。

1. **Continue** をクリックします。確認コードが指定したメールアドレスに送信されます。

1. 受信した確認コードをダイアログボックスに入力し、**Verify** をクリックします。

    確認コードが届かない場合は、**Resend Code** をクリックして再送を試みてください。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

初回ログイン時には、お客様のニーズに合わせてより適切なサービスを提供できるよう、追加情報の入力をお願いしています。

</Admonition>

### Google アカウントを連携する\{#linking-to-google-account}

Google アカウントを Zilliz Cloud に連携するには、以下の手順に従ってください。

<Procedures>

1. Google ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** のチェックボックスをオンにして、**Submit** をクリックします。

1. [Google Account login page](https://accounts.google.com/) にリダイレクトされます。Google アカウントに関連付けられたメールアドレスまたは電話番号と、対応するパスワードを入力します。

1. 認証に成功すると、Zilliz Cloud にリダイレクトされ、成功通知が表示されます。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

スムーズに登録できるよう、連携前に [Google が管理する MFA を無効化](https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP)してください。

</Admonition>

### GitHub アカウントを連携する\{#linking-to-github-account}

#### 前提条件\{#prerequisites}

GitHub で登録しようとする場合は、GitHub アカウントに関連付けられた公開メールアドレスが必要です。GitHub でメールアドレスを公開に設定するには、以下の手順に従ってください。

<Procedures>

1. GitHub にログインし、プロフィールメニューで **Settings** をクリックします。

1. 左側のナビゲーションから **Emails** をクリックします。

1. **Keep my email addresses private** のチェックを外します。

1. 左側のナビゲーションで **Public Profile** をクリックし、**Public email** のドロップダウンから、先ほど公開に設定したメールアドレスを選択します。

1. **Update profile** をクリックして変更を保存します。

</Procedures>

#### 手順\{#procedures}

GitHub アカウントを当社サービスに連携するには、以下の手順に従ってください。

<Procedures>

1. GitHub ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** のチェックボックスをオンにして、**Submit** をクリックします。

1. [GitHub sign in page](https://github.com/login) にリダイレクトされます。GitHub アカウントに関連付けられたユーザー名またはメールアドレスと、対応するパスワードを入力します。

1. 認証に成功すると、Zilliz Cloud にリダイレクトされ、成功通知が表示されます。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

スムーズに登録できるよう、連携前に [GitHub が管理する MFA を無効化](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account)してください。

</Admonition>

### Zilliz Cloud アカウントにログインする\{#log-in-to-your-zilliz-cloud-account}

Zilliz Cloud アカウントにログインする際は、登録時に選択したものと同じ方法を常に使用してください。

## FAQ\{#faq}

**登録に失敗したのはなぜですか？**
このメールアドレスですでにアカウントが登録されている可能性があります。まずは直接ログインをお試しください。問題が解決しない場合は、[サポートチケットを作成](http://support.zilliz.com)してください。
