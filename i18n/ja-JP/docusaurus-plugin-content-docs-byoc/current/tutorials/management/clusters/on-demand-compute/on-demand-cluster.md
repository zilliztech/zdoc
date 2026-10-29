---
title: "オンデマンドクラスターを作成する | BYOC"
slug: /on-demand-cluster
sidebar_label: "クラスターを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターは、オンデマンドの検索およびクエリワークロードにコンピューティングリソースを提供します。リクエストの受信時に起動し、アイドル状態になるとゼロにスケールバックするため、バッチ検索、検証、探索、および常時稼働のサービスを必要としないワークロードに適しています。 | BYOC"
type: origin
token: RoxawNJhki1vXXkFsEEc7laMnxe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# オンデマンドクラスターを作成する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上でのみ利用できます。

</FeatureNote>

オンデマンドクラスターは、オンデマンドの検索およびクエリワークロードにコンピューティングリソースを提供します。リクエストの受信時に起動し、アイドル状態になるとゼロにスケールバックするため、バッチ検索、検証、探索、および常時稼働のサービスを必要としないワークロードに適しています。

## 事前準備\{#prerequisites}

オンデマンドクラスターを作成する前に、以下を満たしていることを確認してください。

- 対象プロジェクトで **Project Admin** であること。ロールと権限の詳細については、[プラットフォームロールの管理](./manage-platform-roles#predefined-project-roles) を参照してください。

- オンデマンドクラスターを作成するプロジェクトの ID を保有していること。

- プロジェクト内のリソースを管理する権限を持つ API キーを保有していること。

- プロジェクトがオンデマンドクラスターと同じリージョンにあること。現在サポートされているリージョンは `aws-us-west-2` です。

## 制限事項\{#limitations}

| 制限 | 説明 |
| --- | --- |
| プロジェクトタイプ | オンデマンドクラスターは Enterprise プロジェクトでのみ利用できます。 |
| リージョン | 現在、オンデマンドクラスターは AWS us-west-2 でのみ作成できます。 |
| 権限 | オンデマンドクラスターを管理するには、Project Admin である必要があります。 |
| クラスター数 | 各プロジェクトには最大 20 個のオンデマンドクラスターを作成できます。 |
| データ量 | オンデマンドクラスターは、8 CU ごとに最大 3 TB の生データをクエリできます。この制限を超えるクエリはエラーを返します。 |
| <NextChannel action="include">Milvus バージョン</NextChannel> | <NextChannel action="include">オンデマンドクラスターでは Milvus バージョンの選択はサポートされていません。</NextChannel> |

## オンデマンドクラスターを作成する\{#create-an-on-demand-cluster}

オンデマンドクラスターは、Zilliz Cloud コンソールから、または RESTful API を呼び出すことで作成できます。

### RESTful API を使用する\{#via-restful-api}

次の例では、オンデマンドクラスターを作成します。詳細については、[Create On-Demand クラスター](https://docs-test.cloud-uat3.zilliz.com/reference/restful/create-on-demand-cluster-v2) を参照してください。

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

次の表でパラメーターについて説明します。

| パラメーター | 説明 |
| --- | --- |
| `projectId` | オンデマンドクラスターを作成するプロジェクトの ID です。 |
| `regionId` | オンデマンドクラスターをデプロイするリージョンです。リージョンはプロジェクトのリージョンと一致する必要があります。現在は、`aws-us-west-2` を使用してください。 |
| `clusterName` | 作成するオンデマンドクラスターの名前です。 |
| `cuSize` | 割り当てるクエリ CU の数です。クラスターはワークロードに基づいてゼロからこの値まで自動的にスケールします。最小値は 8 CU、最大値は 256 CU で、値は 8 ずつ増加します。この値は作成後に固定され、変更できません。 |
| `autoSuspend` | クラスターが自動的にサスペンドするまでのアイドルタイムアウト（秒）です。この期間内にリクエストを受信しない場合、クラスターはサスペンドし、コンピューティングコストの発生を停止します。最小値は 60 秒で、デフォルトは 60 秒です。 |
| `description`（オプション） | 作成するオンデマンドクラスターの説明です。最大 255 文字です。 |

出力例は以下の通りです。

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

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. **+ クラスター** をクリックします。

1. クラスター設定を構成します。

    | パラメーター | 説明 |
    | --- | --- |
    | クラスター Name | 作成するオンデマンドクラスターの名前です。 |
    | クラスター Description | 作成するオンデマンドクラスターの説明です。最大 255 文字です。 |
    | Query CU | 割り当てるクエリ CU の数です。クラスターはゼロからこの値まで自動的にスケールします。最小値は 8 CU、最大値は 256 CU で、値は 8 ずつ増加します。この値は作成後に固定され、変更できません。 |
    | Auto suspend | クラスターが自動的にサスペンドするまでのアイドル時間（秒）です。デフォルトは 1 分です。 |

1. **Create** をクリックします。

</Procedures>

## 次のステップ\{#next-steps}

クラスターの作成後、オンデマンド検索用のプロジェクトエンドポイントに接続する際にクラスター ID を使用します。詳細については、[オンデマンド検索用に接続する](./connect-for-on-demand-search) を参照してください。

オンデマンドクラスターの一覧表示、詳細の確認、削除については、[オンデマンドクラスターを管理する](./manage-on-demand-clusters) を参照してください。
