---
title: "FAQ：はじめに | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ：はじめに"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudの使用を開始する際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1

---

# FAQ：はじめに

このトピックでは、Zilliz Cloudの使用を開始する際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [Zilliz Cloudと他のベクトル検索ソリューションのパフォーマンス比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloudがサポートするインデックスタイプは？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloudの検索レイテンシは？](#what-is-the-search-latency-of-zilliz-cloud)
- [価格はすべてのリージョンで同じですか？](#is-pricing-the-same-in-every-region)
- [無料トライアル終了後はどうなりますか？](#what-happens-after-the-free-trial)
- [マーケットプレイスでのZilliz Cloudの価格は？](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [より多くのクレジットを申請できますか？](#can-i-apply-for-more-credits)
- [無料トライアルを延長できますか？](#can-i-extend-my-free-trial)
- [さらに技術的なサポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)

## FAQ

### Zilliz Cloudと他のベクトル検索ソリューションのパフォーマンス比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。[VectorDBBench](https://zilliz.com/vector-database-benchmark-tool)というベクトルデータベースベンチマークツールを使用して、Zilliz Cloudと他の主要なベクトルデータベースおよびクラウドサービスのパフォーマンスを比較できます。

### Zilliz Cloudがサポートするインデックスタイプは？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz CloudはAUTOINDEXという独自のインデックスタイプのみをサポートしています。これはより良い検索パフォーマンスを実現するために役立ちます。詳細については、[AUTOINDEXの説明](./autoindex-explained)を参照してください。

ただし、サポートしている[インデックスのいずれか](https://milvus.io/docs/index.md)の使用に精通している場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。アプリケーションの要求を評価し、インデックスを有効にするお手伝いをします。

### Zilliz Cloudの検索レイテンシは？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシはCUタイプとデータ量に依存します。

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>パフォーマンス最適化CUのレイテンシ（768次元100万ベクトル）</p></th>
     <th><p>容量最適化CUのレイテンシ（768次元500万ベクトル）</p></th>
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

テスト結果の詳細については、[適切なCUの選択](./cu-types-explained)を参照してください。

### 価格はすべてのリージョンで同じですか？\{#is-pricing-the-same-in-every-region}

簡潔に言えば、クラウドサービスの価格はプロバイダーおよびリージョンによって異なることが多いです。これらの違いには、クラウドデータベースサービスが依存する基盤となる物理リソースのコストなどの要因が関与しています。詳細については、[価格](https://zilliz.com/pricing)を参照してください。

### 無料トライアル終了後はどうなりますか？\{#what-happens-after-the-free-trial}

無料トライアルが終了すると、無料クラスターに引き続きアクセスできます。ただし、サーバーレスおよび専用クラスター内のすべてのデータはごみ箱に移動され、30日間保持されます。クラスターデータを安全に復旧するには、支払い方法を入力してください。詳細については、[Zilliz Cloudを無料でお試しください](./free-trials#use-free-trial)を参照してください。

### マーケットプレイスでのZilliz Cloudの価格は？\{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

マーケットプレイスの価格条件について詳しくは、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

### より多くのクレジットを申請できますか？\{#can-i-apply-for-more-credits}

Zilliz Cloudで勤務先のメールアドレスで登録すると、&#36;100の無料クレジットが付与されます。[マーケットプレイス](./subscribe-on-aws-marketplace)でZilliz Cloudを登録することで、追加の$100クレジットを獲得できます。追加のクレジットと割引については、[営業担当にお問い合わせ](https://zilliz.com/contact-sales)ください。

### 無料トライアルを延長できますか？\{#can-i-extend-my-free-trial}

はい、可能です。Zilliz Cloudに登録すると、30日間有効な&#36;100のクレジットを受け取ることができます。[支払い方法を追加](./payment-billing)することで、これらのクレジットの有効期間を1年間延長できます。

### さらに技術的なサポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zilliz Cloudの[サポートポータル](https://support.zilliz.com/hc/en-us)でリクエストを送信してください。