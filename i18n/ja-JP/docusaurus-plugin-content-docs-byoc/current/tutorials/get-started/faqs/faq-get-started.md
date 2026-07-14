---
title: "FAQ: はじめに | BYOC"
slug: /faq-get-started
sidebar_label: "FAQ: はじめに"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、その対応する解決策を一覧で示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
displayed_sidebar: default

---

# FAQ: はじめに

このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、その対応する解決策を一覧で示します。

## 目次

- [Zilliz Cloud と他のベクトル検索ソリューションとの間に性能比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloud はどの種類のインデックスをサポートしていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloud の検索レイテンシはどのくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [さらに技術サポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)
- [GitHub アカウントでサインアップできますか？](#can-i-sign-up-with-my-github-account)
- [サインアップ中にメール認証コードを受け取れませんでした。どうすればよいですか？](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [登録に失敗したのはなぜですか？](#why-did-my-registration-fail)
- [Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## FAQ




### Zilliz Cloud と他のベクトル検索ソリューションとの間に性能比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。ベクトルデータベースのベンチマークツールである [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) を使用して、Zilliz Cloud と他の主要なベクトルデータベースやクラウドサービスの性能を比較できます。

### Zilliz Cloud はどの種類のインデックスをサポートしていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloud は AUTOINDEX のみをサポートしています。これは、より優れた検索性能の実現に役立つ独自のインデックスタイプです。詳細については、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

ただし、当社がサポートしている [いずれかのインデックス](https://milvus.io/docs/index.md) の使用に慣れている場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us) してください。お客様のアプリケーション要件の評価を支援し、それらのインデックスを有効化できます。

### Zilliz Cloud の検索レイテンシはどのくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシは、クラスターのタイプとデータ量によって異なります。 

| top_k | Performance-optimized クラスターのレイテンシ (768 次元、100 万ベクトル) | Capacity-optimized クラスターのレイテンシ (768 次元、500 万ベクトル) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

テスト結果の詳細については、[適切な CU を選択する](./cu-types-explained) を参照してください。

### さらに技術サポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloud の [サポートポータル](https://support.zilliz.com/hc/en-us) でリクエストを送信してください。

### GitHub アカウントでサインアップできますか？\{#can-i-sign-up-with-my-github-account}

はい。ただし、GitHub アカウントには公開メールアドレスが設定されている必要があります。GitHub のプロフィール設定に移動し、登録前にメールアドレスを公開にしてください。

### サインアップ中にメール認証コードを受け取れませんでした。どうすればよいですか？\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

認証ページで "Resend" をクリックしてください。それでも受け取れない場合は、迷惑メールフォルダを確認してください。

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスですでにアカウントをお持ちの可能性があります。代わりにログインを試してください。問題が解決しない場合は、[サポートに連絡](https://support.zilliz.com/) してください。

### Google または GitHub でサインアップする前に MFA を無効にする必要がありますか？\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

はい。Google または GitHub アカウントでプロバイダー管理の MFA が有効になっている場合は、スムーズに登録できるよう、リンクする前に無効にしてください。その後で再度有効にできます。
