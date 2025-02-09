---
title: "メトリクスとアラートのリファレンス | BYOC"
slug: /metrics-alerts-reference
sidebar_label: "メトリクスとアラートのリファレンス"
beta: FALSE
notebook: FALSE
description: "このリファレンスでは、Zilliz Cloudクラスターの監視メトリクスの説明、および組織およびプロジェクトレベルで設定できるアラートターゲットについて説明しています。 | BYOC"
type: origin
token: Nn8fwYNLmiBZLBkeJIycUARFnfd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# メトリクスとアラートのリファレンス

このリファレンスでは、Zilliz Cloudクラスターの監視メトリクスの説明、および組織およびプロジェクトレベルで設定できるアラートターゲットについて説明しています。

## クラスタメトリクス{#cluster-metrics}

Zilliz Cloudコンソールの**メトリクス**タブには、さまざまなグラフィカルな表現が表示されます。

表には、各メトリックの説明と、クラスターリソースの使用量がしきい値を超えた場合に実行することをお勧めするアクションが示されています。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、無料クラスタではCU容量という1つのメトリックしか提供されていません。高度なメトリックの範囲を解除するには、<a href="./manage-cluster">プランレベルをアップグレード</a>してください。</p>

</Admonition>

\<table>
   <tr>
     <th><p>メトリック名</p></th>
     <th><p>ユニット</p></th>
     <th><p>説明する</p></th>
     <th><p>推奨アクション</p></th>
   </tr>
   <tr>
     <td colspan="4"><p><strong>ポッドリソース</strong></p></td>
   </tr>
   <tr>
     <td><p>CPU使用率を含める</p></td>
     <td><p>コア</p></td>
     <td><p></p><p>ポッドが使用するCPUコアの数。</p><p></p></td>
     <td><p></p><p>リソースの使用状況を定期的に監視して記録し、トレンドや潜在的なボトルネックを特定します。</p><p></p></td>
   </tr>
   <tr>
     <td><p>ネットワークインバウンドフロー</p></td>
     <td><p></p><p>Mbpsの</p><p></p></td>
     <td><p></p><p>ポッドのネットワークインバウンドフロー。</p><p></p></td>
     <td><p></p><p>外部ソースから受信したデータ量を追跡して分析し、ネットワークのパフォーマンスを監視し、潜在的なネットワークの混雑や帯域幅の問題を特定するのに役立ちます。</p><p></p></td>
   </tr>
   <tr>
     <td><p>ネットワークアウトバウンドフロー</p></td>
     <td><p></p><p>Mbpsの</p><p></p></td>
     <td><p></p><p>ポッドのネットワークアウトバウンドフロー。</p><p></p></td>
     <td><p></p><p>外部ソースに送信されるデータ量を追跡して分析し、ネットワークパフォーマンスを監視し、潜在的なネットワークの混雑や帯域幅の問題を特定するのに役立ちます。</p><p></p></td>
   </tr>
   <tr>
     <td colspan="4"><p><strong>リソース</strong></p></td>
   </tr>
   \<tr>
     <td><p></p></td>
     <td><p></p></td>
     \<td>\<p>
