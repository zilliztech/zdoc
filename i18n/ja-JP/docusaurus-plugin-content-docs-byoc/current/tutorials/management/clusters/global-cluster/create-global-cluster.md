---
title: "グローバルクラスターの作成 | BYOC"
slug: /create-global-cluster
sidebar_label: "グローバルクラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、グローバルクラスターを作成する方法を説明します。 | BYOC"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# グローバルクラスターの作成

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能はすべての AWS リージョンと、次の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

このガイドでは、グローバルクラスターを作成する方法を説明します。 

既存のクラスターでグローバルクラスター機能を有効にする必要がある場合は、[クラスターの管理](./manage-cluster#convert-to-a-global-cluster)を参照してください。

## 開始する前に\{#before-you-start}

- **Project Admin** であることを確認してください。

- 現在、この機能はすべての AWS リージョンと、Google Cloud の us-central1 および us-east4 リージョンで利用できます。Google Cloud リージョンでグローバルクラスターを作成するには、[お問い合わせ](http://support.zilliz.com)ください。

## グローバルクラスターを作成する\{#create-a-global-cluster}

- **Web コンソールから**

    **Cluster Settings** で **Global Cluster** の横にあるスイッチをオンにし、グローバルクラスターの名前を指定します。グローバルクラスターには、**1 つのプライマリクラスター** と **1～5 つのセカンダリクラスター** が必要です。 

    クラウドプロバイダー、クラスタータイプ、クエリ CU 数は、プライマリクラスターのものと一致している必要があります。

    グローバルクラスター内のセカンダリクラスターのリージョンは、[プロジェクト](./manage-projects) でサポートされているリージョンに制限されます。 

    次のデモでは、Web コンソールからグローバルクラスターを作成する方法を示しています。

    <Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

    グローバルクラスターを作成すると、Zilliz Cloud は次を実行します。

    1. グローバルクラスターと、そのプライマリクラスターおよびセカンダリクラスターの両方をプロビジョニングします。プライマリクラスターとセカンダリクラスターはすべて **CREATING** ステータスで表示されます。

    1. プライマリクラスターとセカンダリクラスターの両方のプロビジョニングが完了すると、クラスターは **RUNNING** ステータスで表示され、データレプリケーションをサポートします。

    **Global Cluster** ページの **Global Topology** タブで、データ同期のステータスと遅延を監視できます。

    ![CLpZwH1e3hd3F1bIXisc6u7GnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/CLpZwH1e3hd3F1bIXisc6u7GnDg.png)

- **RESTful API から**

    次の例では、AWS us-west-2 にデプロイされた 1 つのプライマリクラスターと、AWS eu-west-1 にデプロイされた 1 つのセカンダリクラスターを持つグローバルクラスターを作成します。API の詳細については、[グローバルクラスターの作成](/reference/restful/create-global-cluster-v2)を参照してください。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "cuSize": 4,
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2"
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1"
          }
        ]
      }'
    ```

    以下は出力例です。

    ```json
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "********",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```
