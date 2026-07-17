---
title: "グローバルクラスターの監視 | BYOC"
slug: /monitor-global-cluster
sidebar_label: "グローバルクラスターの監視"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、グローバルクラスターの正常性、レプリケーション状態、パフォーマンスを監視する方法について説明します。 | BYOC"
type: origin
token: ZQqowpu4Oi0xIPkyRSTconB6nnb
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# グローバルクラスターの監視

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能はすべての AWS リージョン、および以下の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

このページでは、グローバルクラスターの正常性、レプリケーション状態、パフォーマンスを監視する方法について説明します。

## グローバルトポロジー\{#global-topology}

グローバルクラスターのページにある **Global Topology** カードでは、グローバルクラスターの構成と正常性をリアルタイムで確認できます。 

![GbpRw8cuyhmqKLbVHmUcUugenNb](https://zdoc-images.s3.us-west-2.amazonaws.com/GbpRw8cuyhmqKLbVHmUcUugenNb.png)

Global Topology カードには以下が表示されます。

- プライマリクラスターとすべてのセカンダリクラスター、それぞれのリージョン、レプリカ数の情報

- 各クラスターの現在のステータス

- プライマリと各セカンダリクラスター間の同期状態およびラグ

このビューを使用して、スイッチオーバーなどの操作を実行する前に、すべてのセカンダリクラスターが同期済みで正常であることを確認してください。

## クラスターのステータス\{#cluster-status}

グローバルクラスター内の各クラスターは、以下のいずれかのステータスを報告します。

| **ステータス** | **説明** | **対応** |
| --- | --- | --- |
| CREATING | クラスターをプロビジョニング中です。フェイルオーバー後に再構築中、または自動再作成中のセカンダリクラスターにも適用されます。 | プロビジョニングが完了するまで待機してください。 |
| RUNNING | クラスターは正常に動作しています。 | なし。 |
| ABNORMAL | プライマリクラスターで問題が検出されました。 | 問題を調査してください。プライマリに到達できない場合は、[フェイルオーバー](./switchover-and-failover) の開始を検討してください。必要に応じて [サポートに連絡](http://support.zilliz.com/) してください。 |
| SWITCHING | スイッチオーバーまたはフェイルオーバーが進行中です。プライマリロールを移行しています。 | 操作が完了するまで待機してください。追加のスイッチオーバーは開始しないでください。 |

## 同期ラグ\{#synchronization-lag}

同期ラグは、プライマリクラスターでコミットされた書き込みがセカンダリクラスターで利用可能になるまでの遅延を測定します。各セカンダリクラスターの同期ラグは **Global Topology** タブで監視できます。

- 通常の条件下では、同期ラグは一般的に数秒です。

- 書き込み負荷が高い場合や大規模なバルクインポート中には、ラグが一時的に増加することがあります。

以下の表では、同期ラグのレベルと推奨される対応を説明します。

| **同期ラグ** | **影響** |
| --- | --- |
| < 5 seconds | 正常です。セカンダリクラスターはほぼ最新の状態です。 |
| 5–30 seconds | 上昇しています。[スイッチオーバー](./switchover-and-failover#perform-a-switchover) は引き続き許可されます。増加が継続しないか監視してください。 |
| > 30 seconds | [スイッチオーバー](./switchover-and-failover#perform-a-switchover) はブロックされます。書き込み負荷またはセカンダリクラスターの正常性を調査してください。スイッチオーバーを試行する前に根本原因を解決してください。 |
| > 180 seconds | 重大です。[フェイルオーバー](./switchover-and-failover#perform-a-failover) の RPO リスクが大きくなります。直ちに調査が必要です。 |

同期ラグが高い状態で [フェイルオーバー](./switchover-and-failover#perform-a-failover) を実行すると、新しいプライマリクラスターに最近の書き込みが反映されていない可能性があります。潜在的なデータ損失量 (RPO) は、フェイルオーバー時点の同期ラグに等しくなります。

## クラスターのメトリクスとアラート\{#cluster-metrics-and-alerts}

グローバルクラスター内の各クラスター — プライマリとセカンダリの両方 — は、通常の Dedicated クラスターと同じメトリクスを公開します。これらのメトリクスはクラスター詳細ページで確認でき、これらのメトリクスに対するアラートを作成したり、外部監視システムにエクスポートしたりできます。詳細については、[Metrics Reference](./metrics-alerts-reference) を参照してください。

