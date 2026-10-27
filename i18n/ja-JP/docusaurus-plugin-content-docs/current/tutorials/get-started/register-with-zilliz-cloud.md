---
title: "アカウントを作成する | Cloud"
slug: /register-with-zilliz-cloud
sidebar_label: "アカウントを作成する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud アカウントを作成し、マネージドベクトル検索の構築を始めましょう。業務用メールアドレス、Google アカウント、または GitHub アカウントでサインアップできます。 | Cloud"
type: origin
token: B3JxwyvmHiI8CZkUFp4cvRp9nrh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# アカウントを作成する

Zilliz Cloud アカウントを作成し、マネージドベクトル検索の構築を始めましょう。業務用メールアドレス、Google アカウント、または GitHub アカウントでサインアップできます。

アカウントの作成に支払い情報は必要ありません。サインアップ後は、支払い方法を追加する前に、無料リソースを使用して Zilliz Cloud を試すことができます。

## 事前準備\{#before-you-start}

[Zilliz Cloud](https://cloud.zilliz.com/signup) にアクセスし、**Sign up** をクリックします。

初めてサインアップする際、Zilliz Cloud から、オンボーディング体験をカスタマイズするための追加情報を求められる場合があります。

## サインアップ方法を選択する\{#choose-a-sign-up-method}

次のいずれかの方法で登録およびログインできます。

- 業務用メールアドレスとパスワード

- Google アカウント

- GitHub アカウント

後でログインする際は、同じ方法を使用してください。登録後にログイン方法を更新できます。詳細については、[アカウントの管理](/docs/email-accounts#switch-login-method) を参照してください。

### 業務用メールアドレスとパスワードでサインアップする\{#sign-up-with-a-work-email-and-password}

1. **Work Email** フィールドに業務用メールアドレスを入力します。

1. パスワードを入力します。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** を選択します。

1. **Continue** をクリックします。Zilliz Cloud から確認コードがメールアドレスに送信されます。

1. 確認コードを入力し、**Verify** をクリックします。

確認コードが届かない場合は、**Resend Code** をクリックします。

<Admonition type="info" title="Note">

パスワードは 8 文字以上で、小文字、大文字、数字、特殊文字のうち 3 種類以上の文字を含める必要があります。

</Admonition>

### Google でサインアップする\{#sign-up-with-google}

1. Google ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** を選択し、**Submit** をクリックします。

1. [Google アカウント](https://accounts.google.com/) でサインインします。

1. 認証が成功すると、Zilliz Cloud にリダイレクトされます。

<Admonition type="info" title="Note">

Google 管理の MFA が原因でサインアップに失敗した場合は、[Google 管理の MFA を無効化](https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP)してから、再度お試しください。

</Admonition>

### GitHub でサインアップする\{#sign-up-with-github}

GitHub でサインアップする前に、GitHub アカウントに公開メールアドレスが設定されていることを確認してください。

GitHub で公開メールアドレスを設定するには、次の手順を実行します。

1. GitHub でプロフィールメニューを開き、**Settings** をクリックします。

1. 左側のナビゲーションで **Emails** をクリックします。

1. **Keep my email addresses private** をオフにします。

1. 左側のナビゲーションで **Public Profile** をクリックします。

1. **Public email** ドロップダウンから公開メールアドレスを選択します。

1. **Update profile** をクリックします。

次に、GitHub でサインアップします。

1. GitHub ロゴのボタンをクリックします。

1. **I agree to the [Terms of Service](https://zilliz.com/terms-and-conditions) and [Privacy Policy](https://zilliz.com/privacy-policy)** を選択し、**Submit** をクリックします。

1. [GitHub アカウント](https://github.com/login) でサインインします。

1. 認証が成功すると、Zilliz Cloud にリダイレクトされます。

<Admonition type="info" title="Note">

GitHub 管理の MFA が原因でサインアップに失敗した場合は、[GitHub 管理の MFA を無効化](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account)してから、再度お試しください。

</Admonition>

### Zilliz Cloud アカウントへのログイン\{#log-in-to-your-zilliz-cloud-account}

Zilliz Cloud アカウントへログインする際は、必ず登録時に選択した方法を使用してください。

<Admonition type="info" title="Notes">

セキュリティのため、Zilliz Cloud コンソールのセッションは 6 時間操作がないと失効します。セッションが失効した場合は、再度サインインしてコンソールの使用を続けてください。

詳細については、[コンソールセッション](./email-accounts#console-session)を参照してください。

</Admonition>

## 無料リソースを利用して始める\{#start-with-free-resources}

アカウントを作成したら、無料リソースを使用して Zilliz Cloud を試すことができます。このセクションは短い概要として維持し、請求の詳細については、請求またはトライアルに関するドキュメントにリンクしてください。

| リソース | 利用できるもの |
| --- | --- |
| 無料クラスター | 基本的なベクトルデータベースのユースケース向けに、5 GB のストレージ、月あたり 250 万 vCU、最大 5 個のコレクションを利用できます。 |
| 無料トライアルクレジット | 業務用メールアドレスでサインアップすると、組織に &#36;100 の無料クレジットが付与されます。クレジットは 30 日後に失効し、Serverless および Dedicated クラスターの評価に使用できます。詳細については、[無料トライアル](/docs/free-trials) を参照してください。 |
| 追加クレジット | [クレジットカード](/docs/subscribe-by-adding-credit-card)や[マーケットプレイスサブスクリプション](/docs/marketplace-subscription)などの支払い方法を追加すると、さらに &#36;100 のクレジットを獲得できます。支払い方法を追加すると、クレジットの有効期限も 1 年に延長されます。 |

<Admonition type="info" title="Note">

有効な支払い方法がない状態で無料トライアルが終了すると、組織が凍結され、Serverless または Dedicated クラスターは[リサイクルビン](/docs/use-recycle-bin)に移動されます。凍結後 30 日以内に支払い方法を追加しない場合、これらのクラスターは完全に削除されます。組織は保持されます。追加のクレジットが必要な場合は、[営業担当者に問い合わせてください](https://zilliz.com/contact-sales)。

</Admonition>

## FAQ\{#faq}

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスですでにアカウントを登録している可能性があります。直接ログインを試してください。

問題が解決しない場合は、[サポートチケットを作成](http://support.zilliz.com) してください。

## 次のステップ\{#next-steps}

- 最初のベクトル検索を実行する：[5 分間のクイックスタート](/docs/quick-start)

- クラスターを作成する：[クラスターを作成する](/docs/create-cluster)

- デプロイオプションを比較する：[デプロイとプランの比較](/docs/select-zilliz-cloud-service-plans)

- 請求を管理する：[支払いと請求](/docs/faq-payment-and-billing)
