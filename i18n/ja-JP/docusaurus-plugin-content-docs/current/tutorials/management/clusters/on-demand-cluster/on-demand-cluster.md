---
title: "On-Demand Cluster を作成 | Cloud"
slug: /on-demand-cluster
sidebar_label: "Cluster を作成"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "On-demand cluster は、オンデマンドの検索およびクエリワークロード向けにコンピュートリソースを提供します。リクエストが到着すると起動し、アイドル時にはゼロまでスケールダウンするため、バッチ検索、検証、探索、および常時稼働のサービス提供を必要としないワークロードに適しています。 | Cloud"
type: origin
token: RoxawNJhki1vXXkFsEEc7laMnxe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# On-Demand Cluster を作成

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。他のリージョンで on-demand cluster を使用するには、[お問い合わせ](http://zilliz.com/contact-sales)ください。

</FeatureNote>

On-demand cluster は、オンデマンドの検索およびクエリワークロード向けにコンピュートリソースを提供します。リクエストが到着すると起動し、アイドル時にはゼロまでスケールダウンするため、バッチ検索、検証、探索、および常時稼働のサービス提供を必要としないワークロードに適しています。

## 前提条件\{#prerequisites}

On-demand cluster を作成する前に、以下を確認してください。

- 対象 project の **Project Admin** であること。ロールと権限の詳細については、[Project ユーザーの管理](./project-users#project-role-and-access-comparison)を参照してください。

- On-demand cluster を作成する project ID を持っていること。

- project 内のリソースを管理する権限を持つ API key を持っていること。

- project が on-demand cluster と同じリージョンにあること。現在サポートされているリージョンは `aws-us-west-2` です。

## 制限事項\{#limitations}

| 制限 | 説明 |
| --- | --- |
| Project type | On-demand clusters は Enterprise project でのみ利用できます。 |
| Region | 現在、on-demand cluster は AWS us-west-2 でのみ作成できます。 |
| Permission | On-demand cluster を管理するには、Project Admin である必要があります。 |
| Cluster count | 各 project には最大 20 個の on-demand clusters を作成できます。 |
| Data volume | On-demand cluster は、8 CUs ごとに最大 3 TB の生データをクエリできます。この制限を超えるクエリはエラーを返します。 |

## On-demand cluster を作成する\{#create-an-on-demand-cluster}

On-demand cluster は、Zilliz Cloud コンソールから、または RESTful API を呼び出して作成できます。

### RESTful API を使用する\{#via-restful-api}

次の例では on-demand cluster を作成します。詳細については、[Create On-Demand Cluster](https://docs-test.cloud-uat3.zilliz.com/reference/restful/create-on-demand-cluster-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60,
    "description": "A cluster for vector search workloads."
}'
```

次の表では各パラメーターを説明します。

| Parameter | Description |
| --- | --- |
| `projectId` | On-demand cluster を作成する project の ID。 |
| `regionId` | On-demand cluster をデプロイするリージョン。リージョンは project のリージョンと一致している必要があります。現在は `aws-us-west-2` を使用してください。 |
| `clusterName` | 作成する on-demand cluster の名前。 |
| `cuSize` | 割り当てる query CU 数。cluster はワークロードに基づいてゼロからこの値の間で自動的にスケールします。最小値は 8 CUs、最大値は 256 CUs で、値は 8 ずつ増加します。この値は作成後に固定され、変更できません。 |
| `autoSuspend` | cluster が自動停止するまでのアイドルタイムアウト（秒）。この期間内にリクエストを受信しない場合、cluster は停止してコンピュートコストの発生を止めます。最小値は 60 秒、デフォルト値は 60 秒です。 |
| `description`(optional) | 作成する on-demand cluster の説明。255 文字まで指定できます。 |

以下は出力例です。

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted. The on-demand cluster is being created. Use the Describe On-Demand Cluster API to check its creation progress and status. Once the cluster status is RUNNING, use your API key to access the on-demand cluster."
    }
}
```

### Web コンソールを使用する\{#via-web-console}

<Supademo id="cmo9gv84436szl2dy975hyhsh" title=""  />

<Procedures>

1. Zilliz Cloud コンソールで、対象の project を開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. **+ Cluster** をクリックします。

1. cluster の設定を構成します。

    | Parameter | Description |
    | --- | --- |
    | Cluster Name | 作成する on-demand cluster の名前。 |
    | Cluster Description | 作成する on-demand cluster の説明。255 文字まで指定できます。 |
    | Query CU | 割り当てる query CU 数。cluster はゼロからこの値の間で自動的にスケールします。最小値は 8 CUs、最大値は 256 CUs で、値は 8 ずつ増加します。この値は作成後に固定され、変更できません。 |
    | Auto suspend | cluster が自動停止するまでのアイドル時間（秒）。デフォルトは 1 分です。 |

1. **Create** をクリックします。

</Procedures>

## 次のステップ\{#next-steps}

cluster の作成後、オンデマンド検索のために project endpoint に接続する際は cluster ID を使用します。詳細については、[オンデマンド検索の接続](./connect-for-on-demand-search)を参照してください。

On-demand cluster の一覧表示、確認、または削除については、[On-Demand Cluster を管理する](./manage-on-demand-clusters)を参照してください。
