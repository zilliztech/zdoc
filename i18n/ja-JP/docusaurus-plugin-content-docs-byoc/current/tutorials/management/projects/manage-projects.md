---
title: "プロジェクトを管理する | BYOC"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは同じクラウドプロバイダーとリージョンを共有します。 | BYOC"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトを管理する

Zilliz Cloud では、プロジェクトは組織内の論理コンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて、複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用の別のプロジェクトを作成できます。

BYOC デプロイメントでは、各プロジェクトは 1 つのリージョン内の単一の Kubernetes クラスターに対応します。クロスリージョン操作はサポートされていません。複数のリージョンで運用するには、個別の BYOC プロジェクトを作成してください。

このガイドでは、プロジェクトを管理する手順を説明します。

## すべてのプロジェクトを表示する\{#view-all-projects}

組織内で自分の権限範囲にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API を使用する場合**

    次の例は、現在の組織内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[List Projects](/reference/restful/list-projects-v2) を参照してください。

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

## プロジェクトの詳細を表示する\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API を使用する場合**

    次の例は、プロジェクト `proj-xxxxxxxxxxxxxxx` の詳細を取得する方法を示しています。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

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

- **Web コンソールを使用する場合**

    **Projects** ページでは、プロジェクト名、プラン、作成時刻、およびプロジェクト内のクラスター数を確認できます。さらに、特定のプロジェクトをクリックすると、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクトの詳細を編集する\{#edit-project-details}

プロジェクト名の変更またはプロジェクトの説明の編集を行うには、[Organization Owner](./organization-users) である必要があります。プロジェクトの詳細は Web コンソールから編集できます。

![rename-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-project-byoc.png "rename-project-byoc")

## プロジェクトを削除する\{#delete-a-project}

プロジェクトを削除するには、[Organization Owner](./organization-users) である必要があります。 

プロジェクトを削除する前に、そのプロジェクト内のすべての [クラスター](./manage-cluster#drop) を削除する必要があります。

プロジェクトが削除されると、それに関連付けられたすべてのデータとリソースも完全に削除され、元に戻すことはできません。

<Admonition type="info" icon="📘" title="📘 注意">

デフォルトのプロジェクトは削除できません。

</Admonition>

Web コンソールからプロジェクトを削除できます。

![delete-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-project-byoc.png "delete-project-byoc")

