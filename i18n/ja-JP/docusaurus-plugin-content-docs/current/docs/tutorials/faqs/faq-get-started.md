---
title: "FAQ:スタート | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ:スタート"
beta: FALSE
notebook: FALSE
description: "このトピックでは、 Zilliz Cloud と対応するソリューションの使い始める際に遭遇する可能性のある問題をリストします。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 1

---

# FAQ:スタート

このトピックでは、 Zilliz Cloud と対応するソリューションの使い始める際に遭遇する可能性のある問題をリストします。

## Contents

- [Zilliz Cloudと他のベクトル検索ソリューションのパフォーマンス比較はありますか?](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloudはどの種類のインデックスをサポートしていますか?](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloudの検索レイテンシーは何ですか?](#what-is-the-search-latency-of-zilliz-cloud)
- [価格はどの地域でも同じですか?](#is-pricing-the-same-in-every-region)
- [無料トライアルの後はどうなりますか?](#what-happens-after-the-free-trial)
- [Zilliz Cloud on Marketplaceの価格はいくらですか?](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [無料トライアルを延長できますか?](#can-i-extend-my-free-trial)
- [さらなる技術サポートを受けるにはどうすればよいですか?](#how-can-i-get-further-technical-support)

## FAQs




### Zilliz Cloudと他のベクトル検索ソリューションのパフォーマンス比較はありますか?{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。ベクトルデータベースのベンチマークツールである[VectorDBBench](https://zilliz.com/vector-database-benchmark-tool)を使用して、Zilliz Cloudと他の主流のベクトルデータベースやクラウドサービスのパフォーマンスを比較することができます。

### Zilliz Cloudはどの種類のインデックスをサポートしていますか?{#which-type-of-index-is-supported-by-zilliz-cloud}

現在、Zilliz Cloudは独自のインデックスタイプであるAUTOINDEXのみをサポートしており、より良い検索パフォーマンスを実現するのに役立ちます。 

150万個の768次元ベクトルを持つperformance-optimizedクラスタの場合、QPSは数百に達し、レイテンシは100ミリ秒以下になります。500万個の768次元ベクトルを持つ容量最適化クラスタの場合、QPSは50に達し、レイテンシは200ミリ秒以上になります。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」を参照してください。

ただし、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。当社がサポートする[インデックスのいずれかの](https://milvus.io/docs/index.md)使用に精通している場合。アプリケーションの需要を評価し、インデックスを有効にすることができます。

### Zilliz Cloudの検索レイテンシーは何ですか?{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシはCUタイプとデータ量に依存します。 

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>CUPerformance-optimized(76 8-dim 1 Mベクトル)の遅延</p></th>
     <th><p>容量最適化CU（76 8-dim 5 Mベクトル）のレイテンシ</p></th>
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

テスト結果の詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

### 価格はどの地域でも同じですか?{#is-pricing-the-same-in-every-region}

要するに、クラウドサービスの価格はプロバイダーや地域によって異なることがよくあります。クラウドデータベースサービスが依存する基本的な物理リソースのコストなど、いくつかの要因がこれらの違いに寄与しています。詳細については、「[価格設定](https://zilliz.com/pricing)」を参照してください。

### 無料トライアルの後はどうなりますか?{#what-happens-after-the-free-trial}

無料トライアルが終了した後も、無料のクラスターにアクセスできます。ただし、サーバーレスおよび専用クラスター内のすべてのデータはごみ箱に移動され、30日間そこに保持されます。クラスターデータを安全に復元するには、サーバーレスまたは専用プランに加入して、払い戻し方法を提供してください。トライアル期間中にPoCを完了していない場合は、トライアル期間を延長するために[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

### Zilliz Cloud on Marketplaceの価格はいくらですか?{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

マーケットプレイスの価格条件の詳細については、「[支払いと請求](./payment-billing)」を参照してください。

### 無料トライアルを延長できますか?{#can-i-extend-my-free-trial}

はい、可能です。Zilliz Cloudに登録すると、30日間有効な$100のクレジットを受け取ることができます。支払い方法を追加することで、これらのクレジットの有効期間を1年間延長することができます。

### さらなる技術サポートを受けるにはどうすればよいですか?{#how-can-i-get-further-technical-support}

Zillizクラウド[サポートポータル](https://support.zilliz.com/hc/en-us)でリクエストを送信してください。
