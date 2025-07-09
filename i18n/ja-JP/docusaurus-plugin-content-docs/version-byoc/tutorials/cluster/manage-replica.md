---
title: "レプリカの管理 | BYOC"
slug: /manage-replica
sidebar_label: "レプリカの管理"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。 | BYOC"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


# レプリカの管理

Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。

QPSボトルネックを抱えるデータセットが少ないユーザーに対して、レプリカを追加することでクエリの負荷を分散し、全体的なクエリのスループットを向上させることができます。ただし、レプリカを追加してもクラスタの容量は増加しません。なぜなら、容量は各クラスタのCU体格によってのみ決定されるためです。クラスタの容量を増やしたい場合は、[スケールクラスタ](./scale-cluster)を参照してください。

このガイドでは、Zilliz Cloudでクラスタのレプリカを構成する手順について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は現在、専用(エンタープライズ)クラスターでのみ利用可能です。 </p>

</Admonition>

## 限界{#limits}

次の条件が満たされている限り、既存の専用クラスターのレプリカを構成できます。

- クラスタには8つ以上のCUがあります

- 互換性のあるMilvusバージョンが2.4.13未満のクラスタでは、クラスタ内のすべてのコレクションをリリースする必要があります。

クラスタCU体格xレプリカ数の積は256を超えてはならないことに注意してください。

<Admonition type="caution" icon="🚧" title="警告">

<p>レプリカの設定を更新すると、わずかなサービスジッターが発生する可能性があります。注意してください。</p>

</Admonition>

## レプリカを手動で設定する{#configure-replicas-manually}

既存の専用クラスターのレプリカの数は、コンソールで手動またはプログラムで調整できます。

### ウェブコンソールから{#via-web-console}

次のデモでは、Zilliz Cloud Webコンソールでレプリカを設定する方法を示します。

[スパデモ]

### RESTful APIを使用する{#via-restful-api}

クラスター内のレプリカの数を手動で調整するには、RESTful APIを使用できます。 

次の例では、クラスターレプリカのカウントを手動で2に設定します。`replica`パラメータの値は、1から8までの整数である必要があります。詳細については、[クラスタレプリカの変更](/reference/restful/modify-cluster-replica-v2)を参照してください。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="YOUR_CLUSTER_ID"
export TOKEN="YOUR_API_KEY"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modifyReplica" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "replica": "2"
      }'
```

## オートスケールレプリカ{#auto-scale-replicas}

現在、Zilliz Cloudウェブコンソールを介して、事前に定義されたタイムスケジュールに基づいてレプリカを自動スケーリングすることしかできません。 

次のデモでは、レプリカの自動スケーリングを有効にする方法を示します。

[supademo]

