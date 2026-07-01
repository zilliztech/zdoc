---
title: "プロジェクトの管理 | BYOC"
slug: /manage-projects
sidebar_key: manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連するリソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | BYOC"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - プロジェクト

---

import Admonition from '@theme/Admonition';


# プロジェクトの管理

Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスタ、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスの異なる側面に合わせて、複数のプロジェクトを作成できます。たとえば、マルチメディア推奨サービスを提供する企業の場合、動画推奨用のプロジェクトと音楽推奨用のプロジェクトをそれぞれ作成できます。

BYOC デプロイメントでは、各プロジェクトは1つのリージョン内の単一の Kubernetes クラスタにマッピングされます。クロスリージョン操作はサポートされていません。複数のリージョンで運用するには、別々の BYOC プロジェクトを作成してください。

このガイドでは、プロジェクトの管理手順について説明します。

## すべてのプロジェクトを表示する\{#view-all-projects}

組織内の権限スコープにあるすべてのプロジェクトのリストを表示できます。

- **RESTful API経由**

    次の例は、現在の組織内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) を参照してください。

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

- **ウェブコンソール経由**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## View project details\{#view-project-details}

特定のプロジェクトの詳細も確認できます。

- **RESTful API経由**

    以下の例では、プロジェクト `proj-xxxxxxxxxxxxxxx` の詳細を説明します。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

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

- **ウェブコンソール経由**

    **プロジェクト** ページでは、プロジェクト名、プラン、作成時間、およびプロジェクト内のクラスター数を確認できます。さらに、特定のプロジェクトをクリックして、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクト詳細の編集\{#edit-project-details}

プロジェクト名を変更したり、プロジェクトの説明を編集したりするには、[組織オーナー](./organization-users) である必要があります。ウェブコンソール経由でプロジェクト詳細を編集できます。

![rename-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-project-byoc.png "rename-project-byoc")

## Delete a project\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての [クラスター](./manage-cluster#drop) を削除する必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも不可逆的に消去されます。

<Admonition type="info" icon="📘" title="Notes">

デフォルトのプロジェクトは削除できません。

</Admonition>

ウェブコンソール経由でプロジェクトを削除できます。

![delete-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-project-byoc.png "delete-project-byoc")
