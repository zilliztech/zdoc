---
title: "FAQ: はじめに | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ: はじめに"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
displayed_sidebar: default

---

# FAQ: はじめに

このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## Contents

- [Zilliz Cloud と他のベクトル検索ソリューションとの間にパフォーマンス比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloud の検索レイテンシはどのくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [料金はすべてのリージョンで同じですか？](#is-pricing-the-same-in-every-region)
- [無料トライアル終了後はどうなりますか？](#what-happens-after-the-free-trial)
- [Marketplace における Zilliz Cloud の料金はいくらですか？](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [さらにクレジットを申請できますか？](#can-i-apply-for-more-credits)
- [無料トライアルを延長できますか？](#can-i-extend-my-free-trial)
- [さらに技術サポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)
- [GitHub アカウントでサインアップできますか？](#can-i-sign-up-with-my-github-account)
- [サインアップ時にメール認証コードを受信できませんでした。どうすればよいですか？](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [登録に失敗したのはなぜですか？](#why-did-my-registration-fail)
- [Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## FAQs




### Zilliz Cloud と他のベクトル検索ソリューションとの間にパフォーマンス比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。[VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) を使用できます。これはベクトルデータベースのベンチマークツールで、Zilliz Cloud と他の主要なベクトルデータベースおよびクラウドサービスのパフォーマンスを比較できます。

### Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloud では AUTOINDEX のみをサポートしています。これは、より優れた検索パフォーマンスを実現するのに役立つ独自のインデックスタイプです。詳細については、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

ただし、当社がサポートする [インデックスのいずれか](https://milvus.io/docs/index.md) の利用に慣れている場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us) してください。お客様のアプリケーション要件を評価し、インデックスを有効化するお手伝いができます。

### Zilliz Cloud の検索レイテンシはどのくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシは、クラスタータイプとデータ量によって異なります。 

| top_k | Performance-optimized クラスターのレイテンシ（768 次元、100 万ベクトル） | Capacity-optimized クラスターのレイテンシ（768 次元、500 万ベクトル） |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

テスト結果の詳細については、[Select the Right CU](./cu-types-explained) を参照してください。

### 料金はすべてのリージョンで同じですか？\{#is-pricing-the-same-in-every-region}

簡単に言うと、クラウドサービスの価格は、プロバイダーやリージョンによって異なることがよくあります。こうした違いには、クラウドデータベースサービスが依存する基盤となる物理リソースのコストなど、いくつかの要因が関係しています。詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。

### 無料トライアル終了後はどうなりますか？\{#what-happens-after-the-free-trial}

無料トライアルが終了しても、無料のクラスターには引き続きアクセスできます。ただし、サーバーレスおよび Dedicated クラスター内のすべてのデータは Recycle Bin に移動され、30 日間保持されます。クラスターのデータを安全に復元するには、支払い方法を登録してください。詳細については、[Try Zilliz Cloud For Free](./free-trials#use-free-trial) を参照してください。

### Marketplace における Zilliz Cloud の料金はいくらですか？\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

Marketplace の価格は、[Zilliz Cloud Pricing](https://zilliz.com/pricing) ページの表示価格と同じです。 

アカウント担当者と割引価格を交渉済みの場合は、交渉後の価格が適用されます。

料金に関する質問については、[営業担当にお問い合わせください](http://zilliz.com/contact-sales)。

### さらにクレジットを申請できますか？\{#can-i-apply-for-more-credits}

Zilliz Cloud に会社のメールアドレスで登録すると、&#36;100 の無料クレジットを受け取れます。[Marketplaces](./subscribe-on-aws-marketplace) で Zilliz Cloud を購読すると、さらに &#36;100 のクレジットを獲得できます。追加のクレジットや割引については、[営業担当にお問い合わせください](https://zilliz.com/contact-sales)。

### 無料トライアルを延長できますか？\{#can-i-extend-my-free-trial}

はい、可能です。Zilliz Cloud に登録すると、30 日間有効な &#36;100 のクレジットを受け取れます。[支払い方法を追加](./payment-billing) することで、これらのクレジットの有効期間を 1 年に延長できます。

### さらに技術サポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloud の [support portal](https://support.zilliz.com/hc/en-us) からリクエストを送信してください。

### GitHub アカウントでサインアップできますか？\{#can-i-sign-up-with-my-github-account}

はい、可能ですが、GitHub アカウントには公開メールアドレスが設定されている必要があります。登録前に GitHub のプロフィール設定に移動し、メールアドレスを公開にしてください。

### サインアップ時にメール認証コードを受信できませんでした。どうすればよいですか？\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

認証ページで「Resend」をクリックしてください。それでも受信できない場合は、迷惑メールフォルダを確認してください。

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスですでにアカウントを持っている可能性があります。代わりにログインを試してください。問題が解決しない場合は、[サポートにお問い合わせください](https://support.zilliz.com/)。

### Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

はい。Google または GitHub アカウントでプロバイダー管理の MFA が有効になっている場合は、スムーズに登録できるよう、連携前に無効にしてください。その後で再度有効にできます。
