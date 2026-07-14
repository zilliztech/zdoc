---
title: "FAQ: モニターとメトリクス | CLOUD"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ: モニターとメトリクス"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で発生する可能性があるモニターとメトリクスに関する問題と、それに対応する解決策を一覧で示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9
displayed_sidebar: default

---

# FAQ: モニターとメトリクス

このトピックでは、Zilliz Cloud で発生する可能性があるモニターとメトリクスに関する問題と、それに対応する解決策を一覧で示します。

## 目次

- [頻繁な挿入および削除操作の間に、cluster の CU capacity と storage usage が一時的に増加するのはなぜですか？](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [cluster の memory quota を使い切ってしまい、その結果データを挿入できない場合はどうすればよいですか？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [collection を削除したのに memory consumption が減少しないのはなぜですか？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## FAQs




### 頻繁な挿入および削除操作の間に、cluster の CU capacity と storage usage が一時的に増加するのはなぜですか？\{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な挿入および削除操作は、*[compaction](https://milvus.io/blog/2022-2-21-compact.md)* と呼ばれる内部プロセスをトリガーします。

- **挿入の場合**: Compaction は小さなセグメントをより大きなセグメントに結合し、検索パフォーマンスを大幅に向上させることがあります。

- **削除の場合**: データはすぐには削除されません。代わりに削除対象としてマークされ、compaction の後にのみ削除されます。

Compaction の実行中は新しいセグメントが一時的に作成されるため、storage usage と CU capacity が短期間増加することがあります。ガベージコレクション（GC）が発生すると、古いセグメントが削除され、storage と CU capacity の両方が想定されるレベルに戻ります。

この動作は正常であり、システムパフォーマンスには影響しません。

### cluster の memory quota を使い切ってしまい、その結果データを挿入できない場合はどうすればよいですか？\{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

次の 2 つの方法を試すことができます。

1. cluster をより大きな CU サイズに[スケールアップ](./manage-cluster)します。CU サイズが大きい cluster は、より多くのデータを処理できます。

1. memory usage を節約するために、頻繁に使用しないロード済み collection を解放します。

### collection を削除したのに memory consumption が減少しないのはなぜですか？\{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

削除された collection 内のデータは 24 時間後にクリーンアップされます。24 時間経過しても memory consumption が減少しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。
