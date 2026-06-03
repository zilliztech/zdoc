---
title: "FAQ: 監視とメトリクス | CLOUD"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ: 監視とメトリクス"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud の監視とメトリクスに関して発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9

---

# FAQ: 監視とメトリクス

このトピックでは、Zilliz Cloud の監視とメトリクスに関して発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [頻繁な挿入および削除操作中に、クラスターの CU 容量とストレージ使用量が一時的に増加するのはなぜですか？](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [クラスターのメモリクォータを使い切り、その結果データを挿入できない場合はどうすればよいですか？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [コレクションを削除してもメモリ消費量が減らないのはなぜですか？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## よくある質問




### 頻繁な挿入および削除操作中に、クラスターの CU 容量とストレージ使用量が一時的に増加するのはなぜですか？\{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な挿入および削除操作は、*[compaction](https://milvus.io/blog/2022-2-21-compact.md)* と呼ばれる内部プロセスをトリガーします。

- **挿入の場合**: Compaction は小さなセグメントを大きなセグメントに結合し、検索性能を大幅に向上させることがあります。

- **削除の場合**: データはすぐには削除されません。代わりに削除対象としてマークされ、compaction 後にのみ削除されます。

Compaction 中は新しいセグメントが一時的に作成されるため、短期的にストレージ使用量と CU 容量が増加することがあります。ガベージコレクション (GC) が発生すると、古いセグメントが削除され、ストレージと CU 容量の両方が想定されるレベルに戻ります。

この動作は正常であり、システム性能には影響しません。

### クラスターのメモリクォータを使い切り、その結果データを挿入できない場合はどうすればよいですか？\{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

次の 2 つの方法を試すことができます。

1. クラスターをより大きな CU サイズに[スケールアップ](./manage-cluster)します。より大きな CU サイズのクラスターは、より多くのデータを処理できます。

1. 頻繁に使用しないロード済みコレクションをリリースして、メモリ使用量を節約します。

### コレクションを削除してもメモリ消費量が減らないのはなぜですか？\{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

削除されたコレクション内のデータは 24 時間後にクリーンアップされます。24 時間経過してもメモリ消費量が減らない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。
