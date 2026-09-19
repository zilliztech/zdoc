---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プロジェクトの管理

Zilliz Cloud では、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて、複数のプロジェクトを作成できます。たとえば、自社がマルチメディアレコメンデーションサービスを提供している場合、動画レコメンデーション用のプロジェクトと、音楽レコメンデーション用のプロジェクトを別々に作成できます。

このガイドでは、プロジェクトを管理する手順について説明します。

## プロジェクトの作成\{#create-a-project}

各組織には、`Default Project` という名前のデフォルトの **Enterprise** プロジェクトが用意されています。オンボーディング時に、ワークロードをデプロイするクラウドリージョンを選択すると、システムによってそのリージョンにこのデフォルトプロジェクトが自動的に作成されます。ワークロードとビジネスニーズに応じて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの [Project Admin](./manage-platform-roles#predefined-project-roles) になります。

### 制限事項\{#limits}

- プロジェクトを作成するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

- 1つの組織で作成できるプロジェクトは最大 100 個です。

### 手順\{#procedures}

プロジェクトは、Zilliz Cloud Web コンソールまたは RESTful API から作成できます。

- **RESTful API を使用する場合**

    以下にプロジェクトを作成する例を示します。詳細については、[Create Project](/reference/restful/create-project-v2) を参照してください。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectName": "My Project",
        "plan": "Enterprise",
        "regionIds": [
            "aws-us-east-1"
        ],
        "description": "A project for organizing clusters and resources."
    }'
    ```

    以下は出力例です。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソールを使用する場合**

    以下のデモでは、Zilliz Cloud Web コンソールでプロジェクトを作成する方法を紹介しています。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の組織に移動します。左側のナビゲーションで **Projects** をクリックします。

    1. **+ Project** をクリックします。

    1. プロジェクトの設定を構成します。

        以下では、プロジェクトの作成時に使用する各パラメータについて説明します。

        | **パラメータ** | **説明** |
        | --- | --- |
        | プラン | ニーズに最適なプロジェクトプランを選択します。プランによって、利用できる機能と課金が決まります。料金、プラン間の違い、適切なプランの選び方の詳細については、[詳細なプラン比較](./select-zilliz-cloud-service-plans) を参照してください。 |
        | 名前 | 作成するプロジェクトの名前を入力します。 |
        | 説明（任意） | 作成するプロジェクトの説明を最大 255 文字で入力します。 |
        | リージョン | ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（クラスター、ボリュームなど）は、このリージョンにデプロイされます。プロジェクトの作成後にリージョンを変更することはできません。利用可能なリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。 |
        | マルチリージョン（任意） | **Business Critical** プロジェクトでのみ利用できます。有効にすると、同じプロジェクト内で複数のクラウドリージョンにリソースをデプロイできます。これは、[グローバルクラスターの説明](./global-cluster-explained) 機能を使用する予定がある場合に必要です。マルチリージョンは、プロジェクトの作成後に有効にすることができます。 |

    </Procedures>

## プロジェクトのリージョンの追加\{#add-project-regions}

プロジェクトが **Business Critical** プランの場合は、プロジェクトにリージョンを追加できます。[グローバルクラスター](./global-cluster-explained) 機能を使用する必要がある場合、プロジェクトはマルチリージョンである必要があります。

- **RESTful API を使用する場合**

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
         --url "https://${BASE_URL}/v2/projects/proj-a0195d6acacaf2bb985173/regions" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "regions": ["gcp-us-west1"]
          }'
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "projectId": "proj-a0195d6acacaf2bb985173",
        "regions": ["aws-us-west-2", "gcp-us-west1"]
      }
    }
    ```

- **Web コンソールを使用する場合**

    ![Cw14w6V8Ih4QqWbuYstcKqjVnUx](https://zdoc-images.s3.us-west-2.amazonaws.com/Cw14w6V8Ih4QqWbuYstcKqjVnUx.png)

## プロジェクトのリージョンの削除\{#delete-project-regions}

マルチリージョンプロジェクトからリージョンを削除できます。

- **RESTful API を使用する場合**

    ```bash
    curl -i --request DELETE \
        --url "https://${BASE_URL}/v2/projects/proj-a0195d6acacaf2bb985173/regions/gcp-us-west1" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": ["aws-us-west-2"]
    } 
    ```

- **Web コンソールを使用する場合**

    ![DpQXwPmA9hnquubow8UcnFnQn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/DpQXwPmA9hnquubow8UcnFnQn9c.png)

## プロジェクトのアップグレード\{#upgrade-a-project}

高度な機能を利用するには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、プロジェクト内のすべてのクラスターもアップグレードされます。

プロジェクトを **Business Critical** または **BYOC** プランにアップグレードする必要がある場合は、[営業担当者](https://zilliz.com/contact-sales) にお問い合わせください。

- **RESTful API を使用する場合**

    以下のデモでは、プロジェクトのプランを Standard から Enterprise にアップグレードする方法を紹介しています。詳細については、[Upgrade Project](/reference/restful/upgrade-project-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request PATCH \
    --url "${BASE_URL}/v2/projects/${projectId}/plan" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "plan": "Enterprise"
    }'
    ```

    以下は出力例です。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソールを使用する場合**

    以下のデモでは、プロジェクトのプランを **Standard** から **Enterprise** にアップグレードする方法を紹介しています。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h" title=""  />

## すべてのプロジェクトの表示\{#view-all-projects}

組織内で権限の範囲内にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API を使用する場合**

    以下に、現在の組織内のすべてのプロジェクトを一覧表示する例を示します。詳細については、[List Projects](/reference/restful/list-projects-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    以下は出力例です。

    ```bash
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "regionIds": [
                    "aws-us-east-1"
                ],
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise",
                "orgType": "SAAS",
                "description": "A project for organizing clusters and resources."
            }
        ]
    }
    ```

- **Web コンソールを使用する場合**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## プロジェクトの詳細の表示\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API を使用する場合**

    以下は、プロジェクト `proj-xxxxxxxxxxxxxxx` の詳細を表示する例です。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    以下は出力例です。

    ```json
    {
        "code": 0,
        "data": {
            "projectId": "proj-x",
            "projectName": "My Project",
            "regionIds": [
                "aws-us-east-1"
            ],
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise",
            "orgType": "SAAS",
            "description": "A project for organizing clusters and resources."
        }
    }
    ```

- **Web コンソールを使用する場合**

    **Projects** ページでは、プロジェクト名、プラン、作成日時、およびプロジェクト内のクラスター数を確認できます。さらに、特定のプロジェクトをクリックすると、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクトの詳細の編集\{#edit-project-details}

プロジェクトの名前を変更したり、プロジェクトの説明を編集したりするには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。プロジェクトの詳細は Web コンソールから編集できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6" title=""  />

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての[クラスター](./manage-cluster#drop)と[ボリューム](./managed-volume)を削除する必要があります。

プロジェクトを削除すると、関連するすべてのデータとリソースも復元できない形で削除されます。

プロジェクトは Web コンソールから削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## FAQ\{#faq}

**プロジェクトのプランをダウングレードできますか？**

プランの直接的なダウングレードはサポートされていません。下位のプランに切り替えるには、目的のプランで新しいプロジェクトを作成し、そこへデータを[移行](./offline-migration)してください。
