---
title: "レプリカを管理 | Cloud"
slug: /manage-replica
sidebar_label: "レプリカを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することでクエリスループットと可用性を向上させることができます。 | Cloud"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 5
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - 管理
  - コサイン距離
  - ベクターデータベースとは
  - vectordb
  - マルチモーダルベクターデータベース検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# レプリカを管理

Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスター内のリソースとデータの正確なコピーです。レプリカを使用することでクエリスループットと可用性を向上させることができます。

クエリ毎秒（QPS）のボトルネックに直面している小規模データセットのユーザーにとって、レプリカを追加することでクエリワークロードを分散し、全体的なクエリスループットを向上させることができます。ただし、クラスター容量は各クラスターのCUサイズのみによって決定されるため、レプリカを追加してもクラスター容量は増加しません。クラスター容量を増やしたい場合は、[クラスターをスケーリル](./scale-cluster)を参照してください。

レプリカの構成はクラスターの月間CUコストに影響します。クラスターのストレージコストは変更されません。詳細については、[専用クラスターコスト](./dedicated-cluster-cost)を参照してください。

このガイドでは、Zilliz Cloudでクラスターのレプリカを構成する手順を概説します。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>エンタープライズ</strong>プロジェクトの<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

以下の条件が満たされている限り、既存の専用クラスターのレプリカを構成できます：

- クラスターには8CU以上が必要

- 互換性のあるMilvusバージョンが2.4.13未満のクラスターでは、クラスター内のすべてのコレクションを解放する必要があります

クラスターCUサイズ×レプリカ数の積は256を超えないようにしてください。

<Admonition type="caution" icon="🚧" title="警告">

<p>レプリカ構成を更新すると、わずかなサービスジャンクが発生する可能性があります。注意してください。</p>

</Admonition>

## レプリカを手動で構成\{#configure-replicas-manually}

コンソールで手動またはプログラムで既存の専用クラスターのレプリカ数を調整できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでレプリカを構成する方法を示します。

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

### RESTful API経由\{#via-restful-api}

RESTful APIを使用してクラスター内のレプリカ数を手動で調整できます。

以下の例では、クラスターレプリカ数を手動で2に設定します。`replica`パラメーターの値は1から8の範囲の整数である必要があります。詳細については、[クラスターレプリカを変更](/reference/restful/modify-cluster-replica-v2)を参照してください。

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

## レプリカの自動スケーリル\{#auto-scale-replicas}

現在、Zilliz Cloudウェブコンソールでは、事前定義された時間スケジュールに基づいてレプリカを自動スケーリルのみが可能です。

以下のデモでは、レプリカの自動スケーリルを有効にする方法を示します。

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />
