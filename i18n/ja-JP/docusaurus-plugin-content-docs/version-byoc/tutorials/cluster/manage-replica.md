---
title: "レプリカの管理 | BYOC"
slug: /manage-replica
sidebar_label: "レプリカの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはクラスターレベルのレプリケーションを可能にします。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。 | BYOC"
type: origin
token: F72qwzpubibfhHkfLwbcXUNrnYg
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Unstructured Data
  - vector database
  - IVF
  - knn

---

import Admonition from '@theme/Admonition';


# レプリカの管理

Zilliz Cloudはクラスターレベルのレプリケーションを可能にします。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。

QPSボトルネックが発生しているデータセットが少ないユーザーに対して、レプリカを追加することでクエリのワークロードを分散させ、全体的なクエリスループットを向上させることができます。ただし、レプリカを追加してもクラスタ容量は増加しません。なぜなら、容量は各レプリカのCU体格によってのみ決定されるためです。クラスタ容量を増やしたい場合は、[スケールクラスタ](./scale-cluster)を参照してください。

レプリカを設定すると、クラスタの毎月のCUコストに影響します。クラスタのストレージコストは変更されません。

このガイドでは、Zilliz Cloudでクラスタのレプリカを構成する手順について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は現在、専用(エンタープライズ)クラスターでのみ利用可能です。</p>

</Admonition>

## レプリカの設定{#configure-replicas-for-usage-based-cluster}

次の条件が満たされている限り、既存の専用クラスターのレプリカを追加できます。

- クラスタには8つ以上のCUがあります

- 互換性のあるMilvusバージョンが2.4.13未満のクラスタでは、クラスタ内のすべてのコレクションをリリースする必要があります。

レプリカを追加する場合は、クラスターCU体格xレプリカ数が256を超えないように注意してください。

<Admonition type="caution" icon="🚧" title="警告">

<p>レプリカの設定を更新すると、わずかなサービスジッターが発生する可能性があります。注意してください。</p>

</Admonition>

![configure-replica](/img/configure-replica.png)

RESTful APIを使用してレプリカを構成する方法の詳細については、[クラスター変更](/reference/restful/modify-cluster-v2)を参照してください。

