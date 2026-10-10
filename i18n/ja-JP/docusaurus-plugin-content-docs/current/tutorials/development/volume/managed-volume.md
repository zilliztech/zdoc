---
title: "マネージドボリューム | Cloud"
slug: /managed-volume
sidebar_label: "マネージドボリューム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "マネージドボリュームは、インポートと移行で使用するデータファイルを保持するための、Zilliz Cloud がホストするオブジェクトストアです。このページでは、Web コンソールと SDK を使用してマネージドボリュームを作成、管理、削除する方法について説明します。 | Cloud"
type: origin
token: A33MwQX84iXyQNkzopece3oenye
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# マネージドボリューム

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよびすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。Azure でボリュームを使用するには、[お問い合わせ](https://support.zilliz.com/)ください。

</FeatureNote>

マネージドボリュームは、インポートと移行で使用するデータファイルを保持するための、Zilliz Cloud がホストするオブジェクトストアです。このページでは、Web コンソールと SDK を使用してマネージドボリュームを作成、管理、削除する方法について説明します。

## 考慮事項\{#considerations}

- ボリュームは、プロジェクトのクラウドプロバイダーとリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、ボリュームは AWS us-west-2 にのみ作成できます。

- ボリュームをクラスターで使用するには、クラスターがボリュームと同じクラウドプロバイダーおよびリージョンに存在している必要があります。

- ボリュームを作成および管理するには、**Project Admin** である必要があります。

- ボリュームは一度作成すると、その構成を編集できません。ボリューム設定を変更する場合は、代わりに目的の設定で新しいボリュームを作成してください。

- 各組織で作成できるマネージドボリュームは最大 **100 個**です。

## 事前準備\{#before-you-start}

SDK を使用してボリュームを作成および管理する必要がある場合は、まずボリュームマネージャーを初期化する必要があります。

ボリュームマネージャーは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを管理する前に、ボリュームマネージャーを初期化する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .build();
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

</TabItem>

<TabItem value='go'>

```go
// Note: VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
// Note: VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { VolumeManager } from "@zilliz/milvus2-sdk-node";

const volumeManager = new VolumeManager({
    cloudEndpoint: "https://api.cloud.zilliz.com",
    apiKey: "YOUR_API_KEY"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

## マネージドボリュームを作成する\{#create-a-managed-volume}

ボリュームは、Web コンソールまたは SDK で作成できます。

- **SDK を使用する場合**

    ボリュームは Zilliz Cloud プロジェクトに固有です。ボリュームを作成するときは、次のように、プロジェクト ID、リージョン ID、およびボリュームの名前を指定する必要があります。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "managed_volume"
    
    # Create a managed volume
    volume_manager.create_volume(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
        region_id="aws-us-west-2",
        volume_name=volume_name
    )
    
    print(f"\nVolume {volume_name} created")
    
    # Volume managed_volume created
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String projectId = "proj-xxxxxxxxxxxxxxxxxxxxxxx";
    String regionId = "aws-us-west-2";
    String volumeName = "managed_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    CreateVolumeRequest request = CreateVolumeRequest.builder()
            .projectId(projectId)
            .regionId(regionId)
            .volumeName(volumeName)
            .build();
    
    volumeManager.createVolume(request);
    System.out.printf("%nVolume %s created%n", volumeName);
    
    // Volume managed_volume created
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: Managed Volume management is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: Managed Volume management is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Note: Managed Volume management is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.createVolume({
        projectId: "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        regionId: "aws-us-west-2",
        volumeName: "managed_volume"
    });
    
    console.log(res.data);
    
    // { volumeName: "managed_volume" }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "volumeName": "managed_volume",
        "description": "A volume for storing collection data."
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "managed_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

    次の表では、パラメーターについて説明します。

    | **パラメーター** | **説明** |
    | --- | --- |
    | `projectId` | ボリュームを作成するプロジェクトの ID です。 |
    | `regionId` | 作成するボリュームのリージョンは、データをインポートまたは移行する予定の対象クラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。 |
    | `volumeName` | 作成するボリュームの名前は組織全体で一意である必要があり、64 文字以内、英字またはアンダースコアで始まり、英字、数字、ハイフン、アンダースコアのみを含める必要があります。 |
    | `type`（オプション） | オプション: `MANAGED`、`EXTERNAL`<br/>このパラメーターを省略すると、既定でマネージドクラスターが作成されます。 |
    | `description`（オプション） | 作成するボリュームの説明。最大 255 文字です。 |

- **Web コンソールを使用する場合**

    <Supademo id="cmi76tseu4ok8b7b4l5nods0s" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. ボリュームページで **+ Volume** をクリックします。

    1. ボリュームの構成を設定します。

        次の表では、マネージドボリュームの作成時に使用する各パラメーターについて説明します。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>名前</p></td>
             <td><p>ボリューム名は組織全体で一意である必要があり、64 文字以内、英字またはアンダースコアで始まり、英字、数字、ハイフン、アンダースコアのみを含める必要があります。</p></td>
           </tr>
           <tr>
             <td><p>説明（オプション）</p></td>
             <td><p>このパラメーターはオプションです。最大 255 文字です。</p></td>
           </tr>
           <tr>
             <td><p>ボリュームタイプ</p></td>
             <td><p>ボリュームタイプとして &quot;Managed&quot; を選択します。</p></td>
           </tr>
           <tr>
             <td><p>課金タイプ</p></td>
             <td><ul><li><p>マネージドボリューム機能を試してみたいだけの場合は、<strong>無料トライアルボリューム</strong>を作成します。無料トライアルボリュームは<strong>組織ごとに 1 回</strong>のみ作成でき、容量とファイルのアップロードに制限があります。詳細については、<a href="./managed-volume#billing">課金</a>セクションの比較表を参照してください。</p></li><li><p>本番ワークロードには、<strong>従量課金ボリューム</strong>を作成します。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>クラウドプロバイダーとリージョン</p></td>
             <td><p>ボリュームのクラウドプロバイダーとリージョンは、データをインポートまたは移行する予定の対象クラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## マネージドボリュームを一覧表示する\{#list-managed-volumes}

プロジェクト内の既存のボリュームをすべて表示できます。

- **SDK を使用する場合**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # List volumes
    volume_list = volume_manager.list_volumes(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
        current_page=1,
        page_size=10
    )
    
    print("\nlistVolumes results:\n", volume_list.json()["data"])
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.ListVolumesRequest;
    import io.milvus.bulkwriter.response.volume.ListVolumesResponse;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint("https://api.cloud.zilliz.com")
            .withApiKey("YOUR_API_KEY")
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    ListVolumesRequest request = ListVolumesRequest.builder()
            .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
            .currentPage(1)
            .pageSize(10)
            .build();
    ListVolumesResponse response = volumeManager.listVolumes(request);
    System.out.println("listVolumes results: " + new Gson().toJson(response));
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.listVolumes({
        projectId: "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        currentPage: 1,
        pageSize: 10
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxxxxxxxx&currentPage=1&pageSize=10" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    </TabItem>
    </Tabs>

- **Web コンソールを使用する場合**

    ![Hp1Hwxoj9hkJqdbECCYcB4G6nVe](https://zdoc-images.s3.us-west-2.amazonaws.com/Hp1Hwxoj9hkJqdbECCYcB4G6nVe.png)

## マネージドボリュームの詳細を表示する\{#describe-managed-volume}

特定のマネージドボリュームの詳細を確認することもできます。

- **SDK を使用する場合**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "managed_volume"
    
    # Describe a volume
    volume_info = volume_manager.describe_volume(
        volume_name=volume_name
    )
    
    print("\ndescribeVolume result:\n", volume_info.json()["data"])
    
    # describeVolume result:
    # {
    #     "volumeName": "managed_volume",
    #     "type": "MANAGED",
    #     "regionId": "aws-us-west-2",
    #     "status": "RUNNING",
    #     "createTime": "2026-05-06T02:24:26Z"
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.DescribeVolumeRequest;
    import io.milvus.bulkwriter.response.volume.VolumeInfo;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String volumeName = "managed_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    DescribeVolumeRequest request = DescribeVolumeRequest.builder()
            .volumeName(volumeName)
            .build();
    VolumeInfo volumeInfo = volumeManager.describeVolume(request);
    System.out.println("describeVolume result: " + new Gson().toJson(volumeInfo));
    
    // describeVolume result:
    //{
    //    "volumeName": "managed_volume",
    //    "type": "MANAGED",
    //    "regionId": "aws-us-west-2",
    //    "status": "RUNNING",
    //    "createTime": "2026-05-06T02:24:26Z"
    //}
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: Managed Volume management is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: Managed Volume management is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Note: Managed Volume management is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.describeVolume({
        volumeName: "managed_volume"
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="managed_volume"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "managed_volume",
    #         "type": "MANAGED",
    #         "regionId": "aws-us-west-2",
    #         "status": "RUNNING",
    #         "createTime": "2026-05-06T02:24:26Z"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

- **Web コンソールを使用する場合**

    プロジェクト内のボリュームの一覧を表示し、ボリューム名をクリックすると、特定のボリュームの詳細を確認できます。

    ![FU4ow2zIuht0CfbRiBJcFZ6RnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/FU4ow2zIuht0CfbRiBJcFZ6RnYf.png)

## マネージドボリュームにデータをアップロードする\{#upload-data-into-a-managed-volume}

現在、データファイルまたはフォルダーをマネージドボリュームにアップロードできるのは SDK を使用する場合のみです。

1. **ボリュームファイルマネージャーを初期化する**

    ボリュームファイルマネージャーは、Zilliz Cloud のボリュームサービス上の特定のボリュームへの接続を維持します。ボリュームにファイルをアップロードする前に、ボリュームファイルマネージャーを初期化する必要があります。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
    
    volume_file_manager = VolumeFileManager(
        cloud_endpoint='https://api.cloud.zilliz.com',
        api_key='YOUR_API_KEY',
        volume_name='managed_volume',
    )
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeFileManager;
    import io.milvus.bulkwriter.VolumeFileManagerParam;
    
    VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .withVolumeName("managed_volume")
        .build();
    
    VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: VolumeFileManager and volume file upload are not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: VolumeFileManager and volume file upload are not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Note: VolumeFileManager and volume file upload are not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Note: VolumeFileManager and volume file upload are not supported in @zilliz/milvus2-sdk-node as of v3.0.6.
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Note: Volume file upload is not exposed by the current /v2/volumes RESTful API.
    ```

    </TabItem>
    </Tabs>

1. **ファイルまたはフォルダーをアップロードする**

    ボリュームファイルマネージャーの準備ができたら、それを使用して、指定したマネージドボリュームにファイルまたはフォルダーをアップロードします。

    - **ファイルをアップロードする**

        次の例では、ソースファイルパスにあるローカルファイルを、ボリューム内のターゲットファイルパスにアップロードします。

        <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
        <TabItem value='python'>

        ```python
        result = volume_file_manager.upload_file_to_volume(
            source_file_path="/path/to/your/local/data/file", 
            target_volume_path="data/"
        )
        
        print(f"\nuploadFileToVolume results: {result}")
        
        # uploadFileToVolume results: 
        # 
        # {
        #     "volumeName": "managed_volume",
        #     "path": "data/"
        # }
        ```

        </TabItem>

        <TabItem value='java'>

        ```java
        import com.google.gson.Gson;
        import io.milvus.bulkwriter.model.UploadFilesResult;
        import io.milvus.bulkwriter.request.volume.UploadFilesRequest;
        
        UploadFilesRequest request = UploadFilesRequest.builder()
            .sourceFilePath("/path/to/your/local/data/file")
            .targetVolumePath("data/")
            .build();
        
        UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();
        
        System.out.println("\nuploadFiles results: " + new Gson().toJson(result));
        
        // uploadFileToVolume results: 
        // 
        // {
        //     "volumeName": "managed_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>

        <TabItem value='go'>

        ```go
        // Note: VolumeFileManager and volume file upload are not supported by milvus-sdk-go as of client/v3.0.0-beta.
        ```

        </TabItem>

        <TabItem value='rust'>

        ```rust
        // Note: VolumeFileManager and volume file upload are not supported in milvus-sdk-rust as of v3.0.2.
        ```

        </TabItem>

        <TabItem value='c++'>

        ```c++
        // Note: VolumeFileManager and volume file upload are not supported in milvus-sdk-cpp as of v3.0.3.
        ```

        </TabItem>

        <TabItem value='javascript'>

        ```javascript
        // Note: VolumeFileManager and volume file upload are not supported in @zilliz/milvus2-sdk-node as of v3.0.6.
        ```

        </TabItem>

        <TabItem value='bash'>

        ```bash
        # Note: Volume file upload is not exposed by the current /v2/volumes RESTful API.
        ```

        </TabItem>
        </Tabs>

    - **フォルダーをアップロードする**

        次の例では、ソースファイルパスにあるローカルファイルを、ボリューム内のターゲットファイルパスにアップロードします。

        <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
        <TabItem value='python'>

        ```python
        result = volume_file_manager.upload_file_to_volume(
            source_file_path="/path/to/your/local/data/folder/",
            target_volume_path="data/"
        )
        
        print(f"\nuploadFileToVolume results: {result}")
        
        # uploadFileToVolume results:
        #
        # {
        #     "volumeName": "managed_volume",
        #     "path": "data/"
        # }
        ```

        </TabItem>

        <TabItem value='java'>

        ```java
        import com.google.gson.Gson;
        import io.milvus.bulkwriter.model.UploadFilesResult;
        import io.milvus.bulkwriter.request.volume.UploadFilesRequest;
        
        UploadFilesRequest request = UploadFilesRequest.builder()
                .sourceFilePath("/path/to/your/local/data/folder/")
                .targetVolumePath("data/")
                .build();
        
        UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();
        System.out.println("uploadFiles results: " + new Gson().toJson(result));
        
        // uploadFileToVolume results:
        //
        // {
        //     "volumeName": "managed_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>

        <TabItem value='go'>

        ```go
        // Note: Volume file upload is not supported by milvus-sdk-go as of client/v3.0.0-beta.
        ```

        </TabItem>

        <TabItem value='rust'>

        ```rust
        // Note: Volume file upload is not supported in milvus-sdk-rust as of v3.0.2.
        ```

        </TabItem>

        <TabItem value='c++'>

        ```c++
        // Note: Volume file upload is not supported in milvus-sdk-cpp as of v3.0.3.
        ```

        </TabItem>

        <TabItem value='javascript'>

        ```javascript
        // Note: Volume file upload is not supported in @zilliz/milvus2-sdk-node as of v3.0.6.
        ```

        </TabItem>

        <TabItem value='bash'>

        ```bash
        # Note: Volume file upload is not exposed by the RESTful API as of the current v2 volume endpoints.
        ```

        </TabItem>
        </Tabs>

## マネージドボリュームからデータを削除する\{#delete-data-from-a-managed-volume}

マネージドボリュームからデータを削除するには、ファイルまたはフォルダーのサイズによっては数分かかる場合があります。

<Admonition type="warning" title="Warning">

削除されたファイルとフォルダーは**復元できません**。注意して操作してください。

</Admonition>

現在、マネージドボリュームからデータを削除できるのは Web コンソールのみです。

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd" title=""  />

<Procedures>

1. 左側のナビゲーションで **Volumes** をクリックします。

1. **Files** タブに切り替えます。

1. **Actions** 列で **...** をクリックし、続いて **Delete** をクリックします。

</Procedures>

## マネージドボリュームを削除する\{#delete-a-managed-volume}

マネージドボリュームが不要になったら、いつでも削除できます。無料トライアルボリュームは組織ごとに 1 回しか作成できないことに注意してください。一度削除すると、無料トライアルボリュームを再び作成することはできません。

マネージドボリュームを削除すると、**そのすべてのファイルとフォルダー**も削除されます。

<Admonition type="warning" title="Warning">

削除されたボリュームは**復元できません**。注意して操作してください。

</Admonition>

- **SDK を使用する場合**

    マネージドボリュームは次のように削除できます。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "managed_volume"
    
    # Delete a volume
    volume_manager.delete_volume(
        volume_name=volume_name
    )
    
    print(f"\nVolume {volume_name} deleted")
    
    # Volume managed_volume deleted
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String volumeName = "managed_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    DeleteVolumeRequest request = DeleteVolumeRequest.builder()
            .volumeName(volumeName)
            .build();
    
    volumeManager.deleteVolume(request);
    System.out.printf("%nVolume %s deleted%n", volumeName);
    
    // Volume managed_volume deleted
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: Managed Volume management is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: Managed Volume management is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    // Note: Managed Volume management is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.deleteVolume({
        volumeName: "managed_volume"
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="managed_volume"
    
    curl --request DELETE \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "managed_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

- **Web コンソールを使用する場合**

    <Supademo id="cmi77c5554p1gb7b4sqqsm7nn" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. **Actions** 列で **...** をクリックし、続いて **Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## 課金\{#billing}

マネージドボリュームを作成するときは、**無料トライアル**または**従量課金**プランを選択できます。次の表では、それぞれの一般的なユースケースと制限を比較します。

|  | **無料トライアル** | **従量課金** |
| --- | --- | --- |
| **ユースケース** | テスト環境専用です。 | 本番環境での使用向けです。 |
| **容量** | 5 GB | 無制限 |
| **アップロードあたりのファイルサイズと数** | 1 回のアップロードあたり最大 1 GB のデータと 1,000 ファイル以下 | 1 回のアップロードあたり最大 100 GB のデータと無制限のファイル数 |
| **ボリュームの最大数** | 1 | 100 |

**無料トライアルボリューム**

- 支払い方法は必要ありません。

- 各組織は無料トライアルボリュームを 1 つだけ持つことができます。

- 無料トライアルボリュームは 30 日間保持され、その後自動的に削除されます。

**従量課金ボリューム**

- 有効な支払い方法が必要です。

- 従量課金ボリュームを使用すると料金が発生します。

    - 料金が発生するのは、マネージドボリュームが利用可能な場合のみです。

    - 定価については、[Pricing Guide](http://zilliz.com/pricing/pricing-guide) を参照してください。

    - ボリューム料金の計算方法については、[ストレージコスト](./storage-cost) を参照してください。

## FAQ\{#faqs}

**請求書の未払いにより組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、すべてのマネージドボリューム（無料トライアルと従量課金の両方）と、それらに保存されているすべてのファイルが削除され、復元できなくなります。外部ボリュームも凍結され、新しい操作には使用できませんが、ご自身のバケット内のデータは影響を受けません。

ボリュームの使用を続けるには、まず未払いの請求書をすべて支払ってください。

**Web コンソールに無料トライアルボリュームのオプションが表示されないのはなぜですか？**

組織で無料トライアルボリュームを一度作成すると、無料トライアルボリュームのオプションは非表示になります。各組織で作成できる無料トライアルボリュームは 1 つだけです。

**ボリュームのステータスにはどのような意味がありますか？**

次の表に、とり得るボリュームのステータスを示します。

| **ステータス** | **説明** |
| --- | --- |
| **Available** | ボリュームはアクティブで使用可能です。 |
| **Frozen** | [請求書](./manage-invoice) の未払いにより組織が凍結されています。ボリュームは新しい操作には使用できません。ボリュームの使用を続けるには、請求書を支払ってください。 |

