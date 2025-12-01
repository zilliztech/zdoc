---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、プロジェクトは組織内の論理コンテナとして機能し、クラスターと関連リソースをグループ化します。ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディアレコメンデーションサービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用のプロジェクトを作成できます。 | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プロジェクト
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# プロジェクトの管理

Zilliz Cloudでは、プロジェクトは組織内の論理コンテナとして機能し、クラスターと関連リソースをグループ化します。ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディアレコメンデーションサービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用のプロジェクトを作成できます。

このガイドでは、プロジェクトを管理する手順を説明します。

## プロジェクトの作成\{#create-a-project}

各組織には、削除できない`Default Project`という名前のデフォルトの**Enterprise**プロジェクトが付属しています。ワークロードとビジネスのニーズに応じて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの[プロジェクト管理者](./project-users)になります。

### 制限事項\{#limits}

- プロジェクトを作成するには、[組織オーナー](./organization-users)である必要があります。

- 各組織で最大100個のプロジェクトを作成できます。

### 手順\{#procedures}

プロジェクトを作成する際には、プロジェクト名を指定し、ニーズに最も適したプロジェクトプランを選択する必要があります。プランは、利用可能な機能と請求に影響します。価格、プランの違い、および適切なプランの選択方法の詳細については、[詳細プラン比較](./select-zilliz-cloud-service-plans)を参照してください。

Zilliz CloudウェブコンソールまたはRESTful APIを使用してプロジェクトを作成できます。

- **ウェブコンソール経由**

    以下のデモでは、Zilliz Cloudウェブコンソールでプロジェクトを作成する方法を示しています。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l?utm_source=link" title=""  />

    ![create-project](/img/create-project.png "create-project")

- **RESTful API経由**

    次の例では、現在の組織に`My Project`という名前のStandardプロジェクトを作成する方法を示しています。詳細については、[プロジェクトの作成](/reference/restful/create-project-v2)を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"

    curl --request POST \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "projectName": "My Project",
        "plan": "Standard"
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

## プロジェクトのアップグレード\{#upgrade-a-project}

高度な機能をアンロックするには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、プロジェクト内のすべてのクラスターもアップグレードされます。

**Business Critical**プランまたは**BYOC**プランにプロジェクトをアップグレードする必要がある場合は、[営業担当者に連絡](https://zilliz.com/contact-sales)してください。

- **ウェブコンソール経由**

    以下のデモでは、プロジェクトのプランを**Standard**から**Enterprise**にアップグレードする方法を示しています。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h?utm_source=link" title=""  />

- **RESTful API経由**

    以下のデモでは、プロジェクトのプランをStandardからEnterpriseにアップグレードする方法を示しています。詳細については、[プロジェクトのアップグレード](/reference/restful/upgrade-project-v2)を参照してください。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"

    curl --request PATCH \
    --url "${BASE_URL}/v2/projects/${projectId}" \
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

## すべてのプロジェクトを表示\{#view-all-projects}

組織内の権限スコープ内のすべてのプロジェクトのリストを表示できます。

- **ウェブコンソール経由**

    ![view-projects-saas](/img/view-projects-saas.png "view-projects-saas")

- **RESTful API経由**

    次の例では、現在の組織内のすべてのプロジェクトをリストする方法を示しています。詳細については、[プロジェクトのリスト](/reference/restful/list-projects-v2)を参照してください。

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

- **ウェブコンソール経由**

    **プロジェクト**ページで、プロジェクト名、プラン、作成時刻、およびプロジェクト内のクラスター数を確認できます。特定のプロジェクトをクリックして、そのクラスターをさらに表示することもできます。

    ![NoSTbfMVjoPp99x5cjcc0cwWnbd](/img/NoSTbfMVjoPp99x5cjcc0cwWnbd.png "NoSTbfMVjoPp99x5cjcc0cwWnbd")

- **RESTful API経由**

    次の例では、プロジェクト`proj-xxxxxxxxxxxxxxx`を説明しています。詳細については、[プロジェクトの説明](/reference/restful/describe-project-v2)を参照してください。

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

## プロジェクト名の変更\{#rename-a-project}

プロジェクト名を変更するには、[組織オーナー](./organization-users)である必要があります。ウェブコンソールを使用してプロジェクト名を変更できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6?utm_source=link" title=""  />

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users)である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての[クラスター](./manage-cluster#drop-cluster)と[ボリューム](./manage-volumes-via-console#delete-a-volume)を削除する必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも不可逆的に削除されます。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトプロジェクトは削除できません。</p>

</Admonition>

ウェブコンソールを使用してプロジェクトを削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />