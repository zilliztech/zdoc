---
title: "プロジェクトの管理 | BYOC"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、プロジェクトは組織内の論理コンテナとして機能し、クラスターと関連リソースをグループ化します。ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、ビデオ推薦用のプロジェクトと音楽推薦用のプロジェクトを別々に作成できます。 | BYOC"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - プロジェクト
  - ベクトル検索
  - 音声類似検索
  - エラスティックベクトルデータベース
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# プロジェクトの管理

Zilliz Cloudでは、プロジェクトは組織内の論理コンテナとして機能し、クラスターと関連リソースをグループ化します。ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、ビデオ推薦用のプロジェクトと音楽推薦用のプロジェクトを別々に作成できます。

このガイドでは、プロジェクトの管理手順について説明します。

## すべてのプロジェクトを表示\{#view-all-projects}

組織内で自分の権限範囲にあるすべてのプロジェクトのリストを表示できます。

- **Webコンソール経由**

    ![view-projects-byoc](/img/view-projects-byoc.png)

- **RESTful API経由**

    以下の例は、現在の組織内のすべてのプロジェクトを一覧表示する方法を示しています。詳細については、[プロジェクト一覧](/reference/restful/list-projects-v2)を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"

    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    以下は出力例です。

    ```json
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise"
            }
        ]
    }
    ```

## プロジェクトの詳細を表示\{#view-project-details}

特定のプロジェクトの詳細も確認できます。

- **Webコンソール経由**

    **プロジェクト**ページで、プロジェクト名、プラン、作成時間、プロジェクト内のクラスター数を確認できます。特定のプロジェクトをクリックして、そのクラスターを表示することもできます。

    ![NoSTbfMVjoPp99x5cjcc0cwWnbd](/img/NoSTbfMVjoPp99x5cjcc0cwWnbd.png)

- **RESTful API経由**

    以下の例は、プロジェクト `proj-xxxxxxxxxxxxxxx` を説明しています。詳細については、[プロジェクトの説明](/reference/restful/describe-project-v2)を参照してください。

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
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise"
        }
    }
    ```

## プロジェクトの名前変更\{#rename-a-project}

プロジェクトの名前を変更するには、[組織オーナー](./organization-users)である必要があります。Webコンソールからプロジェクトの名前を変更できます。

![rename-project-byoc](/img/rename-project-byoc.png)

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users)である必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも不可逆的に削除されます。

<Admonition type="info" icon="📘" title="注意">

<p>デフォルトプロジェクトは削除できません。</p>

</Admonition>

Webコンソールからプロジェクトを削除できます。

![delete-project-byoc](/img/delete-project-byoc.png)