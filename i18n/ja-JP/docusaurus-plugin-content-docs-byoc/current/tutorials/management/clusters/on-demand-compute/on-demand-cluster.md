---
title: "オンデマンドクラスターの作成 | BYOC"
slug: /on-demand-cluster
sidebar_label: "クラスターの作成"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターは、オンデマンドの検索・クエリワークロード向けにコンピューティングリソースを提供します。リクエスト受信時に起動し、アイドル時はゼロまでスケールダウンするため、バッチ検索、検証、探索など、常時稼働が不要なワークロードに適しています。 | BYOC"
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

現在、この機能は AWS us-west-2 および Azure East US リージョンでのみ利用可能です。他のリージョンでオンデマンドクラスターをご利用になりたい場合は、[お問い合わせください](http://zilliz.com/contact-sales)。

</FeatureNote>

オンデマンドクラスターは、オンデマンドの検索・クエリワークロード向けにコンピューティングリソースを提供します。リクエスト受信時に起動し、アイドル時はゼロまでスケールダウンするため、バッチ検索、検証、探索など、常時稼働が不要なワークロードに適しています。

## 前提条件\{#prerequisites}

オンデマンドクラスターを作成する前に、以下の条件を満たしていることを確認してください。

- 対象プロジェクトで **Project Admin** ロールを有していること。ロールと権限の詳細については、[プロジェクトユーザーの管理](./project-users#project-role-and-access-comparison)を参照してください。

- オンデマンドクラスターを作成するプロジェクトのプロジェクト ID を把握していること。

- プロジェクト内のリソースを管理できる権限を持つ API キーを保有していること。

- プロジェクトがオンデマンドクラスターと同じリージョンに存在すること。現在サポートされているリージョンは `aws-us-west-2` です。

## 制限事項\{#limitations}

| 制限 | 説明 |
| --- | --- |
| プロジェクトタイプ | オンデマンドクラスターは Enterprise プロジェクトでのみ利用できます。 |
| リージョン | 現在、オンデマンドクラスターは AWS us-west-2 でのみ作成可能です。 |
| 権限 | オンデマンドクラスターの管理には Project Admin 権限が必要です。 |
| クラスター数 | 1 つのプロジェクトあたり最大 20 個のオンデマンドクラスターを作成できます。 |
| データ量 | オンデマンドクラスターでは、8 CU あたり最大 3 TB の生データをクエリできます。この上限を超えるクエリを実行するとエラーが返されます。 |

## オンデマンドクラスターの作成\{#create-an-on-demand-cluster}

オンデマンドクラスターは、Zilliz Cloud コンソールまたは RESTful API を使用して作成できます。

### RESTful API を使用した作成\{#via-restful-api}

以下はオンデマンドクラスターを作成する例です。詳細については、[オンデマンドクラスターの作成](https://docs-test.cloud-uat3.zilliz.com/reference/restful/create-on-demand-cluster-v2)を参照してください。

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

各パラメーターの説明は以下の表のとおりです。

| パラメーター | 説明 |
| --- | --- |
| `projectId` | オンデマンドクラスターを作成するプロジェクトの ID です。 |
| `regionId` | オンデマンドクラスターをデプロイするリージョンです。プロジェクトのリージョンと一致させる必要があり、現在は `aws-us-west-2` を指定してください。 |
| `clusterName` | 作成するオンデマンドクラスターの名前です。 |
| `cuSize` | 割り当てるクエリ CU 数です。クラスターはワークロードに応じて 0 からこの値の間で自動的にスケーリングされます。最小値は 8 CU、最大値は 256 CU で、8 CU 単位で指定できます。この値は作成後に固定され、変更できません。 |
| `autoSuspend` | クラスターが自動サスペンドするまでのアイドルタイムアウト（秒）です。この期間内にリクエストがない場合、クラスターはサスペンド状態になりコンピューティングコストの課金が停止されます。最小値は 60 秒、デフォルト値も 60 秒です。 |
| `description`(オプション) | 作成するオンデマンドクラスターの説明です。最大 255 文字まで入力できます。 |

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

### Web コンソールを使用した作成\{#via-web-console}

<Supademo id="cmo9gv84436szl2dy975hyhsh" title=""  />

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **On-Demand Compute > クラスター** に移動します。

1. **+ クラスター** をクリックします。

1. クラスター設定を行います。

    | パラメーター | 説明 |
    | --- | --- |
    | クラスター名 | 作成するオンデマンドクラスターの名前です。 |
    | クラスターの説明 | 作成するオンデマンドクラスターの説明です。最大 255 文字まで入力できます。 |
    | クエリ CU | 割り当てるクエリ CU 数です。クラスターは 0 からこの値の間で自動的にスケーリングされます。最小値は 8 CU、最大値は 256 CU で、8 CU 単位で指定できます。この値は作成後に固定され、変更できません。 |
    | 自動サスペンド | クラスターが自動サスペンドするまでのアイドル時間（秒）です。デフォルトは 1 分です。 |

1. **Create** をクリックします。

</Procedures>

## 次のステップ\{#next-steps}

クラスター作成後、オンデマンド検索用にプロジェクトエンドポイントへ接続する際にクラスター ID を使用します。詳細については、[オンデマンド検索への接続](./connect-for-on-demand-search)を参照してください。

オンデマンドクラスターの一覧表示、詳細確認、削除を行う場合は、[オンデマンドクラスターの管理](./manage-on-demand-clusters)を参照してください。
