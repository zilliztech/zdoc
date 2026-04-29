---
title: "プロジェクトの管理 | BYOC"
slug: /manage-projects
sidebar_key: manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連するリソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。| BYOC"
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

Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連するリソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推奨サービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用のプロジェクトをそれぞれ作成できます。

BYOC デプロイメントでは、各プロジェクトは 1 つのリージョンにある単一の Kubernetes クラスターに対応します。クロスリージョン操作はサポートされていません。複数のリージョンで運用するには、個別の BYOC プロジェクトを作成してください。

このガイドでは、プロジェクトを管理するための手順について説明します。

## すべてのプロジェクトを表示\{#view-all-projects}

組織内での権限範囲に含まれるすべてのプロジェクトのリストを表示できます。

- **RESTful API 経由**

    次の例は、現在の組織内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) をご覧ください。

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
          "projectName": "project1",
          "projectId": "proj-a0195d6acacaf2bb985173",
          "instanceCount": 3,
          "createTime": "2023-12-07T03:21:32Z",
          "plan": "Standard",
          "projectType": "Regional",
          "regions": ["aws-us-west-2"]
        },
        {
          "projectName": "Default Project",
          "projectId": "proj-412e874430bfa02e857247",
          "instanceCount": 0,
          "createTime": "2023-08-16T07:34:06Z",
          "plan": "Enterprise",
          "projectType": "Legacy",
          "regions": []
        }
      ]
    }
    
    ```

- **ウェブコンソール経由**

    ![view-projects-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/view-projects-byoc.png "view-projects-byoc")

## プロジェクトの詳細を表示する\{#view-project-details}

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API 経由**

    次の例では、プロジェクト `proj-xxxxxxxxxxxxxxx` について説明しています。詳細は [プロジェクトの説明](/reference/restful/describe-project-v2) をご覧ください。

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
      "data": [
        {
          "projectName": "project1",
          "projectId": "proj-a0195d6acacaf2bb985173",
          "instanceCount": 3,
          "createTime": "2023-12-07T03:21:32Z",
          "plan": "Standard",
          "projectType": "Regional",
          "regions": ["aws-us-west-2"]
        }
      ]
    }
    ```

- **ウェブコンソール経由**

    **プロジェクト**ページで、プロジェクト名、プラン、作成日時、およびプロジェクト内のクラスター数を確認できます。特定のプロジェクトをクリックして、そのクラスターをさらに表示することもできます。

    ![KgjvbAvUkopKWsxnGXycOZEynZd](https://zdoc-images.s3.us-west-2.amazonaws.com/kgjvbavukopkwsxngxycozeynzd.png "KgjvbAvUkopKWsxnGXycOZEynZd")

## プロジェクトの名前変更\{#rename-a-project}

プロジェクトの名前を変更するには、[組織オーナー](./organization-users) である必要があります。ウェブコンソール経由でプロジェクトの名前を変更できます。

![rename-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-project-byoc.png "rename-project-byoc")

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての [クラスター](./manage-cluster#drop) をドロップする必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも取り消し不能にクリーンアップされます。

<Admonition type="info" icon="📘" title="Notes">

<p>デフォルトのプロジェクトは削除できません。</p>

</Admonition>

ウェブコンソール経由でプロジェクトを削除できます。

![delete-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-project-byoc.png "delete-project-byoc")

