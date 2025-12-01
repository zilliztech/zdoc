---
title: "FAQ：モニターとメトリクス | CLOUD"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ：モニターとメトリクス"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud上でモニターとメトリクスに関する問題に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9

---

# FAQ：モニターとメトリクス

このトピックでは、Zilliz Cloud上でモニターとメトリクスに関する問題に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [頻繁な挿入および削除操作中にクラスターのCU容量とストレージ使用量が一時的に増加する理由は？](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [クラスターメモリクォータが使い果たされ、その結果データを挿入できない場合、どうすればよいですか？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [コレクションを削除してもメモリ消費量が減少しない理由は？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## FAQ

### 頻繁な挿入および削除操作中にクラスターのCU容量とストレージ使用量が一時的に増加する理由は？\{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な挿入および削除操作は、*[コンパクション](https://milvus.io/blog/2022-2-21-compact.md)*と呼ばれる内部プロセスをトリガーします。

- **挿入の場合**：コンパクションは小さなセグメントを大きなセグメントに結合し、検索パフォーマンスを大幅に向上させることができます。

- **削除の場合**：データは即座に削除されるのではなく、削除予定としてマークされ、コンパクション後にのみ削除されます。

コンパクション中は一時的に新しいセグメントが作成され、ストレージ使用量とCU容量が短期的に増加することがあります。ガベージコレクション（GC）が発生すると、古いセグメントが削除され、ストレージとCU容量は期待されるレベルに戻ります。

この動作は正常であり、システムパフォーマンスに影響することはありません。

### クラスターメモリクォータが使い果たされ、その結果データを挿入できない場合、どうすればよいですか？\{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

以下の2つの方法を試すことができます。

1. クラスターをより大きなCUサイズに[スケールアップ](./manage-cluster)してください。より大きなCUサイズのクラスターはより多くのデータを処理できます。

2. 頻繁に使用されていないロードされたコレクションを解放し、メモリ使用量を節約してください。

### コレクションを削除してもメモリ消費量が減少しない理由は？\{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

削除されたコレクションのデータは24時間後にクリーンアップされます。24時間経過後もメモリ消費量が減少しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。