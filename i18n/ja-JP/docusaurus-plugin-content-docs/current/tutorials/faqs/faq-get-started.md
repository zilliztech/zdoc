---
title: "FAQ: はじめに | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ: はじめに"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1

---

# FAQ: はじめに

このトピックでは、Zilliz Cloud を使い始める際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [Zilliz Cloud と他のベクトル検索ソリューションの性能比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloud ではどの種類のインデックスがサポートされていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloud の検索レイテンシはどれくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [価格はすべてのリージョンで同じですか？](#is-pricing-the-same-in-every-region)
- [無料トライアル後はどうなりますか？](#what-happens-after-the-free-trial)
- [Marketplace 上の Zilliz Cloud の価格はどうなっていますか？](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [追加の Credits を申請できますか？](#can-i-apply-for-more-credits)
- [無料トライアルを延長できますか？](#can-i-extend-my-free-trial)
- [さらに技術サポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)
- [GitHub アカウントでサインアップできますか？](#can-i-sign-up-with-my-github-account)
- [サインアップ時にメール認証コードを受信できませんでした。どうすればよいですか？](#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do)
- [登録に失敗したのはなぜですか？](#why-did-my-registration-fail)
- [Google または GitHub でサインアップする前に MFA を無効化する必要がありますか？](#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github)

## よくある質問




### Zilliz Cloud と他のベクトル検索ソリューションの性能比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。[VectorDBBench](https://zilliz.com/vector-database-benchmark-tool) というベクトルデータベースベンチマークツールを使用して、Zilliz Cloud と他の主要なベクトルデータベースおよびクラウドサービスの性能を比較できます。

### Zilliz Cloud ではどの種類のインデックスがサポートされていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloud は独自のインデックスタイプである AUTOINDEX のみをサポートしています。AUTOINDEX は、より優れた検索性能の実現に役立ちます。詳細については、[AUTOINDEX Explained](./autoindex-explained)を参照してください。

ただし、当社がサポートする[いずれかのインデックス](https://milvus.io/docs/index.md)の使用に慣れている場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。アプリケーション要件の評価と、インデックスの有効化を支援できます。

### Zilliz Cloud の検索レイテンシはどれくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシは、クラスタータイプとデータ量によって異なります。

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>Performance-optimized クラスターのレイテンシ（768 次元、100 万ベクトル）</p></th>
     <th><p>Capacity-optimized クラスターのレイテンシ（768 次元、500 万ベクトル）</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>10 - 20 ms</p></td>
     <td><p>50 - 100 ms</p></td>
   </tr>
</table>

テスト結果の詳細については、[適切な CU の選択](./cu-types-explained)を参照してください。

### 価格はすべてのリージョンで同じですか？\{#is-pricing-the-same-in-every-region}

簡単に言うと、クラウドサービスの価格はプロバイダーやリージョンによって異なることがよくあります。この違いには、クラウドデータベースサービスが依存する基盤物理リソースのコストなど、複数の要因が関係します。詳細については、[Pricing](https://zilliz.com/pricing)を参照してください。

### 無料トライアル後はどうなりますか？\{#what-happens-after-the-free-trial}

無料トライアルが終了しても、無料クラスターには引き続きアクセスできます。ただし、Serverless および Dedicated クラスター内のすべてのデータは Recycle Bin に移動され、30 日間保持されます。クラスターのデータを安全に復元するには、支払い方法を提供してください。詳細については、[Zilliz Cloud を無料で試す](./free-trials#use-free-trial)を参照してください。

### Marketplace 上の Zilliz Cloud の価格はどうなっていますか？\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

Marketplace の価格条件については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

### 追加の Credits を申請できますか？\{#can-i-apply-for-more-credits}

勤務先メールで Zilliz Cloud に登録すると、&#36;100 の無料 Credits を受け取ります。[Marketplaces](./subscribe-on-aws-marketplace) で Zilliz Cloud をサブスクライブすると、追加で &#36;100 Credits を獲得できます。追加 Credits や割引については、[営業担当にお問い合わせ](https://zilliz.com/contact-sales)ください。

### 無料トライアルを延長できますか？\{#can-i-extend-my-free-trial}

はい、できます。Zilliz Cloud に登録すると、30 日間有効な &#36;100 Credits を受け取ります。[支払い方法を追加](./payment-billing)することで、これらの Credits の有効期限を 1 年に延長できます。

### さらに技術サポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloud の[サポートポータル](https://support.zilliz.com/hc/en-us)からリクエストを送信してください。

### GitHub アカウントでサインアップできますか？\{#can-i-sign-up-with-my-github-account}

はい。ただし、GitHub アカウントに公開メールアドレスが設定されている必要があります。登録前に GitHub プロフィール設定に移動し、メールアドレスを公開してください。

### サインアップ時にメール認証コードを受信できませんでした。どうすればよいですか？\{#during-signup-i-did-not-receive-the-email-verification-code-what-should-i-do}

認証ページで "Resend" をクリックしてください。それでも受信できない場合は、迷惑メールフォルダーを確認してください。

### 登録に失敗したのはなぜですか？\{#why-did-my-registration-fail}

同じメールアドレスのアカウントがすでに存在している可能性があります。代わりにログインを試してください。問題が解決しない場合は、[サポートにお問い合わせ](https://support.zilliz.com/)ください。

### Google または GitHub でサインアップする前に MFA を無効化する必要がありますか？\{#do-i-need-to-disable-mfa-before-signing-up-with-google-or-github}

はい。Google または GitHub アカウントでプロバイダー管理の MFA が有効になっている場合は、スムーズに登録できるよう、連携前に無効化してください。登録後に再度有効化できます。
