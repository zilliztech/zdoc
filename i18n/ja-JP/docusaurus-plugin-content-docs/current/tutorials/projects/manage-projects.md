---
title: "プロジェクトの管理 | Cloud"
slug: /manage-projects
sidebar_key: manage-projects
sidebar_label: "プロジェクト"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連するリソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。| Cloud"
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

Zilliz Cloud では、プロジェクトは組織内の論理的なコンテナとして機能し、クラスター、ボリューム、および関連するリソースをグループ化します。プロジェクト内のすべてのリソースは、同じクラウドプロバイダーとリージョンを共有します。

ビジネスのさまざまな側面に合わせて複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推奨サービスを提供している場合、動画推奨用のプロジェクトと音楽推奨用のプロジェクトをそれぞれ作成できます。

このガイドでは、プロジェクトを管理するための手順について説明します。

## プロジェクトの作成\{#create-a-project}

各組織には、`Default Project` という名前のデフォルトの **Enterprise** プロジェクトが付属しています。オンボーディング中に、ワークロードを展開するクラウドリージョンを選択すると、システムがそのリージョンにこのデフォルトプロジェクトを自動的に作成します。デフォルトプロジェクトは削除できません。ワークロードとビジネスニーズに基づいて、追加のプロジェクトを作成できます。プロジェクトを作成すると、自動的にそのプロジェクトの [プロジェクト管理者](./project-users) になります。

### 制限\{#limits}

- プロジェクトを作成するには、[組織オーナー](./organization-users) である必要があります。

- 各組織で作成できるプロジェクトの最大数は 100 です。

### 手順\{#procedures}

プロジェクトは、Zilliz Cloud Web コンソールまたは RESTful API を経由して作成できます。

- **RESTful API 経由**

    次の例は、現在の組織内で `gcp-us-west1` にデプロイされた `Enterprise` プロジェクトを作成する方法を示しています。詳細については、[プロジェクトの作成](/reference/restful/create-project-v2) を参照してください。

    ```bash
    curl --request POST \
         --url "https://${BASE_URL}/v2/projects" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-type: application/json" \
         --data-raw '{
            "projectName": "project-05",
            "plan": "Enterprise",
            "projectType": "Regional",
            "regions": ["aws-us-west-2"]
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

    以下のデモでは、Zilliz Cloud ウェブコンソールでプロジェクトを作成する方法を示します。

    <Supademo id="cmhivxhnz5zctfatifx1jw34l" title=""  />

    <Procedures>

    1. 対象の組織に移動します。左側のナビゲーションで**プロジェクト**をクリックします。

    1. **+ プロジェクト**をクリックします。

    1. プロジェクト設定を構成します。

        以下の表は、プロジェクト作成時に使用する各パラメーターについて説明しています。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>プラン</p></td>
             <td><p>ニーズに最も適したプロジェクトプランを選択します。プランによって利用可能な機能と課金が決定されます。価格、プランの違い、適切なプランの選択方法の詳細については、<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>をご覧ください。</p></td>
           </tr>
           <tr>
             <td><p>名前</p></td>
             <td><p>作成するプロジェクトの名前を入力します。</p></td>
           </tr>
           <tr>
             <td><p>リージョン</p></td>
             <td><p>ワークロードをデプロイするクラウドリージョンを選択します。プロジェクト内のすべてのリソース（例：クラスター、ボリュームなど）はこのリージョンにデプロイされます。リージョンはプロジェクト作成後に変更できません。利用可能なリージョンについては、<a href="./cloud-providers-and-regions">クラウドプロバイダーとリージョン</a>をご覧ください。</p></td>
           </tr>
           <tr>
             <td><p>マルチリージョン（オプション）</p></td>
             <td><p><strong>ビジネスクリティカル</strong>プロジェクトでのみ利用可能です。有効にすると、同じプロジェクト内で複数のクラウドリージョンにリソースをデプロイできます。グローバルクラスター機能を使用する予定がある場合は、これが必要です。マルチリージョンはプロジェクト作成後に有効化することもできます。</p></td>
           </tr>
        </table>

    </Procedures>

## プロジェクトリージョンの追加\{#add-project-regions}

プロジェクトが**ビジネスクリティカル**プランの場合、プロジェクトにさらにリージョンを追加できます。[グローバルクラスター](null) 機能を使用する必要がある場合は、プロジェクトをマルチリージョン化する必要があります。

- **RESTful API 経由**

    ```bash
    curl --request POST \
         --url "https://${BASE_URL}/v2/projects/proj-a0195d6acacaf2bb985173/regions" \
         --header "Authorization: Bearer ${API_KEY}" \
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

## プロジェクトのアップグレード\{#upgrade-a-project}

高度な機能を利用するには、既存のプロジェクトのプランをアップグレードできます。

プロジェクトをアップグレードすると、そのプロジェクト内のすべてのクラスターもアップグレードされます。

プロジェクトを**ビジネスクリティカル**または**BYOC**プランにアップグレードする必要がある場合は、[営業担当者にお問い合わせください](https://zilliz.com/contact-sales)。

- **RESTful API 経由**

    以下のデモでは、プロジェクトのプランを Standard から Enterprise にアップグレードする方法を示しています。詳細については、[プロジェクトのアップグレード](/reference/restful/upgrade-project-v2) をご覧ください。

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

    以下のデモでは、プロジェクトのプランを **Standard** から **Enterprise** にアップグレードする方法を示します。

    <Supademo id="cmhiw3gu85zhlfati4r154s2h" title=""  />

## View all projects\{#view-all-projects}

組織内の権限範囲にあるすべてのプロジェクトの一覧を表示できます。

- **RESTful API 経由**

    以下の例では、現在の組織にあるすべてのプロジェクトを一覧表示する方法を示します。詳細については、[List プロジェクト](/reference/restful/list-projects-v2) をご覧ください。

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

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## プロジェクト詳細の確認\{#view-project-details}

特定プロジェクトの詳細を確認することもできます。

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

    **プロジェクト**ページでは、プロジェクト名、プラン、作成日時、およびプロジェクト内のクラスター数を確認できます。特定のプロジェクトをクリックすると、そのクラスターをさらに詳細に閲覧できます。

    ![KgjvbAvUkopKWsxnGXycOZEynZd](https://zdoc-images.s3.us-west-2.amazonaws.com/kgjvbavukopkwsxngxycozeynzd.png "KgjvbAvUkopKWsxnGXycOZEynZd")

## プロジェクトの名前変更\{#rename-a-project}

プロジェクトの名前を変更するには、[組織オーナー](./organization-users) である必要があります。ウェブコンソール経由でプロジェクトの名前を変更できます。

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6?utm_source=link" title=""  />

## プロジェクトの削除\{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users) である必要があります。

プロジェクトを削除する前に、プロジェクト内のすべての [クラスター](./manage-cluster#drop) および [ボリューム](null) を削除する必要があります。

プロジェクトが削除されると、関連するすべてのデータとリソースも不可逆的にクリーンアップされます。

<Admonition type="info" icon="📘" title="Notes">

<p>デフォルトのプロジェクトは削除できません。</p>

</Admonition>

ウェブコンソール経由でプロジェクトを削除できます。

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

## よくある質問\{#faq}

**プロジェクトのプランをダウングレードできますか？**

プランの直接ダウングレードはサポートされていません。低いプランへ切り替えるには、希望のプランで新しいプロジェクトを作成し、データをそのプロジェクトへ [移行](./offline-migration) してください。

