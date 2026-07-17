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

## 目次

- [Zilliz Cloud と他のベクトル検索ソリューションとの間でパフォーマンス比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloud の検索レイテンシはどのくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [価格はすべてのリージョンで同じですか？](#is-pricing-the-same-in-every-region)
- [無料トライアル終了後はどうなりますか？](#what-happens-after-the-free-trial)
- [Marketplace における Zilliz Cloud の価格はいくらですか？](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [さらに多くのクレジットを申請できますか？](#can-i-apply-for-more-credits)
- [無料トライアルを延長できますか？](#can-i-extend-my-free-trial)
- [さらに技術サポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)
- [GitHub アカウントでサインアップできますか？](#can-i-sign-up-with-my-github-account)
- [サインアップ中に、メール認証コードが届きませんでした。どうすればよいですか？](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [登録に失敗したのはなぜですか？](#why-did-my-registration-fail)
- [Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## FAQs




### Zilliz Cloud と他のベクトル検索ソリューションとの間でパフォーマンス比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。ベクトルデータベースのベンチマークツールである [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) を使用して、Zilliz Cloud と他の主要なベクトルデータベースおよびクラウドサービスのパフォーマンスを比較できます。

### Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloud は AUTOINDEX のみをサポートしています。これは、より優れた検索パフォーマンスの実現に役立つ独自のインデックスタイプです。詳細については、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

ただし、サポートされている [インデックスのいずれか](https://milvus.io/docs/index.md) の使用に慣れている場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us) してください。お客様のアプリケーション要件の評価を支援し、該当するインデックスを有効にできます。

### Zilliz Cloud の検索レイテンシはどのくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシは、クラスターのタイプとデータ量によって異なります。 

| top_k | Performance-optimized クラスターのレイテンシ（768-dim 1M vectors） | Capacity-optimized クラスターのレイテンシ（768-dim 5M vectors） |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

テスト結果の詳細については、[Select the Right CU](./cu-types-explained) を参照してください。

### 価格はすべてのリージョンで同じですか？\{#is-pricing-the-same-in-every-region}

簡単に言うと、クラウドサービスの価格は、プロバイダーやリージョンによって異なることがよくあります。こうした違いには、クラウドデータベースサービスが依存する基盤となる物理リソースのコストなど、いくつかの要因が関係しています。詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。

### 無料トライアル終了後はどうなりますか？\{#what-happens-after-the-free-trial}

無料トライアルが終了しても、引き続き無料のクラスターにアクセスできます。ただし、サーバーレスおよび専用クラスター内のすべてのデータは Recycle Bin に移動され、30 日間保持されます。クラスターのデータを安全に復元するには、支払い方法を登録してください。詳細については、[Try Zilliz Cloud For Free](./free-trials#use-free-trial) を参照してください。

### Marketplace における Zilliz Cloud の価格はいくらですか？\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

Marketplace での価格は、[Zilliz Cloud Pricing](https://zilliz.com/pricing) ページに記載されている定価と同じです。 

アカウントエグゼクティブと割引を交渉済みの場合は、交渉後の価格が適用されます。

価格に関する質問については、[セールスにお問い合わせください](http://zilliz.com/contact-sales)。

### さらに多くのクレジットを申請できますか？\{#can-i-apply-for-more-credits}

勤務先のメールアドレスで Zilliz Cloud に登録すると、&#36;100 分の無料クレジットを受け取れます。Marketplace で Zilliz Cloud を購読すると、さらに &#36;100 分のクレジットを獲得できます。追加のクレジットや割引については、[セールスにお問い合わせください](https://zilliz.com/contact-sales)。

### 無料トライアルを延長できますか？\{#can-i-extend-my-free-trial}

はい、可能です。Zilliz Cloud に登録すると、30 日間有効な &#36;100 分のクレジットを受け取れます。[支払い方法を追加](./payment-billing) することで、これらのクレジットの有効期間を 1 年に延長できます。

### さらに技術サポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloud の [サポートポータル](https://support.zilliz.com/hc/en-us) でリクエストを送信してください。

### GitHub アカウントでサインアップできますか？\{#can-i-sign-up-with-my-github-account}

はい、ただし GitHub アカウントには公開メールアドレスが設定されている必要があります。GitHub のプロフィール設定に移動し、登録前にメールアドレスを公開にしてください。

### サインアップ中に、メール認証コードが届きませんでした。どうすればよいですか？\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

認証ページで「Resend」をクリックしてください。それでも届かない場合は、迷惑メールフォルダーを確認してください。

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスですでにアカウントをお持ちの可能性があります。代わりにログインを試してください。問題が解決しない場合は、[サポートにお問い合わせください](https://support.zilliz.com/)。

### Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

はい。Google または GitHub アカウントでプロバイダー管理の MFA が有効になっている場合は、スムーズに登録できるよう、リンクする前に無効にしてください。その後で再度有効にできます。
