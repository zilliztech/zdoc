---
title: "グローバルクラスターの監視 | Cloud"
slug: /monitor-global-cluster
sidebar_key: monitor-global-cluster
sidebar_label: "グローバルクラスターの監視"
beta: FALSE
notebook: FALSE
description: "このページでは、グローバルクラスターのヘルス、レプリケーションステータス、パフォーマンスを監視する方法について説明します。 | Cloud"
type: origin
token: ZQqowpu4Oi0xIPkyRSTconB6nnb
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - グローバルクラスター
  - 監視
  - メトリクス

---

import Admonition from '@theme/Admonition';


# グローバルクラスターの監視

このページでは、グローバルクラスターのヘルス、レプリケーションステータス、およびパフォーマンスを監視する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## グローバルトポロジー\{#global-topology}

グローバルクラスターページの **グローバルトポロジー** カードは、グローバルクラスターの構造とヘルスのリアルタイムビューを提供します。

![GbpRw8cuyhmqKLbVHmUcUugenNb](https://zdoc-images.s3.us-west-2.amazonaws.com/GbpRw8cuyhmqKLbVHmUcUugenNb.png)

グローバルトポロジーカードには以下が表示されます：

- リージョンとレプリカ数情報を含むプライマリークラスターおよびすべてのセカンダリークラスター
- 各クラスターの現在のステータス
- プライマリークラスターと各セカンダリークラスター間の同期ステータスとラグ

このビューを使用して、スイッチオーバーなどの操作を実行する前に、すべてのセカンダリークラスターが同期されており正常であることを確認してください。

## クラスターステータス\{#cluster-status}

グローバルクラスター内の個々のクラスターは、以下のいずれかのステータスを報告します：

<table>
   <tr>
     <th><p><strong>Status</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Action</strong></p></th>
   </tr>
   <tr>
     <td><p>CREATING</p></td>
     <td><p>クラスターのプロビジョニング中です。フェイルオーバー後に再構築または自動再作成されるセカンダリークラスターにも適用されます。</p></td>
     <td><p>プロビジョニングが完了するまで待機してください。</p></td>
   </tr>
   <tr>
     <td><p>RUNNING</p></td>
     <td><p>クラスターは正常に動作しています。</p></td>
     <td><p>なし。</p></td>
   </tr>
   <tr>
     <td><p>ABNORMAL</p></td>
     <td><p>プライマリークラスターで問題が検出されました。</p></td>
     <td><p>問題を調査してください。プライマリーに到達できない場合は、<a href="./switchover-and-failover">フェイルオーバー</a> の開始を検討してください。必要に応じて<a href="http://support.zilliz.com/">サポートにお問い合わせ</a>ください。</p></td>
   </tr>
   <tr>
     <td><p>SWITCHING</p></td>
     <td><p>スイッチオーバーまたはフェイルオーバーが進行中です。プライマリーロールが転送されています。</p></td>
     <td><p>操作が完了するまで待機してください。追加のスイッチオーバーを開始しないでください。</p></td>
   </tr>
</table>

## 同期ラグ\{#synchronization-lag}

同期ラグは、プライマリークラスターでコミットされた書き込みがセカンダリークラスターで利用可能になるまでの遅延時間を測定します。**グローバルトポロジー** タブで各セカンダリークラスターの同期ラグを監視できます。

- 通常の条件下では、同期ラグは通常数秒です。
- 重い書き込みワークロード中や大規模なバルクインポート中には、ラグが一時的に増加する可能性があります。

以下の表は、同期ラグのレベルと推奨されるアクションを説明しています。

<table>
   <tr>
     <th><p><strong>Synchronization lag</strong></p></th>
     <th><p><strong>Implication</strong></p></th>
   </tr>
   <tr>
     <td><p>&lt; 5 秒</p></td>
     <td><p>正常。セカンダリークラスターはほぼ最新の状態です。</p></td>
   </tr>
   <tr>
     <td><p>5〜30 秒</p></td>
     <td><p>上昇傾向。<a href="./switchover-and-failover#perform-a-switchover">スイッチオーバー</a> は引き続き許可されています。持続的な増加を監視してください。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>30 秒</p></blockquote></td>
     <td><p><a href="./switchover-and-failover#perform-a-switchover">スイッチオーバー</a> がブロックされます。書き込み負荷またはセカンダリークラスターのヘルスを調査してください。スイッチオーバーを試みる前に根本原因を解決してください。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>180 秒</p></blockquote></td>
     <td><p>重大。<a href="./switchover-and-failover#perform-a-failover">フェイルオーバー</a> における RPO リスクが顕著です。即時の調査が必要です。</p></td>
   </tr>
</table>

同期ラグが高い状態で [フェイルオーバー](./switchover-and-failover#perform-a-failover) を実行すると、新しいプライマリークラスターに最近の書き込みが含まれていない可能性があります。潜在的なデータ損失量（RPO）は、フェイルオーバー時点での同期ラグに相当します。

## クラスターメトリクスとアラート\{#cluster-metrics-and-alerts}

グローバルクラスター内の各クラスター（プライマリーおよびセカンダリーの両方）は、通常の Dedicated クラスターと同じメトリクスを公開します。これらのメトリクスはクラスター詳細ページで表示したり、アラートを作成したり、外部の監視システムにエクスポートしたりできます。詳細については、[Metrics & Alerts](./metrics-and-alerts) を参照してください。

