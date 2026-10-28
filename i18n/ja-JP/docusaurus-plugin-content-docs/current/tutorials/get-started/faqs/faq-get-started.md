---
title: "FAQ: はじめに | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ: はじめに"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud の利用を開始する際に発生する可能性がある問題と、その解決策について説明します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
displayed_sidebar: default

---

# FAQ: はじめに

このトピックでは、Zilliz Cloud の利用を開始する際に発生する可能性がある問題と、その解決策について説明します。

## 目次

- [Zilliz Cloud と他のベクトル検索ソリューションとのパフォーマンス比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloud の検索レイテンシーはどのくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [リージョンによって料金は異なりますか？](#is-pricing-the-same-in-every-region)
- [無料トライアル終了後はどうなりますか？](#what-happens-after-the-free-trial)
- [マーケットプレイスでの Zilliz Cloud の料金はいくらですか？](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [クレジットを追加申請できますか？](#can-i-apply-for-more-credits)
- [無料トライアルを延長できますか？](#can-i-extend-my-free-trial)
- [さらに技術サポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)
- [GitHub アカウントでサインアップできますか？](#can-i-sign-up-with-my-github-account)
- [サインアップ時に、メール認証コードが届きませんでした。どうすればよいですか？](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [登録に失敗したのはなぜですか？](#why-did-my-registration-fail)
- [Google または GitHub でサインアップする前に、MFA を無効にする必要がありますか？](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## よくある質問




### Zilliz Cloud と他のベクトル検索ソリューションとのパフォーマンス比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。ベクトルデータベースのベンチマークツールである [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) を使用して、Zilliz Cloud と他の主要なベクトルデータベースおよびクラウドサービスのパフォーマンスを比較できます。

### Zilliz Cloud ではどのタイプのインデックスがサポートされていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloud は、より優れた検索パフォーマンスを実現する独自のインデックスタイプである AUTOINDEX のみをサポートしています。詳細は、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

ただし、サポートしている[各種インデックス](https://milvus.io/docs/index.md)の使用に慣れている場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。アプリケーションの要件を評価し、インデックスを有効化するお手伝いをします。

### Zilliz Cloud の検索レイテンシーはどのくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシーは、クラスタータイプとデータ量によって異なります。

| top_k | パフォーマンス最適化クラスターのレイテンシー（768 次元、100 万ベクトル） | 容量最適化クラスターのレイテンシー（768 次元、500 万ベクトル） |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

テスト結果の詳細は、[適切な CU を選択する](./cu-types-explained) を参照してください。

### リージョンによって料金は異なりますか？\{#is-pricing-the-same-in-every-region}

結論から言うと、クラウドサービスの料金はプロバイダーやリージョンによって異なることがよくあります。この違いには、クラウドデータベースサービスが依存する基盤となる物理リソースのコストなど、いくつかの要因が関係しています。詳細は、[料金](https://zilliz.com/pricing) を参照してください。

### 無料トライアル終了後はどうなりますか？\{#what-happens-after-the-free-trial}

無料トライアルが終了しても、無料クラスターには引き続きアクセスできます。ただし、Serverless クラスターと Dedicated クラスター内のすべてのデータは Recycle Bin に移動され、30 日間保持されます。クラスターデータを安全に復元するには、支払い方法を登録してください。詳細は、[クレジット](./credits) を参照してください。

### マーケットプレイスでの Zilliz Cloud の料金はいくらですか？\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

マーケットプレイスの価格は、[Zilliz Cloud の料金](https://zilliz.com/pricing) ページに記載されている定価と同じです。

アカウントエグゼクティブと割引を交渉している場合は、交渉した価格が適用されます。

料金に関するご質問は、[営業担当者にお問い合わせください](http://zilliz.com/contact-sales)。

### クレジットを追加申請できますか？\{#can-i-apply-for-more-credits}

仕事用のメールアドレスで Zilliz Cloud に登録すると、&#36;100 の無料クレジットを受け取れます。[マーケットプレイス](./subscribe-on-aws-marketplace) で Zilliz Cloud をサブスクライブすると、さらに &#36;100 のクレジットを獲得できます。追加のクレジットや割引については、[営業担当者にお問い合わせください](https://zilliz.com/contact-sales)。

### 無料トライアルを延長できますか？\{#can-i-extend-my-free-trial}

はい、できます。Zilliz Cloud に登録すると、30 日間有効な &#36;100 のクレジットを受け取ります。[支払い方法を追加する](./payment-billing) ことで、クレジットの有効期限を 1 年に延長できます。

### さらに技術サポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloud の[サポートポータル](https://support.zilliz.com/hc/en-us)でリクエストを送信してください。

### GitHub アカウントでサインアップできますか？\{#can-i-sign-up-with-my-github-account}

はい。ただし、GitHub アカウントに公開メールアドレスが設定されている必要があります。登録する前に、GitHub のプロフィール設定でメールアドレスを公開してください。

### サインアップ時に、メール認証コードが届きませんでした。どうすればよいですか？\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

認証ページで「Resend」をクリックします。それでも届かない場合は、迷惑メールフォルダーを確認してください。

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスのアカウントがすでに存在している可能性があります。代わりにログインを試してください。問題が解決しない場合は、[サポートにお問い合わせください](https://support.zilliz.com/)。

### Google または GitHub でサインアップする前に、MFA を無効にする必要がありますか？\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

はい。Google または GitHub アカウントでプロバイダー管理の MFA が有効になっている場合は、スムーズに登録できるよう、リンクする前に無効にしてください。後で再度有効にできます。
