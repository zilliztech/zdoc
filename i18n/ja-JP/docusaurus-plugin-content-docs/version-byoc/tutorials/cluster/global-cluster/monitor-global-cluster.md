---
title: "グローバルクラスターの監視 | BYOC"
slug: /monitor-global-cluster
sidebar_key: monitor-global-cluster
sidebar_label: "グローバルクラスターを監視"
beta: FALSE
notebook: FALSE
description: "グローバルクラスターの監視 | BYOC"
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

このページでは、グローバルクラスターの健全性、レプリケーション状態、およびパフォーマンスを監視する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

この機能は、Business Critical（SaaS）および BYOC デプロイでのみ利用できます。

この機能は、すべての AWS リージョンと、Google Cloud の gcp-us-central1 および gcp-us-east4 リージョンで利用できます。Microsoft Azure では利用できません。

</Admonition>

## グローバルトポロジー\{#global-topology}

グローバルクラスターページの **グローバルトポロジー** カードでは、グローバルクラスターの構造と健全性をリアルタイムで確認できます。

![GbpRw8cuyhmqKLbVHmUcUugenNb](https://zdoc-images.s3.us-west-2.amazonaws.com/GbpRw8cuyhmqKLbVHmUcUugenNb.png)

グローバルトポロジーカードには以下が表示されます：

- プライマリークラスターとすべてのセカンダリークラスター、そのリージョン、レプリカ数情報

- 各クラスターの現在の状態

- プライマリと各セカンダリ間の同期状態と遅延

このビューを使用して、スイッチオーバーなどの操作を実行する前に、すべてのセカンダリークラスターが同期されて健全であることを確認してください。

## クラスター状態\{#cluster-status}

グローバルクラスター内の各個別クラスターは、以下のいずれかの状態を報告します：

<table>
   <tr>
     <th><p><strong>状態</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>対応</strong></p></th>
   </tr>
   <tr>
     <td><p>CREATING</p></td>
     <td><p>クラスターがプロビジョニング中です。フェイルオーバー後にセカンダリークラスターが再構築または自動再作成される場合にも適用されます。</p></td>
     <td><p>プロビジョニングが完了するまで待ちます。</p></td>
   </tr>
   <tr>
     <td><p>RUNNING</p></td>
     <td><p>クラスターが正常に動作しています。</p></td>
     <td><p>なし。</p></td>
   </tr>
   <tr>
     <td><p>ABNORMAL</p></td>
     <td><p>プライマリークラスターで問題が検出されました。</p></td>
     <td><p>問題を調査してください。プライマリに到達できない場合は、<a href="./switchover-and-failover">フェイルオーバー</a> の開始を検討してください。必要に応じて <a href="http://support.zilliz.com/">サポートにお問い合わせ</a> ください。</p></td>
   </tr>
   <tr>
     <td><p>SWITCHING</p></td>
     <td><p>スイッチオーバーまたはフェイルオーバーが進行中です。プライマリロールが移行されています。</p></td>
     <td><p>操作が完了するまで待ちます。追加のスイッチオーバーを開始しないでください。</p></td>
   </tr>
</table>

## 同期遅延\{#synchronization-lag}

同期遅延は、プライマリークラスターでコミットされた書き込みがセカンダリークラスターで利用可能になるまでの遅延を測定します。各セカンダリークラスターの同期遅延は、**グローバルトポロジー** タブで監視できます。

- 通常の条件下では、同期遅延は通常数秒です。

- 書き込み負荷が高い場合や大規模な一括インポート時には、遅延が一時的に増加する場合があります。

以下の表は、同期遅延のレベルと推奨される対応を説明しています。

<table>
   <tr>
     <th><p><strong>同期遅延</strong></p></th>
     <th><p><strong>意味</strong></p></th>
   </tr>
   <tr>
     <td><p>&lt; 5 秒</p></td>
     <td><p>正常。セカンダリークラスターはほぼ最新の状態です。</p></td>
   </tr>
   <tr>
     <td><p>5～30 秒</p></td>
     <td><p>上昇。<a href="./switchover-and-failover#perform-a-switchover">スイッチオーバー</a> はまだ実行可能です。持続的な増加を監視してください。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>30 秒</p></blockquote></td>
     <td><p><a href="./switchover-and-failover#perform-a-switchover">スイッチオーバー</a> はブロックされます。書き込み負荷またはセカンダリークラスターの健全性を調査してください。スイッチオーバーを試みる前に根本原因を解決してください。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>180 秒</p></blockquote></td>
     <td><p>重大。<a href="./switchover-and-failover#perform-a-failover">フェイルオーバー</a> の RPO リスクが大きいです。直ちに調査が必要です。</p></td>
   </tr>
</table>

同期遅延が高い状態で [フェイルオーバー](./switchover-and-failover#perform-a-failover) を実行すると、新しいプライマリークラスターに最近の書き込みが欠落している可能性があります。潜在的なデータ損失の量（RPO）は、フェイルオーバー時の同期遅延に等しくなります。

## クラスターメトリクスとアラート\{#cluster-metrics-and-alerts}

グローバルクラスター内の各クラスター（プライマリーおよびセカンダリー）は、通常の Dedicated クラスターと同じメトリクスを公開します。これらのメトリクスはクラスター詳細ページで確認したり、アラートを作成したり、外部監視システムにエクスポートしたりできます。詳細については、[メトリクスリファレンス](./metrics-alerts-reference)を参照してください。
