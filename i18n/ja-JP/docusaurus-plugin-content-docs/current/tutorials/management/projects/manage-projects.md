---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud において、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プロジェクトの管理

Zilliz Cloud において、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな用途に合わせて、複数のプロジェクトを作成できます。たとえば、マルチメディアレコメンデーションサービスを提供している場合、動画レコメンデーション用のプロジェクトと音楽レコメンデーション用のプロジェクトをそれぞれ作成できます。

このガイドでは、プロジェクトの管理手順について説明します。

## プロジェクトの作成\{#create-a-project}

各組織には、`Default Project` という名前のデフォルト **Enterprise** プロジェクトが用意されています。オンボーディング時にワークロードのデプロイ先となるクラウドリージョンを選択すると、システムによってそのリージョンにデフォルトプロジェクトが自動作成されます。デフォルトプロジェクトは削除できません。ワークロードやビジネス要件に応じて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの [Project Admin](./project-users) になります。

### 制限事項\{#limits}

- プロジェクトを作成するには、[Organization Owner](./organization-users) である必要があります。

- 1つの組織あたり最大100個のプロジェクトを作成できます。

### 手順\{#procedures}

プロジェクトは、Zilliz Cloud WebコンソールまたはRESTful APIから作成できます。

- **RESTful APIを使用する場合**

    以下にプロジェクト作成の例を示します。詳細については、[Create Project](/reference/restful/create-project-v2) を参照してください。

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

- **Webコンソールを使用する場合**

    以下のデモでは、Zilliz Cloud Webコンソールでプロジェクトを作成する手順を紹介しています。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の組織に移動し、左側ナビゲーションの **Projects** をクリックします。

    1. **+ Project** をクリックします。

    1. プロジェクトの設定を行います。

        プロジェクト作成時に指定する各パラメータの説明は、以下の表のとおりです。

        | **パラメータ** | **説明** |
        | --- | --- |
        | プラン | 用途に最適なプロジェクトプランを選択します。プランによって利用可能な機能や課金体系が異なります。料金、プラン間の違い、適切なプランの選び方などの詳細については、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。 |
        | 名前 | 作成するプロジェクトの名前を入力します。 |
        | 説明（任意） | 作成するプロジェクトの説明を255文字以内で入力します。 |
        | リージョン | ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（クラスター、ボリュームなど）はこのリージョンにデプロイされます。プロジェクト作成後にリージョンを変更することはできません。利用可能なリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 |
        | マルチリージョン（任意） | **Business Critical** プロジェクトでのみ利用可能です。有効にすると、同じプロジェクト内の複数のクラウドリージョンにリソースをデプロイできます。[Global クラスター Explained](./global-cluster-explained) 機能を使用する予定がある場合は必須です。マルチリージョンは、プロジェクトの作成後に有効にすることもできます。 |

    </Procedures>

## プロジェクトリージョンの追加\{#add-project-regions}

プロジェクトが **Business Critical** プランの場合、プロジェクトにリージョンを追加できます。[Global クラスター](./global-cluster-explained) 機能を使用する必要がある場合は、プロジェクトがマルチリージョンである必要があります。

- **RESTful APIを使用する場合**

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

- **Webコンソールを使用する場合**

    ![Cw14w6V8Ih4QqWbuYstcKqjVnUx](https://zdoc-images.s3.us-west-2.amazonaws.com/Cw14w6V8Ih4QqWbuYstcKqjVnUx.png)

## プロジェクトリージョンの削除\{#delete-project-regions}

マルチリージョンプロジェクトからリージョンを削除できます。

- **RESTful APIを使用する場合**

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

- **Webコンソールを使用する場合**

    ![DpQXwPmA9hnquubow8UcnFnQn9c](https://zdoc-images.s3.us-west-2.amazonaws.com/DpQXwPmA9hnquubow8UcnFnQn9c.png)

## プロジェクトのアップグレード\{#upgrade-a-project}

高度な機能を利用するには、既存プロジェクトのプランをアップグレードします。

プロジェクトをアップグレードすると、そのプロジェクト内のすべてのクラスターも同時にアップグレードされます。

プロジェクトを **Business Critical** または **BYOC** プランにアップグレードする場合は、[contact sales](https://zilliz.com/contact-sales) までお問い合わせください。

- **RESTful APIを使用する場合**

    以下のデモでは、プロジェクトのプランをStandardからEnterpriseへアップグレードする手順を紹介しています。詳細については、[Upgrade Project](/reference/restful/upgrade-project-v2) を参照してください。

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

- **Webコンソールを使用する場合**

    以下のデモでは、プロジェクトのプランを **Standard** から **Enterprise** へアップグレードする手順を紹介しています。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h" title=""  />

## すべてのプロジェクトの表示\{#view-all-projects}

権限範囲内のすべてのプロジェクト一覧を表示できます。

- **RESTful APIを使用する場合**

    以下に現在の組織内のすべてのプロジェクトを一覧表示する例を示します。詳細については、[List Projects](/reference/restful/list-projects-v2) を参照してください。

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

- **Webコンソールを使用する場合**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## プロジェクトの詳細を表示する\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API を使用する場合**

    次の例は、プロジェクト `proj-xxxxxxxxxxxxxxx` について説明しています。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

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

    **Projects** ページでは、プロジェクト名、プラン、作成日時、およびプロジェクト内のクラスター数を確認できます。また、特定のプロジェクトをクリックすると、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクトの詳細を編集する\{#edit-project-details}

プロジェクトの名前変更や説明の編集を行うには、[Organization Owner](./organization-users) である必要があります。プロジェクトの詳細は Web コンソールから編集できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6" title=""  />

## プロジェクトを削除する\{#delete-a-project}

プロジェクトを削除するには、[Organization Owner](./organization-users) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての[クラスター](./manage-cluster#drop)と[ボリューム](./managed-volume)を削除する必要があります。

プロジェクトを削除すると、関連するすべてのデータとリソースも復元不可能な形で消去されます。

プロジェクトは Web コンソールから削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## FAQ\{#faq}

**プロジェクトのプランをダウングレードできますか？**

プランの直接ダウングレードはサポートされていません。下位プランに切り替えるには、希望するプランで新しいプロジェクトを作成し、そこへデータを[移行](./offline-migration)してください。

