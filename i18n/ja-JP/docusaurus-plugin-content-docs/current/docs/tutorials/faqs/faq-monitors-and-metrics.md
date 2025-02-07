---
title: "FAQ:モニターとメトリクス | CLOUD"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ:モニターとメトリクス"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudで遭遇する可能性のあるモニターとメトリックに関する問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 10

---

# FAQ:モニターとメトリクス

このトピックでは、Zilliz Cloudで遭遇する可能性のあるモニターとメトリックに関する問題と、それに対応する解決策をリストアップしています。

## Contents

- [頻繁な挿入および削除操作中にクラスタのCU容量とストレージ使用量が一時的に増加するのはなぜですか?](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [クラスタメモリクォータが枯渇してデータを挿入できない場合はどうすればよいですか?](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [コレクションをドロップしてもメモリ消費量が減らないのはなぜですか?](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## FAQs




### 頻繁な挿入および削除操作中にクラスタのCU容量とストレージ使用量が一時的に増加するのはなぜですか?{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な挿入および削除操作は、*[圧縮](https://milvus.io/blog/2022-2-21-compact.md)*と呼ばれる内部過程を引き起こします。

- **挿入の**場合:圧縮により、小さなセグメントが大きなセグメントに結合され、検索パフォーマンスが大幅に向上します。

- **削除の**場合:データはすぐに削除されません。代わりに、削除のマークが付けられ、圧縮後にのみ削除されます。

圧縮中に、新しいセグメントが一時的に作成され、ストレージ使用量とCU容量の短期的な増加につながる可能性があります。ガベージコレクション(GC)が発生すると、古いセグメントが削除され、ストレージとCU容量が予想されるレベルに戻ります。

この動作は正常であり、システムのパフォーマンスには影響しません。

### クラスタメモリクォータが枯渇してデータを挿入できない場合はどうすればよいですか?{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

以下の2つの方法を試すことができます。

1. [クラスタを](./manage-cluster)より大きなCUサイズに拡張します。CUサイズが大きいクラスタは、より多くのデータを処理できます。

1. メモリ使用量を節約するために頻繁に使用されないロードされたコレクションを解放してください。

### コレクションをドロップしてもメモリ消費量が減らないのはなぜですか?{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

ドロップされたコレクション内のデータは24時間後にクリーニングされます。24時間後もメモリ消費量が減少しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。
