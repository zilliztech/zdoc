---
title: "Zilliz Cloud への登録 | Cloud"
slug: /register-with-zilliz-cloud
sidebar_label: "Zilliz Cloud への登録"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウントを作成する方法を詳しく説明します。 | Cloud"
type: origin
token: HriHwEU3qiQrgskz3a0cdkcpnyf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Zilliz Cloud への登録

このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウントを作成する方法を詳しく説明します。

## 事前準備\{#before-you-start}

Zilliz Cloud にアクセスして[サインアップ](https://cloud.zilliz.com/signup)してください。

![sign_up](https://zdoc-images.s3.us-west-2.amazonaws.com/signup.png "sign_up")

## 登録オプション\{#registration-options}

Zilliz Cloud への登録およびログインには、以下のオプションのうちいずれか1つだけを使用できます。

- [メールアドレスとパスワード](./register-with-zilliz-cloud#with-work-email-and-password)

- [Google アカウント](./register-with-zilliz-cloud#linking-to-google-account)

- [GitHub アカウント](./register-with-zilliz-cloud#linking-to-github-account)

ログイン時は、登録時に選択した方法と一致する方法を使用してください。必要に応じて、後からログイン方法を変更できます。詳細については、[アカウントの管理](./email-accounts#switch-login-method) を参照してください。

### 業務用メールアドレスとパスワードで登録する\{#with-work-email-and-password}

業務用メールアドレスとパスワードを使用して Zilliz Cloud アカウントを作成するには、以下の手順に従います。

<Procedures>

1. **Work Email** フィールドに業務用メールアドレスを入力します。

1. **Password** フィールドにパスワードを入力します。

    パスワードは 8 文字以上で、以下の文字種のうち少なくとも 3 種類を含む必要があります。

    - 小文字（a–z）

    - 大文字（A–Z）

    - 数字（0–9）

    - 特殊文字（例：!@#&#36;%^&&ast;）

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** のチェックボックスをオンにします。

1. **Continue** をクリックします。入力したメールアドレスに確認コードが送信されます。

1. ダイアログボックスに受信した確認コードを入力し、**Verify** をクリックします。

    確認コードが届かない場合は、**Resend Code** をクリックして再送信してください。

</Procedures>

<Admonition type="info" title="Notes">

初回ログイン時には、サービスをより適切に提供するため、追加情報の入力が求められます。

</Admonition>

### Google アカウントとの連携\{#linking-to-google-account}

Google アカウントを Zilliz Cloud と連携するには、以下の手順に従います。

<Procedures>

1. Google ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** のチェックボックスをオンにし、**Submit** をクリックします。

1. [Google アカウントのログインページ](https://accounts.google.com/)にリダイレクトされます。Google アカウントに関連付けられたメールアドレスまたは電話番号と、対応するパスワードを入力してください。

1. 認証に成功すると、Zilliz Cloud にリダイレクトされ、成功通知が表示されます。

</Procedures>

<Admonition type="info" title="Notes">

登録をスムーズに行うため、連携前に [Google が管理する MFA を無効化](https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP)してください。

</Admonition>

### GitHub アカウントとの連携\{#linking-to-github-account}

#### 事前準備\{#prerequisites}

GitHub で登録する場合、GitHub アカウントに公開メールアドレスが関連付けられている必要があります。GitHub でメールアドレスを公開するには、以下の手順に従います。

<Procedures>

1. GitHub にログインし、プロフィールメニューから **Settings** をクリックします。

1. 左側のナビゲーションから **Emails** をクリックします。

1. **Keep my email addresses private** チェックボックスのチェックを外します。

1. 左側のナビゲーションから **Public Profile** をクリックし、**Public email** ドロップダウンから先ほど公開設定にしたメールアドレスを選択します。

1. **Update profile** をクリックして変更を保存します。

</Procedures>

#### 手順\{#procedures}

GitHub アカウントを連携するには、以下の手順に従います。

<Procedures>

1. GitHub ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** のチェックボックスをオンにし、**Submit** をクリックします。

1. [GitHub のサインインページ](https://github.com/login)にリダイレクトされます。GitHub アカウントに関連付けられたユーザー名またはメールアドレスと、対応するパスワードを入力してください。

1. 認証に成功すると、Zilliz Cloud にリダイレクトされ、成功通知が表示されます。

</Procedures>

<Admonition type="info" title="Notes">

登録をスムーズに行うため、連携前に [GitHub が管理する MFA を無効化](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account)してください。

</Admonition>

### Zilliz Cloud アカウントへのログイン\{#log-in-to-your-zilliz-cloud-account}

Zilliz Cloud アカウントへログインする際は、必ず登録時に選択した方法を使用してください。

<Admonition type="info" title="Notes">

セキュリティのため、Zilliz Cloud コンソールのセッションは 6 時間操作がないと失効します。セッションが失効した場合は、再度サインインしてコンソールの使用を続けてください。

詳細については、[コンソールセッション](./email-accounts#console-session)を参照してください。

</Admonition>

## FAQ\{#faq}

**登録に失敗するのはなぜですか？**
このメールアドレスで既にアカウントが登録されている可能性があります。まずは直接ログインをお試しください。問題が解決しない場合は、[サポートチケットを作成](http://support.zilliz.com)してください。
