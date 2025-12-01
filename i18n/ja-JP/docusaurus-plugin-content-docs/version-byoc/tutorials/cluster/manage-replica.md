---
title: "レプリカの管理 | BYOC"
slug: /manage-replica
sidebar_label: "レプリカの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスターのリソースとデータの正確なコピーです。レプリカを使用すると、クエリスループットと可用性を向上させることができます。 | BYOC"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 管理
  - マルチモーダルRAG
  - LLMのハルシネーション
  - ハイブリッド検索
  - レキシカル検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# レプリカの管理

Zilliz Cloudはクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスターのリソースとデータの正確なコピーです。レプリカを使用すると、クエリスループットと可用性を向上させることができます。

QPSのボトルネックに直面している小規模データセットのユーザーの場合、レプリカを追加することでクエリワークロードを分散し、全体的なクエリスループットを向上させることができます。ただし、レプリカを追加してもクラスター容量は増加しません。容量は各クラスターのCUサイズによってのみ決定されます。クラスター容量を増加させたい場合は、[Scale Cluster](./scale-cluster)を参照してください。

このガイドでは、Zilliz Cloudでクラスターのレプリカを設定する手順を概説します。

## 制限事項\{#limits}

以下の条件が満たされている限り、既存のDedicatedクラスターのレプリカを設定できます：

- クラスターが8CU以上であること

- 互換性のあるMilvusバージョンが2.4.13より低いクラスターの場合、クラスター内のすべてのコレクションを解放する必要があります

クラスターCUサイズ×レプリカ数の積が256を超えないようにしてください。

<Admonition type="caution" icon="🚧" title="Warning">

<p>レプリカ設定の更新により、わずかなサービスのジャッターが発生する可能性があります。注意してください。</p>

</Admonition>

## レプリカを手動で設定\{#configure-replicas-manually}

既存のDedicatedクラスターのレプリカ数を、コンソール上で手動で調整するか、プログラムで調整できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでレプリカを設定する方法を示しています。

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p><strong>クラスターレプリカのスケール</strong>ダイアログボックスで<strong>保存</strong>をクリックすると、プロジェクトのリソースクォータを確認するように求められます。リソースが十分であれば、チェックが完了した後にダイアログボックスは消えます。そうでない場合は、以下が可能です。</p>
<ul>
<li><p><strong>プロジェクトリソース設定に移動</strong>をクリックしてプロジェクトのリソース設定を編集するか、または</p></li>
<li><p><strong>最後のステップに戻る</strong>をクリックしてクラスタ設定を変更します。</p></li>
</ul>
<p>プロセス中、ローリングには追加リソースが必要になります。これらのリソースは使用後に解放されます。</p>

</Admonition>

### RESTful API経由\{#via-restful-api}

RESTful APIを使用してクラスター内のレプリカ数を手動で調整できます。

以下の例では、クラスターレプリカ数を手動で2に設定します。`replica`パラメータの値は1から8の範囲の整数である必要があります。詳細は、[Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2)を参照してください。

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

## レプリカの自動スケーリング\{#auto-scale-replicas}

現在、Zilliz Cloudウェブコンソールで事前定義された時間スケジュールに基づいてレプリカを自動スケーリングできます。

以下のデモでは、レプリカの自動スケーリングを有効にする方法を示しています。

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />