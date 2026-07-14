---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは organization 内の論理コンテナとして機能し、cluster、volume、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プロジェクトの管理

Zilliz Cloud では、プロジェクトは organization 内の論理コンテナとして機能し、cluster、volume、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて、複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用の別のプロジェクトを作成できます。

このガイドでは、プロジェクトを管理する手順を説明します。

## プロジェクトを作成する\{#create-a-project}

各 organization には、`Default Project` という名前のデフォルトの **Enterprise** プロジェクトが付属しています。オンボーディング時に、ワークロードをデプロイするクラウドリージョンを選択すると、システムはそのリージョンにこのデフォルトプロジェクトを自動的に作成します。デフォルトプロジェクトは削除できません。ワークロードやビジネスニーズに応じて、追加のプロジェクトを作成できます。プロジェクトを作成すると、そのプロジェクトの [Project Admin](./project-users) に自動的になります。

### 制限\{#limits}

- プロジェクトを作成するには、[Organization Owner](./organization-users) である必要があります。

- 各 organization では最大 100 個のプロジェクトを作成できます。

### 手順\{#procedures}

プロジェクトは、Zilliz Cloud Web コンソールまたは RESTful API を使用して作成できます。

- **RESTful API 経由**

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

    以下は出力例です。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソール経由**

    次のデモは、Zilliz Cloud Web コンソールでプロジェクトを作成する方法を示しています。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の organization に移動します。左側のナビゲーションで **Projects** をクリックします。

    1. **+ Project** をクリックします。

    1. プロジェクト設定を構成します。

        次の表は、プロジェクト作成時に使用される各パラメーターを示しています。

        | **パラメーター** | **説明** |
        | --- | --- |
        | Plan | ニーズに最も適したプロジェクトプランを選択します。プランによって利用可能な機能と課金内容が決まります。料金、プランの違い、適切なプランの選び方の詳細については、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。 |
        | Name | 作成するプロジェクトの名前を入力します。 |
        | Description (optional) | 作成するプロジェクトの説明を入力します。最大 255 文字です。 |
        | Region | ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（例: cluster、volume など）はこのリージョンにデプロイされます。プロジェクト作成後にリージョンを変更することはできません。利用可能なリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 |
        | Multi-region (optional) | **Business Critical** プロジェクトでのみ利用できます。有効にすると、同一プロジェクト内で複数のクラウドリージョンにまたがってリソースをデプロイできます。[Global Cluster Explained](./global-cluster-explained) 機能を使用する予定がある場合は、これが必要です。Multi-region は、プロジェクト作成後に有効化することもできます。 |

    </Procedures>

## プロジェクトリージョンを追加する\{#add-project-regions}

プロジェクトが **Business Critical** プランの場合、プロジェクトにさらにリージョンを追加できます。[Global Cluster](./global-cluster-explained) 機能を使用する必要がある場合、プロジェクトはマルチリージョンである必要があります。

- **RESTful API 経由**

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

- **Web コンソール経由**

    ![Cw14w6V8Ih4QqWbuYstcKqjVnUx](https://zdoc-images.s3.us-west-2.amazonaws.com/Cw14w6V8Ih4QqWbuYstcKqjVnUx.png)

## プロジェクトをアップグレードする\{#upgrade-a-project}

高度な機能を利用するには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、そのプロジェクト内のすべての cluster もアップグレードされます。

プロジェクトを **Business Critical** または **BYOC** プランにアップグレードする必要がある場合は、[営業にお問い合わせください](https://zilliz.com/contact-sales)。

- **RESTful API 経由**

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

    以下は出力例です。

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

- **Web コンソール経由**

    次のデモは、プロジェクトのプランを **Standard** から **Enterprise** にアップグレードする方法を示しています。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h" title=""  />

## すべてのプロジェクトを表示する\{#view-all-projects}

organization 内で、自分の権限範囲にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API 経由**

    次の例は、現在の organization 内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[List Projects](/reference/restful/list-projects-v2) を参照してください。

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

- **Web コンソール経由**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## プロジェクトの詳細を表示する\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API 経由**

    次の例は、プロジェクト `proj-xxxxxxxxxxxxxxx` の詳細を示しています。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    以下は出力例です

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

- **Web コンソール経由**

    **Projects** ページでは、プロジェクト名、プラン、作成時刻、およびプロジェクト内の cluster 数を確認できます。さらに、特定のプロジェクトをクリックして、その cluster を表示することもできます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクトの詳細を編集する\{#edit-project-details}

プロジェクト名の変更やプロジェクトの説明を編集するには、[Organization Owner](./organization-users) である必要があります。Web コンソールを使用してプロジェクトの詳細を編集できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6" title=""  />

## プロジェクトを削除する\{#delete-a-project}

プロジェクトを削除するには、[Organization Owner](./organization-users) である必要があります。 

プロジェクトを削除する前に、そのプロジェクト内のすべての [clusters](./manage-cluster#drop) と [volumes](./managed-volume) を削除する必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも元に戻せない形でクリーンアップされます。

<Admonition type="info" icon="📘" title="📘 注">

デフォルトプロジェクトは削除できません。

</Admonition>

Web コンソールを使用してプロジェクトを削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## FAQ\{#faq}

**プロジェクトプランをダウングレードできますか？**

プランの直接ダウングレードはサポートされていません。より低いプランに切り替えるには、希望するプランで新しいプロジェクトを作成し、データをそこへ[移行](./offline-migration)してください。

