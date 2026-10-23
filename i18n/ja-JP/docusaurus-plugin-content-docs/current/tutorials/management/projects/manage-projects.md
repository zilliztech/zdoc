---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理コンテナーとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プロジェクトの管理

Zilliz Cloud では、プロジェクトは組織内の論理コンテナーとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて、複数のプロジェクトを作成できます。たとえば、会社がマルチメディアレコメンデーションサービスを提供している場合は、動画レコメンデーション用に 1 つのプロジェクト、音楽レコメンデーション用にもう 1 つのプロジェクトを作成できます。

このガイドでは、プロジェクトを管理する手順について説明します。

## プロジェクトを作成する\{#create-a-project}

各組織には、`Default Project` という名前のデフォルトの **Enterprise** プロジェクトが付属しています。オンボーディング時にワークロードをデプロイするクラウドリージョンを選択すると、システムによってそのリージョンにこのデフォルトプロジェクトが自動的に作成されます。ワークロードとビジネスニーズに基づいて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの [Project Admin](./manage-platform-roles#predefined-project-roles) になります。

### 制限\{#limits}

- プロジェクトを作成するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

- 各組織で最大 100 個のプロジェクトを作成できます。

### 手順\{#procedures}

Zilliz Cloud Web コンソールまたは RESTful API を使用して、プロジェクトを作成できます。

- **RESTful API を使用する**

    次の例は、プロジェクトを作成する方法を示しています。詳細については、[Create Project](/reference/restful/create-project-v2) を参照してください。

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

    出力例は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソールを使用する**

    次のデモは、Zilliz Cloud Web コンソールでプロジェクトを作成する方法を示しています。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の組織に移動します。左側のナビゲーションで **Projects** をクリックします。

    1. **+ Project** をクリックします。

    1. プロジェクト設定を構成します。

        次の表では、プロジェクトの作成時に使用する各パラメーターについて説明します。

        | **パラメーター** | **説明** |
        | --- | --- |
        | Plan | ニーズに最適なプロジェクトプランを選択します。プランによって、利用可能な機能と課金が決まります。料金、プランの違い、適切なプランの選び方の詳細については、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。 |
        | Name | 作成するプロジェクトの名前を入力します。 |
        | Description (optional) | 作成するプロジェクトの説明を最大 255 文字で入力します。 |
        | Region | ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（例：クラスター、ボリュームなど）は、このリージョンにデプロイされます。プロジェクトの作成後は、リージョンを変更できません。利用可能なリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 |
        | Multi-region (optional) | **Business Critical** プロジェクトでのみ利用できます。有効にすると、同じプロジェクト内の複数のクラウドリージョンにリソースをデプロイできます。これは、[Global クラスター Explained](./global-cluster-explained) 機能を使用する場合に必要です。マルチリージョンは、プロジェクトの作成後に有効にすることができます。 |

    </Procedures>

## プロジェクトにリージョンを追加する\{#add-project-regions}

プロジェクトが **Business Critical** プランの場合は、プロジェクトにリージョンを追加できます。[Global クラスター](./global-cluster-explained) 機能を使用する必要がある場合、プロジェクトはマルチリージョン対応である必要があります。

- **RESTful API を使用する**

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

    出力例は以下の通りです。

    ```bash
    {
      "code": 0,
      "data": {
        "projectId": "proj-a0195d6acacaf2bb985173",
        "regions": ["aws-us-west-2", "gcp-us-west1"]
      }
    }
    ```

- **Web コンソールを使用する**

    ![Cw14w6V8Ih4QqWbuYstcKqjVnUx](https://zdoc-images.s3.us-west-2.amazonaws.com/Cw14w6V8Ih4QqWbuYstcKqjVnUx.png)

## プロジェクトのリージョンを削除する\{#delete-project-regions}

マルチリージョンプロジェクトからリージョンを削除できます。

- **RESTful API を使用する**

    ```bash
    curl -i --request DELETE \
        --url "https://${BASE_URL}/v2/projects/proj-a0195d6acacaf2bb985173/regions/gcp-us-west1" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json"
    ```

    出力例は以下の通りです。

    ```bash
    {
      "code": 0,
      "data": ["aws-us-west-2"]
    } 
    ```

- **Web コンソールを使用する**

    ![DpQXwPmA9hnquubow8UcnFnQn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/DpQXwPmA9hnquubow8UcnFnQn9c.png)

## プロジェクトをアップグレードする\{#upgrade-a-project}

高度な機能を利用できるようにするには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、プロジェクト内のすべてのクラスターもアップグレードされます。

プロジェクトを **Business Critical** または **BYOC** プランにアップグレードする必要がある場合は、[お問い合わせ](http://support.zilliz.com) ください。

- **RESTful API を使用する**

    次のデモは、プロジェクトのプランを Standard から Enterprise にアップグレードする方法を示しています。詳細については、[Upgrade Project](/reference/restful/upgrade-project-v2) を参照してください。

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

    出力例は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソールを使用する**

    次のデモは、プロジェクトのプランを **Standard** から **Enterprise** にアップグレードする方法を示しています。

    <Supademo id="cmur1bl9j0u2iqm0p6hr5sr2h" title=""  />

## すべてのプロジェクトを表示する\{#view-all-projects}

組織内で、アクセス権限の範囲内にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API を使用する**

    次の例では、現在の組織内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[List Projects](/reference/restful/list-projects-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    出力例は以下の通りです。

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

- **Web コンソールを使用する**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## プロジェクトの詳細を表示する\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API を使用する**

    次の例では、プロジェクト `proj-xxxxxxxxxxxxxxx` について説明します。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    出力例は以下の通りです。

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

- **Web コンソールを使用する**

    **Projects** ページで、プロジェクト名、プラン、作成時刻、およびプロジェクト内のクラスター数を確認できます。さらに、特定のプロジェクトをクリックすると、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクトの詳細を編集する\{#edit-project-details}

プロジェクトの名前を変更する場合、またはプロジェクトの説明を編集する場合は、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。プロジェクトの詳細は、Web コンソールで編集できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6" title=""  />

## プロジェクトを削除する\{#delete-a-project}

プロジェクトを削除するには、[Organization Owner](./manage-platform-roles#predefined-organization-roles) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての [クラスター](./manage-cluster#drop) と [ボリューム](./managed-volume) を削除する必要があります。

プロジェクトを削除すると、関連するすべてのデータとリソースも不可逆的に消去されます。

プロジェクトは、Web コンソールで削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## FAQ\{#faq}

**プロジェクトのプランをダウングレードできますか？**

プランの直接ダウングレードはサポートされていません。下位のプランに切り替えるには、希望するプランで新しいプロジェクトを作成し、そのプロジェクトにデータを [移行](./offline-migration) してください。
