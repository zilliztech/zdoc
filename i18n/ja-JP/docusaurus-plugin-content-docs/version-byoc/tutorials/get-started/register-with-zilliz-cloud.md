---
title: "Zilliz Cloud への登録 | BYOC"
slug: /register-with-zilliz-cloud
sidebar_label: "Zilliz Cloud への登録"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウント作成方法についての包括的な手順を提供します。 | BYOC"
type: origin
token: HriHwEU3qiQrgskz3a0cdkcpnyf
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - register
  - cloud
  - milvus
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud への登録

このガイドでは、Zilliz Cloud サービスにアクセスするためのアカウント作成方法についての包括的な手順を提供します。

## はじめる前に\{#before-you-start}

Zilliz Cloud にご訪問いただき、[サインアップ](https://cloud.zilliz.com/signup) してください。

![sign_up](/img/sign_up.png)

## 登録オプション\{#registration-options}

Zilliz Cloud への登録およびログインには、以下のオプションのいずれか1つだけを使用できます。

- [電子メールアドレスとパスワード](./register-with-zilliz-cloud#with-work-email-and-password)

- [Google アカウント](./register-with-zilliz-cloud#linking-to-google-account)

- [GitHub アカウント](./register-with-zilliz-cloud#linking-to-github-account)

ログイン目的では、選択した登録方法を一貫して使用してください。必要に応じて、後からログイン方法を変更できます。詳しくは、[アカウントの管理](./email-accounts#switch-login-method) を参照してください。

### ワーク電子メールとパスワードでの登録\{#with-work-email-and-password}

以下の手順に従って、ワーク電子メールとパスワードを使用して Zilliz Cloud アカウントを作成してください:

1. **ワーク電子メール** フィールドにワーク電子メールアドレスを入力してください。

1. **パスワード** フィールドにパスワードを入力してください。

    パスワードは8文字以上で、以下の文字タイプのうち少なくとも3つを含める必要があります:

    - 小文字 (a-z)

    - 大文字 (A-Z)

    - 数字 (0-9)

    - 特殊文字 (例: !@#$%^&*)

1. **[利用規約](https://zilliz.com/terms-and-conditions) および [プライバシーポリシー](https://zilliz.com/privacy-policy) に同意する** のチェックボックスをオンにしてください。

1. **続行** をクリックしてください。確認コードが入力された電子メールアドレスに送信されます。

1. 受信した確認コードをダイアログボックスに入力し、**確認** をクリックしてください。

    確認コードが届かない場合は、**コードを再送信** をクリックして再試行してください。

<Admonition type="info" icon="📘" title="Notes">

<p>初回ログイン時、サービスをより適切にカスタマイズするために、さらに詳しい情報をご入力いただくようお願いします。</p>

</Admonition>

### Google アカウントへのリンク\{#linking-to-google-account}

Google アカウントを Zilliz Cloud とリンクさせるには、以下の手順に従ってください。

1. Google ロゴボタンをクリックしてください。

1. **[利用規約](https://zilliz.com/terms-and-conditions) および [プライバシーポリシー](https://zilliz.com/privacy-policy) に同意する** のチェックボックスを選択し、**送信** をクリックしてください。

1. [Google アカウントログインページ](https://accounts.google.com/) にリダイレクトされます。Google アカウントに関連付けられた電子メールアドレスまたは電話番号、および対応するパスワードを入力してください。

1. 認証が成功すると、Zilliz Cloud に戻り、成功通知が表示されます。

<Admonition type="info" icon="📘" title="Notes">

<p>スムーズな登録を確保するために、リンクする前に <a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">Google 管理の MFA を無効化</a> してください。</p>

</Admonition>

### GitHub アカウントへのリンク\{#linking-to-github-account}

#### 前提条件\{#prerequisites}

GitHub で登録を試みる場合は、GitHub アカウントに関連付けられた公開電子メールアドレスが必要です。以下の手順に従って、GitHub 上で電子メールアドレスを公開にしてください:

1. GitHub にログインし、プロファイルメニューの **設定** をクリックしてください。

1. 左側のナビゲーションから **電子メール** をクリックしてください。

1. **メールアドレスを非公開のままにする** ボックスのチェックを外してください。

1. 左側のナビゲーションから **公開プロフィール** をクリックし、**公開メールアドレス** ドロップダウンから先ほど公開に設定したメールアドレスを選択してください。

1. **プロフィールを更新** をクリックして変更を保存してください。

#### 手順\{#procedures}

GitHub アカウントを当社とリンクさせるには、以下の手順に従ってください。

1. GitHub ロゴボタンをクリックしてください。

1. **[利用規約](https://zilliz.com/terms-and-conditions) および [プライバシーポリシー](https://zilliz.com/privacy-policy) に同意する** のチェックボックスを選択し、**送信** をクリックしてください。

1. [GitHub サインインページ](https://github.com/login) にリダイレクトされます。GitHub アカウントに関連付けられたユーザー名または電子メールアドレス、および対応するパスワードを入力してください。

1. 認証が成功すると、Zilliz Cloud に戻り、成功通知が表示されます。

<Admonition type="info" icon="📘" title="Notes">

<p>スムーズな登録を確保するために、リンクする前に <a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">GitHub 管理の MFA を無効化</a> してください。</p>

</Admonition>

### Zilliz Cloud アカウントへのログイン\{#log-in-to-your-zilliz-cloud-account}

Zilliz Cloud アカウントにログインする際は、常に登録時に選択したのと同じ方法を使用してください。

## FAQ\{#faq}

**なぜ登録が失敗したのですか？**
この電子メールアドレスで既にアカウントを登録している可能性があります。直接ログインしてみてください。問題が解決しない場合は、[サポートチケットを作成](http://support.zilliz.com) してください。