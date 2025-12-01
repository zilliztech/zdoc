---
title: "FAQ: モニターとメトリクス | BYOC"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ: モニターとメトリクス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでモニターとメトリクスに関する問題に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9

---

# FAQ: モニターとメトリクス

このトピックでは、Zilliz Cloudでモニターとメトリクスに関する問題に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [頻繁な挿入および削除操作中にクラスターのCU容量とストレージ使用量が一時的に増加するのはなぜですか？](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [クラスターメモリクォータが使い果たされ、その結果としてデータを挿入できない場合、どうすればよいですか？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [コレクションを削除してもメモリ消費量が減少しないのはなぜですか？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## よくある質問




### 頻繁な挿入および削除操作中にクラスターのCU容量とストレージ使用量が一時的に増加するのはなぜですか？\{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な挿入および削除操作は、*[コンパクション](https://milvus.io/blog/2022-2-21-compact.md)*と呼ばれる内部プロセスをトリガーします。

- **挿入の場合**：コンパクションは小さなセグメントを大きなセグメントに結合し、検索パフォーマンスを大幅に向上させることができます。

- **削除の場合**：データは即座に削除されず、代わりに削除のマークが付けられ、コンパクション後でのみ削除されます。

コンパクション中に新しいセグメントが一時的に作成されるため、ストレージ使用量とCU容量が短期間増加する可能性があります。ガベージコレクション（GC）が発生すると、古いセグメントが削除され、ストレージとCU容量は期待されるレベルに戻ります。

この動作は正常であり、システムパフォーマンスに影響を与えません。

### クラスターメモリクォータが使い果たされ、その結果としてデータを挿入できない場合、どうすればよいですか？\{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

以下の2つの方法を試すことができます。

1. [スケールアップ](./manage-cluster)してクラスターをより大きなCUサイズに変更します。より大きなCUサイズを持つクラスターは、より多くのデータを処理できます。

2. 頻繁に使用されていないロードされたコレクションを解放して、メモリ使用量を節約します。

### コレクションを削除してもメモリ消費量が減少しないのはなぜですか？\{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

削除されたコレクションのデータは24時間後にクリーンアップされます。24時間経過後もメモリ消費量が減少しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。
