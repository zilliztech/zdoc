---
title: "FAQ: Monitors & Metrics | BYOC"
slug: /faq-monitors-and-metrics
sidebar_label: "FAQ: Monitors & Metrics"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で発生する可能性のある monitors および metrics に関する問題と、それに対応する解決策を紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 9
displayed_sidebar: default

---

# FAQ: Monitors & Metrics

このトピックでは、Zilliz Cloud で発生する可能性のある monitors および metrics に関する問題と、それに対応する解決策を紹介します。

## 目次

- [頻繁な insert および delete 操作中に、cluster の CU capacity と storage usage が一時的に増加するのはなぜですか？](#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations)
- [cluster の memory quota を使い切ってしまい、その結果データを insert できない場合はどうすればよいですか？](#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result)
- [collection を drop しても memory consumption が減少しないのはなぜですか？](#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection)

## FAQs




### 頻繁な insert および delete 操作中に、cluster の CU capacity と storage usage が一時的に増加するのはなぜですか？\{#why-does-the-clusters-cu-capacity-and-storage-usage-increase-temporarily-during-frequent-insert-and-delete-operations}

頻繁な insert および delete 操作は、内部プロセスである *[compaction](https://milvus.io/blog/2022-2-21-compact.md)* を引き起こします。

- **insert の場合**: compaction は小さな segment をより大きなものに結合し、search performance を大幅に向上させることがあります。

- **delete の場合**: データは即座には削除されません。代わりに削除対象としてマークされ、compaction 後にのみ削除されます。

compaction 中には新しい segment が一時的に作成されるため、storage usage と CU capacity が短期間増加することがあります。garbage collection (GC) が発生すると、古い segment が削除され、storage と CU capacity の両方が想定されるレベルまで戻ります。

この挙動は正常であり、システム performance に影響はありません。

### cluster の memory quota を使い切ってしまい、その結果データを insert できない場合はどうすればよいですか？\{#what-can-i-do-if-my-cluster-memory-quota-has-been-exhausted-and-i-cannot-insert-data-as-a-result}

次の 2 つの方法を試すことができます。

1. cluster をより大きな CU サイズに [scale up](./manage-cluster) します。CU サイズが大きい cluster ほど、より多くのデータを処理できます。

1. あまり使用しない load 済み collection を release して、memory usage を節約します。

### collection を drop しても memory consumption が減少しないのはなぜですか？\{#why-doesnt-the-memory-consumption-decrease-even-if-i-dropped-a-collection}

drop された collection 内のデータは 24 時間後にクリーンアップされます。24 時間経過しても memory consumption が減少しない場合は、[リクエストを送信してください](https://support.zilliz.com/hc/en-us)。
