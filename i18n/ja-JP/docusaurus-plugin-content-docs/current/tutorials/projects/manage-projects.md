---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_key: manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。 | Cloud"
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


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# プロジェクトの管理

Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスタ、ボリューム、および関連リソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスの異なる側面に合わせて、複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、動画推薦用のプロジェクトと音楽推薦用のプロジェクトをそれぞれ作成できます。

このガイドでは、プロジェクトの管理手順について説明します。

## プロジェクトの作成\{#create-a-project}

各組織には、デフォルトで `Default Project` という名前の **Enterprise** プロジェクトが付属しています。オンボーディング時に、ワークロードをデプロイしたいクラウドリージョンを選択すると、システムがそのリージョンにこのデフォルトプロジェクトを自動的に作成します。デフォルトプロジェクトは削除できません。ワークロードやビジネスニーズに応じて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの [プロジェクト管理者](./project-users) になります。

### 制限\{#limits}

- プロジェクトを作成するには、[組織オーナー](./organization-users) である必要があります。

- 各組織で作成できるプロジェクトの最大数は 100 です。

### 手順\{#procedures}

プロジェクトは、Zilliz Cloud Web コンソールまたは RESTful API を使用して作成できます。

- **RESTful API経由**

    以下の例は、プロジェクトを作成する方法を示しています。詳細については、[プロジェクトの作成](/reference/restful/create-project-v2) を参照してください。

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

- **ウェブコンソール経由**

    次のデモでは、Zilliz Cloud のウェブコンソールでプロジェクトを作成する方法を示します。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の組織に移動します。左側のナビゲーションで **プロジェクト** をクリックします。

    1. **+ プロジェクト** をクリックします。

    1. プロジェクト設定を構成します。

        次の表は、プロジェクトの作成時に使用される各パラメーターの説明です。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>プラン</p></td>
             <td><p>ニーズに最も適したプロジェクトプランを選択します。プランによって、利用可能な機能と課金が決まります。価格、プランの違い、適切なプランの選び方の詳細については、<a href="./select-zilliz-cloud-service-plans">プランの詳細比較</a> を参照してください。</p></td>
           </tr>
           <tr>
             <td><p>名前</p></td>
             <td><p>作成するプロジェクトの名前を入力します。</p></td>
           </tr>
           <tr>
             <td><p>説明（オプション）</p></td>
             <td><p>作成するプロジェクトの説明を入力します。最大 255 文字です。</p></td>
           </tr>
           <tr>
             <td><p>リージョン</p></td>
             <td><p>ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（クラスター、ボリュームなど）は、このリージョンにデプロイされます。プロジェクト作成後はリージョンを変更できません。利用可能なリージョンについては、<a href="./cloud-providers-and-regions">クラウドプロバイダーとリージョン</a> を参照してください。</p></td>
           </tr>
           <tr>
             <td><p>マルチリージョン（オプション）</p></td>
             <td><p><strong>ビジネスクリティカル</strong> プロジェクトでのみ利用可能です。有効にすると、同じプロジェクト内で複数のクラウドリージョンにリソースをデプロイできます。これは、<a href="./global-cluster-explained">グローバルクラスターの説明</a> 機能を使用する場合に必要です。マルチリージョンは、プロジェクト作成後に有効にすることもできます。</p></td>
           </tr>
        </table>

    </Procedures>

## プロジェクトリージョンの追加\{#add-project-regions}

プロジェクトが **ビジネスクリティカル** プランの場合、プロジェクトにさらにリージョンを追加できます。[グローバルクラスター](./global-cluster-explained) 機能を使用する必要がある場合、プロジェクトはマルチリージョンである必要があります。

- **RESTful API経由**

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

- **ウェブコンソール経由**

    ![Cw14w6V8Ih4QqWbuYstcKqjVnUx](https://zdoc-images.s3.us-west-2.amazonaws.com/Cw14w6V8Ih4QqWbuYstcKqjVnUx.png)

## Upgrade a project\{#upgrade-a-project}

高度な機能を利用するには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、プロジェクト内のすべてのクラスターもアップグレードされます。

プロジェクトを **ビジネスクリティカル** または **BYOC** プランにアップグレードする必要がある場合は、[営業担当にお問い合わせください](https://zilliz.com/contact-sales)。

- **RESTful API経由**

    次のデモでは、プロジェクトのプランを Standard から Enterprise にアップグレードする方法を示しています。詳細については、[プロジェクトのアップグレード](/reference/restful/upgrade-project-v2) を参照してください。

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

- **ウェブコンソール経由**

    次のデモでは、プロジェクトのプランを **Standard** から **Enterprise** にアップグレードする方法を示します。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h" title=""  />

## View all projects\{#view-all-projects}

組織内で自分の権限範囲にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API経由**

    次の例では、現在の組織内のすべてのプロジェクトを一覧表示する方法を示します。詳細については、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) を参照してください。

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

特定のプロジェクトの詳細を確認することもできます。

- **RESTful API経由**

    以下の例では、プロジェクト `proj-xxxxxxxxxxxxxxx` について説明します。詳細については、[Describe Project](/reference/restful/describe-project-v2) を参照してください。

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

    **プロジェクト** ページで、プロジェクト名、プラン、作成時間、およびプロジェクト内のクラスター数を確認できます。さらに、特定のプロジェクトをクリックして、そのクラスターを表示できます。

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## プロジェクト詳細の編集\{#edit-project-details}

プロジェクト名を変更したり、プロジェクトの説明を編集したりするには、[組織オーナー](./organization-users) である必要があります。ウェブコンソール経由でプロジェクト詳細を編集できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6" title=""  />

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての [クラスター](./manage-cluster#drop) と [ボリューム](./managed-volume) を削除する必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも不可逆的に削除されます。

<Admonition type="info" icon="📘" title="Notes">

デフォルトのプロジェクトは削除できません。

</Admonition>

ウェブコンソール経由でプロジェクトを削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## FAQ\{#faq}

**プロジェクトのプランをダウングレードできますか？**

プランの直接ダウングレードはサポートされていません。より低いプランに切り替えるには、希望のプランで新しいプロジェクトを作成し、データを [移行](./offline-migration) してください。
