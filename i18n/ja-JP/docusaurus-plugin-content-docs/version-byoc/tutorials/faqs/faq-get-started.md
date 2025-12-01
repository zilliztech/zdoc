---
title: "FAQ: はじめに | BYOC"
slug: /faq-get-started
sidebar_label: "FAQ: はじめに"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudの利用を開始する際に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1

---

# FAQ: はじめに

このトピックでは、Zilliz Cloudの利用を開始する際に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [Zilliz Cloudと他のベクター検索ソリューションとの間にパフォーマンス比較はありますか？](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Zilliz Cloudはどのタイプのインデックスをサポートしていますか？](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Zilliz Cloudの検索レイテンシはどれくらいですか？](#what-is-the-search-latency-of-zilliz-cloud)
- [さらに技術的なサポートを受けるにはどうすればよいですか？](#how-can-i-get-further-technical-support)

## よくある質問




### Zilliz Cloudと他のベクター検索ソリューションとの間にパフォーマンス比較はありますか？\{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

はい。[VectorDBBench](https://zilliz.com/vector-database-benchmark-tool)というベクターデータベースのベンチマーキングツールを使用して、Zilliz Cloudと他の主要なベクターデータベースおよびクラウドサービスのパフォーマンスを比較できます。

### Zilliz Cloudはどのタイプのインデックスをサポートしていますか？\{#which-type-of-index-is-supported-by-zilliz-cloud}

現在のところ、Zilliz CloudはAUTOINDEXのみをサポートしており、これはより良い検索パフォーマンスを実現できる独自のインデックスタイプです。詳細については、[AUTOINDEXの説明](./autoindex-explained)を参照してください。

ただし、[サポートしているインデックス](https://milvus.io/docs/index.md)のいずれかの使用に慣れていらっしゃる場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。お客様のアプリケーションの要件を評価し、インデックスを有効化するお手伝いをいたします。

### Zilliz Cloudの検索レイテンシはどれくらいですか？\{#what-is-the-search-latency-of-zilliz-cloud}

検索レイテンシはCUタイプとデータボリュームに依存します。

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>パフォーマンス最適化型CUのレイテンシ（768次元100万ベクトル）</p></th>
     <th><p>容量最適化型CUのレイテンシ（768次元500万ベクトル）</p></th>
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

### さらに技術的なサポートを受けるにはどうすればよいですか？\{#how-can-i-get-further-technical-support}

Zillizクラウド[サポートポータル](https://support.zilliz.com/hc/en-us)でリクエストを送信してください。
