---
title: "オンデマンドクラスターの作成 | Cloud"
slug: /on-demand-cluster
sidebar_label: "クラスターの作成"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターは、オンデマンドの検索およびクエリワークロード向けにコンピュートリソースを提供します。リクエストが到着すると起動し、アイドル時にはゼロまでスケールバックするため、バッチ検索、検証、探索、および常時稼働のサービングを必要としないワークロードに適しています。 | Cloud"
type: origin
token: RoxawNJhki1vXXkFsEEc7laMnxe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# オンデマンドクラスターの作成

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は現在、AWS us-west-2 および Azure East US リージョンでのみ利用できます。他のリージョンでオンデマンドクラスターを使用するには、[お問い合わせください](http://zilliz.com/contact-sales)。

</FeatureNote>

オンデマンドクラスターは、オンデマンドの検索およびクエリワークロード向けにコンピュートリソースを提供します。リクエストが到着すると起動し、アイドル時にはゼロまでスケールバックするため、バッチ検索、検証、探索、および常時稼働のサービングを必要としないワークロードに適しています。

## 前提条件\{#prerequisites}

オンデマンドクラスターを作成する前に、以下を確認してください。

- 対象プロジェクトで **Project Admin** であること。ロールと権限の詳細については、[プロジェクトユーザーの管理](./project-users#project-role-and-access-comparison)を参照してください。

- オンデマンドクラスターを作成するプロジェクトのプロジェクト ID を持っていること。

- プロジェクト内のリソースを管理する権限を持つ API キーを持っていること。

- プロジェクトがオンデマンドクラスターと同じリージョンにあること。現在、サポートされているリージョンは `aws-us-west-2` です。

## 制限事項\{#limitations}

| 制限 | 説明 |
| --- | --- |
| プロジェクトタイプ | オンデマンドクラスターは Enterprise プロジェクトでのみ利用できます。 |
| リージョン | 現在、オンデマンドクラスターは AWS us-west-2 でのみ作成できます。 |
| 権限 | オンデマンドクラスターを管理するには、Project Admin である必要があります。 |
| クラスター数 | 各プロジェクトには最大 20 個のオンデマンドクラスターを作成できます。 |
| データ量 | オンデマンドクラスターは、8 CUs ごとに最大 3 TB の生データをクエリできます。この制限を超えるクエリはエラーを返します。 |

## オンデマンドクラスターを作成する\{#create-an-on-demand-cluster}

オンデマンドクラスターは、Zilliz Cloud コンソールから、または RESTful API を呼び出して作成できます。

### RESTful API を使用する\{#via-restful-api}

次の例では、オンデマンドクラスターを作成します。詳細については、[Create On-Demand Cluster](https://docs-test.cloud-uat3.zilliz.com/reference/restful/create-on-demand-cluster-v2) を参照してください。

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

次の表は、各パラメーターを説明しています。

| パラメーター | 説明 |
| --- | --- |
| `projectId` | オンデマンドクラスターを作成するプロジェクトの ID。 |
| `regionId` | オンデマンドクラスターをデプロイするリージョン。リージョンはプロジェクトのリージョンと一致している必要があります。現在は `aws-us-west-2` を使用してください。 |
| `clusterName` | 作成するオンデマンドクラスターの名前。 |
| `cuSize` | 割り当てるクエリ CUs の数。クラスターはワークロードに基づいて 0 からこの値まで自動的にスケールします。最小値は 8 CUs、最大値は 256 CUs で、値は 8 刻みで増加します。この値は作成後に固定され、変更できません。 |
| `autoSuspend` | クラスターが自動停止するまでのアイドルタイムアウト（秒）。この期間内にリクエストが受信されない場合、クラスターは停止してコンピュートコストの発生を止めます。最小値は 60 秒で、デフォルト値は 60 秒です。 |
| `description`(optional) | 作成するオンデマンドクラスターの説明。255 文字まで。 |

次は出力例です。

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

1. Zilliz Cloud コンソールで、対象プロジェクトを開きます。

1. **On-Demand Compute > Clusters** に移動します。

1. **+ Cluster** をクリックします。

1. クラスター設定を構成します。

    | パラメーター | 説明 |
    | --- | --- |
    | Cluster Name | 作成するオンデマンドクラスターの名前。 |
    | Cluster Description | 作成するオンデマンドクラスターの説明。255 文字まで。 |
    | Query CU | 割り当てるクエリ CUs の数。クラスターは 0 からこの値まで自動的にスケールします。最小値は 8 CUs、最大値は 256 CUs で、値は 8 刻みで増加します。この値は作成後に固定され、変更できません。 |
    | Auto suspend | クラスターが自動停止するまでのアイドル時間（秒）。デフォルトは 1 分です。 |

1. **Create** をクリックします。

</Procedures>

## 次のステップ\{#next-steps}

クラスターの作成後、オンデマンド検索のためにプロジェクトエンドポイントへ接続する際にはクラスター ID を使用します。詳細については、[オンデマンド検索用の接続](./connect-for-on-demand-search)を参照してください。

オンデマンドクラスターの一覧表示、確認、または削除については、[オンデマンドクラスターの管理](./manage-on-demand-clusters)を参照してください。
